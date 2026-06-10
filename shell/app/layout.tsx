import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import PageLoader from '@/components/ui/PageLoader';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taskflow',
  description: 'Premium task management for engineering teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-bg-900 text-text-100 antialiased">
        <PageLoader />
        {children}
      </body>
    </html>
  );
}
