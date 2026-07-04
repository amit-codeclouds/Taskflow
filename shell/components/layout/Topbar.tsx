'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { SettingsIcon } from 'lucide-react';

function getPageInfo(pathname: string): { title: string; subtitle: string } {
  if (pathname.startsWith('/tasks'))    return { title: 'Tasks',    subtitle: 'Manage your work' };
  if (pathname.startsWith('/board'))    return { title: 'Board',    subtitle: 'Visualise your workflow' };
  if (pathname.startsWith('/teams'))    return { title: 'Teams',    subtitle: 'Your team members' };
  if (pathname.startsWith('/people'))   return { title: 'People',   subtitle: 'Contacts and roles' };
  if (pathname.startsWith('/settings')) return { title: 'Settings', subtitle: 'Preferences' };
  if (pathname.startsWith('/profile'))  return { title: 'My Profile', subtitle: 'View and manage your personal information and roles' };
  return { title: 'Home', subtitle: 'Your workspace at a glance' };
}

function BellIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 2C5.8 2 4 3.8 4 6v3.5L2.5 11h11L12 9.5V6c0-2.2-1.8-4-4-4zm-1.5 11a1.5 1.5 0 003 0"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ChevronDownIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }}
    >
      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M2 12.5c0-2.5 2.2-4 5-4s5 1.5 5 4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M5.5 2H3a1 1 0 00-1 1v8a1 1 0 001 1h2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 9.5L12 7l-3-2.5M5.5 7h6.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Topbar() {
  const pathname = usePathname();
  const user = useAuth();
  const { title, subtitle } = getPageInfo(pathname);

  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      window.location.href = '/login';
    }
  }

  const initials = user.initials || 'U';

  return (
    <motion.header
      className="fixed top-0 left-[240px] right-0 h-[60px] bg-bg-800 border-b border-border-subtle z-40 flex items-center justify-between px-6"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.1 }}
    >
      {/* Page title */}
      <div className="flex items-baseline gap-2.5">
        <span className="text-xl font-semibold text-text-100 leading-none">{title}</span>
        <span className="text-xs text-text-300">{subtitle}</span>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-3">
        {/* Bell — commented out for now
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
        */}

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <motion.button
            onClick={() => setOpen(o => !o)}
            className="flex items-center gap-1.5 rounded-lg px-1.5 py-1 hover:bg-bg-700 transition-colors"
            whileHover={{ scale: 1.01 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          >
            <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold select-none">
              {initials}
            </div>
            <span className="text-text-300">
              <ChevronDownIcon open={open} />
            </span>
          </motion.button>

          <AnimatePresence>
            {open && (
              <motion.div
                className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-bg-800 rounded-xl border border-border-subtle shadow-elevated z-50 overflow-hidden"
                initial={{ opacity: 0, y: -8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.96 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              >
                {/* User info header */}
                <div className="px-4 py-3 border-b border-border-subtle">
                  <p className="text-sm font-medium text-text-100 truncate capitalize">
                    {user.name || 'User'}
                  </p>
                  <p className="text-2xs text-text-300 truncate mt-0.5">
                    {user.email || ''}
                  </p>
                </div>

                {/* Menu items */}
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                  >
                    <ProfileIcon />
                    Profile
                  </Link>

                  <div className="mx-3 my-1 h-px bg-border-subtle" />

                  <Link
                    href="/settings"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
                  >
                    <SettingsIcon size={16} />
                    Settings
                  </Link>

                  <div className="mx-3 my-1 h-px bg-border-subtle" />

                  <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-status-red hover:bg-red-bg transition-colors disabled:opacity-60"
                  >
                    <LogoutIcon />
                    {loggingOut ? 'Signing out…' : 'Sign out'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.header>
  );
}
