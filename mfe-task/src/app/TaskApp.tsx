'use client';

import { useEffect, useState } from 'react';

export default function TaskApp() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const onToken = (e: Event) => {
      const ce = e as CustomEvent<{ token: string }>;
      setToken(ce.detail.token);
    };
    const onLogout = () => setToken(null);
    window.addEventListener('auth:token', onToken);
    window.addEventListener('auth:logout', onLogout);
    return () => {
      window.removeEventListener('auth:token', onToken);
      window.removeEventListener('auth:logout', onLogout);
    };
  }, []);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-neutral-100">
      <h2 className="text-xl font-semibold">Task MFE (Next.js · 3002)</h2>
      <p className="mt-2 text-sm text-neutral-400">
        Placeholder. Phase 1 will add login, task list, create form, status update.
      </p>
      <p className="mt-4 text-xs text-neutral-500">
        Auth token from Shell: {token ? <span className="text-emerald-400">received</span> : <span className="text-amber-400">waiting…</span>}
      </p>
    </section>
  );
}
