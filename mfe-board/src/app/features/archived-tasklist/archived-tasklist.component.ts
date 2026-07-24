import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf, TitleCasePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiArchivedTask, ApiBoardColumn, ArchivedAssignee } from '../../shared/interfaces/board.interface';
import { TeamService } from '../../core/services/team/team.service';
import { BoardService } from '../../core/services/board/board.service';

// Palette used to colour status tabs by position when the API supplies no colour
// (mirrors the palette BoardComponent uses for board columns).
const STATUS_PALETTE = ['#6E6C6A', '#6155DD', '#32B173', '#E09D34', '#DC4949', '#6a9eef'];

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

// One status tab — only statuses with isArchievable === true are shown, since those
// are the only ones archived tasks can belong to.
interface StatusTab {
  id: string;
  name: string;
  color: string;
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
  private boardService = inject(BoardService);

  teamId = '';
  teamName = '';
  teamColor = '#6155DD';
  loadingTeam = true;   // team name/badge + status tabs (separate from the table's own loading state)

  rows: ArchivedRow[] = [];
  loading = true;
  error = false;

  // Status tabs (archivable statuses only), scoped to this team.
  statuses: StatusTab[] = [];
  selectedStatusId = '';   // '' = "All"

  // Pagination (endpoint supports page/limit).
  page = 1;
  readonly limit = 10;
  total = 0;
  totalPages = 1;

  // Skeleton placeholder rows while loading.
  readonly skeletonRows = [0, 1, 2, 3, 4];
  readonly skeletonTabs = [0, 1, 2];

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('teamId') ?? '';
    if (!this.teamId) {
      this.error = true;
      this.loading = false;
      return;
    }
    this.loadTeamContext();
    this.load();
  }

  // Team name/colour + archivable status tabs. Non-critical to the table itself,
  // so a failure here just leaves the header generic and hides the tab row.
  private loadTeamContext(): void {
    forkJoin({
      teams: this.boardService.getTeams(),
      board: this.teamService.getTeamBoard(this.teamId),
    }).subscribe({
      next: ({ teams, board }) => {
        const team = teams.find(t => t.id === this.teamId);
        if (team) {
          this.teamName = team.name;
          this.teamColor = team.color;
        }
        this.statuses = (board?.columns ?? [])
          .filter(c => !!c.isArchievable)
          .map((c, i) => this.toStatusTab(c, i));
        this.loadingTeam = false;
      },
      error: () => {
        // header stays generic, tab row stays hidden
        this.loadingTeam = false;
      },
    });
  }

  private toStatusTab(column: ApiBoardColumn, index: number): StatusTab {
    return {
      id: column.id,
      name: column.name ?? column.title ?? '',
      color: column.color ?? STATUS_PALETTE[index % STATUS_PALETTE.length],
    };
  }

  // Switch the status filter — re-queries the archived-tasks endpoint with
  // ?statusId=<id> ('' fetches every status for the team) and resets to page 1.
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
    };
  }

  get selectedStatusName(): string {
    return this.statuses.find(s => s.id === this.selectedStatusId)?.name ?? '';
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
