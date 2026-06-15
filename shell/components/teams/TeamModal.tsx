'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Lock, Plus, Trash2, Users } from 'lucide-react'; // Plus kept for footer Create button
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select, { type MultiValue } from 'react-select';
import type { StylesConfig } from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import { useAuth } from '@/lib/useAuth';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { WORKSPACE_MEMBERS } from '@/lib/workspace';
import type { Team, TeamMember, TeamRole } from '@/lib/teams';
import { TEAM_COLORS, ROLE_OPTIONS } from '@/lib/teams';

// ─── Prop types ───────────────────────────────────────────────────────────────

type CreateProps = {
  mode: 'create';
  onClose: () => void;
  onCreate: (team: Team) => void;
};

type ManageProps = {
  mode: 'manage';
  team: Team;
  onClose: () => void;
  onSave: (team: Team) => void;
  onDelete: (teamId: string) => void;
};

export type TeamModalProps = CreateProps | ManageProps;

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
          title={c}
        >
          {value === c && (
            <>
              <Check
                size={12}
                className="text-white absolute inset-0 m-auto"
                strokeWidth={3}
              />
              <span className="absolute inset-0 rounded-full ring-2 ring-white/40 ring-offset-1 ring-offset-bg-800 pointer-events-none" />
            </>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Member row (manage mode) ─────────────────────────────────────────────────

const rowSelectStyles = getSelectStyles({ size: 'sm' });

function MemberRow({
  member,
  isLastAdmin,
  onRoleChange,
  onRemove,
}: {
  member: TeamMember;
  isLastAdmin: boolean;
  onRoleChange: (id: string, role: TeamRole) => void;
  onRemove: (id: string) => void;
}) {
  const isPending = member.isPending === true;

  return (
    <motion.div
      layout
      className="flex items-center gap-3 py-2 group/row"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
          isPending
            ? 'bg-bg-600 text-text-300 border border-dashed border-border-subtle'
            : 'bg-accent-bg text-accent'
        }`}
      >
        {member.initials}
      </div>

      {/* Name + title */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="text-sm text-text-100 truncate">{member.name}</p>
          {isPending && (
            <span className="text-[10px] text-status-amber bg-amber-bg px-1.5 py-0.5 rounded shrink-0">
              Pending
            </span>
          )}
        </div>
        <p className="text-xs text-text-300 truncate">{member.title}</p>
      </div>

      {/* Role */}
      <div className="w-[138px] shrink-0">
        {isLastAdmin ? (
          <div
            className="h-9 flex items-center gap-1.5 px-3 bg-bg-600/60 border border-border-subtle rounded-lg cursor-not-allowed"
            title="Cannot change role — this is the only admin"
          >
            <Lock size={11} className="text-text-300 shrink-0" />
            <span className="text-xs text-text-300">Admin</span>
          </div>
        ) : (
          <Select
            options={ROLE_OPTIONS}
            value={ROLE_OPTIONS.find(o => o.value === member.role) ?? ROLE_OPTIONS[3]}
            onChange={opt => opt && onRoleChange(member.id, opt.value as TeamRole)}
            styles={rowSelectStyles}
            isSearchable={false}
            menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
            menuPosition="fixed"
            menuPlacement="auto"
            instanceId={`role-${member.id}`}
          />
        )}
      </div>

      {/* Remove */}
      <div className="w-8 shrink-0 flex items-center justify-center">
        {!isLastAdmin && (
          <motion.button
            type="button"
            onClick={() => onRemove(member.id)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-300 hover:text-status-red hover:bg-red-bg opacity-0 group-hover/row:opacity-100 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Remove from team"
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Validation ───────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required('Team name is required')
    .max(60, 'Max 60 characters'),
  description: Yup.string().max(200, 'Max 200 characters'),
  color: Yup.string().required(),
  // members array always has at least 1 (the creator is added programmatically in onSubmit)
});

const addSelectStyles = getSelectStyles({ size: 'sm' });

// ─── Main component ───────────────────────────────────────────────────────────

export default function TeamModal(props: TeamModalProps) {
  const { mode, onClose } = props;

  // Type-safe mode-specific prop access
  const team     = mode === 'manage' ? props.team     : null;
  const onCreate = mode === 'create' ? props.onCreate : null;
  const onSave   = mode === 'manage' ? props.onSave   : null;
  const onDelete = mode === 'manage' ? props.onDelete : null;

  const auth    = useAuth();
  const confirm = useConfirm();

  // ── Create mode: member picker ──────────────────────────────────────────────
  const [memberRoles, setMemberRoles] = useState<Map<string, TeamRole>>(new Map());

  const toggleMember = useCallback((id: string) => {
    setMemberRoles(prev => {
      const next = new Map(prev);
      if (next.has(id)) { next.delete(id); } else { next.set(id, 'developer'); }
      return next;
    });
  }, []);

  const handleMultiMemberChange = useCallback((selected: MultiValue<SelectOption>) => {
    const ids = new Set(selected.map(s => s.value));
    setMemberRoles(prev => {
      const next = new Map<string, TeamRole>();
      ids.forEach(id => { next.set(id, prev.get(id) ?? 'developer'); });
      return next;
    });
  }, []);

  const setMemberRole = useCallback((id: string, role: TeamRole) => {
    setMemberRoles(prev => new Map(prev).set(id, role));
  }, []);

  // ── Manage mode: local member state ─────────────────────────────────────────
  const [localMembers, setLocalMembers] = useState<TeamMember[]>(team?.members ?? []);
  const [addMemberSel, setAddMemberSel] = useState<SelectOption | null>(null);
  const [addMemberRole, setAddMemberRole] = useState<SelectOption>(ROLE_OPTIONS[3]);

  const adminCount = useMemo(
    () => localMembers.filter(m => m.role === 'admin').length,
    [localMembers],
  );
  const membersDirty = useMemo(
    () => (team ? JSON.stringify(localMembers) !== JSON.stringify(team.members) : false),
    [localMembers, team],
  );

  // ── Formik ──────────────────────────────────────────────────────────────────
  const formik = useFormik({
    initialValues: {
      name:        team?.name        ?? '',
      description: team?.description ?? '',
      color:       team?.color       ?? TEAM_COLORS[0],
    },
    validationSchema,
    onSubmit: values => {
      if (mode === 'create' && onCreate) {
        const newTeam: Team = {
          id: `team_${Date.now()}`,
          name: values.name.trim(),
          description: values.description.trim(),
          color: values.color,
          members: [
            {
              id: auth.email || 'u0',
              initials: auth.initials || 'U',
              name: auth.name || 'You',
              email: auth.email || '',
              title: auth.title || '—',
              role: 'admin',
              isPending: false,
            },
            ...Array.from(memberRoles.entries()).map(([mid, role]) => {
              const wm = WORKSPACE_MEMBERS.find(m => m.id === mid)!;
              return {
                id: wm.id, initials: wm.initials, name: wm.name,
                email: wm.email, title: wm.title, role, isPending: false,
              };
            }),
          ],
        };
        onCreate(newTeam);
        onClose();
      } else if (mode === 'manage' && onSave && team) {
        onSave({ ...team, name: values.name.trim(), description: values.description.trim(), color: values.color, members: localMembers });
        onClose();
      }
    },
  });

  // ── Manage mode handlers ─────────────────────────────────────────────────────
  const handleRoleChange = useCallback((id: string, role: TeamRole) => {
    setLocalMembers(prev => prev.map(m => m.id === id ? { ...m, role } : m));
  }, []);

  const handleRemoveMember = useCallback(async (id: string) => {
    const member = localMembers.find(m => m.id === id);
    if (!member) return;
    const confirmed = await confirm({
      title: member.isPending ? 'Remove pending member?' : 'Remove from team?',
      description: member.isPending
        ? `Cancel the pending invite for ${member.email}?`
        : `${member.name} will lose access to this team's board. Their tasks remain unassigned.`,
      confirmLabel: 'Remove',
      danger: true,
    });
    if (confirmed) setLocalMembers(prev => prev.filter(m => m.id !== id));
  }, [confirm, localMembers]);

  const handleAddMember = useCallback(() => {
    if (!addMemberSel) return;
    const wm = WORKSPACE_MEMBERS.find(m => m.id === addMemberSel.value);
    if (!wm) return;
    setLocalMembers(prev => [
      ...prev,
      { id: wm.id, initials: wm.initials, name: wm.name, email: wm.email, title: wm.title, role: addMemberRole.value as TeamRole, isPending: false },
    ]);
    setAddMemberSel(null);
    setAddMemberRole(ROLE_OPTIONS[3]);
  }, [addMemberSel, addMemberRole]);

  const handleDeleteTeam = useCallback(async () => {
    if (!team || !onDelete) return;
    const confirmed = await confirm({
      title: 'Delete team?',
      description: `Permanently delete "${team.name}"? Tasks will not be deleted but will become unassigned.`,
      confirmLabel: 'Delete Team',
      danger: true,
    });
    if (confirmed) { onDelete(team.id); onClose(); }
  }, [confirm, team, onDelete, onClose]);

  // ── Derived lists ────────────────────────────────────────────────────────────
  const createMemberOptions: SelectOption[] = useMemo(
    () => WORKSPACE_MEMBERS
      .filter(m => m.email !== auth.email)
      .map(m => ({ value: m.id, label: m.name })),
    [auth.email],
  );

  const selectedMembers = useMemo(
    () => WORKSPACE_MEMBERS.filter(m => memberRoles.has(m.id)),
    [memberRoles],
  );

  const availableForManage = useMemo(
    () => WORKSPACE_MEMBERS
      .filter(m => !localMembers.some(lm => lm.email === m.email))
      .map(m => ({ value: m.id, label: m.name })),
    [localMembers],
  );

  const nameError = !!formik.touched.name && !!formik.errors.name;
  const canSave   = formik.dirty || membersDirty;

  // ─────────────────────────────────────────────────────────────────────────────

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
        className="relative w-full max-w-[560px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated flex flex-col max-h-[90vh]"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-3">
            {mode === 'manage' && team ? (
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0"
                style={{ background: team.color + '33', color: team.color }}
              >
                {team.name.slice(0, 2).toUpperCase()}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center shrink-0">
                <Users size={15} className="text-accent" strokeWidth={1.5} />
              </div>
            )}
            <div>
              <h2 className="text-sm font-semibold text-text-100">
                {mode === 'create' ? 'Create a new team' : `Manage ${team?.name}`}
              </h2>
              <p className="text-2xs text-text-300 mt-0.5">
                {mode === 'create'
                  ? 'Set up your team and add members'
                  : 'Edit team details and manage members'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* ── Form wraps scrollable body + footer ── */}
        <form
          onSubmit={formik.handleSubmit}
          noValidate
          className="flex flex-col flex-1 overflow-hidden"
        >
          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">

            {/* Name */}
            <div>
              <label htmlFor="team-name" className="text-xs font-medium text-text-200 block mb-1.5">
                Team name <span className="text-status-red">*</span>
              </label>
              <input
                id="team-name"
                type="text"
                autoFocus={mode === 'create'}
                placeholder="e.g. Frontend Team"
                {...formik.getFieldProps('name')}
                className={`w-full h-10 px-3 bg-bg-700 border rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
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
                Description{' '}
                <span className="text-text-300 font-normal">(optional)</span>
              </label>
              <input
                id="team-desc"
                type="text"
                placeholder="What does this team work on?"
                {...formik.getFieldProps('description')}
                className="w-full h-10 px-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
              />
            </div>

            {/* ─── CREATE MODE: admin indicator + member picker ─── */}
            {mode === 'create' && (
              <>
                {/* Admin indicator */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-1.5">
                    Team admin
                  </label>
                  <div className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-700 border border-border-subtle rounded-lg">
                    <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                      {auth.initials || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-100 truncate">{auth.name || 'You'}</p>
                      <p className="text-xs text-text-300 truncate">{auth.title || '—'}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-2xs font-medium px-2 py-0.5 rounded-full bg-accent/20 text-accent">
                        Admin
                      </span>
                      <span title="The creator is always the team admin">
                        <Lock size={12} className="text-text-300" />
                      </span>
                    </div>
                  </div>
                </div>

                {/* Member picker — MultiSelect */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-1.5">
                    Add team members{' '}
                    <span className="text-text-300 font-normal">(optional)</span>
                  </label>
                  <Select
                    isMulti
                    instanceId="create-members"
                    options={createMemberOptions}
                    value={selectedMembers.map(m => ({ value: m.id, label: m.name }))}
                    onChange={handleMultiMemberChange}
                    styles={getSelectStyles({ size: 'md' }) as unknown as StylesConfig<SelectOption, true>}
                    placeholder="Search and select members…"
                    noOptionsMessage={() => 'All workspace members added'}
                    menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                    menuPosition="fixed"
                    menuPlacement="top"
                  />

                  {/* Selected members with role assignment */}
                  <AnimatePresence>
                    {selectedMembers.length > 0 && (
                      <motion.div
                        className="mt-3 pt-3 border-t border-border-subtle flex flex-col gap-2"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      >
                        <p className="text-2xs text-text-300 uppercase tracking-wide">
                          Assign roles
                        </p>
                        <AnimatePresence>
                          {selectedMembers.map(m => (
                            <motion.div
                              key={m.id}
                              className="flex items-center gap-2.5"
                              initial={{ opacity: 0, x: 8 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -8 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            >
                              <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                                {m.initials}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-text-100 truncate">{m.name}</p>
                                <p className="text-xs text-text-300 truncate">{m.title}</p>
                              </div>
                              <div className="w-[138px] shrink-0">
                                <Select
                                  options={ROLE_OPTIONS}
                                  value={
                                    ROLE_OPTIONS.find(
                                      o => o.value === (memberRoles.get(m.id) ?? 'developer'),
                                    ) ?? ROLE_OPTIONS[3]
                                  }
                                  onChange={opt =>
                                    opt && setMemberRole(m.id, opt.value as TeamRole)
                                  }
                                  styles={rowSelectStyles}
                                  isSearchable={false}
                                  menuPortalTarget={
                                    typeof document !== 'undefined' ? document.body : undefined
                                  }
                                  menuPosition="fixed"
                                  menuPlacement="auto"
                                  instanceId={`create-role-${m.id}`}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => toggleMember(m.id)}
                                className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-status-red hover:bg-red-bg transition-colors shrink-0"
                                title="Remove"
                              >
                                <X size={13} />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}

            {/* ─── MANAGE MODE: color + members table + add + delete ─── */}
            {mode === 'manage' && (
              <>
                {/* Color */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-2">Team color</label>
                  <ColorPicker
                    value={formik.values.color}
                    onChange={c => formik.setFieldValue('color', c)}
                  />
                </div>

                {/* Members section */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-2">
                    Members{' '}
                    <span className="text-text-300 font-normal">({localMembers.length})</span>
                  </label>

                  {/* Column headers */}
                  <div className="flex items-center gap-3 pb-1 border-b border-border-subtle mb-0.5">
                    <div className="w-8 shrink-0" />
                    <p className="flex-1 text-2xs text-text-300 uppercase tracking-wide">Member</p>
                    <p className="w-[138px] text-2xs text-text-300 uppercase tracking-wide shrink-0">
                      Role
                    </p>
                    <div className="w-8 shrink-0" />
                  </div>

                  {/* Rows */}
                  <AnimatePresence mode="popLayout">
                    {localMembers.map(member => (
                      <MemberRow
                        key={member.id}
                        member={member}
                        isLastAdmin={adminCount === 1 && member.role === 'admin'}
                        onRoleChange={handleRoleChange}
                        onRemove={handleRemoveMember}
                      />
                    ))}
                  </AnimatePresence>

                  {localMembers.length === 0 && (
                    <p className="text-xs text-text-300 py-4 text-center">No members yet.</p>
                  )}
                </div>

                {/* Add from workspace */}
                <div>
                  <label className="text-xs font-medium text-text-200 block mb-2">
                    Add from workspace
                  </label>
                  <div className="flex gap-2">
                    <div className="flex-1 min-w-0">
                      <Select
                        placeholder="Select a member…"
                        options={availableForManage}
                        value={addMemberSel}
                        onChange={v => setAddMemberSel(v as SelectOption | null)}
                        styles={addSelectStyles}
                        isClearable
                        menuPortalTarget={
                          typeof document !== 'undefined' ? document.body : undefined
                        }
                        menuPosition="fixed"
                        menuPlacement="top"
                        instanceId="manage-add-member"
                        noOptionsMessage={() => 'All workspace members are already in this team'}
                      />
                    </div>
                    <div className="w-[138px] shrink-0">
                      <Select
                        options={ROLE_OPTIONS}
                        value={addMemberRole}
                        onChange={opt => opt && setAddMemberRole(opt as SelectOption)}
                        styles={addSelectStyles}
                        isSearchable={false}
                        menuPortalTarget={
                          typeof document !== 'undefined' ? document.body : undefined
                        }
                        menuPosition="fixed"
                        menuPlacement="top"
                        instanceId="manage-add-role"
                      />
                    </div>
                    <motion.button
                      type="button"
                      onClick={handleAddMember}
                      disabled={!addMemberSel}
                      className={`h-9 px-4 rounded-lg text-sm font-medium shrink-0 transition-colors ${
                        addMemberSel
                          ? 'bg-accent text-white hover:bg-accent-hover'
                          : 'bg-bg-600 text-text-300 cursor-not-allowed'
                      }`}
                      whileHover={addMemberSel ? { scale: 1.02 } : {}}
                      whileTap={addMemberSel ? { scale: 0.98 } : {}}
                    >
                      Add
                    </motion.button>
                  </div>
                </div>

                {/* Danger zone */}
                <div className="pt-2 border-t border-border-subtle">
                  <p className="text-2xs text-text-300 uppercase tracking-wide mb-2">
                    Danger zone
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteTeam}
                    className="flex items-center gap-1.5 text-xs text-status-red hover:bg-red-bg px-3 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 size={13} />
                    Delete Team
                  </button>
                  <p className="text-xs text-text-300 mt-1 pl-1">
                    This cannot be undone. Tasks remain but become unassigned.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* ── Footer ── */}
          <div className="px-6 pb-5 pt-4 border-t border-border-subtle flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors"
            >
              Cancel
            </button>

            {mode === 'create' ? (
              <motion.button
                type="submit"
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
                whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Plus size={13} />
                Create Team
              </motion.button>
            ) : (
              <motion.button
                type="submit"
                disabled={!canSave}
                className={`h-9 px-4 rounded-lg text-sm font-medium transition-colors ${
                  canSave
                    ? 'bg-accent text-white hover:bg-accent-hover'
                    : 'bg-accent/40 text-white/50 cursor-not-allowed'
                }`}
                whileHover={canSave ? { scale: 1.02 } : {}}
                whileTap={canSave ? { scale: 0.98 } : {}}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                Save Changes
              </motion.button>
            )}
          </div>
        </form>
      </motion.div>
    </div>
  );
}
