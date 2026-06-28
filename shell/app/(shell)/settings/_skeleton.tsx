'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };

export function SettingsSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div>
          <Skeleton width={80} height={22} />
          <Skeleton width={220} height={13} className="mt-1" />
        </div>

        {/* Profile section */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="flex items-center gap-3 px-6 py-5 border-b border-border-subtle">
            <Skeleton circle width={32} height={32} />
            <div>
              <Skeleton width={60} height={13} />
              <Skeleton width={120} height={11} className="mt-1" />
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Avatar + name row */}
            <div className="flex items-center gap-4">
              <Skeleton circle width={64} height={64} />
              <div className="space-y-1">
                <Skeleton width={140} height={14} />
                <Skeleton width={100} height={11} />
              </div>
            </div>
            {/* Fields */}
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <Skeleton width={70} height={11} />
                <Skeleton height={38} borderRadius={8} />
              </div>
            ))}
            {/* Teams chips */}
            <div className="space-y-2">
              <Skeleton width={80} height={11} />
              <div className="flex gap-2 flex-wrap">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} width={90} height={26} borderRadius={20} />
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Skeleton width={110} height={36} borderRadius={8} />
            </div>
          </div>
        </div>

        {/* Theme / notifications sections */}
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-5 border-b border-border-subtle">
              <Skeleton circle width={32} height={32} />
              <div>
                <Skeleton width={80} height={13} />
                <Skeleton width={160} height={11} className="mt-1" />
              </div>
            </div>
            <div className="p-6 space-y-4">
              <Skeleton height={44} borderRadius={8} />
              <Skeleton height={44} borderRadius={8} />
            </div>
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}
