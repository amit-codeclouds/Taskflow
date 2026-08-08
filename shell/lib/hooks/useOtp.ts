'use client';

import { useMutation } from '@tanstack/react-query';
import { otpService } from '@/lib/services/otp.service';
import type { GenerateOtpPayload, VerifyOtpPayload } from '@/lib/types/otp.types';

// No onError toast here — callers surface the error inline inside the OTP
// modal (wrong code, expired code, etc.), which reads better than a toast.
export function useGenerateOtp() {
  return useMutation({
    mutationFn: (payload: GenerateOtpPayload) => otpService.generate(payload),
  });
}

export function useVerifyOtp() {
  return useMutation({
    mutationFn: (payload: VerifyOtpPayload) => otpService.verify(payload),
  });
}
