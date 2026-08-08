'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { otpService } from '@/lib/services/otp.service';
import { usersService } from '@/lib/services/users.service';
import OtpModal from '@/components/Modals/OtpModal';
import NewPasswordModal from '@/components/Modals/NewPasswordModal';
import ForgotPasswordEmailModal from '@/components/Modals/ForgotPasswordEmailModal';

const FORGOT_PASSWORD_OTP_EVENT = 'forgotpassword' as const;
type ForgotPasswordStep = 'closed' | 'email' | 'otp' | 'newPassword';

const schema = Yup.object({
  email:    Yup.string().email('Enter a valid email address').required('Email is required'),
  password: Yup.string().required('Password is required'),
});

function inputClass(touched: boolean, error?: string) {
  return `h-10 px-3 rounded-lg bg-bg-700 border text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors w-full ${
    touched && error ? 'border-status-red focus:border-status-red' : 'border-border-subtle focus:border-accent'
  }`;
}

function EyeOpenIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5S1 8 1 8z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 2l12 12M6.5 6.6A2 2 0 009.4 9.5M4.5 4.6C2.5 5.8 1 8 1 8s2.5 5 7 5a7 7 0 002.5-.5M7 3.1C7.3 3 7.7 3 8 3c4.5 0 7 5 7 5s-.5 1-1.5 2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginForm() {
  const router   = useRouter();
  const [showPw, setShowPw] = useState(false);
  const [forgotStep, setForgotStep] = useState<ForgotPasswordStep>('closed');
  const [forgotEmail, setForgotEmail] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        const res  = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        });
        const data = await res.json();
        if (!res.ok) {
          setStatus(data.message || data.error || data.title || 'Sign in failed. Please try again.');
          return;
        }
        router.push('/');
        router.refresh();
      } catch {
        setStatus('Network error — please try again.');
      } finally {
        setSubmitting(false);
      }
    },
  });

  function generateForgotPasswordOtp(email: string) {
    return otpService.generate({
      email,
      event: FORGOT_PASSWORD_OTP_EVENT,
      description: 'OTP for password reset',
    });
  }

  function closeForgotFlow() {
    setForgotStep('closed');
    setForgotEmail('');
  }

  return (
    <div className="min-h-screen bg-bg-900 flex items-center justify-center px-4">
      <motion.div
        className="w-full max-w-[400px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 28 }}
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center shrink-0">
              <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
                <path d="M2 3h10M2 7h6M2 11h8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-text-100 font-semibold text-lg tracking-tight">Taskflow</span>
          </div>
        </motion.div>

        {/* Card */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.08 }}
        >
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-text-100">Welcome back</h1>
            <p className="text-sm text-text-300 mt-1">Sign in to your workspace</p>
          </div>

          <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="text-xs font-medium text-text-200">Email address</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                {...formik.getFieldProps('email')}
                className={inputClass(!!formik.touched.email, formik.errors.email)}
              />
              {formik.touched.email && formik.errors.email && (
                <p className="text-xs text-status-red">{formik.errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-medium text-text-200">Password</label>
                <button
                  type="button"
                  onClick={() => setForgotStep('email')}
                  className="text-xs font-medium text-accent hover:text-accent-hover transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  {...formik.getFieldProps('password')}
                  className={inputClass(!!formik.touched.password, formik.errors.password) + ' pr-10'}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {formik.touched.password && formik.errors.password && (
                <p className="text-xs text-status-red">{formik.errors.password}</p>
              )}
            </div>

            {/* Server error */}
            {formik.status && (
              <motion.p
                className="text-xs text-status-red bg-red-bg px-3 py-2 rounded-lg"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formik.status}
              </motion.p>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={formik.isSubmitting}
              className="h-10 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              whileHover={formik.isSubmitting ? undefined : { scale: 1.01 }}
              whileTap={formik.isSubmitting ? undefined : { scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {formik.isSubmitting ? 'Signing in…' : 'Sign in'}
            </motion.button>
          </form>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-sm text-text-300 mt-5">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-accent hover:text-accent-hover transition-colors font-medium">
            Create one
          </Link>
        </p>
      </motion.div>

      {forgotStep === 'email' && (
        <ForgotPasswordEmailModal
          onSubmit={async (email) => {
            await generateForgotPasswordOtp(email);
            setForgotEmail(email);
            setForgotStep('otp');
          }}
          onClose={closeForgotFlow}
        />
      )}

      {forgotStep === 'otp' && (
        <OtpModal
          email={forgotEmail}
          title="Verify your email"
          onVerify={(otp) =>
            otpService.verify({ email: forgotEmail, event: FORGOT_PASSWORD_OTP_EVENT, otp }).then(() => {})
          }
          onSuccess={() => setForgotStep('newPassword')}
          onResend={() => generateForgotPasswordOtp(forgotEmail)}
          onClose={closeForgotFlow}
        />
      )}

      {forgotStep === 'newPassword' && (
        <NewPasswordModal
          onSubmit={async (values) => {
            await usersService.changePassword({ email: forgotEmail, ...values });
            closeForgotFlow();
            toast.success('Password updated — please sign in.');
            formik.setFieldValue('email', forgotEmail);
          }}
          onClose={closeForgotFlow}
        />
      )}
    </div>
  );
}
