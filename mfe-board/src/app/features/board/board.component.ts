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
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
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
