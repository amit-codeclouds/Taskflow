import type { AppProps } from 'next/app';
import '../styles/globals.css';
import ShellNav from '@/components/ShellNav';
import ShellSidebar from '@/components/ShellSidebar';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <div style={{ background: '#121215', color: '#F4F3F0', minHeight: '100vh', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <ShellNav />
      <div style={{ display: 'flex' }}>
        <ShellSidebar />
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Component {...pageProps} />
        </main>
      </div>
    </div>
  );
}
