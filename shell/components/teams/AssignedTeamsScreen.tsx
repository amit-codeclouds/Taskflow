'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Users, ListChecks } from 'lucide-react';
import { useTeamsList } from '@/lib/hooks/useTeams';
import { AssignedTeamsSkeleton } from '@/app/(shell)/teams/_skeleton';
import type { ApiTeam } from '@/lib/types/teams.types';
import { TeamInitial, MemberAvatar } from './TeamAvatars';

// ─── AssignedTeamCard ─────────────────────────────────────────────────────────

function AssignedTeamCard({
  team,
  index,
}: {
  team: ApiTeam;
  index: number;
}) {
  const activeCount    = team.members.length;
  const pendingCount   = team.pendingInvites;
  const visibleMembers = team.members.slice(0, 4);
  const overflow       = team.members.length - 4;

  return (
    <motion.div
      className="bg-bg-700 border border-border-subtle rounded-card p-5"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.07 }}
      whileHover={{ borderColor: '#2C2C3A' }}
    >
      <div className="flex items-start gap-3">
        <TeamInitial color={team.color} name={team.name} />

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-text-100">{team.name}</h3>
          <p className="text-xs text-text-300 mt-0.5 leading-relaxed">{team.description}</p>

          <div className="flex items-center justify-between mt-3">
            {/* Member avatars */}
            <div className="flex items-center gap-1.5">
              <div className="flex -space-x-1.5">
                {visibleMembers.map(m => (
                  <MemberAvatar key={m.userId} member={m} size="sm" />
                ))}
                {overflow > 0 && (
                  <div className="w-7 h-7 rounded-full bg-bg-600 border-2 border-bg-700 flex items-center justify-center text-[10px] text-text-300 font-medium cursor-default">
                    +{overflow}
                  </div>
                )}
              </div>
              <span className="text-2xs text-text-300">
                {activeCount} member{activeCount !== 1 ? 's' : ''}
                {pendingCount > 0 && (
                  <span className="text-status-amber"> · {pendingCount} pending</span>
                )}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5">
              {/* Cross-zone nav into mfe-task — plain <a>, never <Link>, per Multi-Zones rules */}
              <motion.a
                href={`/tasks/listview?teamid=${team.id}`}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium bg-bg-600 text-text-200 hover:bg-bg-500 hover:text-text-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ListChecks size={11} />
                View Tasks
              </motion.a>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── AssignedTeamsScreen ──────────────────────────────────────────────────────

export default function AssignedTeamsScreen() {
  const { data: teams = [], isPending } = useTeamsList({ excludeWorkspace: true });

  if (isPending) return <AssignedTeamsSkeleton />;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <h1 className="text-2xl font-semibold text-text-100">Assigned Teams</h1>
        <p className="text-sm text-text-300 mt-1">
          {teams.length} team{teams.length !== 1 ? 's' : ''} you've been assigned to
        </p>
      </motion.div>

      {/* Team list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {teams.map((team, i) => (
            <AssignedTeamCard
              key={team.id}
              team={team}
              index={i}
            />
          ))}
        </AnimatePresence>

        {teams.length === 0 && (
          <motion.div
            className="flex flex-col items-center justify-center py-20 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="w-12 h-12 rounded-2xl bg-bg-700 flex items-center justify-center text-text-300 mb-3">
              <Users size={22} strokeWidth={1.3} />
            </div>
            <p className="text-sm text-text-300">No assigned teams yet.</p>
            <p className="text-xs text-text-300 mt-1">
              Teams you're added to outside your workspace will show up here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
