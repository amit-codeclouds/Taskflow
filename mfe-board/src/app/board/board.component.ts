import { Component } from '@angular/core';
import { NgFor, NgClass } from '@angular/common';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  labelColor: string;
  assignee: string;
  due: string;
}

interface Column {
  id: string;
  title: string;
  color: string;
  count: number;
  tasks: Task[];
}

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [NgFor, NgClass],
  template: `
    <div class="board-container">
      <!-- Board header -->
      <div class="board-header">
        <div>
          <h1 class="board-title">Sprint Board</h1>
          <p class="board-subtitle">Phase 0 &middot; Multi-Zones Foundation</p>
        </div>
        <div class="board-actions">
          <button class="btn-secondary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 4h12M4 1v2M10 1v2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>
              <rect x="1" y="5" width="12" height="8" rx="1.5" stroke="currentColor" stroke-width="1.4"/>
            </svg>
            Filter
          </button>
          <button class="btn-primary">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/>
            </svg>
            Add Task
          </button>
        </div>
      </div>

      <!-- Kanban columns -->
      <div class="board-columns">
        <div class="column" *ngFor="let col of columns; let ci = index"
          [style.animation-delay]="(ci * 0.08) + 's'">
          <!-- Column header -->
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

          <!-- Task cards -->
          <div class="column-cards">
            <div class="task-card" *ngFor="let task of col.tasks; let ti = index"
              [style.animation-delay]="(ci * 0.08 + ti * 0.05) + 's'">
              <div class="task-card-top">
                <span class="task-label" [style.background]="task.labelColor + '22'" [style.color]="task.labelColor">
                  {{ task.label }}
                </span>
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
                    </svg>
                    {{ task.due }}
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
    .board-container {
      padding: 32px;
    }

    .board-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      margin-bottom: 28px;
    }

    .board-title {
      font-size: 24px;
      font-weight: 600;
      color: #F4F3F0;
      margin: 0;
    }

    .board-subtitle {
      font-size: 12px;
      color: #6155DD;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 4px;
    }

    .board-actions {
      display: flex;
      gap: 8px;
    }

    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #222227;
      border: 1px solid #2C2C32;
      border-radius: 8px;
      font-size: 13px;
      color: #ABAAA5;
      transition: background 0.15s, color 0.15s;
    }

    .btn-secondary:hover { background: #2C2C32; color: #F4F3F0; }

    .btn-primary {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 8px 14px;
      background: #6155DD;
      border-radius: 8px;
      font-size: 13px;
      color: white;
      font-weight: 500;
      transition: background 0.15s, box-shadow 0.15s;
    }

    .btn-primary:hover { background: #766Be8; box-shadow: 0 0 16px rgba(97,85,221,0.3); }

    .board-columns {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      align-items: start;
    }

    .column {
      background: #1A1A1E;
      border: 1px solid #2C2C32;
      border-radius: 12px;
      padding: 16px;
      animation: fadeUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(16px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .column-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 12px;
    }

    .column-header-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .column-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .column-title {
      font-size: 13px;
      font-weight: 600;
      color: #F4F3F0;
    }

    .column-count {
      font-size: 11px;
      background: #2C2C32;
      color: #6E6C6A;
      padding: 1px 7px;
      border-radius: 999px;
      font-weight: 500;
    }

    .column-add-btn {
      width: 24px;
      height: 24px;
      border-radius: 6px;
      background: #2C2C32;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6E6C6A;
      transition: background 0.15s, color 0.15s;
    }

    .column-add-btn:hover { background: #6155DD22; color: #6155DD; }

    .column-cards {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .task-card {
      background: #222227;
      border: 1px solid #2C2C32;
      border-radius: 10px;
      padding: 14px;
      cursor: pointer;
      transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
      animation: fadeUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) both;
    }

    .task-card:hover {
      border-color: #6155DD55;
      box-shadow: 0 4px 16px rgba(0,0,0,0.3);
      transform: translateY(-1px);
    }

    .task-card-top {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 8px;
    }

    .task-label {
      font-size: 11px;
      font-weight: 500;
      padding: 2px 8px;
      border-radius: 999px;
      letter-spacing: 0.02em;
    }

    .priority-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .priority-high   { background: #DC4949; }
    .priority-medium { background: #E09D34; }
    .priority-low    { background: #393940; }

    .task-title {
      font-size: 13px;
      color: #F4F3F0;
      line-height: 1.5;
      margin-bottom: 12px;
    }

    .task-card-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .task-footer-left {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .task-id {
      font-size: 11px;
      font-family: monospace;
      color: #6E6C6A;
    }

    .task-due {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 11px;
      color: #6E6C6A;
    }

    .task-assignee {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: #261F42;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 10px;
      font-weight: 600;
      color: #6155DD;
    }
  `]
})
export class BoardComponent {
  columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: '#6E6C6A',
      count: 4,
      tasks: [
        { id: 'TF-004', title: 'Set up analytics dashboard',   priority: 'medium', label: 'feature',  labelColor: '#766Be8', assignee: 'AC', due: 'Jun 22' },
        { id: 'TF-007', title: 'Mobile responsive fixes',       priority: 'high',   label: 'bug',      labelColor: '#DC4949', assignee: 'AC', due: 'Jun 18' },
        { id: 'TF-008', title: 'Performance optimisation',      priority: 'medium', label: 'infra',    labelColor: '#32B173', assignee: 'AC', due: 'Jun 25' },
        { id: 'TF-009', title: 'User settings page',            priority: 'low',    label: 'feature',  labelColor: '#766Be8', assignee: 'AC', due: 'Jun 30' },
      ],
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      color: '#6155DD',
      count: 3,
      tasks: [
        { id: 'TF-001', title: 'Authentication redesign',       priority: 'high',   label: 'feature',  labelColor: '#766Be8', assignee: 'AC', due: 'Jun 12' },
        { id: 'TF-003', title: 'Task filtering system',         priority: 'high',   label: 'feature',  labelColor: '#766Be8', assignee: 'AC', due: 'Jun 11' },
        { id: 'TF-006', title: 'API rate limiting',             priority: 'medium', label: 'infra',    labelColor: '#32B173', assignee: 'AC', due: 'Jun 15' },
      ],
    },
    {
      id: 'done',
      title: 'Done',
      color: '#32B173',
      count: 2,
      tasks: [
        { id: 'TF-010', title: 'Initial project setup',         priority: 'high',   label: 'infra',    labelColor: '#32B173', assignee: 'AC', due: 'Jun 1'  },
        { id: 'TF-002', title: 'Database schema design',        priority: 'medium', label: 'design',   labelColor: '#6a9eef', assignee: 'AC', due: 'Jun 5'  },
      ],
    },
  ];
}
