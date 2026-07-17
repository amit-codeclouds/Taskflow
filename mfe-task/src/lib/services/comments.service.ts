import apiClient from '@/lib/http/client';
import type { ApiComment, CreateCommentPayload, UpdateCommentPayload } from '@/lib/types/comments.types';

export const commentsService = {
  async list(taskId: string): Promise<ApiComment[]> {
    const { data } = await apiClient.get<{ result: ApiComment[] }>('/comments', { params: { taskId } });
    return data.result ?? [];
  },

  async create(taskId: string, payload: CreateCommentPayload): Promise<ApiComment> {
    const { data } = await apiClient.post<{ result: ApiComment }>('/comments', payload, { params: { taskId } });
    return data.result;
  },

  async update(commentId: string, payload: UpdateCommentPayload): Promise<ApiComment> {
    const { data } = await apiClient.put<{ result: ApiComment }>(`/comments/${commentId}`, payload);
    return data.result;
  },

  async remove(commentId: string): Promise<void> {
    await apiClient.delete(`/comments/${commentId}`);
  },
};
