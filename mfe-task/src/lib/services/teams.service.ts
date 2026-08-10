import apiClient from '@/lib/http/client';
import type { ApiTeam } from '@/lib/types/teams.types';

// Full backend TeamResponseDto — only `members` is used here (to derive memberCount);
// the rest of the fields (description, ownerId, pendingInvites, etc.) aren't needed by the Task MFE.
interface RawTeam {
  id: string;
  name: string;
  color: string;
  members?: { userId: string }[];
}

export const teamsService = {
  async list(params?: { excludeWorkspace?: boolean }): Promise<ApiTeam[]> {
    const { data } = await apiClient.get<{ result: RawTeam[] }>('/teams', {
      params: params?.excludeWorkspace ? { exclude_workspace: true } : undefined,
    });
    return (data.result ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      color: t.color,
      memberCount: t.members?.length ?? 0,
    }));
  },
};
