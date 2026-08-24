'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Check, Lock, Trash2, Save } from 'lucide-react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import Select from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { TEAM_COLORS } from '@/lib/teams';
import type { TeamRole } from '@/lib/teams';
import { useTeamDetail, useUpdateTeam, useDeleteTeam } from '@/lib/hooks/useTeams';
import { useUsersList } from '@/lib/hooks/useUsers';
import { useRolesList } from '@/lib/hooks/useRoles';
import { useAuth } from '@/lib/useAuth';
import type { ApiTeamMember } from '@/lib/types/teams.types';
import { TeamDetailSkeleton } from './_skeleton';
import { getInitials } from '@/lib/initials';
import RoleSelect, { roleHasPermission } from '@/components/teams/RoleSelect';

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

// ─── Member row ───────────────────────────────────────────────────────────────

const rowStyles = getSelectStyles({ size: 'sm' });

function MemberRow({
  member,
  roleName,
  isLastAdmin,
  onRoleChange,
  onRemove,
}: {
  member: ApiTeamMember;
  roleName: string;
  isLastAdmin: boolean;
  onRoleChange: (id: string, role: TeamRole) => void;
  onRemove: (id: string) => void;
}) {
  const initials = member.avatarInitials || getInitials(member.name);

  return (
    <motion.div
      layout
      className="flex items-center gap-3 py-2.5 group/row border-b border-border-subtle last:border-0"
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      {member.avatarUrl ? (
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={32}
          height={32}
          className="w-8 h-8 rounded-full object-cover shrink-0"
        />
      ) : (
        <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
          {initials}
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-text-100 truncate">{member.name}</p>
        <p className="text-xs text-text-300 truncate">{roleName}</p>
      </div>

      <div className="w-[160px] shrink-0">
        {isLastAdmin ? (
          <div className="h-9 flex items-center gap-1.5 px-3 bg-bg-600/60 border border-border-subtle rounded-lg cursor-not-allowed">
            <Lock size={11} className="text-text-300 shrink-0" />
            <span className="text-xs text-text-300 truncate">{roleName}</span>
          </div>
        ) : (
          <RoleSelect
            value={member.role}
            onChange={role => onRoleChange(member.userId, role)}
            styles={rowStyles}
            instanceId={`role-${member.userId}`}
          />
        )}
      </div>

      <div className="w-8 shrink-0 flex items-center justify-center">
        {!isLastAdmin && (
          <motion.button
            type="button"
            onClick={() => onRemove(member.userId)}
            className="w-8 h-8 flex items-center justify-center rounded-md text-text-300 hover:text-status-red hover:bg-red-bg opacity-0 group-hover/row:opacity-100 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
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
  name:        Yup.string().trim().required('Team name is required').max(60, 'Max 60 characters'),
  description: Yup.string().max(200, 'Max 200 characters'),
  color:       Yup.string().required(),
});

const addStyles = getSelectStyles({ size: 'sm' });

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TeamManagePage({ params }: { params: { id: string } }) {
  const router  = useRouter();
  const confirm = useConfirm();

  const auth                       = useAuth();
  const { data: team, isPending }  = useTeamDetail(params.id);
  const { data: allUsers = [] }    = useUsersList({ workspaceId: auth.workspaceId });
  const { data: roles = [] }       = useRolesList();
  const updateTeam                 = useUpdateTeam();
  const deleteTeam                 = useDeleteTeam();

  const [localMembers, setLocalMembers] = useState<ApiTeamMember[]>([]);
  const [addMemberSel,  setAddMemberSel]  = useState<SelectOption | null>(null);
  const [addMemberRole, setAddMemberRole] = useState<string>('');

  // Sync localMembers once team loads
  useMemo(() => {
    if (team && localMembers.length === 0) setLocalMembers(team.members);
  }, [team]); // eslint-disable-line

  // Default the "add member" role picker to the first available role once GET /roles resolves.
  useEffect(() => {
    if (!addMemberRole && roles.length) setAddMemberRole(roles[0].id);
  }, [roles]); // eslint-disable-line

  const roleById = useMemo(() => new Map(roles.map(r => [r.id, r] as const)), [roles]);
  const roleName = useCallback(
    (roleId: string) => roleById.get(roleId)?.name ?? roleId,
    [roleById],
  );
  // A member counts as an "admin" for last-admin protection if their role carries Manage permission
  // (GET /roles no longer has a fixed 'Admin' role name — any number of roles can be admin-tier).
  const isAdminTier = useCallback(
    (roleId: string) => roleHasPermission(roleById.get(roleId), 'Manage'),
    [roleById],
  );

  const adminCount = useMemo(
    () => localMembers.filter(m => isAdminTier(m.role)).length,
    [localMembers, isAdminTier],
  );

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name:        team?.name        ?? '',
      description: team?.description ?? '',
      color:       team?.color       ?? TEAM_COLORS[0],
    },
    validationSchema,
    onSubmit: async (values) => {
      if (!team) return;
      await updateTeam.mutateAsync({
        id:          team.id,
        name:        values.name.trim(),
        description: values.description.trim(),
        color:       values.color,
        members:     localMembers.map(m => ({ userId: m.userId, role: m.role })),
      });
      router.push('/teams');
    },
  });

  const handleRoleChange = useCallback((userId: string, role: TeamRole) => {
    setLocalMembers(prev => prev.map(m => (m.userId === userId ? { ...m, role } : m)));
  }, []);

  const handleRemove = useCallback(async (userId: string) => {
    const member = localMembers.find(m => m.userId === userId);
    if (!member) return;
    const ok = await confirm({
      title:        'Remove from team?',
      description:  `${member.name} will lose access to this team.`,
      confirmLabel: 'Remove',
      danger:       true,
    });
    if (ok) setLocalMembers(prev => prev.filter(m => m.userId !== userId));
  }, [confirm, localMembers]);

  const handleAddMember = useCallback(() => {
    if (!addMemberSel || !addMemberRole) return;
    const user = allUsers.find(u => u.id === addMemberSel.value);
    if (!user) return;
    const newMember: ApiTeamMember = {
      userId:         user.id,
      name:           user.name,
      role:           addMemberRole,
      avatarInitials: user.avatarInitials,
      avatarUrl:      user.avatarUrl,
    };
    setLocalMembers(prev => [...prev, newMember]);
    setAddMemberSel(null);
    setAddMemberRole(roles[0]?.id ?? '');
  }, [addMemberSel, addMemberRole, allUsers, roles]);

  const handleDeleteTeam = useCallback(async () => {
    if (!team) return;
    const ok = await confirm({
      title:        'Delete team?',
      description:  `Permanently delete "${team.name}"? Tasks remain but become unassigned.`,
      confirmLabel: 'Delete Team',
      danger:       true,
    });
    if (ok) {
      await deleteTeam.mutateAsync(team.id);
      router.push('/teams');
    }
  }, [confirm, team, deleteTeam, router]);

  const availableToAdd = useMemo(
    () => allUsers
      .filter(u => !localMembers.some(lm => lm.userId === u.id))
      .map(u => ({ value: u.id, label: u.name })),
    [allUsers, localMembers],
  );

  const nameError = !!formik.touched.name && !!formik.errors.name;

  if (isPending) return <TeamDetailSkeleton />;
  if (!team)     return null;

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <button
        onClick={() => router.push('/teams')}
        className="flex items-center gap-1.5 text-sm text-text-300 hover:text-text-100 transition-colors mb-6"
      >
        <ChevronLeft size={15} />
        Back to Teams
      </button>

      <div className="flex items-center gap-3 mb-1">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
          style={{ background: team.color + '33', color: team.color }}
        >
          {team.name.slice(0, 2).toUpperCase()}
        </div>
        <h1 className="text-2xl font-semibold text-text-100">Manage {team.name}</h1>
      </div>
      <p className="text-sm text-text-300 mb-8">Edit team details and manage membership.</p>

      <form onSubmit={formik.handleSubmit} noValidate className="flex flex-col gap-6">
        {/* Team Details */}
        <div className="bg-bg-700 border border-border-subtle rounded-card p-6 flex flex-col gap-5">
          <h2 className="text-xs font-semibold text-text-300 uppercase tracking-widest">Team Details</h2>

          <div>
            <label htmlFor="manage-name" className="text-xs font-medium text-text-200 block mb-1.5">
              Team name <span className="text-status-red">*</span>
            </label>
            <input
              id="manage-name"
              type="text"
              placeholder="e.g. Frontend Team"
              {...formik.getFieldProps('name')}
              className={`w-full h-10 px-3 bg-bg-600 border rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                nameError ? 'border-status-red' : 'border-border-subtle focus:border-accent'
              }`}
            />
            {nameError && <p className="text-xs text-status-red mt-1.5">{formik.errors.name}</p>}
          </div>

          <div>
            <label htmlFor="manage-desc" className="text-xs font-medium text-text-200 block mb-1.5">
              Description <span className="text-text-300 font-normal">(optional)</span>
            </label>
            <input
              id="manage-desc"
              type="text"
              placeholder="What does this team work on?"
              {...formik.getFieldProps('description')}
              className="w-full h-10 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-text-200 block mb-2">Team color</label>
            <ColorPicker value={formik.values.color} onChange={c => formik.setFieldValue('color', c)} />
          </div>
        </div>

        {/* Members */}
        <div className="bg-bg-700 border border-border-subtle rounded-card p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold text-text-300 uppercase tracking-widest">Members</h2>
            <span className="text-xs text-text-300">{localMembers.length} total</span>
          </div>

          <div className="flex items-center gap-3 pb-1 border-b border-border-subtle">
            <div className="w-8 shrink-0" />
            <p className="flex-1 text-2xs text-text-300 uppercase tracking-wide">Member</p>
            <p className="w-[160px] text-2xs text-text-300 uppercase tracking-wide shrink-0">Role</p>
            <div className="w-8 shrink-0" />
          </div>

          <AnimatePresence mode="popLayout">
            {localMembers.map(member => (
              <MemberRow
                key={member.userId}
                member={member}
                roleName={roleName(member.role)}
                isLastAdmin={adminCount === 1 && isAdminTier(member.role)}
                onRoleChange={handleRoleChange}
                onRemove={handleRemove}
              />
            ))}
          </AnimatePresence>

          {localMembers.length === 0 && (
            <p className="text-xs text-text-300 py-4 text-center">No members yet.</p>
          )}

          <div className="pt-2 border-t border-border-subtle">
            <p className="text-xs font-medium text-text-200 mb-2">Add from workspace</p>
            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <Select
                  placeholder="Select a member…"
                  options={availableToAdd}
                  value={addMemberSel}
                  onChange={v => setAddMemberSel(v as SelectOption | null)}
                  styles={addStyles}
                  isClearable
                  instanceId="manage-add-member"
                  noOptionsMessage={() => 'All workspace members already in team'}
                />
              </div>
              <div className="w-[160px] shrink-0">
                <RoleSelect
                  value={addMemberRole}
                  onChange={setAddMemberRole}
                  styles={addStyles}
                  instanceId="manage-add-role"
                />
              </div>
              <motion.button
                type="button"
                onClick={handleAddMember}
                disabled={!addMemberSel}
                className={`h-9 px-4 rounded-lg text-sm font-medium shrink-0 transition-colors ${
                  addMemberSel ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-bg-600 text-text-300 cursor-not-allowed'
                }`}
                whileHover={addMemberSel ? { scale: 1.02 } : {}}
                whileTap={addMemberSel ? { scale: 0.98 } : {}}
              >
                Add
              </motion.button>
            </div>
          </div>
        </div>

        {/* Danger zone */}
        <div className="bg-bg-700 border border-red-bg/60 rounded-card p-6">
          <h2 className="text-xs font-semibold text-text-300 uppercase tracking-widest mb-3">Danger Zone</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-text-100 font-medium">Delete this team</p>
              <p className="text-xs text-text-300 mt-0.5">This cannot be undone. Tasks remain but become unassigned.</p>
            </div>
            <motion.button
              type="button"
              onClick={handleDeleteTeam}
              className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium text-status-red border border-status-red/30 hover:bg-red-bg transition-colors shrink-0 ml-6"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <Trash2 size={13} />
              Delete Team
            </motion.button>
          </div>
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
            disabled={updateTeam.isPending}
            className="flex items-center gap-2 h-10 px-5 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover disabled:opacity-50 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <Save size={14} />
            {updateTeam.isPending ? 'Saving…' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
}
