'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import AppSelect, { type SelectOption } from '@/components/ui/AppSelect';
import { useUpdateTask, useTaskDetail } from '@/lib/hooks/useTasks';
import { useBoardStatuses } from '@/lib/hooks/useBoardStatuses';
import { colorForStatus } from '@/lib/statusColors';
import type { ApiTask } from '@/lib/types/tasks.types';

interface Props {
  task: ApiTask;
  onClose: () => void;
}

interface StatusOption extends SelectOption {
  color: string;
}

const clampPct = (n: number) => Math.min(100, Math.max(0, n));

export default function ProgressModal({ task, onClose }: Props) {
  const updateTask = useUpdateTask();
  // Show the list value instantly, then sync to the fresh per-task value from
  // GET /api/tasks/:id once it loads (so the bar reflects the current server
  // progress even if the list row was stale).
  const { data: detail } = useTaskDetail(task.id);
  const { data: statuses = [] } = useBoardStatuses(task.teamId);
  const [progress, setProgress] = useState(clampPct(task.progress ?? 0));
  const [statusId, setStatusId] = useState(task.statusId);
  const syncedRef = useRef(false);

  useEffect(() => {
    if (!syncedRef.current && detail) {
      if (typeof detail.progress === 'number') setProgress(clampPct(detail.progress));
      if (detail.statusId) setStatusId(detail.statusId);
      syncedRef.current = true;
    }
  }, [detail]);

  const statusOptions: StatusOption[] = statuses.map((s) => ({
    value: s.statusId,
    label: s.statusName,
    color: colorForStatus(s.statusName),
  }));

  // Portal to <body> so `position: fixed` is relative to the viewport, not the
  // transformed TaskRow ancestor. Also close on Escape.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit() {
    await updateTask.mutateAsync({ id: task.id, teamId: task.teamId, progress, statusId });
    onClose();
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      <motion.div
        className="relative w-full max-w-[440px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="flex items-start justify-between p-6 pb-4 border-b border-border-subtle">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-text-100">Task Progress</h2>
            <p className="text-sm text-text-300 mt-1 truncate">{task.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 -mr-2 -mt-1 rounded-lg flex items-center justify-center text-text-300 hover:text-text-100 hover:bg-bg-700 transition-colors shrink-0"
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Status */}
          <div>
            <label className="text-sm text-text-200 block mb-1.5">Status</label>
            <AppSelect<StatusOption>
              instanceId="progress-modal-status"
              options={statusOptions}
              value={statusOptions.find((o) => o.value === statusId) ?? null}
              onChange={(opt) => setStatusId(opt?.value ?? statusId)}
              isSearchable={false}
              formatOptionLabel={(opt) => (
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                  {opt.label}
                </span>
              )}
            />
          </div>

          {/* Progress section */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm text-text-200">Progress</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={progress}
                  onChange={(e) => setProgress(clampPct(Number(e.target.value) || 0))}
                  className="w-12 h-6 px-1.5 text-center rounded-md bg-bg-700 border border-border-subtle text-xs text-text-100 focus:outline-none focus:border-accent"
                />
                <span className="text-xs text-text-300">%</span>
              </div>
            </div>

            {/* Clickable filled bar */}
            <div
              className="relative h-2 w-full rounded-full bg-bg-600 cursor-pointer overflow-hidden"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pct = Math.round(((e.clientX - rect.left) / rect.width) * 100 / 5) * 5;
                setProgress(clampPct(pct));
              }}
            >
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent-hover)]"
                animate={{ width: `${progress}%` }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </div>

            {/* Quick-pick steps */}
            <div className="flex justify-between mt-1.5">
              {[0, 25, 50, 75, 100].map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setProgress(v)}
                  className={`text-[10px] transition-colors ${
                    progress === v ? 'text-accent font-semibold' : 'text-text-300 hover:text-text-100'
                  }`}
                >
                  {v === 0 ? 'None' : v === 100 ? 'Done' : `${v}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={updateTask.isPending}
            className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <motion.button
            type="button"
            onClick={handleSubmit}
            disabled={updateTask.isPending}
            className="h-9 px-4 rounded-lg text-sm font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: updateTask.isPending ? 1 : 1.02 }}
            whileTap={{ scale: updateTask.isPending ? 1 : 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {updateTask.isPending ? 'Saving…' : 'Submit'}
          </motion.button>
        </div>
      </motion.div>
    </div>,
    document.body,
  );
}
