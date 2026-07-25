'use client';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import CommentItem from './CommentItem';
import { useComments } from '@/lib/hooks/useComments';

const skeletonTheme = { baseColor: 'var(--color-bg-700)', highlightColor: 'var(--color-bg-600)' };

export default function CommentList({ taskId }: { taskId: string }) {
  const { data: comments, isPending, isError, refetch } = useComments(taskId);

  if (isPending) {
    return (
      <SkeletonTheme {...skeletonTheme}>
        <div className="flex flex-col gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton circle width={32} height={32} />
              <div className="flex-1 space-y-1.5">
                <Skeleton width="40%" height={11} />
                <Skeleton count={2} />
              </div>
            </div>
          ))}
        </div>
      </SkeletonTheme>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-text-300">Couldn&apos;t load comments.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!comments || comments.length === 0) {
    return <p className="text-sm text-text-300 italic">No comments yet — be the first to add one.</p>;
  }

  return (
    <div className="flex flex-col gap-5">
      {comments.map((comment) => (
        <CommentItem key={comment.id} comment={comment} taskId={taskId} />
      ))}
    </div>
  );
}
