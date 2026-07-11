import apiClient from '@/lib/http/client';
import type {
  ApiTask,
  PagedResult,
  TaskListParams,
  CreateTaskPayload,
  UpdateTaskPayload,
  ChangeTaskStatusPayload,
} from '@/lib/types/tasks.types';

export const tasksService = {
  async myList(params?: TaskListParams): Promise<PagedResult<ApiTask>> {
    const { data } = await apiClient.get<{ result: PagedResult<ApiTask> }>('/tasks/my', { params });
    const result = data.result;
    return {
      data: result?.data ?? [],
      total: result?.total ?? 0,
      page: result?.page ?? 1,
      limit: result?.limit ?? 10,
      totalPages: result?.totalPages ?? 0,
    };
  },

  async getById(id: string): Promise<ApiTask> {
    const { data } = await apiClient.get<{ result: ApiTask }>(`/tasks/${id}`);
    return data.result;
  },

  async create(payload: CreateTaskPayload): Promise<ApiTask> {
    const { data } = await apiClient.post<{ result: ApiTask }>('/tasks', payload);
    return data.result;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<ApiTask> {
    const { data } = await apiClient.put<{ result: ApiTask }>(`/tasks/${id}`, payload);
    return data.result;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/tasks/${id}`);
  },

  async changeStatus(id: string, payload: ChangeTaskStatusPayload): Promise<ApiTask> {
    const { data } = await apiClient.patch<{ result: ApiTask }>(`/tasks/${id}/status`, payload);
    return data.result;
  },
};
