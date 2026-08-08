'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { KeyRound, X } from 'lucide-react';
import { extractErrorMessage } from '@/lib/http/extractError';

const schema = Yup.object({
  newPassword: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password must be at most 100 characters')
    .required('New password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('newPassword')], 'Passwords must match')
    .required('Confirm your new password'),
});

export interface NewPasswordValues {
  newPassword: string;
  confirmPassword: string;
}

interface NewPasswordModalProps {
  onSubmit: (values: NewPasswordValues) => Promise<void>;
  onClose: () => void;
}

function inputClass(touched: boolean, error?: string) {
  return `h-10 px-3 rounded-lg bg-bg-700 border text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors w-full pr-10 ${
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

export default function NewPasswordModal({ onSubmit, onClose }: NewPasswordModalProps) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const formik = useFormik<NewPasswordValues>({
    initialValues: { newPassword: '', confirmPassword: '' },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        await onSubmit(values);
      } catch (err) {
        setStatus(extractErrorMessage(err, 'Could not update password. Please try again.'));
      } finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={formik.isSubmitting ? undefined : onClose}
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
              <KeyRound size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">Set a new password</h2>
              <p className="text-2xs text-text-300 mt-0.5">Choose a new password for your account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={formik.isSubmitting}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors disabled:opacity-40"
          >
            <X size={15} />
          </button>
        </div>

        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="px-6 py-5 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="newPassword" className="text-xs font-medium text-text-200">New password</label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  autoFocus
                  placeholder="Min. 6 characters"
                  {...formik.getFieldProps('newPassword')}
                  className={inputClass(!!formik.touched.newPassword, formik.errors.newPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-200 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-xs text-status-red">{formik.errors.newPassword}</p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="confirmPassword" className="text-xs font-medium text-text-200">Confirm new password</label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Re-enter your new password"
                  {...formik.getFieldProps('confirmPassword')}
                  className={inputClass(!!formik.touched.confirmPassword, formik.errors.confirmPassword)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPw((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-300 hover:text-text-200 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirmPw ? <EyeClosedIcon /> : <EyeOpenIcon />}
                </button>
              </div>
              {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                <p className="text-xs text-status-red">{formik.errors.confirmPassword}</p>
              )}
            </div>

            {formik.status && (
              <motion.p
                className="text-xs text-status-red bg-red-bg px-3 py-2 rounded-lg"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {formik.status}
              </motion.p>
            )}
          </div>

          <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={formik.isSubmitting}
              className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={formik.isSubmitting}
              className="h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              whileHover={formik.isSubmitting ? undefined : { scale: 1.02 }}
              whileTap={formik.isSubmitting ? undefined : { scale: 0.98 }}
            >
              {formik.isSubmitting ? 'Updating…' : 'Update password'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
