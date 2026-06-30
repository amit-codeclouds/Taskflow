export interface PaginatedPeople {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}

// Matches PeopleListItemDto
export interface Person {
  id: string;
  name: string;
  email: string;
  title: string;
  avatarInitials?: string;
  avatarUrl?: string;
  teamIds: string[];
  status: string;
}

// Matches PeopleStatsDto
export interface PeopleStats {
  totalMembers: number;
  active: number;
  pendingInvites: number;
  totalTeams: number;
}

// Matches WorkspaceInviteRequestDto
export interface InvitePayload {
  email: string;
}

// Matches UpdateMemberRequestDto
export interface UpdatePersonPayload {
  title?: string;
}

// Matches WorkspaceInvitationResponseDto
export interface InvitationResult {
  id: string;
  email: string;
  status: string;
  expiresAt: string;
}
