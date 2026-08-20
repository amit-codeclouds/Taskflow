'use client';

import { motion } from 'framer-motion';
import { Building2, Crown, Mail, Users, UsersRound } from 'lucide-react';
import Avatar from '@/components/ui/Avatar';
import { getInitials } from '@/lib/initials';
import { useWorkspace } from '@/lib/hooks/useWorkspace';
import { WorkspaceDetailsSkeleton } from '@/app/(shell)/workspace/[id]/_skeleton';

function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  icon, title, count, children, delay = 0,
}: {
  icon: React.ReactNode; title: string; count: number; children: React.ReactNode; delay?: number;
}) {
  return (
    <motion.section
      className="bg-bg-700 rounded-xl border border-border-subtle overflow-hidden"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28, delay }}
    >
      <div className="flex items-center gap-2.5 px-6 py-4 border-b border-border-subtle">
        <span className="text-accent">{icon}</span>
        <h2 className="text-sm font-semibold text-text-100">{title}</h2>
        <span className="text-2xs font-medium text-text-300 bg-bg-600 px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {children}
    </motion.section>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function WorkspaceDetailsScreen({ workspaceId }: { workspaceId: string }) {
  const { data: workspace, isPending, isError } = useWorkspace(workspaceId);

  if (isPending) return <WorkspaceDetailsSkeleton />;

  if (isError || !workspace) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center">
        <p className="text-sm text-text-300">Couldn&apos;t load this workspace. Please try again.</p>
      </div>
    );
  }

  const { name, owner, teams, members, createdAt } = workspace;

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-6">
      {/* Page header */}
      <motion.div
        className="flex items-start gap-3"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="w-11 h-11 rounded-xl bg-accent-bg flex items-center justify-center text-accent shrink-0">
          <Building2 size={20} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-100">{name}</h1>
          <p className="text-sm text-text-300 mt-1">
            Created {formatDate(createdAt)} · {teams.length} team{teams.length === 1 ? '' : 's'} · {members.length} member{members.length === 1 ? '' : 's'}
          </p>
        </div>
      </motion.div>

      {/* Owner */}
      <motion.section
        className="bg-bg-700 rounded-xl border border-border-subtle p-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.06 }}
      >
        <div className="flex items-center gap-2 mb-4 text-accent">
          <Crown size={15} strokeWidth={1.5} />
          <h2 className="text-sm font-semibold text-text-100">Workspace Owner</h2>
        </div>
        <div className="flex items-center gap-4">
          <Avatar initials={getInitials(owner.name)} avatarUrl={owner.avatarUrl || undefined} name={owner.name} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-base font-semibold text-text-100">{owner.name}</p>
              <span className="inline-flex items-center gap-1 text-2xs font-medium text-status-amber bg-amber-bg px-2 py-0.5 rounded-full">
                <Crown size={10} strokeWidth={2} /> Owner
              </span>
            </div>
            <p className="text-sm text-text-300 mt-0.5">{owner.title}</p>
            <a href={`mailto:${owner.email}`} className="inline-flex items-center gap-1.5 text-sm text-text-200 hover:text-accent transition-colors mt-1.5">
              <Mail size={13} strokeWidth={1.5} /> {owner.email}
            </a>
          </div>
        </div>
      </motion.section>

      {/* Teams */}
      <Section icon={<UsersRound size={15} strokeWidth={1.5} />} title="Teams" count={teams.length} delay={0.12}>
        {teams.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-text-300">No teams in this workspace.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
            {teams.map((team) => (
              <a
                key={team.id}
                href={`/board/${team.id}`}
                className="group flex items-center gap-3 rounded-lg border border-border-subtle bg-bg-600 px-4 py-3 hover:border-accent/40 transition-colors"
              >
                <span
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-semibold shrink-0"
                  style={{ background: `color-mix(in srgb, ${team.color} 20%, transparent)`, color: team.color }}
                >
                  {getInitials(team.name)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-text-100 truncate group-hover:text-accent-hover transition-colors">{team.name}</p>
                  <p className="text-xs text-text-300 truncate">{team.description?.trim() || 'No description'}</p>
                </div>
              </a>
            ))}
          </div>
        )}
      </Section>

      {/* Members */}
      <Section icon={<Users size={15} strokeWidth={1.5} />} title="Members" count={members.length} delay={0.18}>
        {members.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-text-300">No members in this workspace.</p>
        ) : (
          <ul className="divide-y divide-border-subtle">
            {members.map((m) => (
              <li key={m.id} className="flex items-center gap-3 px-6 py-3.5">
                <Avatar initials={getInitials(m.name)} avatarUrl={m.avatarUrl || undefined} name={m.name} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-text-100 truncate">
                    {m.name}
                    {m.id === owner.id || m.email === owner.email ? (
                      <span className="ml-2 text-2xs font-medium text-status-amber bg-amber-bg px-1.5 py-0.5 rounded-full align-middle">Owner</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-text-300 truncate">{m.email}</p>
                </div>
                <span className="text-2xs font-medium text-text-300 bg-bg-600 px-2 py-1 rounded-md shrink-0">{m.title}</span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
