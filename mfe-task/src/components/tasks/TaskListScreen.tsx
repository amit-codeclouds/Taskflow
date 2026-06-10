'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';

type Priority = 'high' | 'medium' | 'low';
type Status   = 'in-progress' | 'review' | 'todo' | 'done';

interface Task {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  assignee: string;
  due: string;
  label: string;
}

const TASKS: Task[] = [
  { id: 'TF-001', title: 'Implement authentication flow',    priority: 'high',   status: 'in-progress', assignee: 'AC', due: 'Jun 12', label: 'feature' },
  { id: 'TF-002', title: 'Design onboarding screens',        priority: 'medium', status: 'review',      assignee: 'AC', due: 'Jun 14', label: 'design'  },
  { id: 'TF-003', title: 'Fix navigation bug on mobile',     priority: 'high',   status: 'in-progress', assignee: 'AC', due: 'Jun 11', label: 'bug'     },
  { id: 'TF-004', title: 'Write API documentation',          priority: 'low',    status: 'todo',        assignee: 'AC', due: 'Jun 20', label: 'docs'    },
  { id: 'TF-005', title: 'Set up CI/CD pipeline',            priority: 'medium', status: 'done',        assignee: 'AC', due: 'Jun 8',  label: 'infra'   },
  { id: 'TF-006', title: 'Code review: task filters',        priority: 'low',    status: 'review',      assignee: 'AC', due: 'Jun 13', label: 'feature' },
  { id: 'TF-007', title: 'Refactor data layer',              priority: 'medium', status: 'todo',        assignee: 'AC', due: 'Jun 25', label: 'refactor'},
];

const FILTERS = [
  { key: 'all',         label: 'All'         },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review',      label: 'Review'      },
  { key: 'todo',        label: 'To Do'       },
  { key: 'done',        label: 'Done'        },
] as const;

const STATUS_LABELS: Record<Status, string> = {
  'in-progress': 'In Progress',
  'review':      'Review',
  'todo':        'To Do',
  'done':        'Done',
};

const PRIORITY_DOT: Record<Priority, string> = {
  high:   'bg-status-red',
  medium: 'bg-status-amber',
  low:    'bg-bg-500',
};

const LABEL_STYLES: Record<string, string> = {
  feature:  'bg-accent-bg text-accent-hover',
  bug:      'bg-red-bg text-status-red',
  design:   'bg-[#1a2038] text-[#6a9eef]',
  docs:     'bg-bg-600 text-text-300',
  infra:    'bg-[#1a2a20] text-status-green',
  refactor: 'bg-amber-bg text-status-amber',
};

const STATS = [
  { label: 'Total',       value: 7, color: 'text-text-100' },
  { label: 'In Progress', value: 2, color: 'text-accent-hover' },
  { label: 'In Review',   value: 2, color: 'text-status-amber' },
  { label: 'Done',        value: 1, color: 'text-status-green' },
];

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
      <path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

type FilterKey = typeof FILTERS[number]['key'];

export default function TaskListScreen() {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const filtered = activeFilter === 'all'
    ? TASKS
    : TASKS.filter(t => t.status === activeFilter);

  const countFor = (key: FilterKey) =>
    key === 'all' ? TASKS.length : TASKS.filter(t => t.status === key).length;

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">My Tasks</h1>
          <p className="text-sm text-text-300 mt-1">{TASKS.length} tasks total</p>
        </div>
        <motion.button
          className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <PlusIcon />
          New Task
        </motion.button>
      </motion.div>

      {/* Stats row */}
      <motion.div
        className="grid grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{stat.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Filter tabs */}
      <motion.div
        className="flex items-center gap-1 mb-4 bg-bg-800 rounded-lg p-1 w-fit"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`relative px-3 py-1.5 rounded-md text-sm transition-colors ${
              activeFilter === f.key
                ? 'text-text-100'
                : 'text-text-300 hover:text-text-200'
            }`}
          >
            {activeFilter === f.key && (
              <motion.span
                layoutId="filterBg"
                className="absolute inset-0 bg-bg-600 rounded-md"
              />
            )}
            <span className="relative z-10">
              {f.label}
              <span className="ml-1.5 text-2xs text-text-300">{countFor(f.key)}</span>
            </span>
          </button>
        ))}
      </motion.div>

      {/* Task list */}
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id}
              layout
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: i * 0.04 }}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-bg-600 transition-colors cursor-pointer group ${
                i < filtered.length - 1 ? 'border-b border-border-subtle' : ''
              }`}
            >
              {/* Checkbox */}
              <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                task.status === 'done'
                  ? 'border-status-green bg-green-bg'
                  : 'border-bg-500 group-hover:border-accent'
              }`}>
                {task.status === 'done' && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l1.5 1.5 3.5-3" stroke="#32B173" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>

              {/* Priority dot */}
              <span className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[task.priority]}`} />

              {/* Title + label */}
              <div className="flex-1 min-w-0 flex items-center gap-3">
                <span className={`text-sm truncate ${task.status === 'done' ? 'line-through text-text-300' : 'text-text-100'}`}>
                  {task.title}
                </span>
                <span className={`text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden sm:inline-flex ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
                  {task.label}
                </span>
              </div>

              {/* Status badge */}
              <div className="shrink-0 hidden md:block">
                <Badge label={STATUS_LABELS[task.status]} variant={task.status} />
              </div>

              {/* Due date */}
              <div className="flex items-center gap-1.5 text-2xs text-text-300 shrink-0 hidden lg:flex">
                <CalendarIcon />
                {task.due}
              </div>

              {/* Task ID */}
              <span className="text-2xs text-text-300 font-mono shrink-0 hidden xl:block">{task.id}</span>

              {/* Assignee */}
              <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                {task.assignee}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-text-300 text-sm">No tasks in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
