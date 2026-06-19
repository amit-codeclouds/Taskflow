import { Column, Team } from '../interfaces/board.interface';

export const TEAMS: Team[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];

export const BOARD_DATA: Record<string, Column[]> = {
  team_1: [
    { id: 'todo', statusId: 'stat_1', title: 'To Do', color: '#6E6C6A', count: 4, tasks: [
      { id: 'TF-004', title: 'Set up analytics dashboard', priority: 'medium', label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 22' },
      { id: 'TF-007', title: 'Mobile responsive fixes',    priority: 'high',   label: 'bug',     labelColor: '#DC4949', assignee: 'JD', due: 'Jun 18' },
    ]},
    { id: 'in-progress', statusId: 'stat_2', title: 'In Progress', color: '#6155DD', count: 3, tasks: [
      { id: 'TF-001', title: 'Authentication redesign',  priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 12' },
      { id: 'TF-003', title: 'Task filtering system',    priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'MK', due: 'Jun 11' },
      { id: 'TF-010', title: 'Authentication redesign',  priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 12' },
      { id: 'TF-011', title: 'Task filtering system',    priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'MK', due: 'Jun 11' },
    ]},
    { id: 'done', statusId: 'stat_4', title: 'Done', color: '#32B173', count: 2, tasks: [
      { id: 'TF-010', title: 'Initial project setup',  priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 1' },
      { id: 'TF-002', title: 'Database schema design', priority: 'medium', label: 'design',  labelColor: '#6a9eef', assignee: 'JD', due: 'Jun 5' },
    ]},
  ],
  team_2: [
    { id: 'todo', statusId: 'stat_5', title: 'To Do', color: '#6E6C6A', count: 3, tasks: [
      { id: 'DS-001', title: 'Button component variants',  priority: 'high',   label: 'design',  labelColor: '#6a9eef', assignee: 'SR', due: 'Jun 20' },
      { id: 'DS-002', title: 'Dark mode token audit',      priority: 'medium', label: 'refactor',labelColor: '#E09D34', assignee: 'AC', due: 'Jun 22' },
    ]},
    { id: 'in-progress', statusId: 'stat_6', title: 'In Progress', color: '#32B173', count: 2, tasks: [
      { id: 'DS-003', title: 'Icon library migration',     priority: 'medium', label: 'infra',   labelColor: '#32B173', assignee: 'SR', due: 'Jun 15' },
    ]},
    { id: 'done', statusId: 'stat_7', title: 'Done', color: '#32B173', count: 1, tasks: [
      { id: 'DS-004', title: 'Tailwind config setup',      priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 3' },
    ]},
  ],
  team_3: [
    { id: 'todo', statusId: 'stat_8', title: 'To Do', color: '#6E6C6A', count: 2, tasks: [
      { id: 'AG-001', title: 'Rate limiting middleware',   priority: 'high',   label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 25' },
    ]},
    { id: 'in-progress', statusId: 'stat_9', title: 'In Progress', color: '#E09D34', count: 1, tasks: [
      { id: 'AG-002', title: 'Auth token validation',      priority: 'high',   label: 'feature', labelColor: '#766Be8', assignee: 'AC', due: 'Jun 14' },
    ]},
    { id: 'done', statusId: 'stat_11', title: 'Done', color: '#32B173', count: 1, tasks: [
      { id: 'AG-003', title: 'Route configuration',        priority: 'medium', label: 'infra',   labelColor: '#32B173', assignee: 'AC', due: 'Jun 2' },
    ]},
  ],
};
