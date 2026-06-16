'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/lib/useAuth';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V6.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function KanbanIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="4" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="2" width="4" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="8" y="10" width="4" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

type NavItem = { label: string; href: string; icon: React.ReactNode; crossZone?: boolean };

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: <HomeIcon />, crossZone: true },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: 'Board', href: '/board', icon: <KanbanIcon />, crossZone: true },
];

function NavLink({ label, href, icon, isActive, index, crossZone }: NavItem & { isActive: boolean; index: number }) {
  const inner = (
    <span className={`relative flex items-center gap-3 h-11 px-4 rounded-lg text-sm transition-colors ${
      isActive ? 'bg-accent-bg text-accent-hover font-medium' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
    }`}>
      {isActive && (
        <motion.span layoutId="activeNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />
      )}
      <span className="shrink-0 w-4 h-4">{icon}</span>
      <span>{label}</span>
    </span>
  );

  return (
    <motion.div
      className="mx-2"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 + index * 0.04 }}
      whileHover={isActive ? undefined : { x: 4 }}
    >
      {crossZone ? (
        <a href={href} className="block">{inner}</a>
      ) : (
        <Link href={href} className="block">{inner}</Link>
      )}
    </motion.div>
  );
}

export default function Sidebar() {
  const user = useAuth();

  return (
    <motion.aside
      className="fixed left-0 top-0 w-[240px] h-screen bg-bg-800 flex flex-col z-50 overflow-hidden"
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute left-0 top-0 w-[3px] h-full bg-accent" />

      <div className="h-16 flex items-center px-5 shrink-0"><Logo /></div>
      <div className="mx-4 h-px bg-border-subtle shrink-0" />

      {/* Workspace indicator */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-700 border border-border-subtle">
          <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-white shrink-0" style={{ fontSize: 10, fontWeight: 700 }}>
            {user.initials?.[0] ?? 'W'}
          </div>
          <p className="text-xs font-medium text-text-100 truncate">
            {user.name ? `${user.name.split(' ')[0]}'s Workspace` : 'My Workspace'}
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 pb-2">
        {/* Workspace group */}
        <div className="pb-1.5 px-5">
          <p className="text-2xs text-text-300 tracking-widest uppercase">Workspace</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {WORKSPACE_ITEMS.map((item, i) => (
            <NavLink key={item.href} {...item} isActive={false} index={i} />
          ))}
        </nav>

        {/* Tools group */}
        <div className="mt-5">
          <div className="mx-4 mb-2 h-px bg-border-subtle" />
          <div className="pb-1.5 px-5">
            <p className="text-2xs text-text-300 tracking-widest uppercase">Tools</p>
          </div>
          <nav className="flex flex-col gap-0.5">
            {TOOLS_ITEMS.map((item, i) => (
              <NavLink key={item.href} {...item} isActive={false} index={WORKSPACE_ITEMS.length + i} />
            ))}
          </nav>
        </div>
      </div>

      {/* Bottom user card */}
      <div className="shrink-0">
        <div className="mx-4 h-px bg-border-subtle" />
        <motion.div
          className="h-[68px] flex items-center gap-3 px-4 cursor-default"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0 select-none">
            {user.initials || '??'}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium text-text-100 truncate capitalize">
              {user.name || 'User'}
            </span>
            <span className="text-2xs text-text-300 truncate">{user.email || ''}</span>
          </div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
