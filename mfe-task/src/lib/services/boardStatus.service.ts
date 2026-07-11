import apiClient from '@/lib/http/client';
import type { BoardStatus } from '@/lib/types/boardStatus.types';

export const boardStatusService = {
  async byTeam(teamId: string): Promise<BoardStatus[]> {
    const { data } = await apiClient.get<{ result: BoardStatus[] }>(`/board-statuses/team/${teamId}`);
    return data.result ?? [];
  },
};
