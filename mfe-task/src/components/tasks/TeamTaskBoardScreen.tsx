'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import { useTeamBoard } from '@/lib/hooks/useBoard';
import { useArchivedTasks, ARCHIVED_TASKS_PAGE_LIMIT } from '@/lib/hooks/useArchivedTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { TaskListSkeleton, ArchivedTasksSkeleton } from '@/app/_skeleton';
import { TaskRow } from './TaskRow';
import type { ApiTask, AssigneeSummary, Priority, LabelType } from '@/lib/types/tasks.types';
import type { ApiArchivedTask } from '@/lib/types/archivedTasks.types';

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M6 5.3v3.1M6 3.6v.01" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// Archived tasks come back with `assigneeDetails` (id, not userId) instead of
// `assignees` — adapt into the same ApiTask shape so TaskRow can render both
// live and archived rows without a second component.
function adaptArchivedTask(task: ApiArchivedTask): ApiTask {
  const assignees: AssigneeSummary[] = (task.assigneeDetails ?? []).map((a) => ({
    userId: a.id,
    name: a.name,
    avatarInitials: a.avatarInitials,
    avatarUrl: a.avatarUrl,
  }));
  return {
    id: task.id,
    taskNumber: task.taskNumber,
    title: task.title,
    description: task.description ?? undefined,
    priority: (task.priority as Priority) ?? 'Medium',
    label: (task.label as LabelType) ?? undefined,
    statusId: task.statusId ?? '',
    teamId: task.teamId ?? '',
    assignees,
    expectedCompletion: task.expectedCompletion ?? undefined,
    progress: task.progress ?? 0,
    createdBy: task.createdBy ?? '',
    createdAt: task.createdAt ?? '',
    updatedAt: task.updatedAt ?? task.createdAt ?? '',
  };
}

const ARCHIVED_TAB = '__archived__';

export default function TeamTaskBoardScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamid') ?? '';

  // "Teams on which the user is actually assigned" — same filter as Shell's
  // Assigned Teams screen, since that's the only entry point into this page.
  const { data: teams = [] } = useTeamsList({ excludeWorkspace: true });
  const team = teams.find((t) => t.id === teamId);
  const teamOptions: SelectOption[] = teams.map((t) => ({ value: t.id, label: t.name, color: t.color }));

  const { data: board, isPending, isFetching: boardFetching } = useTeamBoard(teamId);
  const columns = board?.columns ?? [];

  const [activeTab, setActiveTab] = useState('');
  const [archivedPage, setArchivedPage] = useState(1);
  const [archivedSearch, setArchivedSearch] = useState('');

  // Reset local tab/page/search state whenever the viewed team changes —
  // router.replace() below doesn't remount this component.
  useEffect(() => {
    setActiveTab('');
    setArchivedPage(1);
    setArchivedSearch('');
  }, [teamId]);

  const currentTab = activeTab || columns[0]?.id || '';
  const isArchivedTab = currentTab === ARCHIVED_TAB;
  const activeColumn = columns.find((c) => c.id === currentTab);

  const { data: archivedPaged, isPending: archivedPending, isFetching: archivedFetching } = useArchivedTasks(
    { teamId, page: archivedPage, search: archivedSearch || undefined },
    { enabled: isArchivedTab },
  );

  function selectTab(tabId: string) {
    setActiveTab(tabId);
    setArchivedPage(1);
  }

  function handleTeamChange(option: SelectOption | null) {
    if (!option) return;
    router.replace(`/listview?teamid=${option.value}`);
  }

  if (isPending) return <TaskListSkeleton />;

  const archivedTasks = (archivedPaged?.data ?? []).map(adaptArchivedTask);
  const archivedTotalPages = archivedPaged?.totalPages ?? 1;
  const isBusy = isArchivedTab ? archivedFetching : boardFetching;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between gap-4 mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">{team?.name ?? 'Team'} Tasks</h1>
          <p className="text-sm text-text-300 mt-1">
            Tasks grouped by status for this team.
          </p>
        </div>
        <div className="w-[220px] shrink-0">
          <AppSelect
            instanceId="assigned-team-filter"
            options={teamOptions}
            value={teamOptions.find((o) => o.value === teamId) ?? null}
            onChange={(opt) => handleTeamChange(opt as SelectOption | null)}
            isSearchable={false}
            placeholder="Switch team…"
          />
        </div>
      </motion.div>

      {/* Status tabs + Archived */}
      <motion.div
        className="flex items-center gap-1 bg-bg-800 rounded-lg p-1 w-fit mb-4 flex-wrap"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      >
        {columns.map((col) => (
          <button
            key={col.id}
            onClick={() => selectTab(col.id)}
            className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
              currentTab === col.id ? 'text-text-100' : 'text-text-300 hover:text-text-200'
            }`}
          >
            {currentTab === col.id && (
              <motion.span layoutId="teamBoardTabBg" className="absolute inset-0 bg-bg-600 rounded-md" />
            )}
            <span className="relative z-10">{col.name} · {col.totalTasks}</span>
          </button>
        ))}
        <button
          onClick={() => selectTab(ARCHIVED_TAB)}
          data-tooltip="Tasks whose status was archived or removed from the board — kept here for reference"
          className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-colors ${
            isArchivedTab ? 'text-text-100' : 'text-text-300 hover:text-text-200'
          }`}
        >
          {isArchivedTab && (
            <motion.span layoutId="teamBoardTabBg" className="absolute inset-0 bg-bg-600 rounded-md" />
          )}
          <span className="relative z-10">Archived</span>
          <span className="relative z-10 text-text-300"><InfoIcon /></span>
        </button>
      </motion.div>

      {/* Archived search */}
      {isArchivedTab && (
        <div className="relative mb-4 max-w-xs">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300">
            <SearchIcon />
          </span>
          <input
            type="text"
            value={archivedSearch}
            onChange={(e) => { setArchivedSearch(e.target.value); setArchivedPage(1); }}
            placeholder="Search archived tasks…"
            className="w-full h-10 pl-9 pr-3 rounded-lg bg-bg-700 border border-border-subtle text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      )}

      {/* Task list */}
      {isArchivedTab && archivedPending ? (
        <ArchivedTasksSkeleton />
      ) : (
        <div className={`bg-bg-700 rounded-card border border-border-subtle overflow-visible transition-opacity ${isBusy ? 'opacity-60' : ''}`}>
          <AnimatePresence mode="popLayout">
            {isArchivedTab
              ? archivedTasks.map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    index={i}
                    isLast={i === archivedTasks.length - 1}
                    statusName="Archived"
                    readOnly
                  />
                ))
              : (activeColumn?.tasks ?? []).map((task, i) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    index={i}
                    isLast={i === (activeColumn?.tasks.length ?? 0) - 1}
                    statusName={activeColumn?.name ?? '—'}
                  />
                ))}
          </AnimatePresence>

          {!isArchivedTab && (activeColumn?.tasks.length ?? 0) === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-text-300 text-sm">No tasks in this status.</p>
            </div>
          )}

          {isArchivedTab && archivedTasks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-text-300 text-sm">No archived tasks yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Archived pagination */}
      {isArchivedTab && (archivedPaged?.total ?? 0) > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xs text-text-300">
            Showing {(((archivedPaged?.page ?? 1) - 1) * ARCHIVED_TASKS_PAGE_LIMIT) + 1}
            –{Math.min((archivedPaged?.page ?? 1) * ARCHIVED_TASKS_PAGE_LIMIT, archivedPaged?.total ?? 0)}
            {' '}of {archivedPaged?.total ?? 0} · Page {archivedPaged?.page ?? 1} of {archivedTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setArchivedPage((p) => Math.max(1, p - 1))}
              disabled={(archivedPaged?.page ?? 1) <= 1 || archivedFetching}
              className="h-8 px-3 rounded-lg text-xs text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setArchivedPage((p) => Math.min(archivedTotalPages, p + 1))}
              disabled={(archivedPaged?.page ?? 1) >= archivedTotalPages || archivedFetching}
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
