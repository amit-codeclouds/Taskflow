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

// Matches AvatarResponseDto — POST /users/avatar
export interface AvatarUploadResponse {
  avatarUrl: string;
  avatarPublicId: string;
}

// Matches UserSettingsResponseDto — GET /auth/me/settings, PUT /users/{userId}/settings
export interface UserSettings {
  userId: string;
  daysToArchieve: number; // spelling mirrors the backend response
}

// Matches UpdateUserSettingsRequestDto — PUT /users/{id}/settings
export interface UpdateUserSettingsPayload {
  daysToArchieve: number;
}
