import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ApiArchivedTask, ArchivedAssignee } from '../../interfaces/board.interface';
import { TeamService } from '../../../core/services/team/team.service';
import { TooltipDirective } from '../../directives/tooltip.directive';

export interface ArchivableStatus {
  id: string;
  name: string;
  color: string;
}

interface AssigneeView {
  name: string;
  initials: string;
  avatarUrl?: string;
}

interface ArchivedRow {
  id: string;
  number: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  assignees: AssigneeView[];
  updatedAt: string;
}

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

/**
 * Read-only, in-context view of a team's archived tasks — a slide-over panel
 * rather than a Kanban column, since archived tasks aren't part of the live
 * workflow (no drag-and-drop in/out of them). Calls the same
 * GET /api/migrate/task/archived endpoint as the dedicated /archived/:teamId
 * table page (ArchivedTasklistComponent), just scoped to a lightweight list.
 */
@Component({
  selector: 'app-archived-tasks-panel',
  standalone: true,
  imports: [NgFor, NgIf, TitleCasePipe, TooltipDirective],
  templateUrl: './archived-tasks-panel.component.html',
  styleUrl: './archived-tasks-panel.component.scss'
})
export class ArchivedTasksPanelComponent implements OnChanges {
  @Input() teamId = '';
  @Input() statuses: ArchivableStatus[] = [];
  /** Status tab to preselect (e.g. opened from a specific column's "View archived tasks" button). '' = All. */
  @Input() initialStatusId = '';
  @Output() close = new EventEmitter<void>();

  private teamService = inject(TeamService);
  private router = inject(Router);

  rows: ArchivedRow[] = [];
  loading = true;
  error = false;
  selectedStatusId = ''; // '' = All

  page = 1;
  readonly limit = 10;
  total = 0;
  totalPages = 1;

  readonly skeletonRows = [0, 1, 2, 3, 4];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['teamId'] && this.teamId) {
      this.page = 1;
      this.selectedStatusId = this.initialStatusId;
      this.load();
    }
  }

  selectStatus(statusId: string): void {
    if (this.selectedStatusId === statusId) return;
    this.selectedStatusId = statusId;
    this.page = 1;
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = false;
    this.teamService.getArchivedTasks(this.teamId, {
      page: this.page,
      limit: this.limit,
      statusId: this.selectedStatusId,
    }).subscribe({
      next: (res) => {
        this.rows = res.data.map(t => this.toRow(t));
        this.total = res.total;
        this.totalPages = res.totalPages;
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  private toRow(task: ApiArchivedTask): ArchivedRow {
    const num = task.taskNumber ?? task.number;
    const rawAssignees = task.assigneeDetails ?? task.assignees ?? [];
    return {
      id: task.id,
      number: num != null ? `#${num}` : task.id,
      title: task.title,
      priority: (task.priority?.toLowerCase() as ArchivedRow['priority']) ?? 'medium',
      assignees: rawAssignees
        .map((a: ArchivedAssignee) => ({
          name: a.name,
          initials: a.avatarInitials?.trim() || initialsFromName(a.name),
          avatarUrl: a.avatarUrl?.trim() || undefined,
        }))
        .filter(a => a.name || a.avatarUrl),
      updatedAt: formatDate(task.updatedAt),
    };
  }

  get selectedStatusName(): string {
    return this.statuses.find(s => s.id === this.selectedStatusId)?.name ?? '';
  }

  viewTask(taskId: string): void {
    this.router.navigate(['/archived-task', taskId]);
  }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.load(); }
  }

  nextPage(): void {
    if (this.page < this.totalPages) { this.page++; this.load(); }
  }

  onClose(): void {
    this.close.emit();
  }
}
