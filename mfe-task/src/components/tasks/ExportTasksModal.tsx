'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, FileSpreadsheet, FileText } from 'lucide-react';
import { useExportTasks } from '@/lib/hooks/useExportTasks';
import type { ExportFormat } from '@/lib/types/export.types';

interface Props {
  team: { id: string; name: string };
  onClose: () => void;
}

const FORMAT_OPTIONS: { value: ExportFormat; label: string; icon: typeof FileText }[] = [
  { value: 'Csv', label: 'CSV', icon: FileText },
  { value: 'Xlsx', label: 'Excel (.xlsx)', icon: FileSpreadsheet },
];

function slugify(name: string): string {
  return name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'team';
}

export default function ExportTasksModal({ team, onClose }: Props) {
  const exportMutation = useExportTasks();
  const [format, setFormat] = useState<ExportFormat>('Csv');
  const [isIncludeArchiveTask, setIsIncludeArchiveTask] = useState(false);
  const [fileName, setFileName] = useState(`${slugify(team.name)}-tasks-export`);
  const [fileNameTouched, setFileNameTouched] = useState(false);

  const fileNameHasSpaces = /\s/.test(fileName);
  const fileNameError = fileNameTouched && (!fileName.trim() ? 'File name is required' : fileNameHasSpaces ? 'Spaces are not allowed' : '');
  const extension = format === 'Csv' ? '.csv' : '.xlsx';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFileNameTouched(true);
    if (!fileName.trim() || fileNameHasSpaces) return;
    await exportMutation.mutateAsync({
      teamId: team.id,
      fileName,
      format,
      isIncludeArchiveTask,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Dialog */}
      <motion.div
        className="relative w-full max-w-[460px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center shrink-0">
              <Download size={15} className="text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-text-100">Export {team.name} tasks</h2>
              <p className="text-2xs text-text-300 mt-0.5">Download this team&apos;s tasks as a file</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-md text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        {/* Body */}
        <AnimatePresence mode="wait">
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="px-6 py-5 flex flex-col gap-5">
              {/* Format */}
              <div>
                <label className="text-xs font-medium text-text-200 block mb-2">Export format</label>
                <div className="flex flex-col gap-2">
                  {FORMAT_OPTIONS.map(({ value, label, icon: Icon }) => {
                    const selected = format === value;
                    return (
                      <label
                        key={value}
                        htmlFor={`export-format-${value}`}
                        className={`flex items-center gap-3 h-11 px-3 rounded-lg border cursor-pointer transition-colors ${
                          selected
                            ? 'border-accent bg-accent-bg'
                            : 'border-border-subtle bg-bg-700 hover:bg-bg-600'
                        }`}
                      >
                        <input
                          id={`export-format-${value}`}
                          type="radio"
                          name="format"
                          value={value}
                          checked={selected}
                          onChange={() => setFormat(value)}
                          className="w-4 h-4 accent-[var(--color-accent)] cursor-pointer shrink-0"
                        />
                        <Icon size={14} className={selected ? 'text-accent' : 'text-text-300'} strokeWidth={1.5} />
                        <span className={`text-sm ${selected ? 'text-text-100' : 'text-text-200'}`}>{label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* File name */}
              <div>
                <label htmlFor="export-filename" className="text-xs font-medium text-text-200 block mb-1.5">
                  File name
                </label>
                <div className="flex">
                  <input
                    id="export-filename"
                    type="text"
                    autoComplete="off"
                    value={fileName}
                    onChange={e => setFileName(e.target.value)}
                    onBlur={() => setFileNameTouched(true)}
                    className={`flex-1 min-w-0 h-10 px-3 bg-bg-700 border rounded-l-lg border-r-0 text-sm text-text-100 placeholder:text-text-300 focus:outline-none transition-colors ${
                      fileNameError
                        ? 'border-status-red focus:border-status-red'
                        : 'border-border-subtle focus:border-accent'
                    }`}
                  />
                  <span
                    className={`h-10 px-3 flex items-center shrink-0 bg-bg-600 border rounded-r-lg text-sm text-text-300 ${
                      fileNameError ? 'border-status-red' : 'border-border-subtle'
                    }`}
                  >
                    {extension}
                  </span>
                </div>
                {fileNameError && (
                  <p className="text-xs text-status-red mt-1.5">{fileNameError}</p>
                )}
              </div>

              {/* Include archived */}
              <div className="flex items-start gap-3">
                <input
                  id="export-include-archived"
                  type="checkbox"
                  checked={isIncludeArchiveTask}
                  onChange={e => setIsIncludeArchiveTask(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded accent-[var(--color-accent)] cursor-pointer shrink-0"
                />
                <label htmlFor="export-include-archived" className="cursor-pointer select-none">
                  <span className="text-sm text-text-100">Include archived tasks</span>
                  <p className="text-xs text-text-300 mt-0.5 leading-relaxed">
                    Adds tasks whose status was archived or removed from the board.
                  </p>
                </label>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors"
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                disabled={exportMutation.isPending || !fileName.trim() || fileNameHasSpaces}
                className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                <Download size={13} />
                {exportMutation.isPending ? 'Exporting…' : 'Export'}
              </motion.button>
            </div>
          </motion.form>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
