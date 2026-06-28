'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };

export function TeamDetailSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2">
          <Skeleton width={50} height={12} />
          <Skeleton width={8} height={12} />
          <Skeleton width={100} height={12} />
        </div>

        {/* Team info card */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="px-6 py-5 border-b border-border-subtle flex items-center gap-3">
            <Skeleton circle width={36} height={36} />
            <div>
              <Skeleton width={120} height={14} />
              <Skeleton width={80} height={11} className="mt-1" />
            </div>
          </div>
          <div className="p-6 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton width={70} height={11} />
                <Skeleton height={36} borderRadius={8} />
              </div>
            ))}
            <div className="pt-2 flex justify-end">
              <Skeleton width={100} height={36} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* Members card */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="px-6 py-5 border-b border-border-subtle">
            <Skeleton width={80} height={14} />
          </div>
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton circle width={36} height={36} />
                <div className="flex-1 space-y-1">
                  <Skeleton width={120} height={13} />
                  <Skeleton width={160} height={11} />
                </div>
                <Skeleton width={70} height={26} borderRadius={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
