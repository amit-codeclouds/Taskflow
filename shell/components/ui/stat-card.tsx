'use client';

import { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  color?: string;
  delay?: number;
}

// Counts up from the current displayed number to `value`, so a change from
// 0 → 7 (or 3 → 5 when data refreshes) animates smoothly.
function CountUp({ value, delay = 0 }: { value: number; delay?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.1,
      delay,
      ease: [0.22, 1, 0.36, 1], // easeOutQuint-ish — fast start, gentle settle
    });
    return () => controls.stop();
  }, [value, delay, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendPositive = true,
  color = 'text-accent',
  delay = 0,
}: StatCardProps) {
  const numeric = Number(value);
  const isNumeric = value.trim() !== '' && Number.isFinite(numeric);

  return (
    <motion.div
      className="bg-bg-700 rounded-card p-5 border border-border-subtle flex flex-col gap-4 cursor-default"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay }}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-elevated)' }}
    >
      <div className="flex items-start justify-between">
        <div className={`w-9 h-9 rounded-lg bg-bg-600 flex items-center justify-center ${color}`}>
          <Icon size={16} strokeWidth={1.5} />
        </div>
        {trend != null && (
          <span
            className={`text-2xs font-medium px-2 py-0.5 rounded-full ${
              trendPositive ? 'text-status-green bg-green-bg' : 'text-status-amber bg-amber-bg'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-3xl font-semibold text-text-100 tracking-tight leading-none">
          {isNumeric ? <CountUp value={numeric} delay={delay} /> : value}
        </p>
        <p className="text-sm text-text-300 mt-1.5">{label}</p>
      </div>
    </motion.div>
  );
}
