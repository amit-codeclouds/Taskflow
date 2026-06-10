import TaskApp from './TaskApp';

export default function Home() {
  return (
    <main className="min-h-screen bg-neutral-950 p-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-semibold text-neutral-100">mfe-task · standalone</h1>
        <TaskApp />
      </div>
    </main>
  );
}
