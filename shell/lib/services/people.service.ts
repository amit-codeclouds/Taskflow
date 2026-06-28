import apiClient from '@/lib/http/client';
import type { Person, PeopleStats, InvitePayload, UpdatePersonPayload, InvitationResult } from '@/lib/types/people.types';

export const peopleService = {
  async list(params?: { search?: string; status?: string; teamId?: string; page?: number; limit?: number }): Promise<Person[]> {
    const { data } = await apiClient.get<{ result: { data: Person[] } }>('/people', { params });
    return data.result?.data ?? [];
  },

  async stats(): Promise<PeopleStats> {
    const { data } = await apiClient.get<{ result: PeopleStats }>('/people/stats');
    return data.result;
  },

  async invite(payload: InvitePayload): Promise<InvitationResult> {
    const { data } = await apiClient.post<{ result: InvitationResult }>('/people/invite', payload);
    return data.result;
  },

  async update(userId: string, payload: UpdatePersonPayload): Promise<Person> {
    const { data } = await apiClient.patch<{ result: Person }>(`/people/${userId}`, payload);
    return data.result;
  },

  async enlist(userIds: string[]): Promise<void> {
    await apiClient.post('/people/enlist', { userIds });
  },

  async remove(userId: string): Promise<void> {
    await apiClient.delete(`/people/${userId}`);
  },
};
