import type { Metadata } from 'next';
import './globals.css';
import ShellNav from '@/components/ShellNav';
import ShellSidebar from '@/components/ShellSidebar';

export const metadata: Metadata = {
  description: 'Taskflow MFE host',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#121215', color: '#F4F3F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <ShellNav />
        <div style={{ display: 'flex' }}>
          <ShellSidebar />
          <main style={{ flex: 1, overflow: 'hidden' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
