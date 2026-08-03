'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '@/lib/services/auth.service';
import { usersService } from '@/lib/services/users.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { UpdateUserSettingsPayload } from '@/lib/types/users.types';

export function useMySettings() {
  return useQuery({
    queryKey: queryKeys.settings.mine(),
    queryFn: () => authService.meSettings(),
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserSettingsPayload & { id: string }) =>
      usersService.updateSettings(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.mine() });
      toast.success('Settings saved!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
