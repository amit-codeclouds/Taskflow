import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Taskflow · Task MFE',
  description: 'Taskflow Task MFE — standalone dev',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}
