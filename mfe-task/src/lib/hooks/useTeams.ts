'use client';

import { useQuery } from '@tanstack/react-query';
import { teamsService } from '@/lib/services/teams.service';
import { queryKeys } from '@/lib/queryKeys';

export function useTeamsList(params?: { excludeWorkspace?: boolean }) {
  return useQuery({
    queryKey: queryKeys.teams.list(params),
    queryFn: () => teamsService.list(params),
  });
}
