import type { SelectOption } from './selectStyles';

export type TeamRole = 'admin' | 'pm' | 'tl' | 'developer';

export interface TeamMember {
  id: string;
  initials: string;
  name: string;
  email: string;
  title: string;       // '—' if absent
  role: TeamRole;
  isPending?: boolean; // true for email-invited members not yet in workspace
}

export interface Team {
  id: string;
  name: string;
  description: string;
  color: string;
  members: TeamMember[];
}

export const TEAM_COLORS = [
  '#6155DD',
  '#32B173',
  '#E09D34',
  '#6a9eef',
  '#DC4949',
  '#9B59B6',
  '#1ABC9C',
  '#E67E22',
] as const;

export type TeamColor = (typeof TEAM_COLORS)[number];

export const ROLE_OPTIONS: SelectOption[] = [
  { value: 'admin',     label: 'Admin'     },
  { value: 'pm',        label: 'PM'        },
  { value: 'tl',        label: 'Team Lead' },
  { value: 'developer', label: 'Developer' },
];
