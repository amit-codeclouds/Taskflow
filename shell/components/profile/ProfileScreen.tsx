'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Palette, Bell, Shield, Check, Camera,
  Building2, Users, Crown, Clock, Loader2, Trash2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMe } from '@/lib/hooks/useMe';
import {
  useUpdateUser, useUploadAvatar, useDeleteAvatar,
  AVATAR_MAX_SIZE_BYTES, AVATAR_ALLOWED_TYPES,
} from '@/lib/hooks/useUsers';
import { SettingsSkeleton } from '@/app/(shell)/settings/_skeleton';
import { getInitials } from '@/lib/initials';

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

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{ height: 22, width: 40 }}
      className={`relative rounded-full transition-colors shrink-0 ${value ? 'bg-accent' : 'bg-bg-500'}`}
    >
      <motion.div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
        animate={{ left: value ? 20 : 4 }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      />
    </button>
  );
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
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

// ─── Profile hero card ────────────────────────────────────────────────────────

function ProfileCard({ me }: { me: ReturnType<typeof useMe>['data'] }) {
  const initials = me?.avatarInitials || getInitials(me?.name);
  const workspace = me?.workspaces?.[0];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();
  const isBusy = uploadAvatar.isPending || deleteAvatar.isPending;

  function handleAvatarClick() {
    if (isBusy) return;
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow re-selecting the same file
    if (!file) return;

    if (file.size > AVATAR_MAX_SIZE_BYTES) {
      toast.error('Image is too large — please choose a photo under 1MB.');
      return;
    }
    if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
      toast.error('Unsupported file type. Please upload a JPG, PNG, GIF, or WEBP image.');
      return;
    }

    uploadAvatar.mutate(file);
  }

  function handleRemoveAvatar(e: React.MouseEvent) {
    e.stopPropagation();
    if (isBusy) return;
    deleteAvatar.mutate();
  }

  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
    >
      {/* Top accent strip */}
      <div className="h-1 bg-gradient-to-r from-accent via-purple-500 to-indigo-400" />

      <div className="px-6 py-6 flex items-start gap-5">
        {/* Avatar */}
        <div className="shrink-0">
          <div
            className="relative group w-16 h-16 cursor-pointer mx-3"
            onClick={handleAvatarClick}
          >
            {me?.avatarUrl ? (
              <Image
                src={me.avatarUrl}
                alt={me?.name ?? 'Profile photo'}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover ring-2 ring-accent/20"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xl font-semibold ring-2 ring-accent/20">
                {initials}
              </div>
            )}

            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              {uploadAvatar.isPending ? (
                <Loader2 size={16} color="white" className="animate-spin" />
              ) : (
                <Camera size={15} color="white" strokeWidth={1.5} />
              )}
            </div>

            {me?.avatarUrl && !isBusy && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                title="Remove photo"
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-bg-800 border border-border-subtle flex items-center justify-center text-text-300 hover:text-status-red hover:border-status-red/40 transition-colors"
              >
                <Trash2 size={10} strokeWidth={2} />
              </button>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />

          <p className="text-2xs text-text-300 mt-2 text-center leading-tight">
            JPG, PNG or GIF<br />Max 1MB
          </p>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-100 leading-tight">{me?.name}</h2>
              <p className="text-sm text-text-300 mt-0.5">{me?.email}</p>
              {me?.title && (
                <p className="text-xs text-text-200 mt-1 capitalize">{me.title}</p>
              )}
            </div>
            {workspace && (
              <span className={`shrink-0 text-2xs font-medium px-2.5 py-1 rounded-full ${
                workspace.status === 'active'
                  ? 'bg-green-bg text-status-green'
                  : 'bg-status-amber/10 text-status-amber'
              }`}>
                {workspace.status === 'active' ? 'Active' : workspace.status}
              </span>
            )}
          </div>

          {workspace && (
            <div className="flex items-center gap-1.5 mt-3">
              <Building2 size={12} className="text-text-300" />
              <span className="text-xs text-text-300">{workspace.name}</span>
              <span className="text-text-300 text-xs">·</span>
              <span className="text-xs text-accent capitalize">{formatRole(workspace.role)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Workspace card ───────────────────────────────────────────────────────────

function WorkspaceCard({ me }: { me: ReturnType<typeof useMe>['data'] }) {
  const workspaces = me?.workspaces ?? [];

  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.06 }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
        <div className="w-7 h-7 rounded-lg bg-bg-600 flex items-center justify-center shrink-0">
          <Building2 size={13} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-text-100">Workspace</h3>
          <p className="text-2xs text-text-300">{workspaces.length} membership{workspaces.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="divide-y divide-border-subtle">
        {workspaces.length === 0 ? (
          <p className="text-xs text-text-300 px-5 py-4">No workspace memberships.</p>
        ) : workspaces.map(ws => (
          <div key={ws.workspaceId} className="px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-100 truncate">{ws.name}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
                    {formatRole(ws.role)}
                  </span>
                  <span className={`text-2xs font-medium px-2 py-0.5 rounded-full ${
                    ws.status === 'active'
                      ? 'bg-green-bg text-status-green'
                      : 'bg-status-amber/10 text-status-amber'
                  }`}>
                    {ws.status}
                  </span>
                </div>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-text-300">
                <Clock size={11} />
                <span className="text-2xs">{formatDate(ws.joinedAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Teams card ───────────────────────────────────────────────────────────────

function TeamsCard({ me }: { me: ReturnType<typeof useMe>['data'] }) {
  const teams = me?.teams ?? [];

  const roleColor: Record<string, string> = {
    admin: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    tl:    'bg-blue-500/10 text-blue-400 border-blue-500/20',
    pm:    'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.1 }}
    >
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border-subtle">
        <div className="w-7 h-7 rounded-lg bg-bg-600 flex items-center justify-center shrink-0">
          <Users size={13} className="text-accent" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-text-100">Teams</h3>
          <p className="text-2xs text-text-300">{teams.length} team{teams.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="divide-y divide-border-subtle">
        {teams.length === 0 ? (
          <p className="text-xs text-text-300 px-5 py-4">Not a member of any team yet.</p>
        ) : teams.map(team => {
          const roleLower = team.role?.toLowerCase();
          const chipClass = roleColor[roleLower] ?? 'bg-accent/10 text-accent border-accent/20';

          return (
            <div key={team.teamId} className="px-5 py-4 flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-100 truncate">{team.teamName}</p>
                <span className={`inline-block mt-1.5 text-2xs font-medium px-2 py-0.5 rounded-full border ${chipClass}`}>
                  {formatRole(team.role)}
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-1 text-text-300">
                <Clock size={11} />
                <span className="text-2xs">{formatDate(team.joinedAt)}</span>
              </div>
            </div>
          );
        })}
      </div>

      {teams.length > 0 && (
        <div className="px-5 py-3 border-t border-border-subtle bg-bg-800/40">
          <div className="flex items-center gap-1.5">
            <Crown size={11} className="text-text-300" />
            <span className="text-2xs text-text-300">
              Admin in {teams.filter(t => t.role?.toLowerCase() === 'admin').length} team{teams.filter(t => t.role?.toLowerCase() === 'admin').length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ProfileScreen() {
  const { data: me, isPending } = useMe();
  const updateUser = useUpdateUser();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    if (me) {
      setName(me.name ?? '');
      setRole(me.title ?? '');
    }
  }, [me]);

  const [notifs, setNotifs] = useState({
    taskAssigned: true, commentAdded: true, dueSoon: true, statusChanged: false,
  });

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
        <h1 className="text-2xl font-semibold text-text-100">My Profile</h1>
        <p className="text-sm text-text-300 mt-1">View and manage your personal information and roles.</p>
      </motion.div>

      {/* ── Profile hero ── */}
      <ProfileCard me={me} />

      {/* ── Workspace + Teams info grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WorkspaceCard me={me} />
        <TeamsCard me={me} />
      </div>

      {/* ── Edit Profile ── */}
      <Section
        icon={<User size={15} strokeWidth={1.5} />}
        title="Edit Profile"
        description="Update your display name and title."
        delay={0.14}
      >
        <Field label="Full name" hint="Displayed across the workspace.">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>
        <Field label="Email" hint="Cannot be changed here.">
          <input
            type="email"
            value={me?.email ?? ''}
            disabled
            className="w-full h-9 px-3 bg-bg-800 border border-border-subtle rounded-lg text-sm text-text-300 cursor-not-allowed opacity-60"
          />
        </Field>
        <Field label="Role / Title" hint="Visible to teammates.">
          <input
            type="text"
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </Field>
        <div className="flex items-center justify-end gap-3 px-6 py-4">
          <AnimatePresence mode="wait">
            <motion.button
              key="save"
              onClick={handleSave}
              disabled={updateUser.isPending}
              className="flex items-center gap-2 h-9 px-5 rounded-lg bg-accent text-white text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={updateUser.isPending ? undefined : { scale: 1.02, boxShadow: '0 0 16px var(--overlay-accent-hover)' }}
              whileTap={updateUser.isPending ? undefined : { scale: 0.98 }}
            >
              {updateUser.isPending ? 'Saving…' : 'Save changes'}
            </motion.button>
          </AnimatePresence>
        </div>
      </Section>
    </div>
  );
}
