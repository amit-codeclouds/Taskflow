'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import { useMyTasks, TASKS_PAGE_LIMIT } from '@/lib/hooks/useTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { useBoardStatuses, useBoardStatusesMap } from '@/lib/hooks/useBoardStatuses';
import { TaskListSkeleton, TaskRowsSkeleton } from '@/app/_skeleton';
import { TaskRow } from './TaskRow';
import type { ApiTask } from '@/lib/types/tasks.types';

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>;
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
            whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--overlay-accent-hover)' }}
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
      {isFetching ? (
        <TaskRowsSkeleton />
      ) : (
        <div className="bg-bg-700 rounded-card border border-border-subtle overflow-visible">
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
      )}

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
