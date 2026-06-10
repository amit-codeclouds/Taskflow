'use client';

import { useEffect, useState, ComponentType } from 'react';
import { loadRemoteModule } from '@/lib/mf-runtime';

export default function TasksPage() {
  const [TaskApp, setTaskApp] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRemoteModule<{ default: ComponentType } | ComponentType>('taskMfe', 'TaskApp')
      .then((mod) => {
        const Comp = (mod as { default?: ComponentType }).default ?? (mod as ComponentType);
        setTaskApp(() => Comp);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-neutral-100">Tasks</h1>
      {error && <p className="text-red-400">Failed to load Task MFE: {error}</p>}
      {!error && !TaskApp && <p className="text-neutral-400">Loading Task MFE…</p>}
      {TaskApp && <TaskApp />}
    </main>
  );
}
