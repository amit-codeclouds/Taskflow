'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Palette, Bell, Shield, Check, Camera } from 'lucide-react';

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon,
  title,
  description,
  children,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
    >
      {/* Section header */}
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

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-8 py-4 px-6 border-b border-border-subtle last:border-0">
      <div className="w-48 shrink-0">
        <p className="text-sm text-text-100">{label}</p>
        {hint && <p className="text-xs text-text-300 mt-0.5 leading-relaxed">{hint}</p>}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-10 h-5.5 rounded-full transition-colors shrink-0 ${
        value ? 'bg-accent' : 'bg-bg-500'
      }`}
      style={{ height: 22, width: 40 }}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? 20 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
}

// ─── Theme option ─────────────────────────────────────────────────────────────

function ThemeOption({
  label,
  active,
  disabled,
  preview,
  onClick,
}: {
  label: string;
  active: boolean;
  disabled?: boolean;
  preview: React.ReactNode;
  onClick?: () => void;
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
  const [name, setName]         = useState('Arkabrata');
  const [role, setRole]         = useState('Engineer');
  const [saved, setSaved]       = useState(false);

  const [notifs, setNotifs] = useState({
    taskAssigned:   true,
    commentAdded:   true,
    dueSoon:        true,
    statusChanged:  false,
  });

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">

      {/* Page header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h1 className="text-2xl font-semibold text-text-100">Settings</h1>
        <p className="text-sm text-text-300 mt-1">Manage your profile, appearance, and preferences.</p>
      </motion.div>

      {/* ── Profile ── */}
      <Section
        icon={<User size={15} strokeWidth={1.5} />}
        title="Profile"
        description="Your public identity across Taskflow."
        delay={0.06}
      >
        {/* Avatar row */}
        <div className="flex items-center gap-4 px-6 py-5 border-b border-border-subtle">
          <div className="relative group">
            <div className="w-16 h-16 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xl font-semibold">
              {name.slice(0, 2).toUpperCase()}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
              <Camera size={16} color="white" strokeWidth={1.5} />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-text-100">{name || 'Your Name'}</p>
            <p className="text-xs text-text-300 mt-0.5">amit.roy@codeclouds.com</p>
            <p className="text-xs text-text-300 mt-2 leading-relaxed">
              Click avatar to upload a photo.{' '}
              <span className="text-text-300 bg-bg-600 px-1.5 py-px rounded-full text-2xs">Coming soon</span>
            </p>
          </div>
        </div>

        <Field label="Full name" hint="Displayed across the workspace.">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>

        <Field label="Email" hint="Used for notifications and login.">
          <input
            type="email"
            value="amit.roy@codeclouds.com"
            disabled
            className="w-full h-9 px-3 bg-bg-800 border border-border-subtle rounded-lg text-sm text-text-300 cursor-not-allowed opacity-60"
          />
        </Field>

        <Field label="Role / Title" hint="Visible to teammates.">
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>

        {/* Save button */}
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <AnimatePresence mode="wait">
            {saved ? (
              <motion.div
                key="saved"
                className="flex items-center gap-1.5 text-sm text-status-green"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Check size={14} />
                Saved
              </motion.div>
            ) : (
              <motion.button
                key="save"
                onClick={handleSave}
                className="flex items-center gap-2 h-9 px-5 rounded-lg bg-accent text-white text-sm font-medium"
                whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.35)' }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                Save changes
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </Section>

      {/* ── Appearance ── */}
      <Section
        icon={<Palette size={15} strokeWidth={1.5} />}
        title="Appearance"
        description="Customise how Taskflow looks for you."
        delay={0.12}
      >
        <Field label="Theme" hint="Choose your preferred colour scheme.">
          <div className="flex gap-3">
            <ThemeOption
              label="Dark"
              active={true}
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
              active={false}
              disabled
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
        delay={0.18}
      >
        {(
          [
            { key: 'taskAssigned',  label: 'Task assigned to you',    hint: 'When someone assigns a task to you.' },
            { key: 'commentAdded',  label: 'Comment on your task',     hint: 'When someone comments on a task you own.' },
            { key: 'dueSoon',       label: 'Due date reminder',        hint: '24 hours before a task is due.' },
            { key: 'statusChanged', label: 'Status changes',           hint: 'When a task you follow changes status.' },
          ] as const
        ).map(({ key, label, hint }) => (
          <Field key={key} label={label} hint={hint}>
            <div className="flex justify-end">
              <Toggle
                value={notifs[key]}
                onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))}
              />
            </div>
          </Field>
        ))}
      </Section>

      {/* ── Security ── */}
      <Section
        icon={<Shield size={15} strokeWidth={1.5} />}
        title="Security"
        description="Manage your password and active sessions."
        delay={0.24}
      >
        <Field label="Password" hint="Last changed: never">
          <div className="flex justify-end">
            <button className="h-9 px-4 rounded-lg bg-bg-600 border border-border-subtle text-sm text-text-200 hover:text-text-100 hover:bg-bg-500 transition-colors">
              Change password
              <span className="ml-2 text-2xs text-text-300 bg-bg-800 px-1.5 py-px rounded-full">Coming soon</span>
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

    </div>
  );
}
