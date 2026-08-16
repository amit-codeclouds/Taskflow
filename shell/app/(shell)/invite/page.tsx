import { Suspense } from 'react';
import InviteScreen from '@/components/invite/InviteScreen';

export const metadata = { title: 'Invite — Taskflow' };

export default function InvitePage() {
  // Suspense boundary is required because InviteScreen reads useSearchParams().
  return (
    <Suspense fallback={null}>
      <InviteScreen />
    </Suspense>
  );
}
