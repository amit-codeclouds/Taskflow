'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { LABEL_STYLES, PRIORITY_COLORS, PRIORITY_TEXT } from '@/lib/taskData';
import { useTaskDetail, useDeleteTask } from '@/lib/hooks/useTasks';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { useBoardStatuses } from '@/lib/hooks/useBoardStatuses';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { openImageLightbox } from '@/lib/imageLightbox';
import { TaskDetailSkeleton } from '@/app/[id]/_skeleton';
import CommentList from './CommentList';
import CommentComposer from './CommentComposer';
import type { AssigneeSummary } from '@/lib/types/tasks.types';

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
  return (
    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-600 text-text-300">{name}</span>
  );
}

function initialsFor(a: AssigneeSummary): string {
  if (a.avatarInitials) return a.avatarInitials;
  const parts = (a.name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return (a.name ?? '?').slice(0, 2).toUpperCase();
}

function Breadcrumb({ taskNumber }: { taskNumber?: number }) {
  return (
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
      {taskNumber !== undefined && (
        <>
          <span className="text-border-subtle">/</span>
          <span className="text-sm font-mono text-text-300">#{taskNumber}</span>
        </>
      )}
    </motion.div>
  );
}

function NotFoundView({ taskId }: { taskId: string }) {
  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb />
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
  const router = useRouter();
  const confirm = useConfirm();
  const { data: task, isPending, isError } = useTaskDetail(taskId);
  const { data: teams = [] } = useTeamsList();
  const { data: teamStatuses = [] } = useBoardStatuses(task?.teamId ?? '');
  const deleteTask = useDeleteTask();

  if (isPending) return <TaskDetailSkeleton />;
  if (isError || !task) return <NotFoundView taskId={taskId} />;

  const team = teams.find((t) => t.id === task.teamId);
  const statusName = teamStatuses.find((s) => s.statusId === task.statusId)?.statusName ?? '—';

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this task?',
      description: `Permanently delete "${task!.title}". This action cannot be undone.`,
      confirmLabel: 'Delete Task',
      danger: true,
    });
    if (!ok) return;
    await deleteTask.mutateAsync({ id: task!.id, teamId: task!.teamId });
    router.push('/');
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb taskNumber={task.taskNumber} />

      <div className="grid grid-cols-[3fr_2fr] gap-6">

        {/* ── Left — task info ── */}
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
                #{task.taskNumber}
              </span>
              <StatusBadge name={statusName} />
              {task.label && (
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
                  {task.label}
                </span>
              )}
            </div>

            <h1 className="text-xl font-semibold text-text-100 leading-snug mb-4">
              {task.title}
            </h1>

            {/* Priority row */}
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${PRIORITY_COLORS[task.priority]}`} />
              <span className={`text-xs font-medium ${PRIORITY_TEXT[task.priority]}`}>
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
                onClick={(e) => {
                  const target = e.target as HTMLElement;
                  if (target.tagName === 'IMG') {
                    const src = (target as HTMLImageElement).src;
                    openImageLightbox(src, target.getAttribute('alt') ?? '');
                  }
                }}
              />
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
            {task.assignees.length === 0 ? (
              <p className="text-sm text-text-300 italic">Unassigned.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {task.assignees.map((a) => (
                  <div key={a.userId} className="flex items-center gap-2">
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

            <DetailRow label="Team">
              {team ? (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ background: team.color + '22', color: team.color }}
                >
                  {team.name}
                </span>
              ) : (
                <span className="text-xs text-text-300">—</span>
              )}
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
              <span className="text-xs text-text-200">
                {new Date(task.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </DetailRow>
          </motion.div>

          {/* Edit / Delete buttons */}
          <motion.div
            className="flex gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.25 }}
          >
            <Link href={`/${task.id}/edit`} className="flex-1">
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

            <motion.button
              type="button"
              onClick={handleDelete}
              disabled={deleteTask.isPending}
              data-tooltip="Delete this task"
              className="flex-1 h-10 rounded-lg border border-border-subtle text-sm text-status-red hover:bg-red-bg transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              whileHover={deleteTask.isPending ? undefined : { scale: 1.01 }}
              whileTap={deleteTask.isPending ? undefined : { scale: 0.99 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              <Trash2 size={13} strokeWidth={1.5} />
              {deleteTask.isPending ? 'Deleting…' : 'Delete Task'}
            </motion.button>
          </motion.div>
        </div>

        {/* ── Right — comments ── */}
        <motion.div
          className="bg-bg-800 rounded-xl border border-border-subtle p-5 flex flex-col gap-5 h-fit"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.12 }}
        >
          <p className="text-2xs text-text-300 uppercase tracking-widest">Comments</p>
          <CommentList taskId={task.id} />
          <CommentComposer taskId={task.id} />
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
