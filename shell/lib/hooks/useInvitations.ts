'use client';

import { useQuery } from '@tanstack/react-query';
import { inviteService } from '@/lib/services/invite.service';
import { queryKeys } from '@/lib/queryKeys';

export function useInvitations(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.invitations.byUser(userId),
    queryFn: () => inviteService.listByUser(userId),
    enabled: enabled && !!userId,
  });
}
