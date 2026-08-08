'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Mail, X } from 'lucide-react';
import { extractErrorMessage } from '@/lib/http/extractError';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

interface OtpModalProps {
  email: string;
  title?: string;
  description?: string;
  /** Verify the 6-digit code (and run whatever depends on it — e.g. account creation). */
  onVerify: (otp: string) => Promise<void>;
  /** Called once the success animation finishes — use it to advance the flow. */
  onSuccess: () => void;
  /** Re-trigger the generate-OTP call. */
  onResend: () => Promise<void>;
  onClose: () => void;
}

export default function OtpModal({
  email,
  title = 'Enter verification code',
  description,
  onVerify,
  onSuccess,
  onResend,
  onClose,
}: OtpModalProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const [resentNote, setResentNote] = useState(false);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const otp = digits.join('');
  const isComplete = otp.length === OTP_LENGTH;

  function setDigitAt(index: number, value: string) {
    setDigits((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleChange(index: number, raw: string) {
    const value = raw.replace(/\D/g, '').slice(-1);
    setDigitAt(index, value);
    setError(null);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigitAt(index - 1, '');
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    e.preventDefault();
    const next = Array(OTP_LENGTH).fill('');
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    setError(null);
    inputRefs.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isComplete || verifying) return;
    setError(null);
    setVerifying(true);
    try {
      await onVerify(otp);
      setVerified(true);
      setTimeout(onSuccess, 900);
    } catch (err) {
      setError(extractErrorMessage(err, 'Invalid code. Please try again.'));
      setVerifying(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);
    try {
      await onResend();
      setCooldown(RESEND_COOLDOWN_SECONDS);
      setResentNote(true);
      setTimeout(() => setResentNote(false), 3000);
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not resend the code. Please try again.'));
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={verifying ? undefined : onClose}
      />

      <motion.div
        className="relative w-full max-w-[400px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center shrink-0">
              <Mail size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">{title}</h2>
              <p className="text-2xs text-text-300 mt-0.5">
                {description ?? <>Code sent to <span className="text-text-200">{email}</span></>}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={verifying}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        {verified ? (
          <div className="px-6 py-10 flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-green-bg flex items-center justify-center mb-3">
              <Check size={22} className="text-status-green" strokeWidth={2} />
            </div>
            <p className="text-sm font-semibold text-text-100">Verified!</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="px-6 py-6">
              <div className="flex items-center justify-center gap-2.5" onPaste={handlePaste}>
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className={`w-11 h-12 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg bg-bg-700 border text-text-100 focus:outline-none transition-colors ${
                      error ? 'border-status-red focus:border-status-red' : 'border-border-subtle focus:border-accent'
                    }`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-xs text-status-red text-center mt-3">{error}</p>
              )}

              <div className="flex items-center justify-center mt-4">
                {cooldown > 0 ? (
                  <p className="text-xs text-text-300">
                    Resend code in <span className="text-text-200">{cooldown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending}
                    className="text-xs font-medium text-accent hover:text-accent-hover transition-colors disabled:opacity-60"
                  >
                    {resending ? 'Sending…' : 'Resend code'}
                  </button>
                )}
              </div>
              {resentNote && (
                <p className="text-xs text-status-green text-center mt-1.5">Code resent — check your inbox.</p>
              )}
            </div>

            <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={verifying}
                className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors disabled:opacity-60"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={!isComplete || verifying}
                className="h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                whileHover={!isComplete || verifying ? undefined : { scale: 1.02 }}
                whileTap={!isComplete || verifying ? undefined : { scale: 0.98 }}
              >
                {verifying ? 'Verifying…' : 'Verify'}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
