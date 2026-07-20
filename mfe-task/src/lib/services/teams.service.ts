import apiClient from '@/lib/http/client';
import type { ApiTeam } from '@/lib/types/teams.types';

export const teamsService = {
  async list(params?: { excludeWorkspace?: boolean }): Promise<ApiTeam[]> {
    const { data } = await apiClient.get<{ result: ApiTeam[] }>('/teams', {
      params: params?.excludeWorkspace ? { exclude_workspace: true } : undefined,
    });
    return data.result ?? [];
  },
};
