'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const CHATBOT_URL = process.env.NEXT_PUBLIC_CHATBOT_URL || 'https://taskflow-chatbot-six.vercel.app';

export default function ChatPage() {
  const [loaded, setLoaded] = useState(false);

  return (
    // -m-8 escapes ShellLayout's unconditional <main className="p-8"> so the frame sits edge to edge
    <div className="relative -m-8 h-[calc(100vh-60px)] overflow-hidden bg-bg-900">
      {!loaded && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-bg-900">
          <Loader2 size={22} strokeWidth={1.5} className="animate-spin text-accent" />
          <p className="text-xs text-text-300">Loading assistant…</p>
        </div>
      )}

      <motion.iframe
        src={CHATBOT_URL}
        title="Taskflow Chatbot"
        onLoad={() => setLoaded(true)}
        allow="clipboard-read; clipboard-write; microphone"
        referrerPolicy="strict-origin-when-cross-origin"
        className="block w-full h-full border-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: loaded ? 1 : 0 }}
        transition={{ duration: 0.25 }}
      />
    </div>
  );
}
