'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '@/lib/services/users.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { UpdateUserPayload } from '@/lib/types/users.types';

export const AVATAR_MAX_SIZE_BYTES = 1 * 1024 * 1024; // 1MB
export const AVATAR_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

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

export function useUploadAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => {
      if (file.size > AVATAR_MAX_SIZE_BYTES) {
        return Promise.reject(new Error('Image is too large. Please upload a photo under 1MB.'));
      }
      if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
        return Promise.reject(new Error('Unsupported file type. Please upload a JPG, PNG, GIF, or WEBP image.'));
      }
      return usersService.uploadAvatar(file);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Profile photo updated!');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not upload photo. Please try again.')),
  });
}

export function useDeleteAvatar() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => usersService.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
      toast.success('Profile photo removed.');
    },
    onError: (err) => toast.error(extractErrorMessage(err, 'Could not remove photo. Please try again.')),
  });
}
