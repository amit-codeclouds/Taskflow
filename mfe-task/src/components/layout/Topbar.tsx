'use client';

import { motion } from 'framer-motion';
import Avatar from '@/components/ui/Avatar';

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 9l2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2C5.8 2 4 3.8 4 6v3.5L2.5 11h11L12 9.5V6c0-2.2-1.8-4-4-4zm-1.5 11a1.5 1.5 0 003 0"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Topbar() {
  return (
    <motion.header
      className="fixed top-0 left-[240px] right-0 h-[60px] bg-bg-800 border-b border-border-subtle z-40 flex items-center justify-between px-6"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
    >
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-text-100 leading-tight">My Tasks</span>
        <span className="text-2xs text-text-300">Track and manage your work</span>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          className="flex items-center gap-2 bg-bg-600 rounded-full h-[34px] px-4 w-[220px] text-sm text-text-300 cursor-text"
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <SearchIcon />
          Search tasks...
        </motion.button>

        <motion.button
          className="relative w-8 h-8 rounded-lg bg-bg-600 flex items-center justify-center text-text-200"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <BellIcon />
          <motion.span
            className="absolute top-1 right-1 w-2 h-2 rounded-full bg-accent"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.button>

        <Avatar initials="AC" size="sm" />
      </div>
    </motion.header>
  );
}
