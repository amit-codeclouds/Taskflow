import TaskDetailScreen from '@/components/tasks/TaskDetailScreen';

export default function TaskDetailPage({ params }: { params: { id: string } }) {
  return <TaskDetailScreen taskId={params.id} />;
}
