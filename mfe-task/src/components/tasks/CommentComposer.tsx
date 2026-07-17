'use client';

import { useState } from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { useCreateComment } from '@/lib/hooks/useComments';
import { isHtmlEmpty } from '@/lib/htmlContent';

export default function CommentComposer({ taskId }: { taskId: string }) {
  const [value, setValue] = useState('');
  const createComment = useCreateComment(taskId);

  const disabled = isHtmlEmpty(value) || createComment.isPending;

  async function handleSubmit() {
    if (disabled) return;
    await createComment.mutateAsync({ body: value });
    setValue('');
  }

  return (
    <div className="flex flex-col gap-2">
      <RichTextEditor
        value={value}
        onChange={setValue}
        variant="compact"
        minHeight={90}
        placeholder="Add a comment…"
      />
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={disabled}
          className="h-9 px-4 rounded-lg bg-accent text-white text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {createComment.isPending ? 'Posting…' : 'Post Comment'}
        </button>
      </div>
    </div>
  );
}
