import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApiArchivedTask, ArchivedAssignee } from '../../shared/interfaces/board.interface';
import { TeamService } from '../../core/services/team/team.service';

// One assignee as rendered in the table — avatar + name for the hover tooltip.
interface AssigneeView {
  name: string;
  initials: string;
  avatarUrl?: string;
}

// One archived-task row in the table.
interface ArchivedRow {
  id: string;
  number: string;      // display, e.g. "#42"
  title: string;
  priority: 'high' | 'medium' | 'low';
  assignees: AssigneeView[];
}

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

@Component({
  selector: 'app-archived-tasklist',
  standalone: true,
  imports: [NgFor, NgIf, TitleCasePipe, RouterLink],
  templateUrl: './archived-tasklist.component.html',
  styleUrl: './archived-tasklist.component.scss'
})
export class ArchivedTasklistComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private teamService = inject(TeamService);

  teamId = '';
  rows: ArchivedRow[] = [];
  loading = true;
  error = false;

  // Pagination (endpoint supports page/limit).
  page = 1;
  readonly limit = 10;
  total = 0;
  totalPages = 1;

  // Skeleton placeholder rows while loading.
  readonly skeletonRows = [0, 1, 2, 3, 4];

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    this.load();
  }

  private load(): void {
    if (!this.teamId) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.loading = true;
    this.error = false;
    this.teamService.getArchivedTasks(this.teamId, { page: this.page, limit: this.limit }).subscribe({
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
    };
  }

  // Open the archived task's detail page.
  viewTask(taskId: string): void {
    this.router.navigate(['/archived-task', taskId]);
  }

  prevPage(): void {
    if (this.page > 1) { this.page--; this.load(); }
  }

  nextPage(): void {
    if (this.page < this.totalPages) { this.page++; this.load(); }
  }
}
