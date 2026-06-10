'use client';

import { motion } from 'framer-motion';
import Logo from '@/components/ui/Logo';
import NavItem from '@/components/ui/NavItem';
import { NAV_LINKS, CURRENT_ZONE } from '@/lib/navigation';

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M2 6.5L8 2l6 4.5V13a1 1 0 01-1 1h-3v-4H6v4H3a1 1 0 01-1-1V6.5z"
        stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

function CheckSquareIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 8l1.5 1.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3"
        strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LayoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <rect x="2" y="2" width="5" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="2" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="9" y="9" width="5" height="5" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'home':         <HomeIcon />,
  'check-square': <CheckSquareIcon />,
  'layout':       <LayoutIcon />,
};

const PROJECTS = [
  { name: 'Taskflow App',  dot: 'bg-accent' },
  { name: 'Design System', dot: 'bg-status-green' },
  { name: 'API Gateway',   dot: 'bg-status-amber' },
];

export default function Sidebar() {
  return (
    <motion.aside
      className="fixed left-0 top-0 w-[240px] h-screen bg-bg-800 flex flex-col z-50 overflow-hidden"
      initial={{ x: -240 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="absolute left-0 top-0 w-[3px] h-full bg-accent" />

      <div className="h-16 flex items-center px-5 shrink-0">
        <Logo />
      </div>

      <div className="mx-4 h-px bg-border-subtle shrink-0" />

      <div className="pt-5 pb-2 px-5 shrink-0">
        <p className="text-2xs text-text-300 tracking-widest uppercase">Workspace</p>
      </div>

      <nav className="flex flex-col gap-0.5">
        {NAV_LINKS.map((link, index) => (
          <NavItem
            key={link.href + link.zone}
            label={link.label}
            href={link.href}
            icon={ICON_MAP[link.icon]}
            isActive={link.zone === CURRENT_ZONE}
            isCrossZone={link.zone !== CURRENT_ZONE}
            index={index}
          />
        ))}
      </nav>

      <div className="mx-4 my-4 h-px bg-border-subtle shrink-0" />

      <div className="pb-2 px-5 shrink-0">
        <p className="text-2xs text-text-300 tracking-widest uppercase">Projects</p>
      </div>

      <div className="flex flex-col gap-1 px-5">
        {PROJECTS.map((p, i) => (
          <motion.div
            key={p.name}
            className="flex items-center gap-2.5 h-8 text-sm text-text-200"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.15 + i * 0.05 }}
          >
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${p.dot}`} />
            <span className="truncate">{p.name}</span>
          </motion.div>
        ))}
      </div>

      <div className="flex-1" />

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
