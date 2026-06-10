'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PageLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 450);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-bg-900 flex items-center justify-center"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <div className="flex flex-col items-center gap-5">
            <motion.div
              className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <svg width="22" height="22" viewBox="0 0 14 14" fill="none">
                <path d="M2 3h10M2 7h6M2 11h8" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
              </svg>
            </motion.div>

            <div className="w-36 h-[2px] bg-bg-600 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-accent rounded-full"
                initial={{ x: '-100%' }}
                animate={{ x: '140%' }}
                transition={{ duration: 0.85, ease: 'easeInOut', repeat: Infinity, repeatDelay: 0.15 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
