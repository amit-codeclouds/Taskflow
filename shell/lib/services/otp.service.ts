import apiClient from '@/lib/http/client';
import type { GenerateOtpPayload, VerifyOtpPayload, VerifyOtpResult } from '@/lib/types/otp.types';

export const otpService = {
  async generate(payload: GenerateOtpPayload): Promise<void> {
    // `platform` tells the backend whether the account already exists — false for
    // signup (the user isn't created yet), true for every other event (forgotpassword,
    // changepassword, deleteaccount all act on an existing account).
    const platform = payload.event !== 'signup';
    await apiClient.post('/otp/generate', payload, { params: { platform } });
  },

  async verify(payload: VerifyOtpPayload): Promise<VerifyOtpResult> {
    const { data } = await apiClient.post<{ result: VerifyOtpResult } | VerifyOtpResult>('/otp/verify', payload);
    // Backend wraps responses: { status, code, result: {...} }
    return (data as { result: VerifyOtpResult }).result ?? (data as VerifyOtpResult) ?? {};
  },
};
