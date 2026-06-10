export default function TasksPage() {
  const src = process.env.NEXT_PUBLIC_TASK_MFE_URL || 'http://localhost:3003';
  return (
    <iframe
      src={src}
      style={{ width: '100%', height: 'calc(100vh - 65px)', border: 'none', display: 'block' }}
      title="Task Management"
    />
  );
}
