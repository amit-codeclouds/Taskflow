'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { LABEL_STYLES, PRIORITY_COLORS, PRIORITY_TEXT } from '@/lib/taskData';
import { useArchivedTask } from '@/lib/hooks/useArchivedTasks';
import { ArchivedTaskDetailSkeleton } from '@/app/archieve/[taskId]/_skeleton';
import type { Priority, LabelType } from '@/lib/types/tasks.types';
import type { ArchivedAssignee } from '@/lib/types/archivedTasks.types';

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

function initialsFor(a: ArchivedAssignee): string {
  if (a.avatarInitials) return a.avatarInitials;
  const parts = (a.name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (a.name ?? '?').slice(0, 2).toUpperCase();
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function Breadcrumb({ taskNumber, teamId }: { taskNumber?: number; teamId?: string }) {
  const backHref = teamId ? `/listview?teamid=${teamId}` : '/listview';
  return (
    <motion.div
      className="flex items-center gap-3 mb-8"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link href={backHref} data-tooltip="Back to archived tasks" className="text-text-300 hover:text-text-100 transition-colors flex items-center gap-1.5 text-sm">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M8.5 3L4.5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back
      </Link>
      {taskNumber !== undefined && (
        <>
          <span className="text-border-subtle">/</span>
          <span className="text-sm font-mono text-text-300">#{taskNumber}</span>
        </>
      )}
    </motion.div>
  );
}

function NotFoundView() {
  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb />
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-text-300 text-sm">This archived task was not found.</p>
        <Link href="/listview" className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors">
          ← Back to tasks
        </Link>
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

export default function ArchivedTaskDetailScreen({ taskId }: { taskId: string }) {
  const { data: task, isPending, isError } = useArchivedTask(taskId);

  if (isPending) return <ArchivedTaskDetailSkeleton />;
  if (isError || !task) return <NotFoundView />;

  const priority = (task.priority as Priority) || 'Medium';
  const label = (task.label as LabelType) || undefined;
  const assignees = task.assigneeDetails ?? [];

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumb taskNumber={task.taskNumber} teamId={task.teamId} />

      <div className="flex flex-col gap-5">
        {/* Title card */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.05 }}
        >
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-2xs font-mono text-text-300 bg-bg-600 px-2 py-0.5 rounded">
              #{task.taskNumber}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent-bg text-accent-hover">Archived</span>
            {label && (
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LABEL_STYLES[label] ?? 'bg-bg-600 text-text-300'}`}>
                {label}
              </span>
            )}
          </div>

          <h1 className="text-xl font-semibold text-text-100 leading-snug mb-4">{task.title}</h1>

          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[priority]}`} />
            <span className={`text-xs font-medium ${PRIORITY_TEXT[priority]}`}>{priority} priority</span>
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
            <div className="task-description-content" dangerouslySetInnerHTML={{ __html: task.description }} />
          ) : (
            <p className="text-sm text-text-300 italic">No description provided.</p>
          )}
        </motion.div>

        {/* Assignees */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.15 }}
        >
          <p className="text-2xs text-text-300 uppercase tracking-widest mb-4">Assignees</p>
          {assignees.length === 0 ? (
            <p className="text-sm text-text-300 italic">Unassigned.</p>
          ) : (
            <div className="flex flex-wrap gap-3">
              {assignees.map((a) => (
                <div key={a.id} className="flex items-center gap-2">
                  {a.avatarUrl ? (
                    <Image
                      src={a.avatarUrl}
                      alt={a.name ?? 'Assignee'}
                      width={28}
                      height={28}
                      className="w-7 h-7 rounded-full object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-2xs font-semibold shrink-0">
                      {initialsFor(a)}
                    </div>
                  )}
                  <span className="text-xs text-text-200">{a.name ?? 'Unknown'}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Details */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-5 flex flex-col gap-4"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.2 }}
        >
          <p className="text-2xs text-text-300 uppercase tracking-widest">Details</p>

          <DetailRow label="Expected Completion">
            <span className="text-xs text-text-200">{formatDate(task.expectedCompletion)}</span>
          </DetailRow>

          <div>
            <p className="text-xs text-text-300 mb-2">
              Progress
              <span className="ml-1.5 text-text-100 font-medium">{task.progress ?? 0}%</span>
            </p>
            <ProgressBar value={task.progress ?? 0} />
          </div>

          <DetailRow label="Created">
            <span className="text-xs text-text-200">{formatDate(task.createdAt)}</span>
          </DetailRow>

          <DetailRow label="Last Updated">
            <span className="text-xs text-text-200">{formatDate(task.updatedAt)}</span>
          </DetailRow>
        </motion.div>
      </div>
    </div>
  );
}
