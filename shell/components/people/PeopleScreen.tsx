'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, UserCheck, Clock, Users, Trash2, RefreshCw, Loader2, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import { usePeopleList, usePeopleStats, useInvitePerson, useRemovePerson, PEOPLE_PAGE_LIMIT } from '@/lib/hooks/usePeople';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { PeopleSkeleton, PeopleRowsSkeleton } from '@/app/(shell)/people/_skeleton';
import InviteModal from '@/components/Modals/InviteModal';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import Select from 'react-select';
import { getSelectStyles, type SelectOption } from '@/lib/selectStyles';
import type { Person } from '@/lib/types/people.types';
import type { ApiTeam } from '@/lib/types/teams.types';
import { getInitials } from '@/lib/initials';


const filterStyles = getSelectStyles({ size: 'sm' });

// ─── MemberRow ────────────────────────────────────────────────────────────────

function RowActionsMenu({
  isPending,
  onRemove,
  onResend,
}: {
  isPending: boolean;
  onRemove: () => void;
  onResend: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  // Rendered via a portal (see below), so it can't be clipped by the member
  // list's `overflow-hidden` card — position is computed from the trigger's
  // viewport rect instead of relying on CSS containment.
  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onDismiss() { setOpen(false); }
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onDismiss, true);
    window.addEventListener('resize', onDismiss);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onDismiss, true);
      window.removeEventListener('resize', onDismiss);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => (open ? setOpen(false) : openMenu())}
        title="More actions"
        className={`w-8 h-8 flex items-center justify-center rounded-lg text-text-300 hover:text-text-100 hover:bg-bg-500 transition-colors ${open ? 'bg-bg-500 text-text-100' : ''}`}
      >
        <MoreVertical size={15} strokeWidth={1.8} />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div
              ref={panelRef}
              className="fixed w-44 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated z-50 overflow-hidden py-1"
              style={{ top: coords.top, right: coords.right }}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              {isPending && (
                <button
                  onClick={() => { setOpen(false); onResend(); }}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                >
                  <RefreshCw size={13} strokeWidth={1.8} />
                  Resend invite
                </button>
              )}
              <button
                onClick={() => { setOpen(false); onRemove(); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-status-red hover:bg-red-bg transition-colors"
              >
                <Trash2 size={13} strokeWidth={1.8} />
                {isPending ? 'Cancel invite' : 'Remove'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}

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
      className="flex items-center gap-4 px-5 py-3.5 border-b border-border-subtle last:border-0 hover:bg-bg-600 transition-colors"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      layout
    >
      {/* Avatar */}
      {member.avatarUrl ? (
        <Image
          src={member.avatarUrl}
          alt={member.name}
          width={36}
          height={36}
          className="w-9 h-9 rounded-full object-cover shrink-0"
        />
      ) : (
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
            isPending
              ? 'bg-bg-600 text-text-300 border border-dashed border-bg-500'
              : 'bg-accent-bg text-accent'
          }`}
        >
          {initials}
        </div>
      )}

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
      <div className="w-24 shrink-0">
        {isPending ? (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-status-amber bg-amber-bg px-2 py-0.5 rounded-full whitespace-nowrap">
            <Clock size={10} />Pending
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-2xs font-medium text-status-green bg-green-bg px-2 py-0.5 rounded-full whitespace-nowrap">
            <UserCheck size={10} />Active
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="w-9 shrink-0 flex items-center justify-end">
        <RowActionsMenu
          isPending={isPending}
          onRemove={() => onRemove(member.id)}
          onResend={() => onResend(member.id)}
        />
      </div>
    </motion.div>
  );
}

// ─── PeopleScreen ─────────────────────────────────────────────────────────────

export default function PeopleScreen() {
  const [showInvite, setShowInvite]           = useState(false);
  const [search, setSearch]                   = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [teamFilter, setTeamFilter]           = useState('all');
  const [page, setPage]                       = useState(1);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [debouncedSearch, teamFilter]);

  const { data: pageResult, isPending, isFetching, refetch } = usePeopleList({
    search: debouncedSearch || undefined,
    teamId: teamFilter !== 'all' ? teamFilter : undefined,
    page,
  });

  const people     = pageResult?.data  ?? [];
  const total      = pageResult?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PEOPLE_PAGE_LIMIT));

  const { data: statsData }     = usePeopleStats();
  const { data: allTeams = [] } = useTeamsList();
  const removeMutation          = useRemovePerson();
  const inviteMutation          = useInvitePerson();
  const confirm                 = useConfirm();

  const teamOptions: SelectOption[] = useMemo(
    () => [
      { value: 'all', label: 'All teams' },
      ...allTeams.map(t => ({ value: t.id, label: t.name })),
    ],
    [allTeams],
  );

  const stats = [
    { label: 'Total Members',   value: statsData?.totalMembers   ?? total,          color: 'text-text-100'     },
    { label: 'Active',          value: statsData?.active         ?? 0,              color: 'text-status-green' },
    { label: 'Pending Invites', value: statsData?.pendingInvites ?? 0,              color: 'text-status-amber' },
    { label: 'Teams',           value: statsData?.totalTeams     ?? allTeams.length, color: 'text-accent-hover' },
  ];

  function buildPageNumbers(): (number | '…')[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
    if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, '…', page - 1, page, page + 1, '…', totalPages];
  }

  async function handleRemove(id: string) {
    const member = people.find(m => m.id === id);
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

  async function handleResend(id: string) {
    const member = people.find(m => m.id === id);
    if (!member) return;

    const confirmed = await confirm({
      title:        'Resend invitation?',
      description:  `Do you want to resend the invitation to ${member.email}?`,
      confirmLabel: 'Resend',
    });

    if (!confirmed) return;
    // Re-inviting the same email resets the pending invite's expiry (200) —
    // there's no separate resend endpoint on the backend.
    inviteMutation.mutate({ email: member.email });
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
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--overlay-accent-hover)' }}
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
        {/* Refresh */}
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          title="Refresh"
          className="w-9 h-9 shrink-0 flex items-center justify-center rounded-lg bg-bg-700 border border-border-subtle text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors disabled:opacity-50"
        >
          {isFetching && !isPending
            ? <Loader2 size={14} className="animate-spin" />
            : <RefreshCw size={14} />
          }
        </button>

        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-8 pr-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Team filter */}
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
      </div>

      {/* Fetch progress bar */}
      <div className="h-0.5 rounded-full overflow-hidden mb-3 bg-transparent">
        {isFetching && !isPending && (
          <div className="h-full w-full bg-accent/20 relative overflow-hidden rounded-full">
            <div
              className="absolute inset-y-0 left-0 w-1/4 bg-accent rounded-full"
              style={{ animation: 'slide-progress 1.1s ease-in-out infinite' }}
            />
          </div>
        )}
      </div>

      {/* Table header */}
      <div className="flex items-center gap-4 px-5 py-2.5 text-2xs text-text-300 uppercase tracking-widest border-b border-border-subtle">
        <div className="w-9 shrink-0" />
        <div className="w-44 shrink-0">Member</div>
        <div className="w-32 shrink-0 hidden lg:block">Title</div>
        <div className="flex-1">Teams</div>
        <div className="shrink-0 w-24">Status</div>
        <div className="shrink-0 w-9" />
      </div>

      {/* Member rows */}
      {isFetching ? (
        <PeopleRowsSkeleton />
      ) : (
        <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
          <AnimatePresence initial={false}>
            {people.map((m, i) => (
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
          {people.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <Users size={24} className="text-text-300 mb-2" strokeWidth={1.3} />
              <p className="text-sm text-text-300">No members match your filters.</p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <p className="text-xs text-text-300">
            {total === 0 ? '0 members' : (
              <>
                Showing{' '}
                <span className="text-text-200 font-medium">
                  {(page - 1) * PEOPLE_PAGE_LIMIT + 1}–{Math.min(page * PEOPLE_PAGE_LIMIT, total)}
                </span>
                {' '}of{' '}
                <span className="text-text-200 font-medium">{total}</span>
                {' '}members
              </>
            )}
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1 || isFetching}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-300 hover:text-text-100 hover:bg-bg-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={15} />
            </button>

            {buildPageNumbers().map((p, i) =>
              p === '…' ? (
                <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-text-300">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  disabled={isFetching}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors disabled:cursor-not-allowed ${
                    p === page
                      ? 'bg-accent text-white'
                      : 'text-text-300 hover:text-text-100 hover:bg-bg-700'
                  }`}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isFetching}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-text-300 hover:text-text-100 hover:bg-bg-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}

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
