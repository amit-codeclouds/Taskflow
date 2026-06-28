'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, UserCheck, Clock, Users, Trash2, RefreshCw } from 'lucide-react';
import { usePeopleList, usePeopleStats, useRemovePerson } from '@/lib/hooks/usePeople';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { PeopleSkeleton } from '@/app/(shell)/people/_skeleton';
import InviteModal from '@/components/Modals/InviteModal';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import Select from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import type { Person } from '@/lib/types/people.types';
import type { ApiTeam } from '@/lib/types/teams.types';
import { getInitials } from '@/lib/initials';

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'all',     label: 'All status' },
  { value: 'active',  label: 'Active'     },
  { value: 'pending', label: 'Pending'    },
];

const filterStyles = getSelectStyles({ size: 'sm' });

// ─── MemberRow ────────────────────────────────────────────────────────────────

function MemberRow({
  member,
  index,
  allTeams,
  onRemove,
  onResend,
}: {
  member: Person;
  index: number;
  allTeams: ApiTeam[];
  onRemove: (id: string) => void;
  onResend: (id: string) => void;
}) {
  const teams     = allTeams.filter(t => member.teamIds.includes(t.id));
  const isPending = member.status === 'pending';
  const initials = member.avatarInitials || getInitials(member.name);

  return (
    <motion.div
      className="flex items-center gap-4 px-5 py-3.5 border-b border-border-subtle last:border-0 hover:bg-bg-600 transition-colors group"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      layout
    >
      {/* Avatar */}
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
          isPending
            ? 'bg-bg-600 text-text-300 border border-dashed border-bg-500'
            : 'bg-accent-bg text-accent'
        }`}
      >
        {initials}
      </div>

      {/* Name + email */}
      <div className="w-44 shrink-0">
        <p className={`text-sm font-medium ${isPending ? 'text-text-300' : 'text-text-100'}`}>
          {member.name}
        </p>
        <p className="text-xs text-text-300 truncate">{member.email}</p>
      </div>

      {/* Title */}
      <div className="w-32 shrink-0 hidden lg:block">
        <p className="text-xs text-text-300">{member.title || '—'}</p>
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-wrap gap-1.5">
        {teams.length === 0 ? (
          <span className="text-xs text-text-300">—</span>
        ) : (
          teams.map(t => (
            <span
              key={t.id}
              className="text-2xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: t.color + '22', color: t.color }}
            >
              {t.name}
            </span>
          ))
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        {isPending ? (
          <span className="flex items-center gap-1 text-2xs font-medium text-status-amber bg-amber-bg px-2 py-0.5 rounded-full">
            <Clock size={10} />Pending
          </span>
        ) : (
          <span className="flex items-center gap-1 text-2xs font-medium text-status-green bg-green-bg px-2 py-0.5 rounded-full">
            <UserCheck size={10} />Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {isPending && (
          <button
            onClick={() => onResend(member.id)}
            className="flex items-center gap-1 text-xs text-text-300 hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-accent-bg"
          >
            <RefreshCw size={11} strokeWidth={1.8} />
            Resend
          </button>
        )}
        <button
          onClick={() => onRemove(member.id)}
          className="flex items-center gap-1 text-xs text-text-300 hover:text-status-red transition-colors px-2 py-1 rounded-md hover:bg-red-bg"
        >
          <Trash2 size={11} strokeWidth={1.8} />
          Remove
        </button>
      </div>
    </motion.div>
  );
}

// ─── PeopleScreen ─────────────────────────────────────────────────────────────

export default function PeopleScreen() {
  const { data: people = [], isPending } = usePeopleList();
  const { data: statsData }              = usePeopleStats();
  const { data: allTeams = [] }          = useTeamsList();
  const removeMutation                   = useRemovePerson();
  const confirm                          = useConfirm();

  const [showInvite, setShowInvite]     = useState(false);
  const [search, setSearch]             = useState('');
  const [teamFilter, setTeamFilter]     = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const teamOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'All teams' },
      ...allTeams.map(t => ({ value: t.id, label: t.name })),
    ],
    [allTeams],
  );

  const stats = [
    { label: 'Total Members',   value: statsData?.totalMembers   ?? people.length,                                     color: 'text-text-100'     },
    { label: 'Active',          value: statsData?.active         ?? people.filter(m => m.status === 'active').length,  color: 'text-status-green' },
    { label: 'Pending Invites', value: statsData?.pendingInvites ?? people.filter(m => m.status === 'pending').length, color: 'text-status-amber' },
    { label: 'Teams',           value: statsData?.totalTeams     ?? allTeams.length,                                   color: 'text-accent-hover' },
  ];

  const filtered = people.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchTeam   = teamFilter === 'all' || m.teamIds.includes(teamFilter);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchTeam && matchStatus;
  });

  async function handleRemove(id: string) {
    const member    = people.find(m => m.id === id);
    if (!member) return;

    const isPending = member.status === 'pending';
    const confirmed = await confirm({
      title:        isPending ? 'Cancel invitation?' : 'Remove member?',
      description:  isPending
        ? `Cancel the pending invite for ${member.email}? They won't be able to join this workspace.`
        : `Remove ${member.name} from this workspace? They'll lose access immediately.`,
      confirmLabel: isPending ? 'Cancel invite' : 'Remove',
      danger:       true,
    });

    if (confirmed) removeMutation.mutate(id);
  }

  function handleResend(id: string) {
    // stub — no resend endpoint yet
    console.log('Resend invite for', id);
  }

  if (isPending) return <PeopleSkeleton />;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">People</h1>
          <p className="text-sm text-text-300 mt-1">Manage everyone who has access to this workspace.</p>
        </div>
        <motion.button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.97 }}
        >
          <UserPlus size={14} strokeWidth={1.8} />
          Invite to workspace
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {stats.map(s => (
          <div key={s.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-8 pr-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <div className="w-44">
          <Select<SelectOption, false>
            options={teamOptions}
            value={teamOptions.find(o => o.value === teamFilter) ?? teamOptions[0]}
            onChange={opt => setTeamFilter(opt?.value ?? 'all')}
            styles={filterStyles}
            isSearchable={false}
            instanceId="team-filter"
          />
        </div>
        <div className="w-36">
          <Select<SelectOption, false>
            options={STATUS_OPTIONS}
            value={STATUS_OPTIONS.find(o => o.value === statusFilter) ?? STATUS_OPTIONS[0]}
            onChange={opt => setStatusFilter(opt?.value ?? 'all')}
            styles={filterStyles}
            isSearchable={false}
            instanceId="status-filter"
          />
        </div>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-4 px-5 py-2.5 text-2xs text-text-300 uppercase tracking-widest border-b border-border-subtle">
        <div className="w-9 shrink-0" />
        <div className="w-44 shrink-0">Member</div>
        <div className="w-32 shrink-0 hidden lg:block">Title</div>
        <div className="flex-1">Teams</div>
        <div className="shrink-0 w-20">Status</div>
        <div className="shrink-0 w-28" />
      </div>

      {/* Member rows */}
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
        <AnimatePresence initial={false}>
          {filtered.map((m, i) => (
            <MemberRow
              key={m.id}
              member={m}
              index={i}
              allTeams={allTeams}
              onRemove={handleRemove}
              onResend={handleResend}
            />
          ))}
        </AnimatePresence>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={24} className="text-text-300 mb-2" strokeWidth={1.3} />
            <p className="text-sm text-text-300">No members match your filters.</p>
          </div>
        )}
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {showInvite && (
          <InviteModal
            key="invite-modal"
            onClose={() => setShowInvite(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
