'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { boardService } from '@/lib/services/board.service';
import { queryKeys } from '@/lib/queryKeys';

export function useTeamBoard(teamId: string) {
  return useQuery({
    queryKey: queryKeys.board.team(teamId),
    queryFn: () => boardService.getTeamBoard(teamId),
    enabled: !!teamId,
    placeholderData: keepPreviousData,
  });
}
