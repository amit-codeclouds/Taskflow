'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, ListChecks } from 'lucide-react';

export default function TeamTasksPage({ params }: { params: { id: string } }) {
  const router = useRouter();

  return (
    <div className="max-w-3xl mx-auto">
      <motion.button
        onClick={() => router.push('/teams/assigned')}
        className="flex items-center gap-1.5 text-sm text-text-300 hover:text-text-100 transition-colors mb-8"
        whileHover={{ x: -2 }}
      >
        <ChevronLeft size={16} strokeWidth={1.5} />
        Back to Assigned Teams
      </motion.button>

      <motion.div
        className="flex flex-col items-center justify-center py-24 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-12 h-12 rounded-2xl bg-bg-700 flex items-center justify-center text-text-300 mb-3">
          <ListChecks size={22} strokeWidth={1.3} />
        </div>
        <p className="text-sm text-text-300">Task view for this team is coming soon.</p>
      </motion.div>
    </div>
  );
}
