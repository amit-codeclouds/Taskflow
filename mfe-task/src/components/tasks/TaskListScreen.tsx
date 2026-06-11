'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Badge from '@/components/ui/Badge';

type Priority = 'high' | 'medium' | 'low';
type Status   = 'in-progress' | 'review' | 'todo' | 'done';

interface Team { id: string; name: string; color: string; }
interface Task {
  id: string; title: string; priority: Priority; status: Status;
  assignee: string; due: string; label: string; team: Team;
}

const TEAMS: Team[] = [
  { id: 'team_1', name: 'Taskflow Core',  color: '#6155DD' },
  { id: 'team_2', name: 'Design System',  color: '#32B173' },
  { id: 'team_3', name: 'API Gateway',    color: '#E09D34' },
];

const TASKS: Task[] = [
  { id: 'TF-001', title: 'Implement authentication flow',   priority: 'high',   status: 'in-progress', assignee: 'AC', due: 'Jun 12', label: 'feature',  team: TEAMS[0] },
  { id: 'TF-002', title: 'Design onboarding screens',       priority: 'medium', status: 'review',      assignee: 'AC', due: 'Jun 14', label: 'design',   team: TEAMS[0] },
  { id: 'TF-003', title: 'Fix navigation bug on mobile',    priority: 'high',   status: 'in-progress', assignee: 'AC', due: 'Jun 11', label: 'bug',      team: TEAMS[0] },
  { id: 'TF-004', title: 'Write API documentation',         priority: 'low',    status: 'todo',        assignee: 'AC', due: 'Jun 20', label: 'docs',     team: TEAMS[0] },
  { id: 'TF-005', title: 'Set up CI/CD pipeline',           priority: 'medium', status: 'done',        assignee: 'AC', due: 'Jun 8',  label: 'infra',    team: TEAMS[0] },
  { id: 'DS-001', title: 'Button component variants',       priority: 'high',   status: 'todo',        assignee: 'AC', due: 'Jun 20', label: 'design',   team: TEAMS[1] },
  { id: 'DS-002', title: 'Dark mode token audit',           priority: 'medium', status: 'review',      assignee: 'AC', due: 'Jun 22', label: 'refactor', team: TEAMS[1] },
  { id: 'AG-001', title: 'Rate limiting middleware',        priority: 'high',   status: 'todo',        assignee: 'AC', due: 'Jun 25', label: 'infra',    team: TEAMS[2] },
  { id: 'AG-002', title: 'Auth token validation',           priority: 'high',   status: 'in-progress', assignee: 'AC', due: 'Jun 14', label: 'feature',  team: TEAMS[2] },
];

const STATUS_FILTERS = [
  { key: 'all',         label: 'All'         },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'review',      label: 'Review'      },
  { key: 'todo',        label: 'To Do'       },
  { key: 'done',        label: 'Done'        },
] as const;

const STATUS_LABELS: Record<Status, string> = {
  'in-progress': 'In Progress', review: 'Review', todo: 'To Do', done: 'Done',
};
const PRIORITY_DOT: Record<Priority, string> = { high: 'bg-status-red', medium: 'bg-status-amber', low: 'bg-bg-500' };
const LABEL_STYLES: Record<string, string> = {
  feature: 'bg-accent-bg text-accent-hover', bug: 'bg-red-bg text-status-red',
  design: 'bg-[#1a2038] text-[#6a9eef]', docs: 'bg-bg-600 text-text-300',
  infra: 'bg-[#1a2a20] text-status-green', refactor: 'bg-amber-bg text-status-amber',
};

type FilterKey = typeof STATUS_FILTERS[number]['key'];

function PlusIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" /></svg>;
}
function CalendarIcon() {
  return <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><rect x="1" y="2" width="10" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.2" /><path d="M4 1v2M8 1v2M1 5h10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>;
}

export default function TaskListScreen() {
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [teamFilter, setTeamFilter]     = useState<string>('all');

  const filtered = TASKS.filter(t => {
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    const matchTeam   = teamFilter === 'all' || t.team.id === teamFilter;
    return matchStatus && matchTeam;
  });

  const countFor = (key: FilterKey) =>
    key === 'all' ? TASKS.filter(t => teamFilter === 'all' || t.team.id === teamFilter).length
      : TASKS.filter(t => t.status === key && (teamFilter === 'all' || t.team.id === teamFilter)).length;

  const STATS = [
    { label: 'Total',       value: TASKS.length,                                  color: 'text-text-100'      },
    { label: 'In Progress', value: TASKS.filter(t => t.status === 'in-progress').length, color: 'text-accent-hover'  },
    { label: 'In Review',   value: TASKS.filter(t => t.status === 'review').length,      color: 'text-status-amber'  },
    { label: 'Done',        value: TASKS.filter(t => t.status === 'done').length,        color: 'text-status-green'  },
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
        <motion.button
          className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <PlusIcon />New Task
        </motion.button>
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

      {/* Filter bar: status tabs + team dropdown */}
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

        {/* Team filter */}
        <motion.div className="flex items-center gap-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
          <span className="text-xs text-text-300">Team:</span>
          <div className="flex items-center gap-1 bg-bg-800 rounded-lg p-1">
            <button onClick={() => setTeamFilter('all')}
              className={`relative px-2.5 py-1 rounded-md text-xs transition-colors ${teamFilter === 'all' ? 'text-text-100' : 'text-text-300 hover:text-text-200'}`}
            >
              {teamFilter === 'all' && <motion.span layoutId="teamBg" className="absolute inset-0 bg-bg-600 rounded-md" />}
              <span className="relative z-10">All</span>
            </button>
            {TEAMS.map(t => (
              <button key={t.id} onClick={() => setTeamFilter(t.id)}
                className={`relative flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${teamFilter === t.id ? 'text-text-100' : 'text-text-300 hover:text-text-200'}`}
              >
                {teamFilter === t.id && <motion.span layoutId="teamBg" className="absolute inset-0 bg-bg-600 rounded-md" />}
                <span className="relative z-10 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: t.color }} />
                  {t.name.split(' ')[0]}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Task list */}
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
        <AnimatePresence mode="popLayout">
          {filtered.map((task, i) => (
            <motion.div
              key={task.id} layout
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30, delay: i * 0.04 }}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-bg-600 transition-colors cursor-pointer group ${
                i < filtered.length - 1 ? 'border-b border-border-subtle' : ''
              }`}
            >
              {/* Checkbox */}
              <div className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-colors ${
                task.status === 'done' ? 'border-status-green bg-green-bg' : 'border-bg-500 group-hover:border-accent'
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

              {/* Team badge */}
              <span
                className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 hidden md:inline-flex"
                style={{ background: task.team.color + '22', color: task.team.color }}
              >
                {task.team.name}
              </span>

              {/* Status badge */}
              <div className="shrink-0 hidden md:block">
                <Badge label={STATUS_LABELS[task.status]} variant={task.status} />
              </div>

              {/* Due date */}
              <div className="flex items-center gap-1.5 text-2xs text-text-300 shrink-0 hidden lg:flex">
                <CalendarIcon />{task.due}
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
            <p className="text-text-300 text-sm">No tasks match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
