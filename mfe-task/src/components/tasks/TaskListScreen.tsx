'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { LABEL_STYLES, PRIORITY_COLORS } from '@/lib/taskData';
import { useMyTasks, useDeleteTask, TASKS_PAGE_LIMIT } from '@/lib/hooks/useTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { useBoardStatuses, useBoardStatusesMap } from '@/lib/hooks/useBoardStatuses';
import { TaskListSkeleton } from '@/app/_skeleton';
import type { ApiTask, AssigneeSummary } from '@/lib/types/tasks.types';

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>;
}
function CalendarIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>;
}
function RedirectIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M5 2H2a1 1 0 00-1 1v7a1 1 0 001 1h7a1 1 0 001-1V7" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M8 2h2v2M10 2L6.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path d="M8.5 1.5a1.414 1.414 0 012 2L3.5 10.5l-3 .5.5-3 7.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}
function RefreshIcon({ spinning }: { spinning?: boolean }) {
  return (
    <svg
      width="14" height="14" viewBox="0 0 14 14" fill="none"
      className={spinning ? 'animate-spin' : ''}
    >
      <path d="M12.5 7a5.5 5.5 0 11-1.7-3.98" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M12.5 2.3v3.2h-3.2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <path
        d="M2 3.5h8M4.5 3.5V2.5a1 1 0 011-1h1a1 1 0 011 1v1M3 3.5l.5 6.5a1 1 0 001 1h3a1 1 0 001-1l.5-6.5"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function initialsFor(a: AssigneeSummary): string {
  if (a.avatarInitials) return a.avatarInitials;
  const parts = (a.name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (a.name ?? '?').slice(0, 2).toUpperCase();
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Highlights urgency: overdue -> red, due today/tomorrow -> amber, otherwise neutral.
function deadlineChipClass(dateStr: string): string {
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((due.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return 'bg-red-bg text-status-red';
  if (diffDays <= 1) return 'bg-amber-bg text-status-amber';
  return 'bg-bg-600 text-text-300';
}

function AssigneeStack({ assignees, size = 'md' }: { assignees: AssigneeSummary[]; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-2xs';
  const visible = assignees.slice(0, 2);
  const overflow = assignees.length - visible.length;
  if (assignees.length === 0) {
    return <span className="text-text-300 italic">Unassigned</span>;
  }
  return (
    <div className="flex items-center -space-x-1.5 shrink-0">
      {visible.map((a) => (
        <div
          key={a.userId}
          data-tooltip={a.name ?? 'Assignee'}
          className={`${dim} rounded-full bg-accent-bg border-2 border-bg-700 flex items-center justify-center text-accent font-semibold`}
        >
          {initialsFor(a)}
        </div>
      ))}
      {overflow > 0 && (
        <div className={`${dim} rounded-full bg-bg-600 border-2 border-bg-700 flex items-center justify-center text-text-300 font-medium`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

export default function TaskListScreen() {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [teamFilter, setTeamFilter] = useState<SelectOption>({ value: 'all', label: 'All Teams' });
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => { setPage(1); }, [debouncedSearch, teamFilter.value]);
  useEffect(() => { setStatusFilter('all'); }, [teamFilter.value]);

  const { data: teams = [] } = useTeamsList();
  const teamOptions: SelectOption[] = [
    { value: 'all', label: 'All Teams' },
    ...teams.map((t) => ({ value: t.id, label: t.name, color: t.color })),
  ];

  const isTeamScoped = teamFilter.value !== 'all';

  const { data: paged, isPending, isFetching, refetch } = useMyTasks({
    search: debouncedSearch || undefined,
    teamId: isTeamScoped ? teamFilter.value : undefined,
    page,
    limit: TASKS_PAGE_LIMIT,
  });

  function handleResetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setTeamFilter({ value: 'all', label: 'All Teams' });
    setStatusFilter('all');
    setPage(1);
    refetch();
  }

  const tasks = paged?.data ?? [];

  // Dynamic status tabs — only meaningful once a single team's status catalog is known.
  const { data: teamStatuses = [] } = useBoardStatuses(isTeamScoped ? teamFilter.value : '');
  const uniqueTeamIds = Array.from(new Set(tasks.map((t) => t.teamId)));
  const { map: statusNameMap } = useBoardStatusesMap(isTeamScoped ? [] : uniqueTeamIds);

  function statusNameFor(task: ApiTask): string {
    if (isTeamScoped) return teamStatuses.find((s) => s.statusId === task.statusId)?.statusName ?? '—';
    return statusNameMap.get(task.statusId) ?? '—';
  }

  const filteredTasks = isTeamScoped && statusFilter !== 'all'
    ? tasks.filter((t) => t.statusId === statusFilter)
    : tasks;

  const totalPages = paged?.totalPages ?? 1;
  const newTaskHref = isTeamScoped ? `/new?teamId=${teamFilter.value}` : '/new';

  if (isPending) return <TaskListSkeleton />;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">My Tasks</h1>
          <p className="text-sm text-text-300 mt-1">
            {paged?.total ?? 0} task{(paged?.total ?? 0) !== 1 ? 's' : ''} across all teams
          </p>
        </div>
        <Link href={newTaskHref}>
          <motion.button
            className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
            whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <PlusIcon />New Task
          </motion.button>
        </Link>
      </motion.div>

      {/* Search + team filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-bg-700 border border-border-subtle text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <button
          type="button"
          onClick={handleResetFilters}
          data-tooltip="Refresh & reset filters"
          className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-bg-700 border border-border-subtle text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
        >
          <RefreshIcon spinning={isFetching} />
        </button>
        <div className="w-[200px] shrink-0">
          <AppSelect
            instanceId="team-filter"
            options={teamOptions}
            value={teamFilter}
            onChange={(opt) => opt && setTeamFilter(opt as SelectOption)}
            isSearchable={false}
          />
        </div>
      </div>

      {/* Dynamic status tabs — only when a single team is selected */}
      {isTeamScoped && teamStatuses.length > 0 && (
        <motion.div className="flex items-center gap-1 bg-bg-800 rounded-lg p-1 w-fit mb-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        >
          <button
            onClick={() => setStatusFilter('all')}
            className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
              statusFilter === 'all' ? 'text-text-100' : 'text-text-300 hover:text-text-200'
            }`}
          >
            {statusFilter === 'all' && (
              <motion.span layoutId="filterBg" className="absolute inset-0 bg-bg-600 rounded-md" />
            )}
            <span className="relative z-10">All</span>
          </button>
          {teamStatuses.map((s) => (
            <button key={s.statusId} onClick={() => setStatusFilter(s.statusId)}
              className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
                statusFilter === s.statusId ? 'text-text-100' : 'text-text-300 hover:text-text-200'
              }`}
            >
              {statusFilter === s.statusId && (
                <motion.span layoutId="filterBg" className="absolute inset-0 bg-bg-600 rounded-md" />
              )}
              <span className="relative z-10">{s.statusName}</span>
            </button>
          ))}
        </motion.div>
      )}

      {/* Task list */}
      <div className={`bg-bg-700 rounded-card border border-border-subtle overflow-visible transition-opacity ${isFetching ? 'opacity-60' : ''}`}>
        <AnimatePresence mode="popLayout">
          {filteredTasks.map((task, i) => (
            <TaskRow
              key={task.id}
              task={task}
              index={i}
              isLast={i === filteredTasks.length - 1}
              statusName={statusNameFor(task)}
            />
          ))}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-300 text-sm">No tasks match your filters.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {(paged?.total ?? 0) > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xs text-text-300">
            Showing {(((paged?.page ?? 1) - 1) * TASKS_PAGE_LIMIT) + 1}
            –{Math.min((paged?.page ?? 1) * TASKS_PAGE_LIMIT, paged?.total ?? 0)}
            {' '}of {paged?.total ?? 0} · Page {paged?.page ?? 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={(paged?.page ?? 1) <= 1 || isFetching}
              className="h-8 px-3 rounded-lg text-xs text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={(paged?.page ?? 1) >= totalPages || isFetching}
              className="h-8 px-3 rounded-lg text-xs text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, index, isLast, statusName }: { task: ApiTask; index: number; isLast: boolean; statusName: string }) {
  const confirm = useConfirm();
  const deleteTask = useDeleteTask();

  async function handleRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const ok = await confirm({
      title: 'Delete this task?',
      description: `Permanently delete "${task.title}". This action cannot be undone.`,
      confirmLabel: 'Delete Task',
      danger: true,
    });
    if (!ok) return;
    await deleteTask.mutateAsync(task.id);
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      className={`flex items-start gap-4 px-5 py-4 hover:bg-bg-600 transition-colors group ${
        !isLast ? 'border-b border-border-subtle' : 'rounded-b-xl'
      } ${index === 0 ? 'rounded-t-xl' : ''}`}
    >
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${PRIORITY_COLORS[task.priority]}`} />

      {/* Content — two lines */}
      <Link href={`/${task.id}`} className="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer">
        {/* Line 1 — title + highlighted chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm text-text-100 truncate">{task.title}</span>
          {task.label && (
            <span className={`text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
              {task.label}
            </span>
          )}
          <span className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 bg-accent-bg text-accent-hover">
            {statusName}
          </span>
          {task.expectedCompletion && (
            <span className={`text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${deadlineChipClass(task.expectedCompletion)}`}>
              <CalendarIcon />
              {formatShortDate(task.expectedCompletion)}
            </span>
          )}
        </div>

        {/* Line 2 — assignees + created / updated */}
        <div className="flex items-center gap-3 text-2xs text-text-300">
          <AssigneeStack assignees={task.assignees} size="md" />
          <span>Created {formatShortDate(task.createdAt)}</span>
          <span className="text-border-subtle">·</span>
          <span>Updated {formatShortDate(task.updatedAt)}</span>
        </div>
      </Link>

      {/* Right side — Edit / View / Remove */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        <Link
          href={`/${task.id}/edit`}
          data-tooltip="Edit task"
          onClick={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors"
        >
          <EditIcon />
        </Link>
        <Link
          href={`/${task.id}`}
          data-tooltip="View task"
          onClick={(e) => e.stopPropagation()}
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors"
        >
          <RedirectIcon />
        </Link>
        <button
          type="button"
          onClick={handleRemove}
          disabled={deleteTask.isPending}
          data-tooltip="Remove task"
          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-status-red hover:bg-red-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <TrashIcon />
        </button>
      </div>
    </motion.div>
  );
}
