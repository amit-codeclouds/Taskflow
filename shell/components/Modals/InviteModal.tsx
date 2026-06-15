'use client';

import { motion } from 'framer-motion';
import { Mail, X, Check, UserPlus } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
});

interface Props {
  onClose: () => void;
  onInvite: (email: string) => void;
}

export default function InviteModal({ onClose, onInvite }: Props) {
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: schema,
    onSubmit: (values, { setSubmitting }) => {
      setTimeout(() => {
        onInvite(values.email.trim());
        setSubmitting(false);
        onClose();
      }, 1100);
    },
  });

  const hasError = !!formik.touched.email && !!formik.errors.email;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        className="relative w-full max-w-[440px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center shrink-0">
              <UserPlus size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">Invite to workspace</h2>
              <p className="text-2xs text-text-300 mt-0.5">They'll join as a pending member</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={formik.handleSubmit} noValidate>
          <div className="px-6 py-5">
            <p className="text-xs text-text-300 mb-4 leading-relaxed">
              Enter the email address of the person you'd like to invite.
              They'll appear as{' '}
              <span className="text-status-amber font-medium">Pending</span> until
              they accept and complete their profile.
            </p>

            <label htmlFor="invite-email" className="text-xs font-medium text-text-200 block mb-1.5">
              Email address
            </label>
            <div className="relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
              <input
                id="invite-email"
                type="email"
                autoFocus
                placeholder="colleague@example.com"
                {...formik.getFieldProps('email')}
                className={`w-full h-10 pl-8 pr-3 bg-bg-700 border rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                  hasError ? 'border-status-red focus:border-status-red' : 'border-border-subtle focus:border-accent'
                }`}
              />
            </div>
            {hasError && (
              <p className="text-xs text-status-red mt-1.5">{formik.errors.email}</p>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors"
            >
              Cancel
            </button>
            <motion.button
              type="submit"
              disabled={formik.isSubmitting}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                formik.isSubmitting
                  ? 'bg-green-bg text-status-green cursor-default'
                  : 'bg-accent text-white hover:bg-accent-hover'
              }`}
              whileHover={formik.isSubmitting ? {} : { scale: 1.02 }}
              whileTap={formik.isSubmitting ? {} : { scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {formik.isSubmitting ? (
                <><Check size={13} strokeWidth={2} />Sending…</>
              ) : (
                'Send invite'
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
