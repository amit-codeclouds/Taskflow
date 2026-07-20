'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: '#222227', highlightColor: '#2C2C32' };

export function TaskListSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <Skeleton width={120} height={22} />
            <Skeleton width={200} height={13} className="mt-1" />
          </div>
          <Skeleton width={110} height={36} borderRadius={8} />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-bg-700 rounded-card border border-border-subtle p-4">
              <Skeleton width={60} height={11} className="mb-2" />
              <Skeleton width={36} height={26} />
            </div>
          ))}
        </div>

        {/* Filter bar */}
        <div className="flex items-center justify-between">
          <Skeleton width={280} height={34} borderRadius={8} />
          <Skeleton width={200} height={40} borderRadius={8} />
        </div>

        {/* Task rows */}
        <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`flex items-center gap-4 px-5 py-4 ${i !== 5 ? 'border-b border-border-subtle' : ''}`}
            >
              <Skeleton circle width={8} height={8} />
              <Skeleton width={220} height={13} />
              <Skeleton width={70} height={18} borderRadius={999} className="ml-auto" />
              <Skeleton width={70} height={18} borderRadius={999} />
              <Skeleton circle width={28} height={28} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonTheme>
  );
}

// Rows-only skeleton for the Archived tab on TeamTaskBoardScreen — the tabs/header
// are already rendered by that point, only the task rows are still loading.
export function ArchivedTasksSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={`flex items-center gap-4 px-5 py-4 ${i !== 3 ? 'border-b border-border-subtle' : ''}`}
          >
            <Skeleton circle width={8} height={8} />
            <Skeleton width={200} height={13} />
            <Skeleton width={70} height={18} borderRadius={999} className="ml-auto" />
            <Skeleton circle width={28} height={28} />
          </div>
        ))}
      </div>
    </SkeletonTheme>
  );
}
