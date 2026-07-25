'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: 'var(--color-bg-700)', highlightColor: 'var(--color-bg-600)' };

export function ArchivedTaskDetailSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="max-w-3xl mx-auto space-y-5">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton width={50} height={12} />
          <Skeleton width={8} height={12} />
          <Skeleton width={70} height={12} />
        </div>

        <div className="bg-bg-800 rounded-xl border border-border-subtle p-6 space-y-3">
          <div className="flex gap-2">
            <Skeleton width={60} height={18} borderRadius={4} />
            <Skeleton width={70} height={18} borderRadius={999} />
            <Skeleton width={60} height={18} borderRadius={999} />
          </div>
          <Skeleton width="70%" height={22} />
          <Skeleton width={110} height={13} />
        </div>

        <div className="bg-bg-800 rounded-xl border border-border-subtle p-6 space-y-2">
          <Skeleton width={90} height={11} />
          <Skeleton count={3} />
        </div>

        <div className="bg-bg-800 rounded-xl border border-border-subtle p-6 space-y-2">
          <Skeleton width={80} height={11} />
          <div className="flex gap-3 mt-2">
            <Skeleton circle width={28} height={28} />
            <Skeleton circle width={28} height={28} />
          </div>
        </div>

        <div className="bg-bg-800 rounded-xl border border-border-subtle p-5 space-y-4">
          <Skeleton width={60} height={11} />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton width={60} height={11} />
              <Skeleton width={80} height={13} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}
