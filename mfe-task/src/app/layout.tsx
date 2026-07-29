import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import PageLoader from '@/components/ui/PageLoader';
import ShellLayout from '@/components/layout/ShellLayout';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My Tasks — Taskflow',
  description: 'Taskflow Task Management',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const theme = cookies().get('taskflow_theme')?.value === 'light' ? 'light' : 'dark';
  return (
    <html lang="en" className={inter.className} data-theme={theme}>
      <body className="bg-bg-900 text-text-100 antialiased">
        <QueryProvider>
          <ToastProvider />
          <PageLoader />
          <ShellLayout>{children}</ShellLayout>
        </QueryProvider>
      </body>
    </html>
  );
}
