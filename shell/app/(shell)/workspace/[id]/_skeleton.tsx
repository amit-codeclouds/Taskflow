'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';

const theme = { baseColor: 'var(--color-bg-700)', highlightColor: 'var(--color-bg-600)' };

export function WorkspaceDetailsSkeleton() {
  return (
    <SkeletonTheme {...theme}>
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        {/* Page header */}
        <div className="flex items-start gap-3">
          <Skeleton width={44} height={44} borderRadius={12} />
          <div>
            <Skeleton width={220} height={26} />
            <Skeleton width={280} height={13} className="mt-2" />
          </div>
        </div>

        {/* Owner card */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle p-6">
          <Skeleton width={150} height={14} className="mb-4" />
          <div className="flex items-center gap-4">
            <Skeleton circle width={36} height={36} />
            <div className="space-y-1.5">
              <Skeleton width={160} height={15} />
              <Skeleton width={90} height={12} />
              <Skeleton width={180} height={12} />
            </div>
          </div>
        </div>

        {/* Teams section */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border-subtle">
            <Skeleton circle width={15} height={15} />
            <Skeleton width={60} height={13} />
            <Skeleton width={20} height={16} borderRadius={999} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-600 px-4 py-3">
                <Skeleton width={36} height={36} borderRadius={8} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton width="60%" height={13} />
                  <Skeleton width="40%" height={11} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Members section */}
        <div className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden">
          <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border-subtle">
            <Skeleton circle width={15} height={15} />
            <Skeleton width={72} height={13} />
            <Skeleton width={20} height={16} borderRadius={999} />
          </div>
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5">
                <Skeleton circle width={32} height={32} />
                <div className="flex-1 space-y-1.5">
                  <Skeleton width={150} height={13} />
                  <Skeleton width={200} height={11} />
                </div>
                <Skeleton width={80} height={24} borderRadius={6} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonTheme>
  );
}
