import { Component, HostListener, OnInit, inject } from '@angular/core';
import { NgFor, NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest } from 'rxjs';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import {
  ApiBoardColumn,
  ApiBoardTask,
  Column,
  Task,
  Team,
} from '../../shared/interfaces/board.interface';
import { BoardService } from '../../core/services/board/board.service';
import { TeamService } from '../../core/services/team/team.service';
import { ConfirmationModalComponent } from '../../shared/modal/confirmation-modal/confirmation-modal.component';

// Palette used to colour columns by position (the API statuses carry no colour).
const COLUMN_PALETTE = ['#6E6C6A', '#6155DD', '#32B173', '#E09D34', '#DC4949', '#6a9eef'];

const LABEL_COLORS: Record<string, string> = {
  feature: '#766Be8',
  bug: '#DC4949',
  design: '#6a9eef',
  docs: '#6a9eef',
  infra: '#32B173',
  refactor: '#E09D34',
};

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgClass, NgIf, NgTemplateOutlet, DragDropModule, ConfirmationModalComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  private boardService = inject(BoardService);
  private teamService = inject(TeamService);

  teams: Team[] = [];
  selectedTeam?: Team;
  columns: Column[] = [];
  loading = true;      // teams / selected team resolving
  boardLoading = false; // board columns loading for the selected team
  dropdownOpen = false;

  // Skeleton placeholder layout: 3 columns with these task-card counts.
  readonly skeletonColumns = [[0, 1, 2], [0, 1], [0, 1, 2]];

  // Pending archive/delete confirmation (null = no modal open).
  confirm: { kind: 'archive' | 'delete'; col: Column } | null = null;
  confirmLoading = false;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    // Resolve the selected team from GET /api/teams (route param is a real UUID),
    // then load that team's board from GET /api/tasks/team/:teamId/board.
    combineLatest([this.boardService.getTeams(), this.route.paramMap]).subscribe({
      next: ([teams, params]) => {
        this.teams = teams;
        this.loading = false;
        const teamId = params.get('teamId');
        const match = teams.find(t => t.id === teamId);
        this.selectedTeam = match ?? (teams.length ? teams[0] : undefined);
        if (this.selectedTeam) {
          this.loadBoard(this.selectedTeam.id);
        }
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private loadBoard(teamId: string) {
    this.boardLoading = true;
    this.columns = [];
    this.teamService.getTeamBoard(teamId).subscribe({
      next: (board) => {
        this.columns = (board?.columns ?? []).map((c, i) => this.toColumn(c, i));
        this.boardLoading = false;
      },
      error: () => {
        this.columns = [];
        this.boardLoading = false;
      },
    });
  }

  // ── Response → view-model mapping (the single place to adjust if the live
  //    payload's field names differ from the provisional TeamBoard shape) ──
  private toColumn(column: ApiBoardColumn, index: number): Column {
    const tasks = (column.tasks ?? []).map(t => this.toTask(t));
    return {
      id: column.id,
      statusId: column.id,
      title: column.name ?? column.title ?? '',
      color: column.color ?? COLUMN_PALETTE[index % COLUMN_PALETTE.length],
      count: column.totalTasks ?? column.count ?? tasks.length,
      isArchievable: !!column.isArchievable,
      isDeletable: !!column.isDeletable,
      tasks,
    };
  }

  private toTask(task: ApiBoardTask): Task {
    const num = task.taskNumber ?? task.number;
    return {
      id: num != null ? `#${num}` : task.id,
      taskId: task.id,
      title: task.title,
      priority: (task.priority?.toLowerCase() as Task['priority']) ?? 'medium',
      label: task.label ?? '',
      labelColor: LABEL_COLORS[(task.label ?? '').toLowerCase()] ?? '#766Be8',
      assignees: (task.assignees ?? [])
        .map(a => ({
          initials: a.avatarInitials?.trim() || initialsFromName(a.name),
          avatarUrl: a.avatarUrl,
        }))
        .filter(a => a.initials || a.avatarUrl),
      due: this.formatDue(task.expectedCompletion ?? task.dueDate ?? task.due),
    };
  }

  private formatDue(iso?: string): string {
    if (!iso) return '';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  get totalTasks(): number { return this.columns.reduce((s, c) => s + c.tasks.length, 0); }
  get connectedDropLists(): string[] { return this.columns.map(c => c.id); }

  toggleDropdown(e: Event) { e.stopPropagation(); this.dropdownOpen = !this.dropdownOpen; }

  addTaskUrl(col: Column): string {
    const params = new URLSearchParams({ teamId: this.selectedTeam?.id ?? '', statusId: col.statusId });
    return `/tasks/new?${params.toString()}`;
  }

  // Open the task detail page. /tasks/* is the Task MFE zone, so this is a hard
  // (cross-zone) navigation, not an Angular router navigation.
  openTask(task: Task): void {
    window.location.href = `/tasks/${task.taskId}`;
  }

  archiveStatus(col: Column, event: Event): void {
    event.stopPropagation();
    this.confirm = { kind: 'archive', col };
  }

  deleteStatus(col: Column, event: Event): void {
    event.stopPropagation();
    this.confirm = { kind: 'delete', col };
  }

  onConfirm(): void {
    if (!this.confirm) return;
    const { kind, col } = this.confirm;

    if (kind === 'delete') {
      this.confirmLoading = true;
      this.teamService.deleteStatus(col.statusId).subscribe({
        next: () => {
          this.confirmLoading = false;
          this.confirm = null;
          if (this.selectedTeam) this.loadBoard(this.selectedTeam.id);   // refetch the board
        },
        error: () => {
          // Keep the modal open so the user can retry or cancel.
          this.confirmLoading = false;
        },
      });
      return;
    }

    // TODO: archive-status API (no endpoint yet).
    this.confirm = null;
  }

  onCancelConfirm(): void {
    if (!this.confirmLoading) this.confirm = null;
  }

  selectTeam(team: Team, e: Event) {
    e.stopPropagation();
    this.selectedTeam = team;
    this.dropdownOpen = false;
    this.router.navigate(['/', team.id]);
  }

  onTaskDropped(event: CdkDragDrop<Task[]>, target: Column) {
    // Reorder within the same column — purely local, no status change.
    if (event.previousContainer === event.container) {
      moveItemInArray(target.tasks, event.previousIndex, event.currentIndex);
      return;
    }

    const source = this.columns.find(c => c.id === event.previousContainer.id);
    const task = event.previousContainer.data[event.previousIndex];

    // Optimistically move the card, then persist the new status.
    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );
    if (source) source.count = source.tasks.length;
    target.count = target.tasks.length;

    this.teamService.updateTaskStatus(task.taskId, target.statusId).subscribe({
      error: () => {
        // Revert the optimistic move if the backend rejects it.
        transferArrayItem(
          event.container.data,
          event.previousContainer.data,
          event.currentIndex,
          event.previousIndex,
        );
        if (source) source.count = source.tasks.length;
        target.count = target.tasks.length;
      },
    });
  }

  @HostListener('document:click')
  closeDropdown() { this.dropdownOpen = false; }
}
