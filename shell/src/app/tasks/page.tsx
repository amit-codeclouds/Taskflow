import dynamic from 'next/dynamic';

const TaskApp = dynamic(
  () => import('taskMfe/TaskApp').then((m) => m.default),
  { ssr: false, loading: () => <p>Loading tasks...</p> }
);

export default function TasksPage() {
  return <TaskApp />;
}
