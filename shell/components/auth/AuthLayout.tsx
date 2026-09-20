'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { KanbanSquare, Users, Sparkles, ListChecks } from 'lucide-react';

const FEATURES = [
  { icon: ListChecks, text: 'Track every task with clear ownership and status' },
  { icon: KanbanSquare, text: 'Visualise work on a real-time Kanban board' },
  { icon: Users, text: 'Bring your whole team into one shared workspace' },
  { icon: Sparkles, text: 'Get help from your built-in AI Task Assistant' },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg-900 flex">
      {/* Banner — hidden below lg, left column on larger screens */}
      <div className="hidden lg:flex lg:w-[46%] xl:w-[42%] relative flex-col justify-between bg-bg-800 border-r border-border-subtle px-14 py-12 overflow-hidden">
        <div
          className="pointer-events-none absolute -top-24 -left-24 w-[420px] h-[420px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6155DD 0%, transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute -bottom-32 -right-16 w-[380px] h-[380px] rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6155DD 0%, transparent 70%)' }}
        />

        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="relative flex items-center gap-3"
        >
          <Image src="/brand/icon-mark.png" alt="Taskflow" width={56} height={56} priority style={{ height: 56, width: 56 }} />
          <div className="flex flex-col leading-none">
            <span className="text-text-100 font-semibold text-2xl tracking-tight">Taskflow</span>
            <span className="text-text-300 text-xs font-medium tracking-[0.08em] mt-1">WORKSPACE &amp; COLLABORATION</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.1 }}
          className="relative"
        >
          <div className="relative w-[132px] h-[132px] mb-8">
            <div
              className="pointer-events-none absolute inset-[-20px] rounded-full opacity-40 blur-2xl"
              style={{ background: 'radial-gradient(circle, #6155DD 0%, transparent 72%)' }}
            />
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <Image src="/brand/icon-mark.png" alt="Taskflow" width={132} height={132} priority style={{ height: 132, width: 132 }} />
            </motion.div>
          </div>
          <h2 className="text-3xl font-semibold text-text-100 leading-tight max-w-[380px]">
            Where your team plans, tracks, and ships work together.
          </h2>
          <ul className="mt-10 flex flex-col gap-5">
            {FEATURES.map(({ icon: Icon, text }, i) => (
              <motion.li
                key={text}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 260, damping: 28, delay: 0.15 + i * 0.06 }}
                className="flex items-center gap-3 text-sm text-text-200"
              >
                <span className="shrink-0 w-8 h-8 rounded-lg bg-accent-bg flex items-center justify-center text-accent-hover">
                  <Icon size={16} strokeWidth={1.75} />
                </span>
                {text}
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <p className="relative text-xs text-text-300">© {new Date().getFullYear()} Taskflow. All rights reserved.</p>
      </div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px]">
          {/* Compact logo — only visible when the banner is hidden (mobile/tablet) */}
          <motion.div
            className="flex items-center justify-center gap-3 mb-8 lg:hidden"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.05 }}
          >
            <Image src="/brand/icon-mark.png" alt="Taskflow" width={56} height={56} priority style={{ height: 56, width: 56 }} />
            <span className="text-text-100 font-semibold text-2xl tracking-tight">Taskflow</span>
          </motion.div>

          {children}
        </div>
      </div>
    </div>
  );
}
