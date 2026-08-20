'use client';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { tasksService } from '@/lib/services/tasks.service';
import { queryKeys } from '@/lib/queryKeys';
import { extractErrorMessage } from '@/lib/http/extractError';
import type {
  TaskListParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  ChangeTaskStatusPayload,
} from '@/lib/types/tasks.types';

export const TASKS_PAGE_LIMIT = 10;

export function useMyTasks(params?: TaskListParams) {
  return useQuery({
    queryKey: queryKeys.tasks.myList(params),
    queryFn: () => tasksService.myList({ ...params, limit: params?.limit ?? TASKS_PAGE_LIMIT }),
    placeholderData: keepPreviousData,
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => tasksService.getById(id),
    enabled: !!id,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => tasksService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      toast.success('Task created!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

// `teamId` is accepted purely so the mutation can invalidate that team's board
// query too — it's stripped before the payload reaches the PUT request, since
// UpdateTaskRequestDto has no teamId (a task's team can't change post-creation).
export function useUpdateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, teamId, ...payload }: UpdateTaskPayload & { id: string; teamId?: string }) =>
      tasksService.update(id, payload),
    onSuccess: (_, { id, teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      if (teamId) queryClient.invalidateQueries({ queryKey: queryKeys.board.team(teamId) });
      toast.success('Task updated!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: string; teamId?: string }) => tasksService.delete(id),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      if (teamId) queryClient.invalidateQueries({ queryKey: queryKeys.board.team(teamId) });
      toast.success('Task deleted.');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}

export function useChangeTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: ChangeTaskStatusPayload & { id: string }) =>
      tasksService.changeStatus(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all() });
      toast.success('Status updated!');
    },
    onError: (err) => toast.error(extractErrorMessage(err)),
  });
}
