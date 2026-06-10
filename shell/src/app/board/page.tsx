'use client';

import { useEffect, useRef } from 'react';

const BOARD_ORIGIN = 'http://localhost:4200';

export default function BoardPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const forward = (e: Event) => {
      const ce = e as CustomEvent;
      iframeRef.current?.contentWindow?.postMessage(
        { type: e.type, detail: ce.detail ?? null },
        BOARD_ORIGIN
      );
    };
    window.addEventListener('auth:token', forward);
    window.addEventListener('auth:logout', forward);
    return () => {
      window.removeEventListener('auth:token', forward);
      window.removeEventListener('auth:logout', forward);
    };
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-semibold text-neutral-100">Board</h1>
      <p className="mb-6 text-sm text-neutral-500">
        Angular MFE embedded via iframe for Phase 0. A native Module-Federation bootstrap
        (mounting the Angular remote directly into the Shell DOM) lands in Phase 2 once
        the Kanban board has real surface area.
      </p>
      <iframe
        ref={iframeRef}
        src={BOARD_ORIGIN}
        className="h-[600px] w-full rounded-xl border border-neutral-800 bg-neutral-950"
        title="Board MFE"
      />
    </main>
  );
}
