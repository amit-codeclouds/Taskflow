'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { commentsService } from '@/lib/services/comments.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type { CreateCommentPayload, UpdateCommentPayload } from '@/lib/types/comments.types';

export function useComments(taskId: string) {
  return useQuery({
    queryKey: queryKeys.comments.list(taskId),
    queryFn: () => commentsService.list(taskId),
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCommentPayload) => commentsService.create(taskId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) });
      toast.success('Comment added.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useUpdateComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateCommentPayload & { id: string }) =>
      commentsService.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) });
      toast.success('Comment updated.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteComment(taskId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => commentsService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.comments.list(taskId) });
      toast.success('Comment deleted.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
