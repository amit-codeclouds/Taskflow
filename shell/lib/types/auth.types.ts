export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  title: string;
  workspaceName: string;
}

export interface UserTeamMembership {
  teamId: string;
  teamName: string;
  workspaceId: string;
  role: string;
  joinedAt: string;
}

export interface UserWorkspaceMembership {
  workspaceId: string;
  name: string;
  role: string;
  status: string;
  joinedAt: string | null;
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
