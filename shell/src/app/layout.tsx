import type { Metadata } from 'next';
import './globals.css';
import { NavBar } from '@taskflow/ui';

export const metadata: Metadata = {
  title: 'Taskflow',
  description: 'Taskflow — Multi-Zones MFE host',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ background: '#121215', color: '#F4F3F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif', margin: 0 }}>
        <NavBar />
        <main>{children}</main>
      </body>
    </html>
  );
}
