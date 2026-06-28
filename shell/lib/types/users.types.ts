import type { UserTeamMembership, UserWorkspaceMembership } from './auth.types';

// Matches UserResponseDto
export interface User {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarInitials?: string;
  avatarUrl?: string;
  workspaces?: UserWorkspaceMembership[];
  teams?: UserTeamMembership[];
}

// Matches UpdateUserRequestDto
export interface UpdateUserPayload {
  name?: string;
  title?: string;
  avatarUrl?: string;
  avatarPublicId?: string;
}
