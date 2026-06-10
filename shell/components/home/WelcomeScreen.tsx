'use client';

import { motion } from 'framer-motion';
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  LayoutDashboard,
  CheckSquare,
  Kanban,
} from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import Badge from '@/components/ui/Badge';

const STATS = [
  { icon: ClipboardList, label: 'Total Tasks',  value: '142', trend: '+12%',    trendPositive: true,  color: 'text-accent',         delay: 0 },
  { icon: Clock3,        label: 'In Progress',  value: '28',  trend: '+3 today', trendPositive: true,  color: 'text-status-amber',   delay: 0.08 },
  { icon: CheckCircle2,  label: 'Completed',    value: '96',  trend: '67%',      trendPositive: true,  color: 'text-status-green',   delay: 0.16 },
  { icon: Kanban,        label: 'Board Items',  value: '18',  trend: '4 cols',   trendPositive: true,  color: 'text-text-200',       delay: 0.24 },
];

const PHASES = [
  { number: 0, label: 'MFE Foundation',   status: 'Active',  variant: 'active'  as const, symbol: '✓' },
  { number: 1, label: 'Identity + Tasks', status: 'Next',    variant: 'next'    as const, symbol: '○' },
  { number: 2, label: 'Board + Kanban',   status: 'Planned', variant: 'planned' as const, symbol: '○' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

export default function WelcomeScreen() {
  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">

      {/* Greeting row */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col gap-2">
          <span className="inline-flex items-center gap-1.5 bg-accent-bg text-accent-hover text-2xs font-medium px-3 py-1 rounded-full w-fit">
            Phase 0 · MFE Foundation
          </span>
          <h1 className="text-3xl font-semibold text-text-100 leading-tight">
            {getGreeting()}, Arkabrata
          </h1>
          <p className="text-sm text-text-300">Here&apos;s what&apos;s happening today.</p>
        </div>
        <span className="text-sm text-text-300 pt-1 shrink-0">{formatDate()}</span>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Quick access */}
      <div className="flex flex-col gap-4">
        <motion.p
          className="text-2xs text-text-300 tracking-widest uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          Quick Access
        </motion.p>

        <div className="grid grid-cols-2 gap-4">
          <motion.div
            className="bg-bg-700 rounded-card p-6 border border-border-subtle flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.38 }}
            whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-accent-bg flex items-center justify-center text-accent">
              <CheckSquare size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-text-100">Task Management</h3>
              <p className="text-sm text-text-200 leading-relaxed">
                Create, assign and track tasks across your team. Status updates, priorities, and due dates.
              </p>
            </div>
            <a href="/tasks">
              <motion.span
                className="inline-flex items-center gap-1.5 bg-accent text-white text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer w-fit"
                whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(97,85,221,0.35)' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                Go to Tasks →
              </motion.span>
            </a>
          </motion.div>

          <motion.div
            className="bg-bg-700 rounded-card p-6 border border-border-subtle flex flex-col gap-4"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.43 }}
            whileHover={{ y: -2, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
          >
            <div className="w-10 h-10 rounded-xl bg-bg-600 flex items-center justify-center text-text-200">
              <LayoutDashboard size={20} strokeWidth={1.5} />
            </div>
            <div className="flex flex-col gap-1.5">
              <h3 className="text-base font-semibold text-text-100">Kanban Board</h3>
              <p className="text-sm text-text-200 leading-relaxed">
                Visualise your workflow. Drag and drop tasks across columns. Track sprint progress.
              </p>
            </div>
            <a href="/board">
              <motion.span
                className="inline-flex items-center gap-1.5 border border-border-subtle text-text-100 text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer w-fit"
                whileHover={{ scale: 1.02, borderColor: '#6155DD', color: '#6155DD' }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                Go to Board →
              </motion.span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Project timeline */}
      <div className="pt-4 border-t border-border-subtle">
        <motion.p
          className="text-2xs text-text-300 tracking-widest uppercase mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Project Timeline
        </motion.p>
        <div className="grid grid-cols-3 gap-4">
          {PHASES.map((phase, index) => (
            <motion.div
              key={phase.number}
              className={`flex flex-col gap-2 p-4 rounded-card ${
                phase.variant === 'active' ? 'bg-green-bg' : 'bg-bg-600'
              }`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.52 + index * 0.08 }}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-2xs font-medium tracking-widest uppercase ${
                    phase.variant === 'active' ? 'text-status-green' : 'text-text-300'
                  }`}
                >
                  Phase {phase.number}
                </span>
                <Badge label={phase.status} variant={phase.variant} />
              </div>
              <p
                className={`text-sm font-medium ${
                  phase.variant === 'active' ? 'text-status-green' : 'text-text-300'
                }`}
              >
                {phase.symbol}  {phase.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
