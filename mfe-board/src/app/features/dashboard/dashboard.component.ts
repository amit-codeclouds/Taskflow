import { Component, OnInit, inject } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Team } from '../../shared/interfaces/board.interface';
import { BoardService } from '../../core/services/board/board.service';

// One rendered status pill on a board card — only built for statuses that are
// actually present in the team's `statusTaskCounts`.
interface StatusPill {
  label: string;
  count: number;
  color: string;
}

interface BoardSummary {
  team: Team;
  total: number;
  inProgress: number;
  statuses: StatusPill[];
  assignees: string[];
}

// Dot colour + display label for the well-known statuses; unknown statuses fall
// back to a neutral dot and their raw label from the API.
const STATUS_DOT: Record<string, string> = {
  todo: '#6E6C6A',
  inprogress: '#6155DD',
  inreview: '#E09D34',
  done: '#32B173',
};
const STATUS_LABEL: Record<string, string> = {
  todo: 'To Do',
  inprogress: 'In Progress',
  inreview: 'In Review',
  done: 'Done',
};

function initialsFromName(name?: string | null): string {
  if (!name?.trim()) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// "In Progress" / "in-progress" / "InProgress" → "inprogress"
function normStatus(s: string): string {
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

// Read a team's `statusTaskCounts` (array OR object map) into an ordered list of
// only the statuses actually present, preserving their original labels. Statuses
// missing from the response are simply absent — the card renders no pill for them.
function readStatusEntries(raw: Team['statusTaskCounts']): { key: string; label: string; count: number }[] {
  const entries: { key: string; label: string; count: number }[] = [];

  if (Array.isArray(raw)) {
    for (const item of raw) {
      const label = item.statusName ?? item.status ?? item.name;
      const count = item.count ?? item.taskCount ?? 0;
      if (label != null) {
        entries.push({ key: normStatus(String(label)), label: String(label), count: Number(count) || 0 });
      }
    }
  } else if (raw && typeof raw === 'object') {
    for (const [key, value] of Object.entries(raw)) {
      entries.push({ key: normStatus(key), label: key, count: Number(value) || 0 });
    }
  }

  return entries;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private boardService = inject(BoardService);

  boards: BoardSummary[] = [];
  loading = true;
  error = false;

  // Placeholder rows rendered while loading (skeleton cards).
  readonly skeletonCards = [0, 1, 2];

  ngOnInit(): void {
    this.boardService.getTeams().subscribe({
      next: (teams) => {
        this.boards = teams.map(team => this.toSummary(team));
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      },
    });
  }

  // Built entirely from the GET /api/teams response. Assignees come from the team's
  // `members` array; status pills come from whatever statuses are present in the
  // team's `statusTaskCounts` — a status absent from the response gets no pill.
  private toSummary(team: Team): BoardSummary {
    const assignees = (team.members ?? []).map(
      m => (m.avatarInitials?.trim() || initialsFromName(m.name)),
    );
    const entries = readStatusEntries(team.statusTaskCounts);
    return {
      team,
      total: entries.reduce((s, e) => s + e.count, 0),
      inProgress: entries.find(e => e.key === 'inprogress')?.count ?? 0,
      statuses: entries.map(e => ({
        label: STATUS_LABEL[e.key] ?? e.label,
        count: e.count,
        color: STATUS_DOT[e.key] ?? '#6E6C6A',
      })),
      assignees,
    };
  }

  get totalBoards(): number { return this.boards.length; }
  get totalTasks(): number { return this.boards.reduce((s, b) => s + b.total, 0); }
  get totalInProgress(): number { return this.boards.reduce((s, b) => s + b.inProgress, 0); }

  visibleAssignees(b: BoardSummary): string[] { return b.assignees.slice(0, 4); }
  overflowAssignees(b: BoardSummary): number { return Math.max(0, b.assignees.length - 4); }
}
