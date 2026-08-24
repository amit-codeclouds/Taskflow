import apiClient from '@/lib/http/client';
import type { ApiRole } from '@/lib/types/roles.types';

export const rolesService = {
  async list(): Promise<ApiRole[]> {
    const { data } = await apiClient.get<{ result: ApiRole[] }>('/roles');
    return data.result ?? [];
  },
};
