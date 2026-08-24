// A team member's role is now a dynamic role id fetched from GET /roles (see RoleSelect).
export type TeamRole = string;

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
