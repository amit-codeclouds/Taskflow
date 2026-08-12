'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';

const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL;

// The chatbot is deployed on its own origin, so it receives neither the
// taskflow_theme cookie nor the session. The shell hands it what it needs on the URL.
function chatbotSrc(params: { theme: 'dark' | 'light'; name?: string }) {
  if (!CHATBOT_URL) return undefined;
  try {
    const url = new URL(CHATBOT_URL);
    url.searchParams.set('theme', params.theme);
    if (params.name) url.searchParams.set('name', params.name);
    return  url.pathname === '/' ? `${url.origin}${url.search}${url.hash}` : url.toString();
  } catch {
    return CHATBOT_URL;
  }
}

export default function ChatPage() {
  const [loaded, setLoaded] = useState(false);
  const user = useAuth();
  // Resolved on the client only — the theme lives on <html data-theme>, and reading it
  // during render would mismatch the server-rendered markup. Written once: recomputing
  // the src would reload the iframe and drop the conversation.
  const [src, setSrc] = useState<string>();

  useEffect(() => {
    if (user.isPending) return; // wait for /me, so the name is in the URL on first load
    setSrc(current => current ?? chatbotSrc({
      theme: document.documentElement.dataset.theme === 'light' ? 'light' : 'dark',
      name: user.name,
    }));
  }, [user.isPending, user.name]);

  return (
    // -m-8 escapes ShellLayout's unconditional <main className="p-8"> so the frame sits edge to edge
    <div className="relative -m-8 h-[calc(100vh-60px)] overflow-hidden bg-bg-900">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-900">
          <Loader2 size={22} strokeWidth={1.5} className="animate-spin text-accent" />
          <p className="text-xs text-text-300">Loading assistant…</p>
        </div>
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
