'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Lock, X, Check, Plus, Building2 } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import type { MultiValue } from 'react-select';
import type { StylesConfig } from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import { useAuth } from '@/lib/useAuth';
import { useUsersList } from '@/lib/hooks/useUsers';
import { useCreateTeam } from '@/lib/hooks/useTeams';
import type { TeamRole } from '@/lib/types/teams.types';
import { TEAM_COLORS, ROLE_OPTIONS } from '@/lib/teams';
import { getInitials } from '@/lib/initials';

// ─── Color picker ─────────────────────────────────────────────────────────────

function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {TEAM_COLORS.map(c => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className="relative w-7 h-7 rounded-full transition-transform hover:scale-110 shrink-0"
          style={{ background: c }}
        >
          {value === c && (
            <>
              <Check size={12} className="text-white absolute inset-0 m-auto" strokeWidth={3} />
              <span className="absolute inset-0 rounded-full ring-2 ring-white/40 ring-offset-1 ring-offset-bg-800 pointer-events-none" />
            </>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  name:        Yup.string().trim().required('Team name is required').max(60, 'Max 60 characters'),
  description: Yup.string().max(200, 'Max 200 characters'),
  color:       Yup.string().required(),
});

const rowStyles = getSelectStyles({ size: 'sm' });

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamNewPage() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const auth         = useAuth();

  const workspaceId   = searchParams.get('workspaceId') || auth.workspaceId;
  const workspaceName = auth.workspaceName;

  const { data: allUsers = [] } = useUsersList({ workspaceId });
  const createTeam              = useCreateTeam();

  const [memberRoles, setMemberRoles] = useState<Map<string, TeamRole>>(new Map());

  const handleMultiMemberChange = useCallback((selected: MultiValue<SelectOption>) => {
    const ids = new Set(selected.map(s => s.value));
    setMemberRoles(prev => {
      const next = new Map<string, TeamRole>();
      ids.forEach(id => { next.set(id, prev.get(id) ?? 'Developer'); });
      return next;
    });
  }, []);

  const toggleMember = useCallback((id: string) => {
    setMemberRoles(prev => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const setMemberRole = useCallback((id: string, role: TeamRole) => {
    setMemberRoles(prev => new Map(prev).set(id, role));
  }, []);

  const memberOptions: SelectOption[] = useMemo(
    () => allUsers
      .filter(u => u.email !== auth.email)
      .map(u => ({ value: u.id, label: u.name })),
    [allUsers, auth.email],
  );

  const selectedUsers = useMemo(
    () => allUsers.filter(u => memberRoles.has(u.id)),
    [allUsers, memberRoles],
  );

  const formik = useFormik({
    initialValues: { name: '', description: '', color: TEAM_COLORS[0] },
    validationSchema,
    onSubmit: async (values) => {
      await createTeam.mutateAsync({
        name:        values.name.trim(),
        description: values.description.trim(),
        color:       values.color,
        memberIds:   Array.from(memberRoles.entries()).map(([userId, role]) => ({ userId, role })),
      });
      router.push('/teams');
    },
  });

  const nameError = !!formik.touched.name && !!formik.errors.name;

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Breadcrumb */}
      <button
        onClick={() => router.push('/teams')}
        className="flex items-center gap-1.5 text-sm text-text-300 hover:text-text-100 transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Back to Teams
      </button>

      <h1 className="text-2xl font-semibold text-text-100 mb-1">Create New Team</h1>
      <div className="flex items-center gap-2 mb-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
          <Building2 size={11} />
          {workspaceName || workspaceId || 'Workspace'}
        </span>
      </div>
      <p className="text-sm text-text-300 mb-8">Set up a team and invite members to collaborate.</p>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
        {/* ── Team Details card ── */}
        <div className="bg-bg-700 border border-border-subtle rounded-card p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-text-300 uppercase tracking-widest">Team Details</h2>

          {/* Name */}
          <div>
            <label htmlFor="team-name" className="text-xs font-medium text-text-200 block mb-1.5">
              Team name <span className="text-status-red">*</span>
            </label>
            <input
              id="team-name"
              type="text"
              autoFocus
              placeholder="e.g. Frontend Team"
              {...formik.getFieldProps('name')}
              className={`w-full h-10 px-3 bg-bg-600 border rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                nameError
                  ? 'border-status-red focus:border-status-red'
                  : 'border-border-subtle focus:border-accent'
              }`}
            />
            {nameError && (
              <p className="text-xs text-status-red mt-1.5">{formik.errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label htmlFor="team-desc" className="text-xs font-medium text-text-200 block mb-1.5">
              Description <span className="text-text-300 font-normal">(optional)</span>
            </label>
            <input
              id="team-desc"
              type="text"
              placeholder="What does this team work on?"
              {...formik.getFieldProps('description')}
              className="w-full h-10 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-medium text-text-200 block mb-2">Team color</label>
            <ColorPicker
              value={formik.values.color}
              onChange={c => formik.setFieldValue('color', c)}
            />
          </div>
        </div>

        {/* ── Members card ── */}
        <div className="bg-bg-700 border border-border-subtle rounded-card p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-text-300 uppercase tracking-widest">Team Members</h2>

          {/* Admin indicator */}
          <div>
            <label className="text-xs font-medium text-text-200 block mb-1.5">Team admin</label>
            <div className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-600 border border-border-subtle rounded-lg">
              <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                {auth.initials || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-100 truncate">{auth.name || 'You'}</p>
                <p className="text-xs text-text-300 truncate">{auth.title || '—'}</p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">Admin</span>
                <span title="The creator is always the team admin">
                  <Lock size={12} className="text-text-300" />
                </span>
              </div>
            </div>
          </div>

          {/* Member multi-select */}
          <div>
            <label className="text-xs font-medium text-text-200 block mb-1.5">
              Add members <span className="text-text-300 font-normal">(optional)</span>
            </label>
            <Select
              isMulti
              instanceId="create-members"
              options={memberOptions}
              value={selectedUsers.map(u => ({ value: u.id, label: u.name }))}
              onChange={handleMultiMemberChange}
              styles={getSelectStyles({ size: 'md' }) as unknown as StylesConfig<SelectOption, true>}
              placeholder="Search and select members…"
              noOptionsMessage={() => 'All workspace members added'}
            />
          </div>

          {/* Role assignment rows */}
          <AnimatePresence>
            {selectedUsers.length > 0 && (
              <motion.div
                className="flex flex-col gap-2 pt-1 border-t border-border-subtle"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              >
                <p className="text-2xs text-text-300 uppercase tracking-wide pt-3">Assign roles</p>
                <AnimatePresence>
                  {selectedUsers.map(u => {
                    const initials = u.avatarInitials || getInitials(u.name);
                    return (
                      <motion.div
                        key={u.id}
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: 8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -8 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-100 truncate">{u.name}</p>
                          <p className="text-xs text-text-300 truncate">{u.title || '—'}</p>
                        </div>
                        <div className="w-[160px] shrink-0">
                          <Select
                            options={ROLE_OPTIONS}
                            value={ROLE_OPTIONS.find(o => o.value === (memberRoles.get(u.id) ?? 'Developer')) ?? ROLE_OPTIONS[3]}
                            onChange={opt => opt && setMemberRole(u.id, opt.value as TeamRole)}
                            styles={rowStyles}
                            isSearchable={false}
                            instanceId={`role-${u.id}`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleMember(u.id)}
                          className="w-8 h-8 flex items-center justify-center rounded-md text-text-300 hover:text-status-red hover:bg-red-bg transition-colors shrink-0"
                          title="Remove"
                        >
                          <X size={14} />
                        </button>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pb-10">
          <button
            type="button"
            onClick={() => router.push('/teams')}
            className="h-10 px-5 rounded-lg text-sm font-medium text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            type="submit"
            disabled={formik.isSubmitting || createTeam.isPending}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            whileHover={createTeam.isPending ? undefined : { scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
            whileTap={createTeam.isPending ? undefined : { scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Plus size={14} />
            {createTeam.isPending ? 'Creating…' : 'Create Team'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
