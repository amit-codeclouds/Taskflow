'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { dispatchAuthLogout, dispatchAuthToken } from '@/lib/auth-event';

export default function ShellNav() {
  useEffect(() => {
    const onShellNav = (e: Event) => {
      const ce = e as CustomEvent<{ path: string }>;
      if (ce.detail?.path) window.location.assign(ce.detail.path);
    };
    window.addEventListener('shell:navigate', onShellNav);
    return () => window.removeEventListener('shell:navigate', onShellNav);
  }, []);

  return (
    <header className="border-b border-neutral-800 bg-neutral-900">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-neutral-100">
          Taskflow
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link className="text-neutral-300 hover:text-white" href="/tasks">Tasks</Link>
          <Link className="text-neutral-300 hover:text-white" href="/board">Board</Link>
          <button
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-500"
            onClick={() => dispatchAuthToken('dev-jwt-' + Date.now())}
          >
            Dispatch token
          </button>
          <button
            className="rounded-md border border-neutral-700 px-3 py-1.5 text-neutral-200 hover:bg-neutral-800"
            onClick={() => dispatchAuthLogout()}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
