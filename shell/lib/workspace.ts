// Shared workspace-level data used by People screen, Teams invite picker, and Sidebar.
// Replace with API calls when the backend is connected.

export type MemberStatus = 'active' | 'pending';

export interface WorkspaceMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  title: string;      // job title / role
  teamIds: string[];  // IDs of teams they belong to
  status: MemberStatus;
}

export interface WorkspaceTeam {
  id: string;
  name: string;
  color: string;
}

export const WORKSPACE_TEAMS: WorkspaceTeam[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];

export const WORKSPACE_MEMBERS: WorkspaceMember[] = [
  { id: 'u1', initials: 'AC', name: 'Arkabrata C.', email: 'arkabrata@codeclouds.com', title: 'Engineer',        teamIds: ['team_1', 'team_2'], status: 'active'  },
  { id: 'u2', initials: 'JD', name: 'John Doe',     email: 'john@codeclouds.com',      title: 'Product Manager', teamIds: ['team_1'],           status: 'active'  },
  { id: 'u3', initials: 'MK', name: 'Maya Khan',    email: 'maya@codeclouds.com',      title: 'Designer',        teamIds: ['team_1'],           status: 'active'  },
  { id: 'u4', initials: 'SR', name: 'Sam Roy',      email: 'sam@codeclouds.com',       title: 'Engineer',        teamIds: ['team_2'],           status: 'active'  },
  { id: 'u5', initials: 'PR', name: 'Priya R.',     email: 'priya@external.com',       title: '—',               teamIds: [],                   status: 'pending' },
];
