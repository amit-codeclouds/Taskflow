import apiClient from '@/lib/http/client';
import type { Invitation, InviteActionPayload } from '@/lib/types/invite.types';

export const inviteService = {
  // GET /people/invitations?userId= — invitations addressed to a user.
  // Backend wraps successful payloads as { status, code, result }.
  async listByUser(userId: string): Promise<Invitation[]> {
    const { data } = await apiClient.get<{ result: Invitation[] }>('/people/invitations', {
      params: { userId },
    });
    return data.result ?? [];
  },

  // POST /people/invitations/accept — accept a workspace invitation.
  async accept(payload: InviteActionPayload): Promise<void> {
    await apiClient.post('/people/invitations/accept', payload);
  },

  // POST /people/invitations/decline — reject a workspace invitation.
  async decline(payload: InviteActionPayload): Promise<void> {
    await apiClient.post('/people/invitations/decline', payload);
  },
};
