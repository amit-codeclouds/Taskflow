'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '@/lib/services/users.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { UpdateUserPayload } from '@/lib/types/users.types';

export function useUsersList(params?: { workspaceId?: string }) {
  return useQuery({
    queryKey: queryKeys.users.list(params),
    queryFn: () => usersService.list(params),
    // Only block fetching when params are explicitly passed with an empty workspaceId
    enabled: !params || !!params.workspaceId,
  });
}

export function useUserDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserPayload & { id: string }) =>
      usersService.update(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Profile saved!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
