// One invitation addressed to a user — GET /people/invitations?userId=
// Shape confirmed against the live payload.
export interface Invitation {
  id: string;
  workspaceId: string;
  workspaceName: string;
  invitedBy: string;      // inviter's display name (e.g. "Arkabrata Chandra")
  email: string;          // recipient email
  expiresAt: string;      // ISO 8601
  createdAt: string;      // ISO 8601
}

// Body for accept / decline — POST /people/invitations/accept | /decline
export interface InviteActionPayload {
  workspaceId: string;
  userId: string;
}
