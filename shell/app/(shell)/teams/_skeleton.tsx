'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };

export function TeamsSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={100} height={22} />
            <Skeleton width={180} height={13} className="mt-1" />
          </div>
          <Skeleton width={110} height={36} borderRadius={8} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-bg-700 rounded-xl p-5 border border-border-subtle">
              <Skeleton width={70} height={11} className="mb-2" />
              <Skeleton width={40} height={26} />
            </div>
          ))}
        </div>

        {/* Team cards */}
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-bg-700 rounded-xl border border-border-subtle p-5 flex items-center gap-4"
            >
              <Skeleton circle width={36} height={36} />
              <div className="flex-1 space-y-2">
                <Skeleton width={140} height={14} />
                <Skeleton width={200} height={11} />
              </div>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((__, j) => (
                  <Skeleton key={j} circle width={28} height={28} />
                ))}
              </div>
              <Skeleton width={60} height={28} borderRadius={6} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}
