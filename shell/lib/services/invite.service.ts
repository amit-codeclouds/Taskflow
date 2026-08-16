import apiClient from '@/lib/http/client';
import type { Invitation } from '@/lib/types/invite.types';

export const inviteService = {
  // GET /people/invitations?userId= — invitations addressed to a user.
  // Backend wraps successful payloads as { status, code, result }.
  async listByUser(userId: string): Promise<Invitation[]> {
    const { data } = await apiClient.get<{ result: Invitation[] }>('/people/invitations', {
      params: { userId },
    });
    return data.result ?? [];
  },
};
