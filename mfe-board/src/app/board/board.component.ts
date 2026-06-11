import { Component, HostListener } from '@angular/core';
import { NgFor, NgClass, NgIf } from '@angular/common';

interface Task {
  id: string; title: string; priority: 'high' | 'medium' | 'low';
  label: string; labelColor: string; assignee: string; due: string;
}
interface Column { id: string; title: string; color: string; count: number; tasks: Task[]; }
interface Team    { id: string; name: string; color: string; }

const TEAMS: Team[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];

const BOARD_DATA: Record<string, Column[]> = {
  team_1: [
    { id: 'todo', title: 'To Do', color: '#6E6C6A', count: 4, tasks: [
      { id: 'TF-004', title: 'Set up analytics dashboard', priority: 'medium', label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 22' },
      { id: 'TF-007', title: 'Mobile responsive fixes',    priority: 'high',   label: 'bug',     labelColor: '#DC4949', assignee: 'JD', due: 'Jun 18' },
    ]},
    { id: 'in-progress', title: 'In Progress', color: '#6155DD', count: 3, tasks: [
      { id: 'TF-001', title: 'Authentication redesign',  priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 12' },
      { id: 'TF-003', title: 'Task filtering system',    priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'MK', due: 'Jun 11' },
    ]},
    { id: 'done', title: 'Done', color: '#32B173', count: 2, tasks: [
      { id: 'TF-010', title: 'Initial project setup',  priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 1' },
      { id: 'TF-002', title: 'Database schema design', priority: 'medium', label: 'design',  labelColor: '#6a9eef', assignee: 'JD', due: 'Jun 5' },
    ]},
  ],
  team_2: [
    { id: 'todo', title: 'To Do', color: '#6E6C6A', count: 3, tasks: [
      { id: 'DS-001', title: 'Button component variants',  priority: 'high',   label: 'design',  labelColor: '#6a9eef', assignee: 'SR', due: 'Jun 20' },
      { id: 'DS-002', title: 'Dark mode token audit',      priority: 'medium', label: 'refactor',labelColor: '#E09D34', assignee: 'AC', due: 'Jun 22' },
    ]},
    { id: 'in-progress', title: 'In Progress', color: '#32B173', count: 2, tasks: [
      { id: 'DS-003', title: 'Icon library migration',     priority: 'medium', label: 'infra',   labelColor: '#32B173', assignee: 'SR', due: 'Jun 15' },
    ]},
    { id: 'done', title: 'Done', color: '#32B173', count: 1, tasks: [
      { id: 'DS-004', title: 'Tailwind config setup',      priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 3' },
    ]},
  ],
  team_3: [
    { id: 'todo', title: 'To Do', color: '#6E6C6A', count: 2, tasks: [
      { id: 'AG-001', title: 'Rate limiting middleware',   priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 25' },
    ]},
    { id: 'in-progress', title: 'In Progress', color: '#E09D34', count: 1, tasks: [
      { id: 'AG-002', title: 'Auth token validation',      priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 14' },
    ]},
    { id: 'done', title: 'Done', color: '#32B173', count: 1, tasks: [
      { id: 'AG-003', title: 'Route configuration',        priority: 'medium', label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 2' },
    ]},
  ],
};

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgClass, NgIf],
  template: `
    <div class="board-container">
      <!-- Board header -->
      <div class="board-header">
        <div class="board-header-left">
          <!-- Team selector -->
          <div class="team-selector" (click)="toggleDropdown($event)">
            <span class="team-dot" [style.background]="selectedTeam.color"></span>
            <span class="team-name">{{ selectedTeam.name }}</span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" [style.transform]="dropdownOpen ? 'rotate(180deg)' : ''" style="transition:transform 0.2s">
              <path d="M3 4.5l3 3 3-3" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- Dropdown -->
            <div class="team-dropdown" *ngIf="dropdownOpen">
              <div *ngFor="let team of teams"
                class="team-dropdown-item"
                [class.team-dropdown-item--active]="team.id === selectedTeam.id"
                (click)="selectTeam(team, $event)"
              >
                <span class="team-dot" [style.background]="team.color"></span>
                <span>{{ team.name }}</span>
                <svg *ngIf="team.id === selectedTeam.id" width="12" height="12" viewBox="0 0 12 12" fill="none" style="margin-left:auto">
                  <path d="M2 6l3 3 5-5" stroke="#6155DD" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>
          <span class="header-sep">·</span>
          <div>
            <h1 class="board-title">Sprint Board</h1>
            <p class="board-subtitle">{{ columns.length }} columns · {{ totalTasks }} tasks</p>
          </div>
        </div>
        <div class="board-actions">
          <button class="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 4h12M4 1v2M10 1v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            </svg>Filter
          </button>
          <button class="btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>Add Task
          </button>
        </div>
      </div>

      <!-- Kanban columns -->
      <div class="board-columns">
        <div class="column" *ngFor="let col of columns; let ci = index" [style.animation-delay]="(ci * 0.08) + 's'">
          <div class="column-header">
            <div class="column-header-left">
              <span class="column-dot" [style.background]="col.color"></span>
              <span class="column-title">{{ col.title }}</span>
              <span class="column-count">{{ col.count }}</span>
            </div>
            <button class="column-add-btn">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M6 2v8M2 6h8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
          <div class="column-cards">
            <div class="task-card" *ngFor="let task of col.tasks; let ti = index" [style.animation-delay]="(ci * 0.08 + ti * 0.05) + 's'">
              <div class="task-card-top">
                <span class="task-label" [style.background]="task.labelColor + '22'" [style.color]="task.labelColor">{{ task.label }}</span>
                <div class="priority-dot" [ngClass]="'priority-' + task.priority"></div>
              </div>
              <p class="task-title">{{ task.title }}</p>
              <div class="task-card-footer">
                <div class="task-footer-left">
                  <span class="task-id">{{ task.id }}</span>
                  <span class="task-due">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <rect x="1" y="2" width="8" height="7" rx="1.2" stroke="currentColor" stroke-width="1.1"/>
                      <path d="M3.5 1v1.5M6.5 1v1.5M1 4.5h8" stroke="currentColor" stroke-width="1.1" stroke-linecap="round"/>
                    </svg>{{ task.due }}
                  </span>
                </div>
                <div class="task-assignee">{{ task.assignee }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .board-container { padding: 32px; }
    .board-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 28px; }
    .board-header-left { display: flex; align-items: center; gap: 16px; }
    .header-sep { color: #393940; font-size: 18px; }

    .team-selector {
      position: relative; display: flex; align-items: center; gap: 8px;
      padding: 7px 12px; background: #222227; border: 1px solid #2C2C32;
      border-radius: 10px; cursor: pointer; font-size: 13px; color: #F4F3F0; font-weight: 500;
      transition: border-color 0.15s, background 0.15s; user-select: none;
    }
    .team-selector:hover { background: #2C2C32; }
    .team-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .team-name { white-space: nowrap; }

    .team-dropdown {
      position: absolute; top: calc(100% + 6px); left: 0; min-width: 180px;
      background: #1A1A1E; border: 1px solid #2C2C32; border-radius: 10px;
      padding: 4px; z-index: 100; box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .team-dropdown-item {
      display: flex; align-items: center; gap: 8px; padding: 8px 10px;
      border-radius: 7px; font-size: 13px; color: #ABAAA5; cursor: pointer;
      transition: background 0.12s, color 0.12s;
    }
    .team-dropdown-item:hover { background: #222227; color: #F4F3F0; }
    .team-dropdown-item--active { color: #F4F3F0; }

    .board-title { font-size: 20px; font-weight: 600; color: #F4F3F0; margin: 0; }
    .board-subtitle { font-size: 12px; color: #6E6C6A; margin-top: 2px; }
    .board-actions { display: flex; gap: 8px; }

    .btn-secondary {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      background: #222227; border: 1px solid #2C2C32; border-radius: 8px;
      font-size: 13px; color: #ABAAA5; transition: background 0.15s, color 0.15s;
    }
    .btn-secondary:hover { background: #2C2C32; color: #F4F3F0; }
    .btn-primary {
      display: flex; align-items: center; gap: 6px; padding: 8px 14px;
      background: #6155DD; border-radius: 8px; font-size: 13px; color: white;
      font-weight: 500; transition: background 0.15s, box-shadow 0.15s;
    }
    .btn-primary:hover { background: #766Be8; box-shadow: 0 0 16px rgba(97,85,221,0.3); }

    .board-columns { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; align-items: start; }
    .column {
      background: #1A1A1E; border: 1px solid #2C2C32; border-radius: 12px;
      padding: 16px; animation: fadeUp 0.4s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }

    .column-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .column-header-left { display: flex; align-items: center; gap: 8px; }
    .column-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .column-title { font-size: 13px; font-weight: 600; color: #F4F3F0; }
    .column-count { font-size: 11px; background: #2C2C32; color: #6E6C6A; padding: 1px 7px; border-radius: 999px; font-weight: 500; }
    .column-add-btn { width: 24px; height: 24px; border-radius: 6px; background: #2C2C32; display: flex; align-items: center; justify-content: center; color: #6E6C6A; transition: background 0.15s, color 0.15s; }
    .column-add-btn:hover { background: #6155DD22; color: #6155DD; }
    .column-cards { display: flex; flex-direction: column; gap: 8px; }

    .task-card {
      background: #222227; border: 1px solid #2C2C32; border-radius: 10px;
      padding: 14px; cursor: pointer; transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      animation: fadeUp 0.35s cubic-bezier(0.34,1.56,0.64,1) both;
    }
    .task-card:hover { border-color: #6155DD55; box-shadow: 0 4px 16px rgba(0,0,0,0.3); transform: translateY(-1px); }
    .task-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
    .task-label { font-size: 11px; font-weight: 500; padding: 2px 8px; border-radius: 999px; }
    .priority-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
    .priority-high { background: #DC4949; } .priority-medium { background: #E09D34; } .priority-low { background: #393940; }
    .task-title { font-size: 13px; color: #F4F3F0; line-height: 1.5; margin-bottom: 12px; }
    .task-card-footer { display: flex; align-items: center; justify-content: space-between; }
    .task-footer-left { display: flex; align-items: center; gap: 8px; }
    .task-id { font-size: 11px; font-family: monospace; color: #6E6C6A; }
    .task-due { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #6E6C6A; }
    .task-assignee { width: 24px; height: 24px; border-radius: 50%; background: #261F42; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #6155DD; }
  `]
})
export class BoardComponent {
  teams = TEAMS;
  selectedTeam = TEAMS[0];
  dropdownOpen = false;

  get columns(): Column[] { return BOARD_DATA[this.selectedTeam.id] ?? []; }
  get totalTasks(): number { return this.columns.reduce((s, c) => s + c.tasks.length, 0); }

  toggleDropdown(e: Event) { e.stopPropagation(); this.dropdownOpen = !this.dropdownOpen; }

  selectTeam(team: Team, e: Event) {
    e.stopPropagation();
    this.selectedTeam = team;
    this.dropdownOpen = false;
  }

  @HostListener('document:click')
  closeDropdown() { this.dropdownOpen = false; }
}
