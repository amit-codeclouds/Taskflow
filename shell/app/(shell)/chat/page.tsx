'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/useAuth';
import { getAccessToken } from '@/lib/token';

const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL;
// Hardcoded for now — the agent backend is a single Render instance that spins
// down after 15 minutes idle, so we have to wake it before pointing the iframe at it.
const HEALTH_URL = 'https://taskflowassistant.onrender.com/health';

// The chatbot is deployed on its own origin, so it receives neither the
// taskflow_theme cookie nor the session. The shell hands it what it needs on the URL.
function chatbotSrc(params: { theme: 'dark' | 'light'; name?: string; token?: string | null }) {
  if (!CHATBOT_URL) return undefined;
  try {
    const url = new URL(CHATBOT_URL);
    url.searchParams.set('theme', params.theme);
    if (params.name) url.searchParams.set('name', params.name);
    if (params.token) url.searchParams.set('token', params.token);
    return  url.pathname === '/' ? `${url.origin}${url.search}${url.hash}` : url.toString();
  } catch {
    return CHATBOT_URL;
  }
}

// The Render free-tier instance can take up to ~60s to wake from a cold start —
// keep pinging /health until it answers, rather than firing the iframe at a dead host.
function useAgentHealth() {
  const [ready, setReady] = useState(false);
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const startedAt = Date.now();

    async function poll() {
      while (!cancelled) {
        try {
          const res = await fetch(HEALTH_URL, { method: 'GET', cache: 'no-store' });
          if (res.ok) break;
        } catch {
          // instance is asleep or waking up — keep retrying
        }
        if (!cancelled && Date.now() - startedAt > 15000) setSlow(true);
        await new Promise(r => setTimeout(r, 3000));
      }
      if (!cancelled) setReady(true);
    }

    poll();
    return () => { cancelled = true; };
  }, []);

  return { ready, slow };
}

// The lucide "Sparkle" glyph — reused at three sizes so it reads as one
// consistent AI motif (same mark as the sidebar's Task Assistant icon).
const SPARKLE_PATH = 'M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .963L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z';

function AssistantLoader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-7 bg-bg-900">
      <div className="relative w-[140px] h-[140px] flex items-center justify-center">
        {/* Ambient glow — breathes, never spins */}
        <motion.div
          className="absolute w-[112px] h-[112px] rounded-full"
          style={{ background: 'radial-gradient(circle, var(--color-accent) 0%, transparent 70%)', filter: 'blur(20px)' }}
          animate={{ opacity: [0.2, 0.45, 0.2], scale: [0.9, 1.08, 0.9] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Central mark — materializes once, then breathes gently */}
        <motion.svg
          width="60" height="60" viewBox="0 0 24 24" fill="var(--color-accent)"
          initial={{ opacity: 0, scale: 0.4, rotate: -15 }}
          animate={{ opacity: 1, scale: [1, 1.06, 1], rotate: 0 }}
          transition={{
            opacity: { duration: 0.5, ease: 'easeOut' },
            rotate: { duration: 0.5, ease: 'easeOut' },
            scale: { duration: 2.4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 },
          }}
        >
          <path d={SPARKLE_PATH} />
        </motion.svg>

        {/* Satellite sparkles — appear a beat later, twinkle in place */}
        <motion.svg
          width="20" height="20" viewBox="0 0 24 24" fill="var(--color-accent-hover)"
          className="absolute top-3 right-2"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0.55, 1], scale: [0.3, 1, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut', delay: 0.35 }}
        >
          <path d={SPARKLE_PATH} />
        </motion.svg>
        <motion.svg
          width="14" height="14" viewBox="0 0 24 24" fill="var(--color-accent)"
          className="absolute bottom-4 left-3"
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 0.55, 1], scale: [0.3, 1, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        >
          <path d={SPARKLE_PATH} />
        </motion.svg>
      </div>
      <div className="flex flex-col items-center gap-1 text-center px-8">
        <p className="text-sm font-medium text-text-100">{label}</p>
        {hint && <p className="text-2xs text-text-300">{hint}</p>}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [loaded, setLoaded] = useState(false);
  const user = useAuth();
  const { ready: healthReady, slow: slowWake } = useAgentHealth();
  // Resolved on the client only — the theme lives on <html data-theme>, and reading it
  // during render would mismatch the server-rendered markup. Written once: recomputing
  // the src would reload the iframe and drop the conversation.
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (user.isPending || !healthReady) return; // wait for /me and for the agent to be awake
    setSrc(current => current ?? chatbotSrc({
      theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      name: user.name,
      token: getAccessToken(),
    }));
  }, [user.isPending, user.name, healthReady]);

  return (
    // -m-8 escapes ShellLayout's unconditional <main className="p-8"> so the frame sits edge to edge
    <div className="relative -m-8 h-[calc(100vh-60px)] overflow-hidden bg-bg-900">
      {!loaded && (
        <AssistantLoader
          label={healthReady ? 'Loading assistant…' : 'Waking up your Task Assistant'}
          hint={!healthReady && slowWake ? 'First load can take up to a minute — hang tight' : undefined}
        />
      )}

      {src && (
        <motion.iframe
          src={src}
          title="Taskflow Chatbot"
          onLoad={() => setLoaded(true)}
          allow="clipboard-read; clipboard-write; microphone"
          referrerPolicy="strict-origin-when-cross-origin"
          className="block w-full h-full border-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: loaded ? 1 : 0 }}
          transition={{ duration: 0.25 }}
        />
      )}
    </div>
  );
}
