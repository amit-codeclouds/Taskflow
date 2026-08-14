'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical } from 'lucide-react';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import ProgressModal from '@/components/Modals/ProgressModal';
import { LABEL_STYLES, PRIORITY_COLORS } from '@/lib/taskData';
import { colorForStatus } from '@/lib/statusColors';
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
// Mini circular gauge whose arc fills to `value` (0–100). Both the track and
// the filled arc use currentColor, so the ring automatically reads accent-lit
// on the "active" (editable) progress chip and dulled on the read-only one —
// same markup, color comes entirely from the parent chip's text color.
function ProgressRing({ value }: { value: number }) {
  const r = 5;
  const c = 2 * Math.PI * r;
  const pct = Math.min(100, Math.max(0, value));
  const offset = c * (1 - pct / 100);
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
      <circle cx="7" cy="7" r={r} stroke="currentColor" strokeWidth="1.6" opacity="0.25" />
      <circle
        cx="7"
        cy="7"
        r={r}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform="rotate(-90 7 7)"
      />
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

// Collapses Edit/View/Delete into a single "⋮" trigger — saves the horizontal
// space three separate icon buttons used to take. Rendered via a portal (like
// PeopleScreen's RowActionsMenu) so it can't be clipped by the list card's
// overflow, with position computed from the trigger's viewport rect.
function TaskRowActionsMenu({
  taskId,
  linkHref,
  canEdit,
  onRemove,
  removing,
}: {
  taskId: string;
  linkHref?: string;
  canEdit: boolean;
  onRemove: (e: React.MouseEvent) => void;
  removing: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<{ top: number; right: number } | null>(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  function openMenu() {
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) setCoords({ top: rect.bottom + 4, right: window.innerWidth - rect.right });
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (btnRef.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onDismiss() { setOpen(false); }
    document.addEventListener('mousedown', onMouseDown);
    window.addEventListener('scroll', onDismiss, true);
    window.addEventListener('resize', onDismiss);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('scroll', onDismiss, true);
      window.removeEventListener('resize', onDismiss);
    };
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (open) setOpen(false);
          else openMenu();
        }}
        data-tooltip="More actions"
        className={`w-7 h-7 rounded-lg flex items-center justify-center text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors ${open ? 'bg-bg-600 text-text-100' : ''}`}
      >
        <MoreVertical size={15} strokeWidth={1.8} />
      </button>

      {mounted && createPortal(
        <AnimatePresence>
          {open && coords && (
            <motion.div
              ref={panelRef}
              className="fixed w-40 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated z-50 overflow-hidden py-1"
              style={{ top: coords.top, right: coords.right }}
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
            >
              {canEdit && (
                <Link
                  href={`/${taskId}/edit`}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                >
                  <EditIcon />
                  Edit
                </Link>
              )}
              {linkHref && (
                <Link
                  href={linkHref}
                  onClick={() => setOpen(false)}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                >
                  <RedirectIcon />
                  View
                </Link>
              )}
              {canEdit && (
                <button
                  type="button"
                  onClick={(e) => { setOpen(false); onRemove(e); }}
                  disabled={removing}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-status-red hover:bg-red-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <TrashIcon />
                  Delete
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
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
// Pass `readOnly` for tasks with no live detail route (e.g. archived tasks) —
// this always hides Edit/Remove. Pass `viewHref` alongside it to still link the
// row through to a read-only detail page (e.g. `/archieve/<id>`) with just a
// View button; without it, a readOnly row renders as plain, unlinked content.
export function TaskRow({
  task,
  index,
  isLast,
  statusName,
  readOnly = false,
  viewHref,
}: {
  task: ApiTask;
  index: number;
  isLast: boolean;
  statusName: string;
  readOnly?: boolean;
  viewHref?: string;
}) {
  const confirm = useConfirm();
  const deleteTask = useDeleteTask();
  const { id: currentUserId } = useAuth();
  const isAssignedToMe = !readOnly && task.assignees.some((a) => a.userId === currentUserId);
  const [progressOpen, setProgressOpen] = useState(false);

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
    await deleteTask.mutateAsync({ id: task.id, teamId: task.teamId });
  }

  const statusColor = colorForStatus(statusName);

  const content = (
    <>
      {/* Line 1 — title only; ellipsis-truncated with the full title on hover */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-text-100 truncate" data-tooltip={task.title}>{task.title}</span>
      </div>

      {/* Line 2 — assignees, label / due chips, created / updated */}
      <div className="flex items-center gap-2 flex-wrap text-2xs text-text-300">
        <AssigneeStack assignees={task.assignees} size="md" />
        {task.label && (
          <span className={`font-medium px-2 py-0.5 rounded-full shrink-0 ${LABEL_STYLES[task.label] ?? 'bg-bg-600 text-text-300'}`}>
            {task.label}
          </span>
        )}
        {task.expectedCompletion && (
          <span className={`font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 ${deadlineChipClass(task.expectedCompletion)}`}>
            <CalendarIcon />
            {formatShortDate(task.expectedCompletion)}
          </span>
        )}
        <span>Created {formatShortDate(task.createdAt)}</span>
        <span className="text-border-subtle">·</span>
        <span>Updated {formatShortDate(task.updatedAt)}</span>
      </div>
    </>
  );

  // Archived rows have no live detail route of their own — `viewHref` (e.g.
  // /archieve/<id>) stands in for the normal `/${task.id}` link-through.
  const linkHref = readOnly ? viewHref : `/${task.id}`;
  const showActions = !readOnly || !!viewHref;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
      className={`flex items-start gap-4 px-5 py-4 transition-colors group ${linkHref ? 'hover:bg-bg-600' : ''} ${
        !isLast ? 'border-b border-border-subtle' : 'rounded-b-xl'
      } ${index === 0 ? 'rounded-t-xl' : ''}`}
    >
      {/* Priority dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 mt-2 ${PRIORITY_COLORS[task.priority]}`} />

      {/* Content — two lines */}
      {linkHref ? (
        <Link href={linkHref} className="flex-1 min-w-0 flex flex-col gap-1.5 cursor-pointer">
          {content}
        </Link>
      ) : (
        <div className="flex-1 min-w-0 flex flex-col gap-1.5">{content}</div>
      )}

      {/* Right end — status + progress, kept apart from the title/content so it
          reads as its own distinct group. Progress is always visible (everyone
          can see where a task stands); it's only rendered as a live, accent-lit
          button for the task's own assignee — everyone else gets the same chip
          in a dulled, non-interactive style so it's obvious at a glance who can
          actually change it. Menu is the only actual action. */}
      {showActions && (
        <div className="flex items-center gap-2 shrink-0 self-center" onClick={(e) => e.stopPropagation()}>
          <span
            className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0"
            style={{ background: `color-mix(in srgb, ${statusColor} 16%, transparent)`, color: statusColor }}
          >
            {statusName}
          </span>

          {isAssignedToMe ? (
            <button
              type="button"
              data-tooltip="Update progress"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setProgressOpen(true);
              }}
              className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 bg-accent-bg text-accent hover:bg-accent hover:text-white transition-colors"
            >
              <ProgressRing value={task.progress ?? 0} />
              <span className="tabular-nums">{task.progress ?? 0}%</span>
            </button>
          ) : (
            <span
              data-tooltip="Only the assignee can update progress"
              className="text-2xs font-medium px-2 py-0.5 rounded-full shrink-0 flex items-center gap-1 bg-bg-700 text-text-300 opacity-70 cursor-default"
            >
              <ProgressRing value={task.progress ?? 0} />
              <span className="tabular-nums">{task.progress ?? 0}%</span>
            </span>
          )}

          <TaskRowActionsMenu
            taskId={task.id}
            linkHref={linkHref}
            canEdit={isAssignedToMe}
            onRemove={handleRemove}
            removing={deleteTask.isPending}
          />
        </div>
      )}

      <AnimatePresence>
        {progressOpen && <ProgressModal task={task} onClose={() => setProgressOpen(false)} />}
      </AnimatePresence>
    </motion.div>
  );
}
