'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const MotionImage = motion(Image);

interface AvatarProps {
  initials: string;
  avatarUrl?: string;
  name?: string;
  size?: 'sm' | 'md';
}

export default function Avatar({ initials, avatarUrl, name, size = 'md' }: AvatarProps) {
  const sizeClass = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-9 h-9 text-sm';
  const px = size === 'sm' ? 32 : 36;

  if (avatarUrl) {
    return (
      <MotionImage
        src={avatarUrl}
        alt={name || 'Profile photo'}
        width={px}
        height={px}
        className={`${sizeClass} rounded-full object-cover cursor-pointer shrink-0`}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      />
    );
  }

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
