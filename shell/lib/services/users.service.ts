import apiClient from '@/lib/http/client';
import type { User, UpdateUserPayload } from '@/lib/types/users.types';

export const usersService = {
  async list(params?: { search?: string; limit?: number; page?: number; workspaceId?: string }): Promise<User[]> {
    const { data } = await apiClient.get<{ result: User[] }>('/users', { params });
    return data.result ?? [];
  },

  async getById(id: string): Promise<User> {
    const { data } = await apiClient.get<{ result: User }>(`/users/${id}`);
    return data.result;
  },

  async update(id: string, payload: UpdateUserPayload): Promise<User> {
    const { data } = await apiClient.put<{ result: User }>(`/users/${id}`, payload);
    return data.result;
  },
};
