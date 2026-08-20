'use client';

import { useQuery } from '@tanstack/react-query';
import { workspaceService } from '@/lib/services/workspace.service';
import { queryKeys } from '@/lib/queryKeys';

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.detail(workspaceId),
    queryFn: () => workspaceService.info(workspaceId),
    enabled: !!workspaceId,
  });
}
