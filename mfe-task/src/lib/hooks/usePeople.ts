'use client';

import { useQuery } from '@tanstack/react-query';
import { peopleService } from '@/lib/services/people.service';
import { queryKeys } from '@/lib/queryKeys';

// Flat option list for the assignee multi-select — not paginated in the UI.
// Scoped to a team: a task's assignees can only be people on its team.
const ASSIGNEE_OPTIONS_LIMIT = 100;

export function usePeopleOptions(teamId: string) {
  return useQuery({
    queryKey: queryKeys.people.list({ teamId, limit: ASSIGNEE_OPTIONS_LIMIT }),
    queryFn: () => peopleService.list({ teamId, limit: ASSIGNEE_OPTIONS_LIMIT }),
    enabled: !!teamId,
  });
}
