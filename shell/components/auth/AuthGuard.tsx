'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMe } from '@/lib/hooks/useMe';

/**
 * Client-side auth guard for the (shell) route group.
 *
 * middleware.ts already blocks routes when the `taskflow_access_token` cookie is
 * missing (fast, server-side, no flash). This guard covers the remaining case:
 * the cookie is present but the session is actually invalid (revoked/expired) —
 * `useMe()` then settles with no user, and we redirect to /login.
 *
 * Non-blocking on purpose: children still render while the session resolves, so
 * the sidebar's own skeleton UX is preserved. The redirect fires only once the
 * query has definitively settled without a user.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data, isPending, isError } = useMe();

  useEffect(() => {
    if (!isPending && (isError || !data)) {
      router.replace('/login');
    }
  }, [isPending, isError, data, router]);

  return <>{children}</>;
}
