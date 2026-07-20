import apiClient from '@/lib/http/client';
import type { TeamBoard } from '@/lib/types/board.types';

export const boardService = {
  async getTeamBoard(teamId: string): Promise<TeamBoard> {
    const { data } = await apiClient.get<{ result: TeamBoard }>(`/tasks/team/${teamId}/board`);
    return data.result;
  },
};
