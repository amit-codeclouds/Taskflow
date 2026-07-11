import apiClient from '@/lib/http/client';
import type { MeResponse } from '@/lib/types/auth.types';

export const authService = {
  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<{ result: MeResponse }>('/auth/me');
    return data.result;
  },
};
