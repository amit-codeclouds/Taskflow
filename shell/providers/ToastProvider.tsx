'use client';

import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 99999 }}
      gutter={8}
      toastOptions={{
        style: {
          background: 'var(--color-bg-700)',
          color: 'var(--color-text-100)',
          border: '1px solid var(--color-border-subtle)',
          borderRadius: '8px',
          fontSize: '13px',
          padding: '10px 14px',
          maxWidth: '360px',
        },
        success: {
          duration: 4000,
          iconTheme: { primary: 'var(--color-status-green)', secondary: 'var(--color-bg-700)' },
        },
        error: {
          duration: 5000,
          iconTheme: { primary: 'var(--color-status-red)', secondary: 'var(--color-bg-700)' },
        },
        loading: {
          duration: Infinity,
          iconTheme: { primary: 'var(--color-accent)', secondary: 'var(--color-bg-700)' },
        },
      }}
    />
  );
}
