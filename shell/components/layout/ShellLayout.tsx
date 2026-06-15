'use client';

import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { ConfirmProvider } from '@/components/Modals/ConfirmProvider';

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <ConfirmProvider>
      <div className="min-h-screen bg-bg-900">
        <Sidebar />
        <Topbar />
        <div className="ml-[240px] pt-[60px]">
          <main className="p-8">{children}</main>
        </div>
      </div>
    </ConfirmProvider>
  );
}
