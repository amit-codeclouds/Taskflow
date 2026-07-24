import ArchivedTaskDetailScreen from '@/components/tasks/ArchivedTaskDetailScreen';

export default function ArchivedTaskDetailPage({ params }: { params: { taskId: string } }) {
  return <ArchivedTaskDetailScreen taskId={params.taskId} />;
}
