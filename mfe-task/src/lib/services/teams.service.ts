import apiClient from '@/lib/http/client';
import type { ApiTeam } from '@/lib/types/teams.types';

export const teamsService = {
  async list(): Promise<ApiTeam[]> {
    const { data } = await apiClient.get<{ result: ApiTeam[] }>('/teams');
    return data.result ?? [];
  },
};
