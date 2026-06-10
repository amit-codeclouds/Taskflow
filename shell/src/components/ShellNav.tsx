'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { dispatchAuthLogout, dispatchAuthToken } from '@/lib/auth-events';

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
    <header style={{ borderBottom: '1px solid #222227', background: '#121215' }}>
      <nav
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link href="/" style={{ color: '#F4F3F0', fontSize: 18, fontWeight: 600, textDecoration: 'none' }}>
          Taskflow
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, fontSize: 14 }}>
          <Link href="/" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Dashboard</Link>
          <Link href="/tasks" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Tasks</Link>
          <Link href="/board" style={{ color: '#ABAAA5', textDecoration: 'none' }}>Board</Link>
          <button
            style={{
              background: '#6155DD',
              color: '#F4F3F0',
              border: 'none',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onClick={() => dispatchAuthToken('dev-jwt-' + Date.now())}
          >
            Dispatch token
          </button>
          <button
            style={{
              background: 'transparent',
              color: '#F4F3F0',
              border: '1px solid #2a2a2f',
              padding: '6px 12px',
              borderRadius: 6,
              cursor: 'pointer',
            }}
            onClick={() => dispatchAuthLogout()}
          >
            Logout
          </button>
        </div>
      </nav>
    </header>
  );
}
