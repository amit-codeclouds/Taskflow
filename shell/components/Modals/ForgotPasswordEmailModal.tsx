'use client';

import { motion } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Mail, X } from 'lucide-react';
import { extractErrorMessage } from '@/lib/http/extractError';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
});

interface ForgotPasswordEmailModalProps {
  onSubmit: (email: string) => Promise<void>;
  onClose: () => void;
}

export default function ForgotPasswordEmailModal({ onSubmit, onClose }: ForgotPasswordEmailModalProps) {
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setStatus(null);
      try {
        await onSubmit(values.email.trim());
      } catch (err) {
        setStatus(extractErrorMessage(err, 'Could not send a verification code. Please try again.'));
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
              <Mail size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">Forgot your password?</h2>
              <p className="text-2xs text-text-300 mt-0.5">We&apos;ll email you a verification code</p>
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
          <div className="px-6 py-5">
            <label htmlFor="forgot-email" className="text-xs font-medium text-text-200 block mb-1.5">
              Email address
            </label>
            <input
              id="forgot-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              {...formik.getFieldProps('email')}
              className={`w-full h-10 px-3 rounded-lg bg-bg-700 border text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                formik.touched.email && formik.errors.email ? 'border-status-red focus:border-status-red' : 'border-border-subtle focus:border-accent'
              }`}
            />
            {formik.touched.email && formik.errors.email && (
              <p className="text-xs text-status-red mt-1.5">{formik.errors.email}</p>
            )}
            {formik.status && (
              <motion.p
                className="text-xs text-status-red bg-red-bg px-3 py-2 rounded-lg mt-3"
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
              {formik.isSubmitting ? 'Sending…' : 'Send code'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
