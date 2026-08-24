'use client';

import { useQuery } from '@tanstack/react-query';
import { rolesService } from '@/lib/services/roles.service';
import { queryKeys } from '@/lib/queryKeys';

export function useRolesList() {
  return useQuery({
    queryKey: queryKeys.roles.list(),
    queryFn: () => rolesService.list(),
    staleTime: 5 * 60 * 1000,
  });
}
