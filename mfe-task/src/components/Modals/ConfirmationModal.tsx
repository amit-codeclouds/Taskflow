'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

interface Props {
  title: string;
  description?: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({
  title,
  description,
  confirmLabel = 'Confirm',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onCancel}
      />

      <motion.div
        className="relative w-full max-w-[380px] mx-4 bg-bg-800 rounded-xl border border-border-subtle shadow-elevated"
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      >
        <div className="p-6">
          {danger && (
            <div className="w-10 h-10 rounded-full bg-red-bg flex items-center justify-center mb-4">
              <AlertTriangle size={18} className="text-status-red" strokeWidth={1.5} />
            </div>
          )}
          <h2 className="text-base font-semibold text-text-100">{title}</h2>
          {description && (
            <p className="text-sm text-text-300 mt-1.5 leading-relaxed">{description}</p>
          )}
        </div>

        <div className="px-6 pb-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="h-9 px-4 rounded-lg text-sm font-medium text-text-200 bg-bg-700 hover:bg-bg-600 transition-colors"
          >
            Cancel
          </button>
          <motion.button
            onClick={onConfirm}
            className={`h-9 px-4 rounded-lg text-sm font-medium text-white transition-colors ${
              danger
                ? 'bg-status-red hover:opacity-90'
                : 'bg-accent hover:bg-accent-hover'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {confirmLabel}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
