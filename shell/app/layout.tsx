import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Inter } from 'next/font/google';
import './globals.css';
import 'react-loading-skeleton/dist/skeleton.css';
import PageLoader from '@/components/ui/PageLoader';
import QueryProvider from '@/providers/QueryProvider';
import ToastProvider from '@/providers/ToastProvider';

const inter = Inter({ subsets: ['latin'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:8787';
const siteName = 'Taskflow';
const siteDescription = 'Premium task management for engineering teams.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'Taskflow — Task management for engineering teams',
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  keywords: ['task management', 'kanban board', 'project management', 'engineering teams', 'agile', 'sprint planning'],
  applicationName: siteName,
  authors: [{ name: 'Taskflow' }],
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  verification: {
    google: 'lK2ROp0BirP0h7z7fDvW_J8IktFEKPkJtiAqBzKT40k',
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName,
    title: 'Taskflow — Task management for engineering teams',
    description: siteDescription,
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Taskflow — Task management for engineering teams',
    description: siteDescription,
  },
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
