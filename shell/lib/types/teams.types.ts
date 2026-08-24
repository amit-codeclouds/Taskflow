// A team member's role is a dynamic role id fetched from GET /roles (see @/lib/hooks/useRoles).
export type TeamRole = string;

// Matches TeamMemberSummaryDto
export interface ApiTeamMember {
  userId: string;
  name: string;
  avatarInitials?: string;
  avatarUrl?: string;
  role: string;
}

// Matches TeamResponseDto
export interface ApiTeam {
  id: string;
  name: string;
  description?: string;
  color: string;
  workspaceId: string;
  adminId: string;
  pendingInvites: number;
  members: ApiTeamMember[];
  createdAt: string;
  updatedAt: string;
}

// Matches TeamStatsDto
export interface TeamStats {
  totalTeams: number;
  totalMembers: number;
  pendingInvites: number;
}

// Matches TeamMemberInitDto / TeamMemberUpdateDto
export interface CreateTeamMember {
  userId: string;
  role: TeamRole;
}

// Matches CreateTeamRequestDto
export interface CreateTeamPayload {
  name: string;
  description?: string;
  color: string;
  memberIds?: CreateTeamMember[];
}

// Matches UpdateTeamRequestDto
export interface UpdateTeamPayload {
  name?: string;
  description?: string;
  color?: string;
  members?: CreateTeamMember[];
}

// Matches TeamInviteRequestDto
export interface TeamInvitePayload {
  email: string;
  role: TeamRole;
  addToWorkspace?: boolean;
}

// Matches TeamInvitationResponseDto
export interface TeamInvitationResult {
  id: string;
  teamId: string;
  email: string;
  role: string;
  status: string;
  expiresAt: string;
  createdAt: string;
}
