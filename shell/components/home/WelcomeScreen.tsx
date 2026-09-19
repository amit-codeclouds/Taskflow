'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClipboardList, Archive, Users, Building2 } from 'lucide-react';
import StatCard from '@/components/ui/stat-card';
import { useUserStats } from '@/lib/hooks/useUserStats';
import { useMe } from '@/lib/hooks/useMe';
import type { MeStats } from '@/lib/types/auth.types';

// Same lucide "Sparkle" glyph used by the sidebar's Task Assistant nav item and
// the /chat loading screen, so the AI mark reads as one consistent motif.
const SPARKLE_PATH = 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z';

// Presentation config for each stat card; the value is derived from GET /auth/me/stats.
// Every accessor is null-safe and defaults missing keys to 0.
const STAT_CONFIG = [
  { icon: ClipboardList, label: 'Total Tasks',     color: 'text-accent',       delay: 0,    value: (s?: MeStats) => (s?.taskCount?.activeTasks ?? 0) + (s?.taskCount?.archieveTask ?? 0) },
  { icon: Archive,       label: 'Archived Task',   color: 'text-status-amber', delay: 0.08, value: (s?: MeStats) => s?.taskCount?.archieveTask ?? 0 },
  { icon: Users,         label: 'Total Team',      color: 'text-status-green', delay: 0.16, value: (s?: MeStats) => s?.teamCount ?? 0 },
  { icon: Building2,     label: 'Total Workspace', color: 'text-text-200',     delay: 0.24, value: (s?: MeStats) => s?.workspaceCount ?? 0 },
] as const;

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

// ─── Task MFE preview mockup ────────────────────────────────────────────────

function TasksPreview() {
  const rows = [
    { dot: 'var(--color-status-red)', title: 'Implement authentication flow',  badge: 'In Progress', badgeBg: 'var(--color-accent-bg)', badgeColor: 'var(--color-accent-hover)' },
    { dot: 'var(--color-status-amber)', title: 'Design onboarding screens',      badge: 'Review',      badgeBg: 'var(--color-amber-bg)', badgeColor: 'var(--color-status-amber)' },
    { dot: 'var(--color-status-red)', title: 'Fix navigation bug on mobile',   badge: 'In Progress', badgeBg: 'var(--color-accent-bg)', badgeColor: 'var(--color-accent-hover)' },
    { dot: 'var(--color-bg-500)', title: 'Write API documentation',        badge: 'To Do',       badgeBg: 'var(--color-bg-700)', badgeColor: 'var(--color-text-300)' },
  ];

  return (
    <div className="absolute inset-0 p-4 flex flex-col gap-2.5 overflow-hidden">
      {/* Mini topbar */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex flex-col gap-0.5">
          <div className="h-2 w-14 bg-text-100 rounded-full opacity-70" />
          <div className="h-1.5 w-20 bg-text-300 rounded-full opacity-40" />
        </div>
        <div className="h-5 w-16 rounded-md bg-accent opacity-80 flex items-center justify-center gap-1 px-1.5">
          <div className="w-1.5 h-1.5 border border-white rounded-sm opacity-80" />
          <div className="h-1 w-7 bg-white rounded-full opacity-70" />
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-4 gap-1.5">
        {['var(--color-accent-hover)', 'var(--color-status-amber)', 'var(--color-status-amber)', 'var(--color-status-green)'].map((c, i) => (
          <div key={i} className="bg-bg-800 rounded border border-border-subtle p-1.5">
            <div className="h-1 w-5 bg-text-300 rounded-full opacity-40 mb-1" />
            <div className="h-3" style={{ color: c }}>
              <div className="h-full w-4 rounded-sm opacity-70" style={{ background: c }} />
            </div>
          </div>
        ))}
      </div>

      {/* Mini task rows */}
      <div className="bg-bg-800 rounded-lg border border-border-subtle overflow-hidden flex-1">
        {rows.map((row, i) => (
          <div
            key={i}
            className={`flex items-center gap-2 px-2.5 py-2 ${i < rows.length - 1 ? 'border-b border-border-subtle' : ''}`}
          >
            <div className="w-2.5 h-2.5 rounded border border-bg-500 shrink-0" />
            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.dot }} />
            <div className="flex-1 h-1.5 bg-text-300 rounded-full opacity-30" />
            <div
              className="text-[8px] font-medium px-1.5 py-0.5 rounded-full shrink-0"
              style={{ background: row.badgeBg, color: row.badgeColor }}
            >
              {row.badge}
            </div>
            <div className="w-4 h-4 rounded-full bg-accent-bg flex items-center justify-center text-accent shrink-0"
              style={{ fontSize: 6, fontWeight: 700 }}>AC</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Board MFE preview mockup ────────────────────────────────────────────────

function BoardPreview() {
  const cols = [
    {
      title: 'To Do',     dot: 'var(--color-text-300)',
      cards: [
        { label: 'feature', labelColor: 'var(--color-accent-hover)', dot: 'var(--color-status-amber)' },
        { label: 'bug',     labelColor: 'var(--color-status-red)', dot: 'var(--color-status-red)' },
      ],
    },
    {
      title: 'In Progress', dot: 'var(--color-accent)',
      cards: [
        { label: 'feature', labelColor: 'var(--color-accent-hover)', dot: 'var(--color-status-red)' },
        { label: 'infra',   labelColor: 'var(--color-status-green)', dot: 'var(--color-status-amber)' },
      ],
    },
    {
      title: 'Done', dot: 'var(--color-status-green)',
      cards: [
        { label: 'infra',   labelColor: 'var(--color-status-green)', dot: 'var(--color-status-red)' },
      ],
    },
  ];

  return (
    <div className="absolute inset-0 p-4 flex flex-col gap-3 overflow-hidden">
      {/* Mini board header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <div className="h-2 w-20 bg-text-100 rounded-full opacity-70" />
          <div className="h-1.5 w-28 bg-accent rounded-full opacity-40" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-5 w-12 rounded-md bg-bg-800 border border-border-subtle" />
          <div className="h-5 w-14 rounded-md bg-accent opacity-80" />
        </div>
      </div>

      {/* Mini columns */}
      <div className="grid grid-cols-3 gap-2 flex-1">
        {cols.map((col) => (
          <div key={col.title} className="bg-bg-800 rounded-lg border border-border-subtle p-2 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: col.dot }} />
              <div className="h-1.5 w-10 bg-text-100 rounded-full opacity-50" />
              <div className="h-3.5 w-3.5 rounded bg-bg-700 text-[7px] text-text-300 flex items-center justify-center ml-auto">
                {col.cards.length}
              </div>
            </div>
            {col.cards.map((card, ci) => (
              <div key={ci} className="bg-bg-700 rounded-lg border border-border-subtle p-1.5 flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div
                    className="text-[7px] font-medium px-1 py-px rounded-full"
                    style={{ background: `color-mix(in srgb, ${card.labelColor} 13%, transparent)`, color: card.labelColor }}
                  >
                    {card.label}
                  </div>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: card.dot }} />
                </div>
                <div className="h-1 w-full bg-text-300 rounded-full opacity-20" />
                <div className="h-1 w-3/4 bg-text-300 rounded-full opacity-20" />
                <div className="flex items-center justify-between mt-0.5">
                  <div className="h-1 w-6 bg-text-300 rounded-full opacity-30 font-mono" />
                  <div className="w-3 h-3 rounded-full bg-accent-bg" style={{ fontSize: 5, color: 'var(--color-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>AC</div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Task Assistant banner ──────────────────────────────────────────────────

function AssistantBanner() {
  return (
    <motion.div
      className="relative overflow-hidden rounded-xl border border-border-subtle"
      style={{ background: 'linear-gradient(120deg, color-mix(in srgb, var(--color-accent) 9%, var(--color-bg-700)), var(--color-bg-700) 65%)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{
        opacity: 1,
        y: 0,
        boxShadow: [
          '0 0 0 1px rgba(97,85,221,0.12), 0 0 0 0 rgba(97,85,221,0)',
          '0 0 0 1px rgba(97,85,221,0.22), 0 0 24px 2px rgba(97,85,221,0.1)',
          '0 0 0 1px rgba(97,85,221,0.12), 0 0 0 0 rgba(97,85,221,0)',
        ],
      }}
      transition={{
        opacity: { type: 'spring', stiffness: 300, damping: 30, delay: 0.26 },
        y: { type: 'spring', stiffness: 300, damping: 30, delay: 0.26 },
        boxShadow: { duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 },
      }}
    >
      {/* Decorative sparkles — twinkle, never spin */}
      <motion.svg
        className="absolute top-3 right-20" width="16" height="16" viewBox="0 0 24 24" fill="var(--color-accent-hover)"
        animate={{ opacity: [0.25, 0.9, 0.25], scale: [0.8, 1.05, 0.8] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <path d={SPARKLE_PATH} />
      </motion.svg>
      <motion.svg
        className="absolute bottom-4 right-44" width="10" height="10" viewBox="0 0 24 24" fill="var(--color-accent)"
        animate={{ opacity: [0.15, 0.7, 0.15], scale: [0.75, 1, 0.75] }}
        transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
      >
        <path d={SPARKLE_PATH} />
      </motion.svg>

      <div className="relative flex items-center gap-5 px-6 py-5">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'color-mix(in srgb, var(--color-accent) 16%, transparent)', color: 'var(--color-accent)' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d={SPARKLE_PATH} /></svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-base font-semibold text-text-100">Task Assistant</h3>
            <span
              className="text-2xs font-semibold tracking-wide px-2 py-0.5 rounded-full shrink-0"
              style={{ background: 'var(--color-accent)', color: '#fff' }}
            >
              AI Agent
            </span>
          </div>
          <p className="text-sm text-text-200 leading-relaxed">
            Create, update, or delete tasks in plain language, ask about anything across your tasks, teams, and boards, or get help using Taskflow itself — your assistant knows your workspace.
          </p>
        </div>

        <Link href="/chat" className="shrink-0">
          <motion.span
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2.5 rounded-lg text-white whitespace-nowrap"
            style={{ background: 'var(--color-accent)' }}
            whileHover={{ scale: 1.02, boxShadow: '0 0 20px rgba(97,85,221,0.33)' }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            Chat Now
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.span>
        </Link>
      </div>
    </motion.div>
  );
}

// ─── App showcase card ────────────────────────────────────────────────────────

interface AppCardProps {
  href: string;
  accentColor: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  cta: string;
  preview: React.ReactNode;
  delay: number;
  variant: 'primary' | 'secondary';
}

function AppCard({ href, icon, title, description, cta, preview, delay, variant, accentColor }: AppCardProps) {
  return (
    <motion.div
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden flex flex-col group"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 28, delay }}
      whileHover={{ y: -3, boxShadow: `var(--shadow-elevated), 0 0 0 1px color-mix(in srgb, ${accentColor} 20%, transparent)` }}
    >
      {/* Preview area */}
      <div className="relative h-52 bg-bg-900 overflow-hidden">
        {/* Gradient overlay at bottom so preview fades into card body */}
        <div className="absolute inset-x-0 bottom-0 h-16 z-10"
          style={{ background: 'linear-gradient(to bottom, transparent, var(--color-bg-700))' }} />
        {/* Subtle top accent line */}
        <div className="absolute top-0 inset-x-0 h-[2px] z-10" style={{ background: accentColor }} />
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.04, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: delay + 0.1 }}
        >
          {preview}
        </motion.div>
      </div>

      {/* Card body */}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: `color-mix(in srgb, ${accentColor} 13%, transparent)`, color: accentColor }}>
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-100">{title}</h3>
            </div>
          </div>
          <motion.div
            className="w-6 h-6 rounded-full flex items-center justify-center text-text-300"
            animate={{ x: [0, 3, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: delay + 0.5 }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.div>
        </div>
        <p className="text-sm text-text-200 leading-relaxed">{description}</p>
        <a href={href} className="mt-auto block">
          <motion.span
            className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg w-fit transition-colors"
            style={
              variant === 'primary'
                ? { background: accentColor, color: '#fff' }
                : { background: 'transparent', border: `1px solid var(--color-border-subtle)`, color: 'var(--color-text-100)' }
            }
            whileHover={
              variant === 'primary'
                ? { scale: 1.02, boxShadow: `0 0 20px color-mix(in srgb, ${accentColor} 33%, transparent)` }
                : { scale: 1.02, borderColor: accentColor, color: accentColor }
            }
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            {cta}
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6h7M6.5 3l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </motion.span>
        </a>
      </div>
    </motion.div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const { data: stats } = useUserStats();
  const { data: me } = useMe();

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-8">

      {/* Greeting */}
      <motion.div
        className="flex items-start justify-between"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold text-text-100 leading-tight">
            {getGreeting()}{me?.name ? `, ${me.name}` : ''}
          </h1>
          <p className="text-sm text-text-300">Here&apos;s what&apos;s happening today.</p>
        </div>
        <span className="text-sm text-text-300 pt-1 shrink-0">{formatDate()}</span>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-4">
        {STAT_CONFIG.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            color={stat.color}
            delay={stat.delay}
            value={String(stat.value(stats))}
          />
        ))}
      </div>

      {/* Task Assistant banner */}
      <AssistantBanner />

      {/* App showcase */}
      <div className="flex flex-col gap-4">
        <motion.div
          className="flex items-center justify-between"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <p className="text-2xs text-text-300 tracking-widest uppercase">Your Apps</p>
          <p className="text-xs text-text-300">Click to open</p>
        </motion.div>

        <div className="grid grid-cols-2 gap-5">
          <AppCard
            href="/tasks"
            accentColor="var(--color-accent)"
            variant="primary"
            icon={
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            }
            title="Task Management"
            description="Create, prioritise, and track tasks. Filter by status, assign to teammates, and stay on top of due dates."
            cta="Open Tasks"
            preview={<TasksPreview />}
            delay={0.32}
          />
          <AppCard
            href="/board"
            accentColor="var(--color-status-green)"
            variant="secondary"
            icon={
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none">
                <rect x="2" y="2" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
                <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3"/>
              </svg>
            }
            title="Kanban Board"
            description="Visualise your workflow across sprint columns. Drag tasks between stages and track team progress at a glance."
            cta="Open Board"
            preview={<BoardPreview />}
            delay={0.4}
          />
        </div>
      </div>

    </div>
  );
}
