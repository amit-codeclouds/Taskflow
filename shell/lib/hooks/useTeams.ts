'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { teamsService } from '@/lib/services/teams.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { CreateTeamPayload, UpdateTeamPayload, TeamInvitePayload } from '@/lib/types/teams.types';

export function useTeamsList() {
  return useQuery({
    queryKey: queryKeys.teams.list(),
    queryFn: () => teamsService.list(),
  });
}

export function useTeamsStats() {
  return useQuery({
    queryKey: queryKeys.teams.stats(),
    queryFn: () => teamsService.stats(),
  });
}

export function useTeamDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.teams.detail(id),
    queryFn: () => teamsService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => teamsService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      toast.success('Team created!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateTeamPayload & { id: string }) =>
      teamsService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.list() });
      toast.success('Team updated!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteTeam() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => teamsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.all() });
      toast.success('Team deleted.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useInviteTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, ...payload }: TeamInvitePayload & { teamId: string }) =>
      teamsService.invite(teamId, payload),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      toast.success('Invite sent!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useRemoveTeamMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }: { teamId: string; userId: string }) =>
      teamsService.removeMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teams.detail(teamId) });
      toast.success('Member removed.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
