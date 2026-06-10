'use client';

import Link from 'next/link';

const items = [
  { href: '/', label: 'Dashboard' },
  { href: '/tasks', label: 'Tasks' },
  { href: '/board', label: 'Board' },
];

export default function ShellSidebar() {
  return (
    <aside
      style={{
        width: 220,
        borderRight: '1px solid #222227',
        background: '#121215',
        padding: '24px 16px',
        minHeight: 'calc(100vh - 65px)',
      }}
    >
      <p style={{ margin: 0, fontSize: 11, letterSpacing: 1, color: '#6b6a66' }}>WORKSPACE</p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '12px 0 0' }}>
        {items.map((it) => (
          <li key={it.href} style={{ marginBottom: 4 }}>
            <Link
              href={it.href}
              style={{
                display: 'block',
                padding: '8px 12px',
                color: '#ABAAA5',
                textDecoration: 'none',
                borderRadius: 6,
                fontSize: 14,
              }}
            >
              {it.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
