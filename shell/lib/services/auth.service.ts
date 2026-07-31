import apiClient from '@/lib/http/client';
import type { LoginPayload, SignupPayload, MeResponse, MeStats } from '@/lib/types/auth.types';

export const authService = {
  // Login and signup go through Next.js proxy so it can set the httpOnly refresh cookie
  async login(payload: LoginPayload): Promise<{ user: MeResponse }> {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'Login failed');
    }
    return data;
  },

  async signup(payload: SignupPayload): Promise<{ user: MeResponse }> {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message ?? data.error ?? 'Signup failed');
    }
    return data;
  },

  async me(): Promise<MeResponse> {
    const { data } = await apiClient.get<{ result: MeResponse } | MeResponse>('/auth/me');
    // Backend wraps responses: { status, code, result: {...} }
    return (data as { result: MeResponse }).result ?? (data as MeResponse);
  },

  async meStats(): Promise<MeStats> {
    const { data } = await apiClient.get<{ result: MeStats } | MeStats>('/auth/me/stats');
    // Backend wraps responses: { status, code, result: {...} }
    return (data as { result: MeStats }).result ?? (data as MeStats);
  },

  async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  },
};
