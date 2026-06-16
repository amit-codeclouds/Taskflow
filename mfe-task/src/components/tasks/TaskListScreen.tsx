'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import {
  TASKS, TEAMS, LABEL_STYLES, PRIORITY_COLORS,
  type Task,
} from '@/lib/taskData';

type FilterKey = 'all' | 'in-progress' | 'review' | 'todo' | 'done';

const STATUS_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all',         label: 'All'         },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review',      label: 'Review'      },
  { key: 'todo',        label: 'To Do'       },
  { key: 'done',        label: 'Done'        },
];

// Map task statusId to a filter key for the tab
const STATUS_KEY_MAP: Record<string, FilterKey> = {
  stat_1:  'todo',
  stat_2:  'in-progress',
  stat_3:  'review',
  stat_4:  'done',
  stat_5:  'todo',
  stat_6:  'in-progress',
  stat_7:  'done',
  stat_8:  'todo',
  stat_9:  'in-progress',
  stat_10: 'review',
  stat_11: 'done',
};

const STATUS_BADGE_MAP: Record<string, string> = {
  in_progress: 'in-progress',
  review: 'review',
  todo: 'todo',
  done: 'done',
};

function getFilterKey(task: Task): FilterKey {
  return STATUS_KEY_MAP[task.statusId] ?? 'todo';
}

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

const STATUS_LABELS: Record<FilterKey, string> = {
  'all': 'All', 'in-progress': 'In Progress', review: 'Review', todo: 'To Do', done: 'Done',
};

const TEAM_OPTIONS: SelectOption[] = [
  { value: 'all', label: 'All Teams' },
  ...TEAMS.map(t => ({ value: t.id, label: t.name })),
];

export default function TaskListScreen() {
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [teamFilter, setTeamFilter]     = useState<SelectOption>(TEAM_OPTIONS[0]);

  const filtered = TASKS.filter(t => {
    const matchStatus = statusFilter === 'all' || getFilterKey(t) === statusFilter;
    const matchTeam   = teamFilter.value === 'all' || t.teamId === teamFilter.value;
    return matchStatus && matchTeam;
  });

  const countFor = (key: FilterKey) =>
    TASKS.filter(t =>
      (key === 'all' || getFilterKey(t) === key) &&
      (teamFilter.value === 'all' || t.teamId === teamFilter.value)
    ).length;

  const STATS = [
    { label: 'Total',       value: TASKS.length,                                          color: 'text-text-100'      },
    { label: 'In Progress', value: TASKS.filter(t => getFilterKey(t) === 'in-progress').length, color: 'text-accent-hover'  },
    { label: 'In Review',   value: TASKS.filter(t => getFilterKey(t) === 'review').length,      color: 'text-status-amber'  },
    { label: 'Done',        value: TASKS.filter(t => getFilterKey(t) === 'done').length,         color: 'text-status-green'  },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">My Tasks</h1>
          <p className="text-sm text-text-300 mt-1">All tasks across all teams</p>
        </div>
        <Link href="/new">
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

      {/* Stats */}
      <motion.div className="grid grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {STATS.map((s) => (
          <div key={s.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <motion.div className="flex items-center gap-1 bg-bg-800 rounded-lg p-1 w-fit"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        >
          {STATUS_FILTERS.map((f) => (
            <button key={f.key} onClick={() => setStatusFilter(f.key)}
              className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
                statusFilter === f.key ? 'text-text-100' : 'text-text-300 hover:text-text-200'
              }`}
            >
              {statusFilter === f.key && (
                <motion.span layoutId="filterBg" className="absolute inset-0 bg-bg-600 rounded-md" />
              )}
              <span className="relative z-10">
                {f.label}
                <span className="ml-1.5 text-2xs text-text-300">{countFor(f.key)}</span>
              </span>
            </button>
          ))}
        </motion.div>

        <motion.div className="flex items-center gap-2 w-[200px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <AppSelect
            instanceId="team-filter"
            options={TEAM_OPTIONS}
            value={teamFilter}
            onChange={opt => opt && setTeamFilter(opt as SelectOption)}
            isSearchable={false}
          />
        </motion.div>
      </div>

      {/* Task list */}
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-visible">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => (
            <TaskRow key={task.id} task={task} index={i} isLast={i === filtered.length - 1} />
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-300 text-sm">No tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function TaskRow({ task, index, isLast }: { task: Task; index: number; isLast: boolean }) {
  const filterKey = getFilterKey(task);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      className={`flex items-center gap-4 px-5 py-4 hover:bg-bg-600 transition-colors group ${
        !isLast ? 'border-b border-border-subtle' : 'rounded-b-xl'
      } ${index === 0 ? 'rounded-t-xl' : ''}`}
    >
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_COLORS[task.priority]}`} />

      {/* Title + label */}
      <Link href={`/${task.id}`} className="flex-1 min-w-0 flex items-center gap-3 cursor-pointer">
        <span className={`text-sm truncate ${filterKey === 'done' ? 'line-through text-text-300' : 'text-text-100'}`}>
          {task.title}
        </span>
        <span className={`text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
          {task.label}
        </span>
      </Link>

      {/* Team badge */}
      <span
        className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden md:inline-flex"
        style={{ background: task.team.color + '22', color: task.team.color }}
      >
        {task.team.name}
      </span>

      {/* Status badge */}
      <div className="shrink-0 hidden md:block">
        <Badge label={task.status.name} variant={filterKey === 'all' ? 'todo' : filterKey} />
      </div>

      {/* Due date */}
      {task.expectedCompletion && (
        <div className="flex items-center gap-1.5 text-2xs text-text-300 shrink-0 hidden lg:flex">
          <CalendarIcon />
          {new Date(task.expectedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      )}

      {/* Task ID */}
      <span className="text-2xs text-text-300 font-mono shrink-0 hidden xl:block">{task.id}</span>

      {/* Assignee */}
      <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
        {task.assignee}
      </div>

      {/* Edit icon — permanently visible */}
      <Link
        href={`/${task.id}/edit`}
        data-tooltip="Edit task"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors shrink-0"
      >
        <EditIcon />
      </Link>

      {/* Open detail */}
      <Link
        href={`/${task.id}`}
        data-tooltip="Open task"
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors shrink-0"
      >
        <RedirectIcon />
      </Link>
    </motion.div>
  );
}
