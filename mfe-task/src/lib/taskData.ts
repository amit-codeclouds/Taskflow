export type Priority = 'high' | 'medium' | 'low';
export type LabelType = 'feature' | 'bug' | 'design' | 'docs' | 'infra' | 'refactor';
export type StatusKey = 'in-progress' | 'review' | 'todo' | 'done';

export interface Team { id: string; name: string; color: string; }
export interface BoardStatus { id: string; name: string; teamId: string; }

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  statusId: string;
  status: { id: string; name: string };
  label: LabelType;
  assignee: string;
  teamId: string;
  team: Team;
  expectedCompletion?: string;
  progress: number;
  imageUrls: string[];
}

export const TEAMS: Team[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];

export const TEAM_STATUSES: Record<string, BoardStatus[]> = {
  team_1: [
    { id: 'stat_1', name: 'Backlog',     teamId: 'team_1' },
    { id: 'stat_2', name: 'In Progress', teamId: 'team_1' },
    { id: 'stat_3', name: 'Review',      teamId: 'team_1' },
    { id: 'stat_4', name: 'Done',        teamId: 'team_1' },
  ],
  team_2: [
    { id: 'stat_5', name: 'To Do',      teamId: 'team_2' },
    { id: 'stat_6', name: 'In Design',  teamId: 'team_2' },
    { id: 'stat_7', name: 'Done',       teamId: 'team_2' },
  ],
  team_3: [
    { id: 'stat_8',  name: 'Backlog',     teamId: 'team_3' },
    { id: 'stat_9',  name: 'Development', teamId: 'team_3' },
    { id: 'stat_10', name: 'Testing',     teamId: 'team_3' },
    { id: 'stat_11', name: 'Done',        teamId: 'team_3' },
  ],
};

export interface Person {
  id: string;
  name: string;
  initials: string;
  email: string;
  title: string;
}

export const PEOPLE: Person[] = [
  { id: 'u1', name: 'Arkabrata Das',  initials: 'AD', email: 'arkabrata@codeclouds.com', title: 'Engineer'   },
  { id: 'u2', name: 'Alice Chen',     initials: 'AC', email: 'alice@codeclouds.com',     title: 'Designer'   },
  { id: 'u3', name: 'Bob Smith',      initials: 'BS', email: 'bob@codeclouds.com',       title: 'PM'         },
  { id: 'u4', name: 'Carol White',    initials: 'CW', email: 'carol@codeclouds.com',     title: 'Developer'  },
  { id: 'u5', name: 'Dev Kumar',      initials: 'DK', email: 'dev@codeclouds.com',       title: 'Tech Lead'  },
];

export const TASKS: Task[] = [
  { id: 'TF-001', title: 'Implement authentication flow',  description: 'Build the full login/signup flow including OAuth and session management.', priority: 'high',   statusId: 'stat_2', status: { id: 'stat_2', name: 'In Progress' }, assignee: 'AC', teamId: 'team_1', team: TEAMS[0], label: 'feature',  expectedCompletion: '2026-06-12', progress: 35, imageUrls: [] },
  { id: 'TF-002', title: 'Design onboarding screens',      description: 'Create Figma designs for the onboarding flow covering all steps.',          priority: 'medium', statusId: 'stat_3', status: { id: 'stat_3', name: 'Review' },      assignee: 'AC', teamId: 'team_1', team: TEAMS[0], label: 'design',   expectedCompletion: '2026-06-14', progress: 80, imageUrls: [] },
  { id: 'TF-003', title: 'Fix navigation bug on mobile',   description: 'The bottom nav bar overlaps content on small screen iOS devices.',          priority: 'high',   statusId: 'stat_2', status: { id: 'stat_2', name: 'In Progress' }, assignee: 'AC', teamId: 'team_1', team: TEAMS[0], label: 'bug',      expectedCompletion: '2026-06-11', progress: 60, imageUrls: [] },
  { id: 'TF-004', title: 'Write API documentation',        description: 'Document all public API endpoints with OpenAPI spec.',                       priority: 'low',    statusId: 'stat_1', status: { id: 'stat_1', name: 'Backlog' },     assignee: 'AC', teamId: 'team_1', team: TEAMS[0], label: 'docs',     expectedCompletion: '2026-06-20', progress: 0,  imageUrls: [] },
  { id: 'TF-005', title: 'Set up CI/CD pipeline',          description: 'Configure GitHub Actions for automated test and deploy on each PR.',         priority: 'medium', statusId: 'stat_4', status: { id: 'stat_4', name: 'Done' },        assignee: 'AC', teamId: 'team_1', team: TEAMS[0], label: 'infra',    expectedCompletion: '2026-06-08', progress: 100,imageUrls: [] },
  { id: 'DS-001', title: 'Button component variants',       description: 'Build all button variants (primary, secondary, ghost, danger) in the DS.',   priority: 'high',   statusId: 'stat_5', status: { id: 'stat_5', name: 'To Do' },       assignee: 'AC', teamId: 'team_2', team: TEAMS[1], label: 'design',   expectedCompletion: '2026-06-20', progress: 0,  imageUrls: [] },
  { id: 'DS-002', title: 'Dark mode token audit',           description: 'Audit all colour tokens and ensure dark mode consistency across components.', priority: 'medium', statusId: 'stat_6', status: { id: 'stat_6', name: 'In Design' },  assignee: 'AC', teamId: 'team_2', team: TEAMS[1], label: 'refactor', expectedCompletion: '2026-06-22', progress: 40, imageUrls: [] },
  { id: 'AG-001', title: 'Rate limiting middleware',        description: 'Implement per-IP and per-user rate limiting at the edge gateway.',           priority: 'high',   statusId: 'stat_8', status: { id: 'stat_8', name: 'Backlog' },     assignee: 'AC', teamId: 'team_3', team: TEAMS[2], label: 'infra',    expectedCompletion: '2026-06-25', progress: 0,  imageUrls: [] },
  { id: 'AG-002', title: 'Auth token validation',           description: 'Validate JWT tokens at the gateway before forwarding to upstream services.',  priority: 'high',   statusId: 'stat_9', status: { id: 'stat_9', name: 'Development' },assignee: 'AC', teamId: 'team_3', team: TEAMS[2], label: 'feature',  expectedCompletion: '2026-06-14', progress: 20, imageUrls: [] },
];

export const LABEL_STYLES: Record<LabelType, string> = {
  feature:  'bg-accent-bg text-accent-hover',
  bug:      'bg-red-bg text-status-red',
  design:   'bg-[#1a2038] text-[#6a9eef]',
  docs:     'bg-bg-600 text-text-300',
  infra:    'bg-[#1a2a20] text-status-green',
  refactor: 'bg-amber-bg text-status-amber',
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  high:   'bg-status-red',
  medium: 'bg-status-amber',
  low:    'bg-status-green',
};

export const PRIORITY_TEXT: Record<Priority, string> = {
  high:   'text-status-red',
  medium: 'text-status-amber',
  low:    'text-status-green',
};
