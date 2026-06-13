import { notFound } from 'next/navigation';
import { TASKS } from '@/lib/taskData';
import TaskFormScreen from '@/components/tasks/TaskFormScreen';

export default function EditTaskPage({ params }: { params: { id: string } }) {
  const task = TASKS.find(t => t.id === params.id);
  if (!task) notFound();
  return <TaskFormScreen editTask={task} />;
}
