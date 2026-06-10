'use client';

import { motion } from 'framer-motion';

interface AvatarProps {
  initials: string;
  size?: 'sm' | 'md';
}

export default function Avatar({ initials, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';

  return (
    <motion.div
      className={`${sizeClass} rounded-full bg-accent-bg text-accent font-semibold flex items-center justify-center cursor-pointer shrink-0`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      {initials}
    </motion.div>
  );
}
