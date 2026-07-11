export interface UserWorkspaceMembership {
  workspaceId: string;
  name: string;
  role: string;
  status: string;
  joinedAt: string | null;
}

export interface UserTeamMembership {
  teamId: string;
  teamName: string;
  workspaceId: string;
  role: string;
  joinedAt: string;
}

// Matches UserResponseDto from the backend OpenAPI spec
export interface MeResponse {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarInitials?: string;
  avatarUrl?: string;
  workspaces?: UserWorkspaceMembership[];
  teams?: UserTeamMembership[];
}
