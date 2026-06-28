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
          background: '#222227',
          color: '#F4F3F0',
          border: '1px solid #2C2C32',
          borderRadius: '8px',
          fontSize: '13px',
          padding: '10px 14px',
          maxWidth: '360px',
        },
        success: {
          duration: 4000,
          iconTheme: { primary: '#32B173', secondary: '#222227' },
        },
        error: {
          duration: 5000,
          iconTheme: { primary: '#DC4949', secondary: '#222227' },
        },
        loading: {
          duration: Infinity,
          iconTheme: { primary: '#6155DD', secondary: '#222227' },
        },
      }}
    />
  );
}
