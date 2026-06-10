'use client';

import { motion } from 'framer-motion';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Users, CheckSquare, Kanban } from 'lucide-react';
import Logo from '@/components/ui/Logo';
import { isSameZone } from '@/lib/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface NavGroup {
  label: string | null;
  items: NavItem[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: null,
    items: [
      { label: 'Home',     href: '/',      icon: <LayoutDashboard size={16} strokeWidth={1.5} /> },
      { label: 'My Teams', href: '/teams', icon: <Users size={16} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Tasks',
    items: [
      { label: 'My Tasks', href: '/tasks', icon: <CheckSquare size={16} strokeWidth={1.5} /> },
    ],
  },
  {
    label: 'Board',
    items: [
      { label: 'Kanban Board', href: '/board', icon: <Kanban size={16} strokeWidth={1.5} /> },
    ],
  },
];

const PROJECTS = [
  { name: 'Taskflow App',  dot: 'bg-accent' },
  { name: 'Design System', dot: 'bg-status-green' },
  { name: 'API Gateway',   dot: 'bg-status-amber' },
];

function SidebarNavItem({
  item,
  isActive,
  isCrossZone,
  index,
}: {
  item: NavItem;
  isActive: boolean;
  isCrossZone: boolean;
  index: number;
}) {
  const inner = (
    <span
      className={`relative flex items-center gap-3 h-11 px-4 rounded-lg text-sm transition-colors ${
        isActive
          ? 'bg-accent-bg text-accent-hover font-medium'
          : 'text-text-200 hover:bg-bg-700 hover:text-text-100'
      }`}
    >
      {isActive && (
        <motion.span
          layoutId="activeNav"
          className="absolute left-0 top-[14%] h-[72%] w-[3px] bg-accent rounded-r-full"
        />
      )}
      <span className="shrink-0 w-4 h-4">{item.icon}</span>
      <span>{item.label}</span>
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
      {isCrossZone ? (
        <a href={item.href} className="block">{inner}</a>
      ) : (
        <Link href={item.href} className="block">{inner}</Link>
      )}
    </motion.div>
  );
}

export default function Sidebar() {
  const pathname = usePathname();

  let globalIndex = 0;

  return (
    <motion.aside
      className="fixed left-0 top-0 w-[240px] h-screen bg-bg-800 flex flex-col z-50 overflow-hidden"
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute left-0 top-0 w-[3px] h-full bg-accent" />

      {/* Logo */}
      <div className="h-16 flex items-center px-5 shrink-0">
        <Logo />
      </div>

      <div className="mx-4 h-px bg-border-subtle shrink-0" />

      {/* Nav groups */}
      <div className="flex-1 overflow-y-auto pt-3 pb-2">
        {NAV_GROUPS.map((group, gi) => {
          const groupStartIndex = globalIndex;
          globalIndex += group.items.length;

          return (
            <div key={gi} className={gi > 0 ? 'mt-4' : ''}>
              {group.label && (
                <div className="px-5 pb-1.5">
                  <p className="text-2xs text-text-300 tracking-widest uppercase">{group.label}</p>
                </div>
              )}

              {gi > 0 && (
                <div className="mx-4 mb-2 h-px bg-border-subtle" />
              )}

              <nav className="flex flex-col gap-0.5">
                {group.items.map((item, ii) => {
                  const isActive = item.href === '/'
                    ? pathname === '/'
                    : pathname.startsWith(item.href);
                  const isCrossZone = !isSameZone(item.href, pathname);

                  return (
                    <SidebarNavItem
                      key={item.href}
                      item={item}
                      isActive={isActive}
                      isCrossZone={isCrossZone}
                      index={groupStartIndex + ii}
                    />
                  );
                })}
              </nav>
            </div>
          );
        })}

        {/* Projects */}
        <div className="mt-4">
          <div className="mx-4 mb-2 h-px bg-border-subtle" />
          <div className="pb-1.5 px-5">
            <p className="text-2xs text-text-300 tracking-widest uppercase">Projects</p>
          </div>
          <div className="flex flex-col gap-1 px-5">
            {PROJECTS.map((p, i) => (
              <motion.div
                key={p.name}
                className="flex items-center gap-2.5 h-8 text-sm text-text-200"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.2 + i * 0.05 }}
              >
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
                <span className="truncate">{p.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* User card */}
      <div className="mx-4 h-px bg-border-subtle shrink-0" />
      <div className="h-[68px] flex items-center gap-3 px-4 shrink-0">
        <div className="w-8 h-8 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">
          AC
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-text-100 truncate">Arkabrata</span>
          <span className="text-2xs text-text-300 truncate">Engineer</span>
        </div>
      </div>
    </motion.aside>
  );
}
