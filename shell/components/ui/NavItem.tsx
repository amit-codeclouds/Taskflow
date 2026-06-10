'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavItemProps {
  label: string;
  href: string;
  icon: React.ReactNode;
  isActive: boolean;
  isCrossZone: boolean;
  index: number;
}

export default function NavItem({ label, href, icon, isActive, isCrossZone, index }: NavItemProps) {
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
      <span className="shrink-0 w-4 h-4">{icon}</span>
      <span>{label}</span>
    </span>
  );

  return (
    <motion.div
      className="mx-2"
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.05 }}
      whileHover={isActive ? undefined : { x: 4 }}
    >
      {isCrossZone ? (
        <a href={href} className="block">{inner}</a>
      ) : (
        <Link href={href} className="block">{inner}</Link>
      )}
    </motion.div>
  );
}
