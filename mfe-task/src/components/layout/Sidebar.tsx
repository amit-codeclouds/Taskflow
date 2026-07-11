'use client';

import { motion } from 'framer-motion';
import { LayoutDashboard, KanbanSquare, User, Settings } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { useAuth } from '@/lib/useAuth';

type NavItem = { label: string; href: string; icon: React.ReactNode };

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: 'Task Board', href: '/board', icon: <KanbanSquare size={16} strokeWidth={1.5} /> },
];

function NavLink({ label, href, icon, isActive, index }: NavItem & { isActive: boolean; index: number }) {
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
      <a href={href} className="block">{inner}</a>
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

      {/* Bottom — My Profile / Settings (owned by the shell zone) */}
      <div className="shrink-0">
        <div className="mx-4 h-px bg-border-subtle" />
        <div className="mx-2 my-1.5">
          <a href="/profile" className="block">
            <span className="relative flex items-center gap-3 h-10 px-4 rounded-lg text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors">
              <User size={16} strokeWidth={1.5} className="shrink-0" />
              <span>My Profile</span>
            </span>
          </a>
          <a href="/settings" className="block">
            <span className="relative flex items-center gap-3 h-10 px-4 rounded-lg text-sm text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors">
              <Settings size={16} strokeWidth={1.5} className="shrink-0" />
              <span>Settings</span>
            </span>
          </a>
        </div>
        <div className="mx-4 h-px bg-border-subtle" />
        <a href="/settings" className="block">
          <motion.div className="h-[68px] flex items-center gap-3 px-4 cursor-pointer hover:bg-bg-700 transition-colors" whileHover={{ x: 2 }}>
            <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0 select-none">
              {user.initials || '??'}
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-text-100 truncate capitalize">
                {user.name || 'User'}
              </span>
              <span className="text-2xs text-text-300 truncate">{user.email || ''}</span>
            </div>
            <Settings size={13} className="text-text-300 shrink-0" strokeWidth={1.5} />
          </motion.div>
        </a>
      </div>
    </motion.aside>
  );
}
