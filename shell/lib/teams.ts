import type { SelectOption } from './selectStyles';

export type TeamRole = 'Admin' | 'PM' | 'TL' | 'Developer';

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
  { value: 'Admin',     label: 'Admin'     },
  { value: 'PM',        label: 'PM'        },
  { value: 'TL',        label: 'Team Lead' },
  { value: 'Developer', label: 'Developer' },
];
