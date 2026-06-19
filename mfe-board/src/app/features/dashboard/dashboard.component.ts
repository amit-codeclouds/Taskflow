import { Component } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BOARD_DATA, TEAMS } from '../../shared/static/boardData';
import { Column, Team } from '../../shared/interfaces/board.interface';

interface BoardSummary {
  team: Team;
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  assignees: string[];
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  boards: BoardSummary[] = TEAMS.map(team => {
    const cols: Column[] = BOARD_DATA[team.id] ?? [];
    const all = cols.flatMap(c => c.tasks);
    const find = (id: string) => cols.find(c => c.id === id)?.tasks.length ?? 0;
    return {
      team,
      total: all.length,
      todo: find('todo'),
      inProgress: find('in-progress'),
      done: find('done'),
      assignees: Array.from(new Set(all.map(t => t.assignee))),
    };
  });

  get totalBoards(): number { return this.boards.length; }
  get totalTasks(): number { return this.boards.reduce((s, b) => s + b.total, 0); }
  get totalInProgress(): number { return this.boards.reduce((s, b) => s + b.inProgress, 0); }

  visibleAssignees(b: BoardSummary): string[] { return b.assignees.slice(0, 4); }
  overflowAssignees(b: BoardSummary): number { return Math.max(0, b.assignees.length - 4); }
}
