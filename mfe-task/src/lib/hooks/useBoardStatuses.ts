'use client';

import { useQuery, useQueries } from '@tanstack/react-query';
import { boardStatusService } from '@/lib/services/boardStatus.service';
import { queryKeys } from '@/lib/queryKeys';

export function useBoardStatuses(teamId: string) {
  return useQuery({
    queryKey: queryKeys.boardStatuses.byTeam(teamId),
    queryFn: () => boardStatusService.byTeam(teamId),
    enabled: !!teamId,
  });
}

// Resolves statusId -> statusName across several teams at once — used by
// screens (e.g. the "All Teams" task list) that mix tasks from multiple teams,
// each with its own custom status catalog.
export function useBoardStatusesMap(teamIds: string[]) {
  const uniqueTeamIds = Array.from(new Set(teamIds.filter(Boolean)));

  const results = useQueries({
    queries: uniqueTeamIds.map((teamId) => ({
      queryKey: queryKeys.boardStatuses.byTeam(teamId),
      queryFn: () => boardStatusService.byTeam(teamId),
    })),
  });

  const map = new Map<string, string>();
  results.forEach((r) => {
    (r.data ?? []).forEach((s) => map.set(s.statusId, s.statusName));
  });

  return { map, isLoading: results.some((r) => r.isLoading) };
}
