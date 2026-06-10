import TaskApp from '@/components/TaskApp';

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', background: '#121215', padding: 40 }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <h1 style={{ marginBottom: 24, fontSize: 22, fontWeight: 600, color: '#F4F3F0', fontFamily: 'Inter, system-ui, sans-serif' }}>
          mfe-task · standalone
        </h1>
        <TaskApp />
      </div>
    </main>
  );
}
