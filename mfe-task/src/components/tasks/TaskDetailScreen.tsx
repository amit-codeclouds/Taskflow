'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  TASKS, LABEL_STYLES, PRIORITY_COLORS, PRIORITY_TEXT,
  type Task,
} from '@/lib/taskData';

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="w-full h-1.5 rounded-full bg-bg-600 overflow-hidden">
      <motion.div
        className="h-full rounded-full bg-accent"
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: 'spring', stiffness: 120, damping: 20, delay: 0.3 }}
      />
    </div>
  );
}

function StatusBadge({ name }: { name: string }) {
  const lower = name.toLowerCase();
  const styles: Record<string, string> = {
    'in progress': 'bg-accent-bg text-accent-hover',
    'review':      'bg-amber-bg text-status-amber',
    'done':        'bg-green-bg text-status-green',
    'backlog':     'bg-bg-600 text-text-300',
    'in design':   'bg-[#1a2038] text-[#6a9eef]',
    'development': 'bg-[#1a2a20] text-status-green',
    'testing':     'bg-amber-bg text-status-amber',
    'to do':       'bg-bg-600 text-text-300',
  };
  const cls = styles[lower] ?? 'bg-bg-600 text-text-300';
  return (
    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${cls}`}>{name}</span>
  );
}

function NotFoundView({ taskId }: { taskId: string }) {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/" data-tooltip="Back to tasks" className="text-text-300 hover:text-text-100 transition-colors flex items-center gap-1.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tasks
        </Link>
        <span className="text-border-subtle">/</span>
        <span className="text-sm text-text-300">{taskId}</span>
      </div>
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-text-300 text-sm">Task <span className="font-mono text-text-200">{taskId}</span> was not found.</p>
        <Link href="/" className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors">
          ← Back to tasks
        </Link>
      </div>
    </div>
  );
}

export default function TaskDetailScreen({ taskId }: { taskId: string }) {
  const task: Task | undefined = TASKS.find(t => t.id === taskId);
  if (!task) return <NotFoundView taskId={taskId} />;

  return (
    <div className="max-w-4xl mx-auto">

      {/* Breadcrumb */}
      <motion.div
        className="flex items-center gap-3 mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <Link href="/" data-tooltip="Back to tasks" className="text-text-300 hover:text-text-100 transition-colors flex items-center gap-1.5 text-sm">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Tasks
        </Link>
        <span className="text-border-subtle">/</span>
        <span className="text-sm font-mono text-text-300">{task.id}</span>
      </motion.div>

      <div className="grid grid-cols-[1fr_280px] gap-6">

        {/* ── Left — main content ── */}
        <div className="flex flex-col gap-5">

          {/* Title card */}
          <motion.div
            className="bg-bg-800 rounded-xl border border-border-subtle p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
          >
            {/* ID + badges row */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-2xs font-mono text-text-300 bg-bg-600 px-2 py-0.5 rounded">
                {task.id}
              </span>
              <StatusBadge name={task.status.name} />
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
                {task.label}
              </span>
            </div>

            <h1 className="text-xl font-semibold text-text-100 leading-snug mb-4">
              {task.title}
            </h1>

            {/* Priority row */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
              <span className={`text-xs font-medium capitalize ${PRIORITY_TEXT[task.priority]}`}>
                {task.priority} priority
              </span>
            </div>
          </motion.div>

          {/* Description card */}
          <motion.div
            className="bg-bg-800 rounded-xl border border-border-subtle p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.1 }}
          >
            <p className="text-2xs text-text-300 uppercase tracking-widest mb-3">Description</p>
            {task.description ? (
              <div
                className="task-description-content"
                dangerouslySetInnerHTML={{ __html: task.description }}
              />
            ) : (
              <p className="text-sm text-text-300 italic">No description provided.</p>
            )}
          </motion.div>

          {/* Activity placeholder */}
          <motion.div
            className="bg-bg-800 rounded-xl border border-border-subtle p-6"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.15 }}
          >
            <p className="text-2xs text-text-300 uppercase tracking-widest mb-4">Activity</p>
            <div className="flex flex-col gap-3">
              {[
                { action: 'created this task',                  time: '2 days ago' },
                { action: 'changed status to In Progress',      time: '1 day ago'  },
                { action: 'updated progress to ' + task.progress + '%', time: '3 hours ago' },
              ].map((entry, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-accent-bg flex items-center justify-center text-accent text-2xs font-semibold shrink-0 mt-0.5">
                    {task.assignee}
                  </div>
                  <div>
                    <span className="text-xs text-text-200">{task.assignee} </span>
                    <span className="text-xs text-text-300">{entry.action}</span>
                    <p className="text-2xs text-text-300 mt-0.5">{entry.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right — details panel ── */}
        <motion.div
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.12 }}
        >
          <div className="bg-bg-800 rounded-xl border border-border-subtle p-5 flex flex-col gap-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">Details</p>

            <DetailRow label="Team">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: task.team.color + '22', color: task.team.color }}
              >
                {task.team.name}
              </span>
            </DetailRow>

            <DetailRow label="Assignee">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-accent-bg flex items-center justify-center text-accent text-2xs font-semibold">
                  {task.assignee}
                </div>
                <span className="text-xs text-text-200">{task.assignee}</span>
              </div>
            </DetailRow>

            <DetailRow label="Expected Completion">
              <span className="text-xs text-text-200">
                {task.expectedCompletion
                  ? new Date(task.expectedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : '—'}
              </span>
            </DetailRow>

            <div>
              <p className="text-xs text-text-300 mb-2">
                Progress
                <span className="ml-1.5 text-text-100 font-medium">{task.progress}%</span>
              </p>
              <ProgressBar value={task.progress} />
            </div>

            <DetailRow label="Created">
              <span className="text-xs text-text-200">Jun 1, 2026</span>
            </DetailRow>
          </div>

          {/* Edit button */}
          <Link href={`/${task.id}/edit`} className="block">
            <motion.button
              type="button"
              className="w-full h-10 rounded-lg border border-border-subtle text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors flex items-center justify-center gap-2"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
                <path d="M8.5 1.5a1.414 1.414 0 012 2L3.5 10.5l-3 .5.5-3 7.5-6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Edit Task
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-text-300 shrink-0">{label}</span>
      {children}
    </div>
  );
}
