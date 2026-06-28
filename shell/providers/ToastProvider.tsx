'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        style: {
          background: '#222227',
          color: '#F4F3F0',
          border: '1px solid #2C2C32',
          borderRadius: '8px',
          fontSize: '13px',
        },
        success: {
          iconTheme: { primary: '#32B173', secondary: '#222227' },
        },
        error: {
          iconTheme: { primary: '#DC4949', secondary: '#222227' },
        },
        duration: 4000,
      }}
    />
  );
}
