'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.me(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
