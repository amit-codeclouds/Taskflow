'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };

export function PeopleSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Skeleton width={90} height={22} />
            <Skeleton width={200} height={13} className="mt-1" />
          </div>
          <Skeleton width={120} height={36} borderRadius={8} />
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bg-700 rounded-xl p-4 border border-border-subtle">
              <Skeleton width={60} height={11} className="mb-2" />
              <Skeleton width={36} height={24} />
            </div>
          ))}
        </div>

        {/* Filters row */}
        <div className="flex gap-3">
          <Skeleton height={36} borderRadius={8} className="flex-1" />
          <Skeleton width={140} height={36} borderRadius={8} />
          <Skeleton width={140} height={36} borderRadius={8} />
        </div>

        {/* Member rows */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton circle width={36} height={36} />
                <div className="flex-1 space-y-1">
                  <Skeleton width={130} height={13} />
                  <Skeleton width={180} height={11} />
                </div>
                <Skeleton width={80} height={11} />
                <div className="flex gap-1">
                  {Array.from({ length: 2 }).map((__, j) => (
                    <Skeleton key={j} width={60} height={22} borderRadius={4} />
                  ))}
                </div>
                <Skeleton circle width={28} height={28} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
