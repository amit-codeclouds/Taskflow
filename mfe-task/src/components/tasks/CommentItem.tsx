'use client';

import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useConfirm } from '@/components/Modals/ConfirmProvider';
import { useAuth } from '@/lib/useAuth';
import { useDeleteComment, useUpdateComment } from '@/lib/hooks/useComments';
import { getInitials } from '@/lib/initials';
import { formatRelativeTime } from '@/lib/relativeTime';
import { isHtmlEmpty } from '@/lib/htmlContent';
import type { ApiComment } from '@/lib/types/comments.types';

export default function CommentItem({ comment, taskId }: { comment: ApiComment; taskId: string }) {
  const auth = useAuth();
  const confirm = useConfirm();
  const updateComment = useUpdateComment(taskId);
  const deleteComment = useDeleteComment(taskId);

  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.body);

  const isOwnComment = !!auth.id && comment.authorId === auth.id;
  const authorName = comment.author?.name ?? 'Unknown';

  function startEdit() {
    setEditValue(comment.body);
    setIsEditing(true);
  }

  async function saveEdit() {
    if (isHtmlEmpty(editValue)) return;
    await updateComment.mutateAsync({ id: comment.id, body: editValue });
    setIsEditing(false);
  }

  async function handleDelete() {
    const ok = await confirm({
      title: 'Delete this comment?',
      description: 'This action cannot be undone.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!ok) return;
    await deleteComment.mutateAsync(comment.id);
  }

  return (
    <div className="group flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar
            size="sm"
            initials={comment.author?.avatarInitials || getInitials(comment.author?.name)}
            avatarUrl={comment.author?.avatarUrl}
            name={authorName}
          />
          <span className="text-xs font-medium text-text-100">{authorName}</span>
          <span className="text-2xs text-text-300">{formatRelativeTime(comment.createdAt)}</span>
        </div>

        {isOwnComment && !isEditing && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              data-tooltip="Edit comment"
              onClick={startEdit}
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-300 hover:text-text-100 hover:bg-bg-600 transition-colors"
            >
              <Pencil size={13} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              data-tooltip="Delete comment"
              onClick={handleDelete}
              disabled={deleteComment.isPending}
              className="w-7 h-7 rounded-md flex items-center justify-center text-text-300 hover:text-status-red hover:bg-red-bg transition-colors disabled:opacity-50"
            >
              <Trash2 size={13} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <div className="flex flex-col gap-2 pl-10">
          <RichTextEditor value={editValue} onChange={setEditValue} variant="compact" minHeight={80} />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="h-8 px-3 rounded-lg border border-border-subtle text-xs text-text-200 hover:bg-bg-700 hover:text-text-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveEdit}
              disabled={isHtmlEmpty(editValue) || updateComment.isPending}
              className="h-8 px-3 rounded-lg bg-accent text-white text-xs font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateComment.isPending ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="task-description-content pl-10" dangerouslySetInnerHTML={{ __html: comment.body }} />
      )}
    </div>
  );
}
