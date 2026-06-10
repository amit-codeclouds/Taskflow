'use client';

import { motion } from 'framer-motion';
import Badge from '@/components/ui/Badge';

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 30 } },
};

function CheckSquareIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
      <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 12l3 3 5-6" stroke="currentColor" strokeWidth="1.5"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-accent">
      <rect x="3" y="3" width="7" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="3" width="7" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const PHASES = [
  { number: 0, label: 'MFE Foundation',   status: 'Active',  variant: 'active'  as const, symbol: '✓' },
  { number: 1, label: 'Identity + Tasks', status: 'Next',    variant: 'next'    as const, symbol: '○' },
  { number: 2, label: 'Board + Kanban',   status: 'Planned', variant: 'planned' as const, symbol: '○' },
];

export default function WelcomeScreen() {
  return (
    <div className="max-w-4xl mx-auto">
      <motion.div variants={container} initial="hidden" animate="show" className="flex flex-col gap-4">
        <motion.div variants={item}>
          <span className="inline-flex items-center gap-1.5 bg-accent-bg text-accent-hover text-2xs font-medium px-3 py-1 rounded-full">
            Phase 0 · MFE Foundation
          </span>
        </motion.div>

        <motion.h1 variants={item} className="text-4xl font-semibold text-text-100 leading-tight">
          Welcome to Taskflow
        </motion.h1>

        <motion.p variants={item} className="text-text-200 text-base max-w-lg leading-relaxed">
          A premium task management platform built for modern engineering teams.
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 gap-4 mt-10">
        <motion.div
          className="bg-bg-700 rounded-card p-6 border border-border-subtle flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
          whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <CheckSquareIcon />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-semibold text-text-100">Task Management</h3>
            <p className="text-sm text-text-200 leading-relaxed">
              Create, assign and track tasks across your team. Status updates, priorities, and due dates.
            </p>
          </div>
          <a href="/tasks">
            <motion.span
              className="inline-flex items-center gap-1.5 bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(97,85,221,0.3)' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              Go to Tasks →
            </motion.span>
          </a>
        </motion.div>

        <motion.div
          className="bg-bg-700 rounded-card p-6 border border-border-subtle flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.35 }}
          whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
        >
          <LayoutIcon />
          <div className="flex flex-col gap-1.5">
            <h3 className="text-base font-semibold text-text-100">Kanban Board</h3>
            <p className="text-sm text-text-200 leading-relaxed">
              Visualise your workflow. Drag and drop tasks across columns. Track sprint progress.
            </p>
          </div>
          <a href="/board">
            <motion.span
              className="inline-flex items-center gap-1.5 border border-border-subtle text-text-100 text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer"
              whileHover={{ scale: 1.02, borderColor: '#6155DD' }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            >
              Go to Board →
            </motion.span>
          </a>
        </motion.div>
      </div>

      <div className="mt-10 pt-8 border-t border-border-subtle">
        <div className="grid grid-cols-3 gap-4">
          {PHASES.map((phase, index) => (
            <motion.div
              key={phase.number}
              className={`flex flex-col gap-2 p-4 rounded-card ${phase.variant === 'active' ? 'bg-green-bg' : 'bg-bg-600'}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="flex items-center justify-between">
                <span className={`text-2xs font-medium tracking-widest uppercase ${phase.variant === 'active' ? 'text-status-green' : 'text-text-300'}`}>
                  Phase {phase.number}
                </span>
                <Badge label={phase.status} variant={phase.variant} />
              </div>
              <p className={`text-sm font-medium ${phase.variant === 'active' ? 'text-status-green' : 'text-text-300'}`}>
                {phase.symbol}  {phase.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
