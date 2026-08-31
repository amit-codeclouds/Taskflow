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

function AssistantLoader({ label, hint }: { label: string; hint?: string }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-5 bg-bg-900">
      <div className="relative w-[72px] h-[72px]">
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ background: 'conic-gradient(from 0deg, var(--color-accent), transparent 60%)' }}
          animate={{ rotate: 360 }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
        />
        <div className="absolute inset-[4px] rounded-full bg-bg-900" />
        <motion.div
          className="absolute inset-[16px] rounded-full bg-accent shadow-glow"
          animate={{ scale: [0.85, 1.05, 0.85], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
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
