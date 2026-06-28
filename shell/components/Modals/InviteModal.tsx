'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, X, Check, UserPlus, Users } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import { useInvitePerson, useEnlistPeople } from '@/lib/hooks/usePeople';
import { usePeopleList } from '@/lib/hooks/usePeople';
import { useUsersList } from '@/lib/hooks/useUsers';

type Tab = 'email' | 'platform';

const emailSchema = Yup.object({
  email: Yup.string().email('Enter a valid email address').required('Email is required'),
});

const multiStyles = getSelectStyles({ size: 'md' });

interface Props {
  onClose: () => void;
}

export default function InviteModal({ onClose }: Props) {
  const [tab, setTab] = useState<Tab>('email');
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [platformSuccess, setPlatformSuccess] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<MultiValue<SelectOption>>([]);

  const inviteMutation  = useInvitePerson();
  const enlistMutation  = useEnlistPeople();
  const { data: people  = [] } = usePeopleList();
  const { data: allUsers = [] } = useUsersList();

  // Users not already in the workspace
  const memberIds = useMemo(() => new Set(people.map(p => p.id)), [people]);
  const platformOptions: SelectOption[] = useMemo(
    () => allUsers
      .filter(u => !memberIds.has(u.id))
      .map(u => ({ value: u.id, label: u.name })),
    [allUsers, memberIds],
  );

  // ── Email form ────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: emailSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        await inviteMutation.mutateAsync({ email: values.email.trim() });
        setEmailSuccess(true);
      } catch {
        // onError in useInvitePerson shows the toast
      } finally {
        setSubmitting(false);
      }
    },
  });
  const hasError = !!formik.touched.email && !!formik.errors.email;

  // ── Platform submit ───────────────────────────────────────────────────────
  async function handleEnlist() {
    if (!selectedUsers.length) return;
    try {
      await enlistMutation.mutateAsync(selectedUsers.map(u => u.value));
      setPlatformSuccess(true);
    } catch {
      // onError in useEnlistPeople shows the toast
    }
  }

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: 'email',    label: 'Via Email',    icon: <Mail size={13} /> },
    { key: 'platform', label: 'Via Platform', icon: <Users size={13} /> },
  ];

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
              <h2 className="text-sm font-semibold text-text-100">Invite to workspace</h2>
              <p className="text-2xs text-text-300 mt-0.5">Add a new member to your workspace</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex px-6 pt-4 gap-1">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setEmailSuccess(false); setPlatformSuccess(false); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                tab === t.key
                  ? 'bg-accent/15 text-accent'
                  : 'text-text-300 hover:text-text-200 hover:bg-bg-600'
              }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          {tab === 'email' ? (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
            >
              {emailSuccess ? (
                <div className="px-6 py-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-bg flex items-center justify-center mb-3">
                    <Check size={22} className="text-status-green" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold text-text-100 mb-1">Invite sent!</p>
                  <p className="text-xs text-text-300">
                    <span className="text-text-200">{formik.values.email}</span> will appear as Pending until they accept.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 h-9 px-5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={formik.handleSubmit} noValidate>
                  <div className="px-6 py-5">
                    <p className="text-xs text-text-300 mb-4 leading-relaxed">
                      Enter the email address of the person you'd like to invite.
                      They'll appear as <span className="text-status-amber font-medium">Pending</span> until
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
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-60 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {formik.isSubmitting ? 'Sending…' : 'Send invite'}
                    </motion.button>
                  </div>
                </form>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="platform"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.15 }}
            >
              {platformSuccess ? (
                <div className="px-6 py-10 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-green-bg flex items-center justify-center mb-3">
                    <Check size={22} className="text-status-green" strokeWidth={2} />
                  </div>
                  <p className="text-sm font-semibold text-text-100 mb-1">Members added!</p>
                  <p className="text-xs text-text-300">
                    {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} added to the workspace.
                  </p>
                  <button
                    onClick={onClose}
                    className="mt-6 h-9 px-5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <div className="px-6 py-5">
                    <p className="text-xs text-text-300 mb-4 leading-relaxed">
                      Select existing platform users to add directly to this workspace.
                      They'll be active immediately — no invitation required.
                    </p>
                    <label className="text-xs font-medium text-text-200 block mb-1.5">
                      Select members
                    </label>
                    <Select
                      isMulti
                      instanceId="platform-invite"
                      options={platformOptions}
                      value={selectedUsers}
                      onChange={setSelectedUsers}
                      styles={multiStyles as never}
                      placeholder="Search users…"
                      noOptionsMessage={() =>
                        platformOptions.length === 0
                          ? 'All platform users are already members'
                          : 'No users found'
                      }
                      menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                      menuPosition="fixed"
                    />
                    {selectedUsers.length > 0 && (
                      <p className="text-xs text-text-300 mt-2">
                        {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} selected
                      </p>
                    )}
                  </div>
                  <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={onClose}
                      className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="button"
                      onClick={handleEnlist}
                      disabled={!selectedUsers.length || enlistMutation.isPending}
                      className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Users size={13} />
                      {enlistMutation.isPending ? 'Adding…' : 'Add to workspace'}
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
