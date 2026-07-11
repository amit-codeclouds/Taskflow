import { Suspense } from 'react';
import TaskFormScreen from '@/components/tasks/TaskFormScreen';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <TaskFormScreen taskId={params.id} />
    </Suspense>
  );
}
