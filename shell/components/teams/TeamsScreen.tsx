'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Plus, Settings } from 'lucide-react';
import { useTeamsList, useTeamsStats, useInviteTeamMember } from '@/lib/hooks/useTeams';
import { useAuth } from '@/lib/useAuth';
import { TeamsSkeleton } from '@/app/(shell)/teams/_skeleton';
import type { ApiTeam, TeamRole } from '@/lib/types/teams.types';
import TeamInviteModal from './TeamInviteModal';
import { TeamInitial, MemberAvatar } from './TeamAvatars';

// ─── TeamCard ─────────────────────────────────────────────────────────────────

function TeamCard({
  team,
  index,
  onManage,
  onInvite,
}: {
  team: ApiTeam;
  index: number;
  onManage: (team: ApiTeam) => void;
  onInvite: (team: ApiTeam) => void;
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
              <motion.button
                onClick={() => onManage(team)}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium bg-bg-600 text-text-200 hover:bg-bg-500 hover:text-text-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <Settings size={11} />
                Manage
              </motion.button>
              <motion.button
                onClick={() => onInvite(team)}
                className="flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium bg-bg-600 text-text-200 hover:bg-bg-500 hover:text-text-100 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <UserPlus size={11} />
                Invite
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── TeamsScreen ──────────────────────────────────────────────────────────────

export default function TeamsScreen() {
  const router = useRouter();
  const auth   = useAuth();
  const { data: teams = [], isPending }  = useTeamsList();
  const { data: statsData }             = useTeamsStats();
  const inviteMutation                  = useInviteTeamMember();

  const [invitingTeam, setInvitingTeam] = useState<ApiTeam | null>(null);

  const stats = [
    { label: 'Total Teams',     value: statsData?.totalTeams    ?? teams.length },
    { label: 'Total Members',   value: statsData?.totalMembers  ?? 0 },
    { label: 'Pending Invites', value: statsData?.pendingInvites ?? 0 },
  ];

  if (isPending) return <TeamsSkeleton />;

  function handleInvite(email: string, role: TeamRole, addToWorkspace: boolean) {
    if (!invitingTeam) return;
    inviteMutation.mutate({ teamId: invitingTeam.id, email, role, addToWorkspace });
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">My Teams</h1>
          <p className="text-sm text-text-300 mt-1">
            {teams.length} team{teams.length !== 1 ? 's' : ''} you belong to
          </p>
        </div>
        <motion.button
          onClick={() => router.push(`/teams/new?workspaceId=${auth.workspaceId}`)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
          <Plus size={14} />
          New Team
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid grid-cols-3 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {stats.map(stat => (
          <div key={stat.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-semibold text-text-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Team list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {teams.map((team, i) => (
            <TeamCard
              key={team.id}
              team={team}
              index={i}
              onManage={t => router.push(`/teams/${t.id}`)}
              onInvite={setInvitingTeam}
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
            <p className="text-sm text-text-300">No teams yet.</p>
            <p className="text-xs text-text-300 mt-1">
              Click <span className="text-text-200">New Team</span> to get started.
            </p>
          </motion.div>
        )}
      </div>

      {/* Invite modal */}
      <AnimatePresence>
        {invitingTeam && (
          <TeamInviteModal
            key={`invite-${invitingTeam.id}`}
            team={invitingTeam}
            existingEmails={[]}
            onClose={() => setInvitingTeam(null)}
            onInvite={handleInvite}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
