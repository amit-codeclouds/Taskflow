'use client';

import { useQuery } from '@tanstack/react-query';
import { authService } from '@/lib/services/auth.service';
import { queryKeys } from '@/lib/queryKeys';

export function useUserStats() {
  return useQuery({
    queryKey: queryKeys.auth.stats(),
    queryFn: () => authService.meStats(),
    staleTime: 10 * 1000, // 10 seconds
    retry: true,
  });
}
