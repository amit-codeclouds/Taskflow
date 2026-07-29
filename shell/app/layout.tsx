import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import PageLoader from '@/components/ui/PageLoader';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Taskflow',
  description: 'Premium task management for engineering teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = cookies().get('taskflow_theme')?.value === 'light' ? 'light' : 'dark';
  return (
    <html lang="en" className={inter.className} data-theme={theme}>
      <body className="bg-bg-900 text-text-100 antialiased">
        <QueryProvider>
          <ToastProvider />
          <PageLoader />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
