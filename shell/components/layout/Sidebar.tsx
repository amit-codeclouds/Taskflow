'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, UserCircle2, Settings, KanbanSquare, User, ChevronRight, Sparkles, Sparkle } from 'lucide-react';
import Skeleton from 'react-loading-skeleton';
import Logo from '@/components/ui/Logo';
import Avatar from '@/components/ui/Avatar';
import { useAuth } from '@/lib/useAuth';

type NavItem = { label: string; href: string; icon: React.ReactNode; external?: boolean; highlight?: boolean };

const WORKSPACE_ITEMS: NavItem[] = [
  { label: 'Home', href: '/', icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
];

// Task Assistant is the AI agentic assistant (can create/edit tasks and answer
// task questions) — visually distinct from plain nav links so it reads as a
// different kind of thing, not just another page.
const WORKSPACE_TRAILING_ITEMS: NavItem[] = [
  { label: 'Task Assistant', href: '/chat', icon: <Sparkles size={16} strokeWidth={1.5} />, highlight: true },
];

const TEAMS_CHILDREN = [
  { label: 'Workspace Teams', href: '/teams' },
  { label: 'Assigned Teams', href: '/teams/assigned' },
];

const CONTRIBUTORS_CHILDREN = [
  { label: 'People', href: '/people' },
  { label: 'Pending Invitations', href: '/invite' },
];

const TOOLS_ITEMS: NavItem[] = [
  { label: 'Task Board', href: '/board', icon: <KanbanSquare size={16} strokeWidth={1.5} />, external: true },
  { label: 'My Tasks', href: '/tasks', icon: <KanbanSquare size={16} strokeWidth={1.5} />, external: true },
];

function NavLink({ label, href, icon, isActive, index, external, highlight }: NavItem & { isActive: boolean; index: number }) {
  const pill = (
    <span className={`relative flex items-center gap-3 h-11 px-4 rounded-[7px] text-sm transition-colors ${
      highlight
        ? `bg-bg-800 ${isActive ? 'bg-gradient-to-r from-accent/20 to-accent/5' : 'bg-gradient-to-r from-accent/8 to-bg-800 hover:from-accent/14'} text-accent-hover font-medium`
        : isActive
          ? 'bg-accent-bg text-accent-hover font-medium'
          : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
    }`}>
      {isActive && <motion.span layoutId="activeNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />}
      <span className="shrink-0 w-4 h-4">{icon}</span>
      <span className="flex-1">{label}</span>
      {highlight && (
        <span className="shrink-0 text-accent-hover">
          <Sparkle size={12} strokeWidth={1.5} fill="currentColor" />
        </span>
      )}
    </span>
  );

  // Highlighted (AI) items get a glowing conic-gradient ring spinning behind
  // the pill — two opposite bright arcs sweeping over a dim ring that's always
  // visible around the full perimeter (not fully transparent in between, so
  // the border never has a "gap" while the bright arcs are elsewhere).
  // A 1px inset reveals it as a border.
  const inner = highlight ? (
    <span className="relative block rounded-lg p-px overflow-hidden">
      <motion.span
        className="absolute inset-0"
        style={{
          background: 'conic-gradient(from 0deg, rgba(97,85,221,0.35) 0%, var(--color-accent) 6%, rgba(97,85,221,0.35) 18%, rgba(97,85,221,0.35) 50%, var(--color-accent) 56%, rgba(97,85,221,0.35) 68%, rgba(97,85,221,0.35) 100%)',
          filter: 'drop-shadow(0 0 3px var(--color-accent))',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />
      {pill}
    </span>
  ) : pill;

  return (
    <motion.div
      className="mx-2"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 + index * 0.04 }}
      whileHover={isActive ? undefined : { x: 4 }}
    >
      {external ? (
        <a href={href} className="block">{inner}</a>
      ) : (
        <Link href={href} className="block">{inner}</Link>
      )}
    </motion.div>
  );
}

function TeamsAccordion({ index }: { index: number }) {
  const pathname = usePathname();
  const isAssigned = pathname.startsWith('/teams/assigned');
  const isSectionActive = pathname.startsWith('/teams');
  const [open, setOpen] = useState(isSectionActive);

  return (
    <div className="mx-2">
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`relative flex items-center justify-between w-full gap-3 h-11 px-4 rounded-lg text-sm transition-colors ${
          isSectionActive ? 'text-text-100 font-medium' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
        }`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 + index * 0.04 }}
        whileHover={{ x: 4 }}
      >
        <span className="flex items-center gap-3">
          <span className="shrink-0 w-4 h-4"><Users size={16} strokeWidth={1.5} /></span>
          <span>Teams</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="shrink-0 text-text-300"
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <nav className="flex flex-col gap-0.5 ml-6 pl-3 pt-0.5 pb-0.5 border-l border-border-subtle">
              {TEAMS_CHILDREN.map(child => {
                const isActive = child.href === '/teams/assigned' ? isAssigned : (isSectionActive && !isAssigned);
                return (
                  <Link key={child.href} href={child.href} className="block">
                    <span className={`relative flex items-center h-10 px-3 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-accent-bg text-accent-hover font-medium' : 'text-text-300 hover:bg-bg-700 hover:text-text-100'
                    }`}>
                      {isActive && <motion.span layoutId="activeSubNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />}
                      {child.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ContributorsAccordion({ index }: { index: number }) {
  const pathname = usePathname();
  const isInvite = pathname.startsWith('/invite');
  const isSectionActive = pathname.startsWith('/people') || pathname.startsWith('/invite');
  const [open, setOpen] = useState(isSectionActive);

  return (
    <div className="mx-2">
      <motion.button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`relative flex items-center justify-between w-full gap-3 h-11 px-4 rounded-lg text-sm transition-colors ${
          isSectionActive ? 'text-text-100 font-medium' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
        }`}
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 + index * 0.04 }}
        whileHover={{ x: 4 }}
      >
        <span className="flex items-center gap-3">
          <span className="shrink-0 w-4 h-4"><UserCircle2 size={16} strokeWidth={1.5} /></span>
          <span>Contributors</span>
        </span>
        <motion.span
          animate={{ rotate: open ? 90 : 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="shrink-0 text-text-300"
        >
          <ChevronRight size={14} strokeWidth={1.5} />
        </motion.span>
      </motion.button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="overflow-hidden"
          >
            <nav className="flex flex-col gap-0.5 ml-6 pl-3 pt-0.5 pb-0.5 border-l border-border-subtle">
              {CONTRIBUTORS_CHILDREN.map(child => {
                const isActive = child.href === '/invite' ? isInvite : (isSectionActive && !isInvite);
                return (
                  <Link key={child.href} href={child.href} className="block">
                    <span className={`relative flex items-center h-10 px-3 rounded-lg text-sm transition-colors ${
                      isActive ? 'bg-accent-bg text-accent-hover font-medium' : 'text-text-300 hover:bg-bg-700 hover:text-text-100'
                    }`}>
                      {isActive && <motion.span layoutId="activeSubNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />}
                      {child.label}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuth();

  return (
    <motion.aside
      className="fixed left-0 top-0 w-[240px] h-screen bg-bg-800 flex flex-col z-50 overflow-hidden"
      initial={{ x: -240 }} animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute left-0 top-0 w-[3px] h-full bg-accent" />

      <div className="h-16 flex items-center px-5 shrink-0"><Logo /></div>
      <div className="mx-4 h-px bg-border-subtle shrink-0" />

      {/* Workspace indicator */}
      <div className="px-3 pt-3 pb-1 shrink-0">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-bg-700 border border-border-subtle">
          {user.isPending ? (
            <>
              <Skeleton width={20} height={20} borderRadius={6} baseColor="var(--color-bg-700)" highlightColor="var(--color-bg-600)" />
              <Skeleton width={120} height={12} baseColor="var(--color-bg-700)" highlightColor="var(--color-bg-600)" containerClassName="flex-1" />
            </>
          ) : (
            <>
              <div className="w-5 h-5 rounded bg-accent flex items-center justify-center text-white shrink-0" style={{ fontSize: 10, fontWeight: 700 }}>
                {user.initials?.[0] ?? 'W'}
              </div>
              <p className="text-xs font-medium text-text-100 truncate">
                {user.workspaceName || 'My Workspace'}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pt-3 pb-2">
        {/* Workspace group */}
        <div className="pb-1.5 px-5">
          <p className="text-2xs text-text-300 tracking-widest uppercase">Workspace</p>
        </div>
        <nav className="flex flex-col gap-0.5">
          {WORKSPACE_ITEMS.map((item, i) => {
            const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
            return <NavLink key={item.href} {...item} isActive={isActive} index={i} />;
          })}
          <TeamsAccordion index={WORKSPACE_ITEMS.length} />
          <ContributorsAccordion index={WORKSPACE_ITEMS.length + 1} />
          {WORKSPACE_TRAILING_ITEMS.map((item, i) => {
            const isActive = pathname.startsWith(item.href);
            return <NavLink key={item.href} {...item} isActive={isActive} index={WORKSPACE_ITEMS.length + 2 + i} />;
          })}
        </nav>

        {/* Tools group */}
        <div className="mt-5">
          <div className="mx-4 mb-2 h-px bg-border-subtle" />
          <div className="pb-1.5 px-5">
            <p className="text-2xs text-text-300 tracking-widest uppercase">Tools</p>
          </div>
          <nav className="flex flex-col gap-0.5">
            {TOOLS_ITEMS.map((item, i) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <NavLink
                  key={item.href}
                  {...item}
                  isActive={isActive}
                  index={WORKSPACE_ITEMS.length + 2 + WORKSPACE_TRAILING_ITEMS.length + i}
                />
              );
            })}
          </nav>
        </div>
      </div>

      {/* Bottom */}
      <div className="shrink-0">
        <div className="mx-4 h-px bg-border-subtle" />
        <div className="mx-2 my-1.5">
          <Link href="/profile" className="block">
            <span className={`relative flex items-center gap-3 h-10 px-4 rounded-lg text-sm transition-colors ${
              pathname.startsWith('/profile') ? 'bg-accent-bg text-accent-hover font-medium' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
            }`}>
              {pathname.startsWith('/profile') && <motion.span layoutId="activeNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />}
              <User size={16} strokeWidth={1.5} className="shrink-0" />
              <span>My Profile</span>
            </span>
          </Link>
          <Link href="/settings" className="block">
            <span className={`relative flex items-center gap-3 h-10 px-4 rounded-lg text-sm transition-colors ${
              pathname.startsWith('/settings') ? 'bg-accent-bg text-accent-hover font-medium' : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
            }`}>
              {pathname.startsWith('/settings') && <motion.span layoutId="activeNav" className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full" />}
              <Settings size={16} strokeWidth={1.5} className="shrink-0" />
              <span>Manage Settings</span>
            </span>
          </Link>
        </div>
        <div className="mx-4 h-px bg-border-subtle" />
        <Link href="/settings" className="block">
          <motion.div className="h-[68px] flex items-center gap-3 px-4 cursor-pointer hover:bg-bg-700 transition-colors" whileHover={{ x: 2 }}>
            <Avatar initials={user.initials || '??'} avatarUrl={user.avatarUrl} name={user.name} size="sm" loading={user.isPending} />
            <div className="flex flex-col min-w-0 flex-1 gap-1">
              {user.isPending ? (
                <>
                  <Skeleton width={90} height={11} />
                  <Skeleton width={130} height={10} />
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-text-100 truncate capitalize">
                    {user.name || 'User'}
                  </span>
                  <span className="text-2xs text-text-300 truncate">{user.email || ''}</span>
                </>
              )}
            </div>
            <Settings size={13} className="text-text-300 shrink-0" strokeWidth={1.5} />
          </motion.div>
        </Link>
      </div>
    </motion.aside>
  );
}
