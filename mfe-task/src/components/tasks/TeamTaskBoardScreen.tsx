'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Download } from 'lucide-react';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import { useTeamBoard } from '@/lib/hooks/useBoard';
import { useArchivedTasks, ARCHIVED_TASKS_PAGE_LIMIT } from '@/lib/hooks/useArchivedTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { TaskListSkeleton, TaskRowsSkeleton } from '@/app/_skeleton';
import { TaskRow } from './TaskRow';
import ExportTasksModal from './ExportTasksModal';
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

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>;
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

// The backend's `search` param on this endpoint does a case-sensitive match, so
// typing "test" misses a task titled "Test Task". Rather than rely on it, we
// fetch an unfiltered batch and do our own case-insensitive filtering client-side.
// Bounded to the first 100 archived tasks for the team — fine for a per-team list,
// but a team with more archived tasks than that could miss older matches.
const ARCHIVED_SEARCH_FETCH_LIMIT = 100;

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
  const [isExporting, setIsExporting] = useState(false);

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

  const isSearchingArchived = archivedSearch.trim().length > 0;

  // Stable query key while typing (no `search`/`page`) — the fetch happens once
  // per team, then every keystroke re-filters the same cached batch instantly.
  const { data: archivedPaged, isFetching: archivedFetching } = useArchivedTasks(
    isSearchingArchived
      ? { teamId, limit: ARCHIVED_SEARCH_FETCH_LIMIT }
      : { teamId, page: archivedPage, limit: ARCHIVED_TASKS_PAGE_LIMIT },
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

  const rawArchivedTasks = archivedPaged?.data ?? [];
  const filteredArchivedRaw = isSearchingArchived
    ? rawArchivedTasks.filter((t) => t.title.toLowerCase().includes(archivedSearch.trim().toLowerCase()))
    : rawArchivedTasks;

  const archivedTotal = isSearchingArchived ? filteredArchivedRaw.length : (archivedPaged?.total ?? 0);
  const archivedTotalPages = isSearchingArchived
    ? Math.max(1, Math.ceil(archivedTotal / ARCHIVED_TASKS_PAGE_LIMIT))
    : (archivedPaged?.totalPages ?? 1);

  const archivedPageSlice = isSearchingArchived
    ? filteredArchivedRaw.slice((archivedPage - 1) * ARCHIVED_TASKS_PAGE_LIMIT, archivedPage * ARCHIVED_TASKS_PAGE_LIMIT)
    : filteredArchivedRaw;

  const archivedTasks = archivedPageSlice.map(adaptArchivedTask);
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
        <div className="flex items-center gap-3 shrink-0">
          <motion.button
            onClick={() => setIsExporting(true)}
            className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg text-sm font-medium bg-bg-600 text-text-200 hover:bg-bg-500 hover:text-text-100 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Download size={14} />Export
          </motion.button>
          <Link href={`/new?teamId=${teamId}`}>
            <motion.button
              className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
              whileHover={{ scale: 1.02, boxShadow: '0 0 16px var(--overlay-accent-hover)' }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <PlusIcon />New Task
            </motion.button>
          </Link>
          <div className="w-[220px]">
            <AppSelect
              instanceId="assigned-team-filter"
              options={teamOptions}
              value={teamOptions.find((o) => o.value === teamId) ?? null}
              onChange={(opt) => handleTeamChange(opt as SelectOption | null)}
              isSearchable={false}
              placeholder="Switch team…"
            />
          </div>
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
      {isBusy ? (
        <TaskRowsSkeleton />
      ) : (
        <div className="bg-bg-700 rounded-card border border-border-subtle overflow-visible">
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
                    viewHref={`/archieve/${task.id}`}
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
              <p className="text-text-300 text-sm">
                {isSearchingArchived ? 'No archived tasks match your search.' : 'No archived tasks yet.'}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Archived pagination */}
      {isArchivedTab && archivedTotal > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-2xs text-text-300">
            Showing {((archivedPage - 1) * ARCHIVED_TASKS_PAGE_LIMIT) + 1}
            –{Math.min(archivedPage * ARCHIVED_TASKS_PAGE_LIMIT, archivedTotal)}
            {' '}of {archivedTotal} · Page {archivedPage} of {archivedTotalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setArchivedPage((p) => Math.max(1, p - 1))}
              disabled={archivedPage <= 1 || archivedFetching}
              className="h-8 px-3 rounded-lg text-xs text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setArchivedPage((p) => Math.min(archivedTotalPages, p + 1))}
              disabled={archivedPage >= archivedTotalPages || archivedFetching}
              className="h-8 px-3 rounded-lg text-xs text-text-200 bg-bg-700 border border-border-subtle hover:bg-bg-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Export modal */}
      <AnimatePresence>
        {isExporting && team && (
          <ExportTasksModal
            key={`export-${team.id}`}
            team={team}
            onClose={() => setIsExporting(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
