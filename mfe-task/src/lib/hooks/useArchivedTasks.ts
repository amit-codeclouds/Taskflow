'use client';

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { archivedTasksService } from '@/lib/services/archivedTasks.service';
import { queryKeys } from '@/lib/queryKeys';
import type { ArchivedTasksParams } from '@/lib/types/archivedTasks.types';

export const ARCHIVED_TASKS_PAGE_LIMIT = 10;

export function useArchivedTasks(params: ArchivedTasksParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: queryKeys.archivedTasks.list(params),
    queryFn: () => archivedTasksService.list({ ...params, limit: params.limit ?? ARCHIVED_TASKS_PAGE_LIMIT }),
    enabled: !!params.teamId && (options?.enabled ?? true),
    placeholderData: keepPreviousData,
  });
}
