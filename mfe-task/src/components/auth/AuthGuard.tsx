'use client';

import { useEffect } from 'react';
import { useMe } from '@/lib/hooks/useMe';

/**
 * Client-side auth guard for the Task MFE.
 *
 * middleware.ts already blocks routes when the `taskflow_access_token` cookie is
 * missing/expired (server-side, no flash). This guard covers the remaining case:
 * the cookie is present but the session is actually invalid — `useMe()` then
 * settles with no user and we send the user to /login.
 *
 * /login lives in the Shell zone, so this uses a hard `window.location`
 * navigation (the Worker routes /login to the Shell) — a Next router push would
 * stay inside the /tasks zone. Non-blocking: children still render so the
 * sidebar's own skeleton UX is preserved.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { data, isPending, isError } = useMe();

  useEffect(() => {
    if (!isPending && (isError || !data)) {
      window.location.href = '/login';
    }
  }, [isPending, isError, data]);

  return <>{children}</>;
}
