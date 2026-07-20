import apiClient from '@/lib/http/client';
import type {
  ApiTeam,
  TeamStats,
  CreateTeamPayload,
  UpdateTeamPayload,
  TeamInvitePayload,
  TeamInvitationResult,
} from '@/lib/types/teams.types';

export const teamsService = {
  async list(params?: { excludeWorkspace?: boolean }): Promise<ApiTeam[]> {
    const { data } = await apiClient.get<{ result: ApiTeam[] }>('/teams', {
      params: params?.excludeWorkspace ? { exclude_workspace: true } : undefined,
    });
    return data.result ?? [];
  },

  async stats(): Promise<TeamStats> {
    const { data } = await apiClient.get<{ result: TeamStats }>('/teams/stats');
    return data.result;
  },

  async getById(id: string): Promise<ApiTeam> {
    const { data } = await apiClient.get<{ result: ApiTeam }>(`/teams/${id}`);
    return data.result;
  },

  async create(payload: CreateTeamPayload): Promise<ApiTeam> {
    const { data } = await apiClient.post<{ result: ApiTeam }>('/teams', payload);
    return data.result;
  },

  async update(id: string, payload: UpdateTeamPayload): Promise<ApiTeam> {
    const { data } = await apiClient.put<{ result: ApiTeam }>(`/teams/${id}`, payload);
    return data.result;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/teams/${id}`);
  },

  async invite(teamId: string, payload: TeamInvitePayload): Promise<TeamInvitationResult> {
    const { data } = await apiClient.post<{ result: TeamInvitationResult }>(`/teams/${teamId}/invite`, payload);
    return data.result;
  },

  async removeMember(teamId: string, userId: string): Promise<void> {
    await apiClient.delete(`/teams/${teamId}/members/${userId}`);
  },
};
