'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { peopleService } from '@/lib/services/people.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { InvitePayload, UpdatePersonPayload } from '@/lib/types/people.types';

export function usePeopleList() {
  return useQuery({
    queryKey: queryKeys.people.list(),
    queryFn: () => peopleService.list(),
  });
}

export function usePeopleStats() {
  return useQuery({
    queryKey: queryKeys.people.stats(),
    queryFn: () => peopleService.stats(),
  });
}

export function useInvitePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvitePayload) => peopleService.invite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all() });
      toast.success('Invitation sent!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdatePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, ...payload }: UpdatePersonPayload & { userId: string }) =>
      peopleService.update(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all() });
      toast.success('Member updated.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useEnlistPeople() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userIds: string[]) => peopleService.enlist(userIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all() });
      toast.success('Members added to workspace!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useRemovePerson() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => peopleService.remove(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.people.all() });
      toast.success('Member removed from workspace.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
