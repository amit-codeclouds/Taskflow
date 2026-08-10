import apiClient from '@/lib/http/client';
import type { User, UpdateUserPayload, AvatarUploadResponse, UserSettings, UpdateUserSettingsPayload, ChangePasswordPayload } from '@/lib/types/users.types';

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

  async uploadAvatar(file: File): Promise<AvatarUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Do not set Content-Type manually — the browser must generate the
    // multipart boundary itself. Setting it here (or inheriting the
    // apiClient's default 'application/json') sends a boundary-less header
    // the backend can't parse, causing a 415.
    const { data } = await apiClient.post<{ result: AvatarUploadResponse }>('/users/avatar', formData, {
      headers: { 'Content-Type': undefined },
    });
    return data.result;
  },

  async deleteAvatar(): Promise<{ avatarInitials: string }> {
    const { data } = await apiClient.delete<{ result: { Initials: string } }>('/users/avatar');
    return { avatarInitials: data.result.Initials };
  },

  async updateSettings(id: string, payload: UpdateUserSettingsPayload): Promise<UserSettings> {
    const { data } = await apiClient.put<{ result: UserSettings }>(`/users/${id}/settings`, payload);
    return data.result;
  },

  // Identifies the account by email, not an :id path param — used for both
  // Settings → Change Password (authenticated) and Login → Forgot Password
  // (anonymous, no bearer token).
  async changePassword(payload: ChangePasswordPayload): Promise<void> {
    await apiClient.put('/users/change/password', payload);
  },
};
