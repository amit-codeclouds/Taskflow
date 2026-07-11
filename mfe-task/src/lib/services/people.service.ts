import apiClient from '@/lib/http/client';
import type { PaginatedPeople } from '@/lib/types/people.types';

export const peopleService = {
  async list(params?: { search?: string; teamId?: string; limit?: number; page?: number }): Promise<PaginatedPeople> {
    const { data } = await apiClient.get<{ result: PaginatedPeople }>('/people', { params });
    const result = data.result;
    return {
      data: result?.data ?? [],
      total: result?.total ?? 0,
      page: result?.page ?? 1,
      limit: result?.limit ?? 20,
    };
  },
};
