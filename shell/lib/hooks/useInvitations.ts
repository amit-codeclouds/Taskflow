'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { inviteService } from '@/lib/services/invite.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { Invitation, InviteActionPayload } from '@/lib/types/invite.types';

// Remove the handled invitation from the cached list so the table updates
// immediately, then invalidate to resync with the server.
function dropInvitationFromCache(
  queryClient: ReturnType<typeof useQueryClient>,
  { userId, workspaceId }: InviteActionPayload,
) {
  const key = queryKeys.invitations.byUser(userId);
  queryClient.setQueryData<Invitation[]>(key, (old) =>
    (old ?? []).filter((inv) => inv.workspaceId !== workspaceId),
  );
  queryClient.invalidateQueries({ queryKey: key });
}

export function useInvitations(userId: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.invitations.byUser(userId),
    queryFn: () => inviteService.listByUser(userId),
    enabled: enabled && !!userId,
  });
}

export function useAcceptInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteActionPayload) => inviteService.accept(payload),
    onSuccess: (_, payload) => {
      dropInvitationFromCache(queryClient, payload);
      toast.success('Invitation accepted!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeclineInvite() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InviteActionPayload) => inviteService.decline(payload),
    onSuccess: (_, payload) => {
      dropInvitationFromCache(queryClient, payload);
      toast.success('Invitation declined.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
