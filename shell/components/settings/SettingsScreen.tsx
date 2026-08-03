'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  User, Palette, Bell, Shield, Check, Camera,
  Building2, Users, Crown, Clock, Archive,
} from 'lucide-react';
import { useMe } from '@/lib/hooks/useMe';
import { useUpdateUser } from '@/lib/hooks/useUsers';
import { useMySettings, useUpdateUserSettings } from '@/lib/hooks/useSettings';
import { SettingsSkeleton } from '@/app/(shell)/settings/_skeleton';
import { getInitials } from '@/lib/initials';
import { getTheme, setTheme, type Theme } from '@/lib/theme';
import ComingSoon from '@/components/ui/ComingSoon';
import InfoTooltip from '@/components/ui/InfoTooltip';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRole(role: string): string {
  const map: Record<string, string> = {
    admin: 'Admin', member: 'Member', owner: 'Owner',
    developer: 'Developer', tl: 'Team Lead', pm: 'Product Manager',
  };
  return map[role?.toLowerCase()] ?? role;
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({
  icon, title, description, children, delay = 0,
}: {
  icon: React.ReactNode; title: string; description: string;
  children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
    >
      <div className="flex items-start gap-3 px-6 py-5 border-b border-border-subtle">
        <div className="w-8 h-8 rounded-lg bg-bg-600 flex items-center justify-center text-accent shrink-0 mt-0.5">
          {icon}
        </div>
        <div>
          <h2 className="text-sm font-semibold text-text-100">{title}</h2>
          <p className="text-xs text-text-300 mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </motion.div>
  );
}

function Field({ label, hint, tooltip, children }: {
  label: string; hint?: string; tooltip?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 px-6 border-b border-border-subtle last:border-0">
      <div className="w-96 shrink-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-text-100">{label}</p>
          {tooltip && <InfoTooltip text={tooltip} />}
        </div>
        {hint && <p className="text-xs text-text-300 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── ThemeOption ──────────────────────────────────────────────────────────────

function ThemeOption({ label, active, disabled, preview, onClick }: {
  label: string; active: boolean; disabled?: boolean;
  preview: React.ReactNode; onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative flex flex-col gap-2 p-1 rounded-xl border transition-all ${
        active
          ? 'border-accent bg-accent-bg'
          : disabled
          ? 'border-border-subtle opacity-40 cursor-not-allowed'
          : 'border-border-subtle hover:border-bg-400 cursor-pointer'
      }`}
      style={{ width: 120 }}
    >
      <div className="w-full rounded-lg overflow-hidden border border-border-subtle">
        {preview}
      </div>
      <div className="flex items-center justify-between px-1.5 pb-1">
        <span className={`text-xs font-medium ${active ? 'text-accent-hover' : 'text-text-200'}`}>
          {label}
        </span>
        {disabled && (
          <span className="text-2xs text-text-300 bg-bg-600 px-1.5 py-px rounded-full">Soon</span>
        )}
        {active && (
          <div className="w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
            <Check size={8} strokeWidth={2.5} color="white" />
          </div>
        )}
      </div>
    </button>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function SettingsScreen() {
  const { data: me, isPending } = useMe();
  const updateUser = useUpdateUser();
  const router = useRouter();

  const { data: mySettings, isPending: settingsPending } = useMySettings();
  const updateSettings = useUpdateUserSettings();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [theme, setThemeState] = useState<Theme>('dark');

  const archiveFormik = useFormik({
    enableReinitialize: true,
    initialValues: {
      daysToArchieve: mySettings ? String(mySettings.daysToArchieve) : '',
    },
    validationSchema: Yup.object({
      daysToArchieve: Yup.string()
        .required('Required')
        .matches(/^[1-9]\d*$/, 'Enter a whole number greater than 0'),
    }),
    onSubmit: (values) => {
      if (!mySettings) return;
      updateSettings.mutate({ id: mySettings.userId, daysToArchieve: Number(values.daysToArchieve) });
    },
  });

  const daysError = !!archiveFormik.touched.daysToArchieve && !!archiveFormik.errors.daysToArchieve;

  useEffect(() => {
    if (me) {
      setName(me.name ?? '');
      setRole(me.title ?? '');
    }
  }, [me]);

  useEffect(() => {
    setThemeState(getTheme());
  }, []);

  function handleThemeChange(next: Theme) {
    if (next === theme) return;
    setTheme(next);
    setThemeState(next);
    router.refresh();
  }

  function handleSave() {
    if (!me) return;
    updateUser.mutate({ id: me.id, name: name.trim(), title: role.trim() });
  }

  if (isPending) return <SettingsSkeleton />;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-5">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h1 className="text-2xl font-semibold text-text-100">Settings</h1>
        <p className="text-sm text-text-300 mt-1">Manage your profile, workspace, and preferences.</p>
      </motion.div>

      {/* ── Appearance ── */}
      <Section
        icon={<Palette size={15} strokeWidth={1.5} />}
        title="Appearance"
        description="Customise how Taskflow looks for you."
        delay={0.18}
      >
        <Field label="Theme" hint="Choose your preferred colour scheme.">
          <div className="flex gap-3">
            <ThemeOption
              label="Dark"
              active={theme === 'dark'}
              onClick={() => handleThemeChange('dark')}
              preview={
                <div className="h-14 bg-[#121215] flex flex-col gap-1 p-1.5">
                  <div className="h-1.5 w-10 bg-[#222227] rounded-full" />
                  <div className="h-1.5 w-7 bg-[#393940] rounded-full" />
                  <div className="h-1.5 w-12 bg-[#222227] rounded-full" />
                </div>
              }
            />
            <ThemeOption
              label="Light"
              active={theme === 'light'}
              onClick={() => handleThemeChange('light')}
              preview={
                <div className="h-14 bg-[#F8F8F8] flex flex-col gap-1 p-1.5">
                  <div className="h-1.5 w-10 bg-[#E5E5E5] rounded-full" />
                  <div className="h-1.5 w-7 bg-[#D0D0D0] rounded-full" />
                  <div className="h-1.5 w-12 bg-[#E5E5E5] rounded-full" />
                </div>
              }
            />
          </div>
        </Field>
      </Section>

      {/* ── Notifications ── */}
      <Section
        icon={<Bell size={15} strokeWidth={1.5} />}
        title="Notifications"
        description="Choose what activity triggers a notification."
        delay={0.22}
      >
        {(
          [
            { key: 'taskAssigned',  label: 'Task assigned to you',  hint: 'When someone assigns a task to you.'      },
            { key: 'commentAdded',  label: 'Comment on your task',  hint: 'When someone comments on a task you own.' },
            { key: 'dueSoon',       label: 'Due date reminder',     hint: '24 hours before a task is due.'           },
            { key: 'statusChanged', label: 'Status changes',        hint: 'When a task you follow changes status.'   },
          ] as const
        ).map(({ key, label, hint }) => (
          <Field key={key} label={label} hint={hint}>
            <div className="flex justify-end">
              <ComingSoon />
            </div>
          </Field>
        ))}
      </Section>

      {/* ── Security ── */}
      <Section
        icon={<Shield size={15} strokeWidth={1.5} />}
        title="Security"
        description="Manage your password and active sessions."
        delay={0.26}
      >
        <Field label="Password" hint="Last changed: never">
          <div className="flex justify-end">
            <button className="h-9 px-4 rounded-lg bg-bg-600 border border-border-subtle text-sm text-text-200 hover:text-text-100 hover:bg-bg-500 transition-colors">
              Change password
              <ComingSoon className="ml-2" />
            </button>
          </div>
        </Field>
        <Field label="Active sessions" hint="Devices where you are signed in.">
          <div className="flex items-center justify-between bg-bg-600 rounded-lg px-3 py-2.5 border border-border-subtle">
            <div>
              <p className="text-sm text-text-100">This device</p>
              <p className="text-xs text-text-300 mt-0.5">Windows · Chrome · Just now</p>
            </div>
            <span className="text-2xs text-status-green bg-green-bg px-2 py-0.5 rounded-full font-medium">Current</span>
          </div>
        </Field>
      </Section>

      {/* ── Task Archiving ── */}
      <Section
        icon={<Archive size={15} strokeWidth={1.5} />}
        title="Task Archiving"
        description="Control when completed tasks move to the archive."
        delay={0.3}
      >
        <form onSubmit={archiveFormik.handleSubmit} noValidate>
          <Field
            label="Archive after"
            hint="Tasks marked as Archived move to the archive table after this many days."
            tooltip="This setting only applies to tasks in teams where you're set as an admin. It has no effect on tasks in teams where you're not an admin."
          >
            <div className="flex justify-end">
              <div className="flex flex-col items-end gap-1.5">
                <div
                  className={`flex items-center justify-between w-40 h-9 pl-3 pr-3 bg-bg-600 border rounded-lg transition-colors ${
                    daysError
                      ? 'border-status-red'
                      : 'border-border-subtle focus-within:border-accent'
                  }`}
                >
                  <input
                    id="daysToArchieve"
                    type="text"
                    inputMode="numeric"
                    disabled={settingsPending}
                    {...archiveFormik.getFieldProps('daysToArchieve')}
                    className="flex-1 min-w-0 bg-transparent text-sm text-text-100 focus:outline-none disabled:opacity-60"
                  />
                  <span className="text-sm text-text-300 shrink-0 pl-3">days</span>
                </div>
                {daysError && (
                  <p className="text-xs text-status-red">{archiveFormik.errors.daysToArchieve}</p>
                )}
              </div>
            </div>
          </Field>
          <div className="flex items-center justify-end gap-3 px-6 py-4">
            <motion.button
              type="submit"
              disabled={settingsPending || updateSettings.isPending}
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={updateSettings.isPending ? undefined : { scale: 1.02, boxShadow: '0 0 16px var(--overlay-accent-hover)' }}
              whileTap={updateSettings.isPending ? undefined : { scale: 0.98 }}
            >
              {updateSettings.isPending ? 'Saving…' : 'Save settings'}
            </motion.button>
          </div>
        </form>
      </Section>

    </div>
  );
}
