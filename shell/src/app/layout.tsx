import type { Metadata } from 'next';
import './globals.css';
import ShellNav from '@/components/ShellNav';
import ShellSidebar from '@/components/ShellSidebar';

export const metadata: Metadata = {
  title: 'Taskflow Shell',
  description: 'Taskflow MFE host',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#121215', color: '#F4F3F0', margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        <ShellNav />
        <div style={{ display: 'flex' }}>
          <ShellSidebar />
          <main style={{ flex: 1, padding: '32px 40px' }}>{children}</main>
        </div>
      </body>
    </html>
  );
}
