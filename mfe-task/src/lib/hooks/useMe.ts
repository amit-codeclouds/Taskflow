'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';

export function useMe() {
  return useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: () => authService.me(),
    staleTime: 10 * 1000, // 10 seconds
    retry: true,
  });
}
