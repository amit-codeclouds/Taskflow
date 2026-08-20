// Shapes for GET /api/workspace/:workspaceId/info (response `result`).

export interface WorkspacePerson {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarUrl?: string | null;
}

export interface WorkspaceTeamSummary {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface WorkspaceDetails {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  owner: WorkspacePerson;
  teams: WorkspaceTeamSummary[];
  members: WorkspacePerson[];
}
