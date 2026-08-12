// Matches the .NET backend's Otp folder (Generate OTP / Verify OTP requests)
export type OtpEvent = 'signup' | 'forgotpassword' | 'deleteaccount' | 'changepassword';

export interface GenerateOtpPayload {
  email: string;
  event: OtpEvent;
  description?: string;
}

export interface VerifyOtpPayload {
  email: string;
  event: OtpEvent;
  otp: string;
}

// Confirmed against the live response: { verified: true, event: "forgotpassword" }.
// No userId is returned — the Forgot Password flow resets by email instead
// (see usersService.changePassword).
export interface VerifyOtpResult {
  verified?: boolean;
  event?: OtpEvent;
}
