'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { LABEL_STYLES, PRIORITY_COLORS } from '@/lib/taskData';
import { useDeleteTask } from '@/lib/hooks/useTasks';
import { useAuth } from '@/lib/useAuth';
import type { ApiTask, AssigneeSummary } from '@/lib/types/tasks.types';

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

export function AssigneeStack({ assignees, size = 'md' }: { assignees: AssigneeSummary[]; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-2xs';
  const px = size === 'sm' ? 20 : 28;
  const visible = assignees.slice(0, 2);
  const overflow = assignees.length - visible.length;
  if (assignees.length === 0) {
    return <span className="text-text-300 italic">Unassigned</span>;
  }
  return (
    <div className="flex items-center -space-x-1.5 shrink-0">
      {visible.map((a) => (
        a.avatarUrl ? (
          <span
            key={a.userId}
            data-tooltip={a.name ?? 'Assignee'}
            className={`${dim} rounded-full shrink-0 block`}
          >
            <Image
              src={a.avatarUrl}
              alt={a.name ?? 'Assignee'}
              width={px}
              height={px}
              className={`${dim} rounded-full object-cover border-2 border-bg-700`}
            />
          </span>
        ) : (
          <div
            key={a.userId}
            data-tooltip={a.name ?? 'Assignee'}
            className={`${dim} rounded-full bg-accent-bg border-2 border-bg-700 flex items-center justify-center text-accent font-semibold`}
          >
            {initialsFor(a)}
          </div>
        )
      ))}
      {overflow > 0 && (
        <div className={`${dim} rounded-full bg-bg-600 border-2 border-bg-700 flex items-center justify-center text-text-300 font-medium`}>
          +{overflow}
        </div>
      )}
    </div>
  );
}

// Edit + Delete only render for the current user's own assigned tasks — everyone
// else (e.g. viewing a teammate's task from the team board) only gets View.
// Pass `readOnly` for tasks with no live detail route yet (e.g. archived tasks),
// which hides the action cluster entirely and drops the row's own link-through.
export function TaskRow({
  task,
  index,
  isLast,
  statusName,
  readOnly = false,
}: {
  task: ApiTask;
  index: number;
  isLast: boolean;
  statusName: string;
  readOnly?: boolean;
}) {
  const confirm = useConfirm();
  const deleteTask = useDeleteTask();
  const { id: currentUserId } = useAuth();
  const isAssignedToMe = task.assignees.some((a) => a.userId === currentUserId);

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

  const content = (
    <>
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
    </>
  );

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      className={`flex items-start gap-4 px-5 py-4 transition-colors group ${!readOnly ? 'hover:bg-bg-600' : ''} ${
        !isLast ? 'border-b border-border-subtle' : 'rounded-b-xl'
      } ${index === 0 ? 'rounded-t-xl' : ''}`}
    >
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${PRIORITY_COLORS[task.priority]}`} />

      {/* Content — two lines */}
      {readOnly ? (
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">{content}</div>
      ) : (
        <Link href={`/${task.id}`} className="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer">
          {content}
        </Link>
      )}

      {/* Right side — Edit / View / Remove */}
      {!readOnly && (
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {isAssignedToMe && (
            <Link
              href={`/${task.id}/edit`}
              data-tooltip="Edit task"
              onClick={(e) => e.stopPropagation()}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors"
            >
              <EditIcon />
            </Link>
          )}
          <Link
            href={`/${task.id}`}
            data-tooltip="View task"
            onClick={(e) => e.stopPropagation()}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-accent hover:bg-accent-bg transition-colors"
          >
            <RedirectIcon />
          </Link>
          {isAssignedToMe && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={deleteTask.isPending}
              data-tooltip="Remove task"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-status-red hover:bg-red-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <TrashIcon />
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
