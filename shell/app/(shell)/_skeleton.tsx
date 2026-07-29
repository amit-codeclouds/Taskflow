'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: 'var(--color-bg-700)', highlightColor: 'var(--color-bg-600)' };

export function HomeSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Stat cards row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bg-700 rounded-xl p-5 border border-border-subtle">
              <Skeleton width={80} height={12} className="mb-3" />
              <Skeleton width={48} height={28} />
            </div>
          ))}
        </div>

        {/* Content cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="bg-bg-700 rounded-xl p-6 border border-border-subtle space-y-3">
              <Skeleton width={120} height={16} />
              <Skeleton count={3} height={12} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}
