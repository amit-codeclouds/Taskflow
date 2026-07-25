'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, UserPlus } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { getSelectStyles } from '@/lib/selectStyles';
import type { TeamRole } from '@/lib/types/teams.types';
import { ROLE_OPTIONS } from '@/lib/teams';

interface Props {
  team: { id: string; name: string };
  existingEmails: string[];
  onClose: () => void;
  onInvite: (email: string, role: TeamRole, addToWorkspace: boolean) => void;
}

const roleStyles = getSelectStyles({ size: 'md' });

export default function TeamInviteModal({ team, existingEmails, onClose, onInvite }: Props) {
  const [success, setSuccess] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: '',
      role: 'Developer' as TeamRole,
      addToWorkspace: false,
    },
    validationSchema: Yup.object({
      email: Yup.string()
        .email('Enter a valid email address')
        .required('Email is required')
        .test(
          'not-already-member',
          'This person is already in this team',
          val => !existingEmails.includes(val ?? ''),
        ),
    }),
    onSubmit: (values, { setSubmitting }) => {
      onInvite(values.email.trim(), values.role, values.addToWorkspace);
      setSubmitting(false);
      setSuccess(true);
    },
  });

  const emailError = !!formik.touched.email && !!formik.errors.email;

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
        className="relative w-full max-w-[460px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center shrink-0">
              <UserPlus size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">Invite to {team.name}</h2>
              <p className="text-2xs text-text-300 mt-0.5">Send an invite by email</p>
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
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              className="px-6 py-10 flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              <div className="w-12 h-12 rounded-full bg-green-bg flex items-center justify-center mb-3">
                <Check size={22} className="text-status-green" strokeWidth={2} />
              </div>
              <p className="text-sm font-semibold text-text-100 mb-1">Invite sent!</p>
              <p className="text-xs text-text-300">
                <span className="text-text-200">{formik.values.email}</span> was invited to{' '}
                <span className="text-text-200">{team.name}</span>.
              </p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={formik.handleSubmit}
              noValidate
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="px-6 py-5 flex flex-col gap-4">
                {/* Email */}
                <div>
                  <label htmlFor="team-invite-email" className="text-xs font-medium text-text-200 block mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
                    <input
                      id="team-invite-email"
                      type="email"
                      autoFocus
                      placeholder="colleague@example.com"
                      {...formik.getFieldProps('email')}
                      className={`w-full h-10 pl-8 pr-3 bg-bg-700 border rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                        emailError
                          ? 'border-status-red focus:border-status-red'
                          : 'border-border-subtle focus:border-accent'
                      }`}
                    />
                  </div>
                  {emailError && (
                    <p className="text-xs text-status-red mt-1.5">{formik.errors.email}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-1.5">
                    Assign role
                  </label>
                  <Select
                    inputId="team-invite-role"
                    instanceId="team-invite-role"
                    options={ROLE_OPTIONS}
                    value={ROLE_OPTIONS.find(o => o.value === formik.values.role) ?? ROLE_OPTIONS[3]}
                    onChange={opt => formik.setFieldValue('role', opt?.value ?? 'Developer')}
                    styles={roleStyles}
                    isSearchable={false}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    menuPosition="fixed"
                    menuPlacement="top"
                  />
                </div>

                {/* Workspace checkbox */}
                <div className="flex items-start gap-3 pt-0.5">
                  <input
                    id="add-to-workspace"
                    type="checkbox"
                    checked={formik.values.addToWorkspace}
                    onChange={e => formik.setFieldValue('addToWorkspace', e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
                  />
                  <label htmlFor="add-to-workspace" className="cursor-pointer select-none">
                    <span className="text-sm text-text-100">Also add to workspace</span>
                    <p className="text-xs text-text-300 mt-0.5 leading-relaxed">
                      {formik.values.addToWorkspace
                        ? "They'll appear as Pending in People until they accept."
                        : 'Invite is scoped to this team only.'}
                    </p>
                  </label>
                </div>
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
                  className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                >
                  Send invite
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Success footer */}
        {success && (
          <div className="px-6 pb-5 flex justify-end">
            <motion.button
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              Done
            </motion.button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
