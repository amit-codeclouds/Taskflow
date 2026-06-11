'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, UserPlus, Plus, Mail, X, Check, Shield, ChevronDown } from 'lucide-react';
import { WORKSPACE_MEMBERS } from '@/lib/workspace';

interface Member {
  initials: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
}

interface Team {
  id: string;
  name: string;
  description: string;
  members: Member[];
  pendingInvites: number;
  color: string;
}

const TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'Taskflow Core',
    description: 'Engineering team building the core platform.',
    color: '#6155DD',
    pendingInvites: 1,
    members: [
      { initials: 'AC', name: 'Arkabrata',   email: 'arkabrata@codeclouds.com', role: 'admin'  },
      { initials: 'JD', name: 'John Doe',    email: 'john@codeclouds.com',      role: 'member' },
      { initials: 'MK', name: 'Maya Khan',   email: 'maya@codeclouds.com',      role: 'member' },
    ],
  },
  {
    id: 'team_2',
    name: 'Design System',
    description: 'Maintains the shared UI component library.',
    color: '#32B173',
    pendingInvites: 0,
    members: [
      { initials: 'AC', name: 'Arkabrata', email: 'arkabrata@codeclouds.com', role: 'admin'  },
      { initials: 'SR', name: 'Sam Roy',   email: 'sam@codeclouds.com',       role: 'member' },
    ],
  },
];

const STATS = [
  { label: 'Total Teams',     value: 2 },
  { label: 'Total Members',   value: 4 },
  { label: 'Pending Invites', value: 1 },
];

function TeamInitial({ color, name }: { color: string; name: string }) {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-semibold shrink-0"
      style={{ background: color + '33', color }}
    >
      {name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MemberAvatar({ member, size = 'md' }: { member: Member; size?: 'sm' | 'md' }) {
  const dim = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  return (
    <div
      title={`${member.name} (${member.role})`}
      className={`${dim} rounded-full bg-accent-bg flex items-center justify-center text-accent font-semibold shrink-0 border-2 border-bg-700`}
    >
      {member.initials}
    </div>
  );
}

function InviteForm({ teamId, teamName, existingMemberEmails, onClose }: {
  teamId: string; teamName: string; existingMemberEmails: string[]; onClose: () => void;
}) {
  const [mode, setMode]             = useState<'workspace' | 'email'>('workspace');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [email, setEmail]           = useState('');
  const [done, setDone]             = useState(false);
  const [error, setError]           = useState('');

  // Workspace members not already in this team
  const available = WORKSPACE_MEMBERS.filter(m => !existingMemberEmails.includes(m.email));

  function handleAdd() {
    if (!selectedId) return;
    setDone(true);
    setTimeout(() => { setDone(false); setSelectedId(null); onClose(); }, 1500);
  }

  function handleEmailSend() {
    if (!email.includes('@')) { setError('Enter a valid email address.'); return; }
    setError(''); setDone(true);
    setTimeout(() => { setDone(false); setEmail(''); onClose(); }, 1500);
  }

  return (
    <motion.div
      className="mt-3 pt-3 border-t border-border-subtle"
      initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <p className="text-xs text-text-300 mb-2.5">
        Add member to <span className="text-text-100 font-medium">{teamName}</span>
      </p>

      {/* Mode tabs */}
      <div className="flex gap-0.5 bg-bg-800 rounded-lg p-0.5 w-fit mb-3">
        {(['workspace', 'email'] as const).map(m => (
          <button key={m} onClick={() => { setMode(m); setError(''); }}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${mode === m ? 'bg-bg-600 text-text-100' : 'text-text-300 hover:text-text-200'}`}
          >
            {m === 'workspace' ? 'From workspace' : 'Invite by email'}
          </button>
        ))}
      </div>

      {mode === 'workspace' ? (
        <div className="flex flex-col gap-1.5">
          {available.length === 0 ? (
            <p className="text-xs text-text-300 py-2">All workspace members are already in this team.</p>
          ) : (
            available.map(m => (
              <button key={m.id} onClick={() => setSelectedId(m.id)}
                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-left transition-colors ${
                  selectedId === m.id ? 'bg-accent-bg border border-accent/30' : 'bg-bg-600 hover:bg-bg-500 border border-transparent'
                }`}
              >
                <div className="w-7 h-7 rounded-full bg-accent-bg flex items-center justify-center text-accent text-xs font-semibold shrink-0">{m.initials}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-text-100 truncate">{m.name}</p>
                  <p className="text-xs text-text-300 truncate">{m.email}</p>
                </div>
                {selectedId === m.id && <Check size={14} className="text-accent shrink-0" />}
              </button>
            ))
          )}
          {available.length > 0 && (
            <motion.button onClick={handleAdd} disabled={!selectedId || done}
              className={`mt-1 flex items-center justify-center gap-1.5 h-8 rounded-lg text-sm font-medium transition-colors ${
                done ? 'bg-green-bg text-status-green' : selectedId ? 'bg-accent text-white hover:bg-accent-hover' : 'bg-bg-600 text-text-300 cursor-not-allowed'
              }`}
              whileHover={selectedId && !done ? { scale: 1.01 } : {}}
            >
              {done ? <><Check size={13} />Added</> : 'Add to team'}
            </motion.button>
          )}
        </div>
      ) : (
        <div>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
              <input type="email" value={email}
                onChange={e => { setEmail(e.target.value); setError(''); }}
                onKeyDown={e => e.key === 'Enter' && handleEmailSend()}
                placeholder="colleague@example.com"
                className="w-full h-9 pl-8 pr-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <motion.button onClick={handleEmailSend} disabled={done}
              className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium shrink-0 ${done ? 'bg-green-bg text-status-green' : 'bg-accent text-white hover:bg-accent-hover'}`}
              whileHover={done ? {} : { scale: 1.02 }} whileTap={done ? {} : { scale: 0.98 }}
            >
              {done ? <><Check size={13} />Sent</> : 'Send invite'}
            </motion.button>
          </div>
          {error && <p className="text-xs text-status-red mt-1.5">{error}</p>}
        </div>
      )}
    </motion.div>
  );
}

function CreateTeamForm({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string, desc: string) => void }) {
  const [name, setName]   = useState('');
  const [desc, setDesc]   = useState('');
  const [error, setError] = useState('');

  function handleCreate() {
    if (!name.trim()) { setError('Team name is required.'); return; }
    onCreate(name.trim(), desc.trim());
  }

  return (
    <motion.div
      className="bg-bg-700 border border-accent/30 rounded-card p-5 mb-4"
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-100">Create a new team</h3>
        <button onClick={onClose} className="text-text-300 hover:text-text-100 transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-text-300 mb-1.5 block">Team name</label>
          <input
            autoFocus
            type="text"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="e.g. Frontend Team"
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
          {error && <p className="text-xs text-status-red mt-1">{error}</p>}
        </div>
        <div>
          <label className="text-xs text-text-300 mb-1.5 block">Description <span className="text-text-300">(optional)</span></label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="What does this team work on?"
            className="w-full h-9 px-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="h-9 px-4 rounded-lg text-sm text-text-200 hover:text-text-100 hover:bg-bg-600 transition-colors"
        >
          Cancel
        </button>
        <motion.button
          onClick={handleCreate}
          className="flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium bg-accent text-white hover:bg-accent-hover transition-colors"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={13} />
          Create Team
        </motion.button>
      </div>
    </motion.div>
  );
}

function TeamCard({ team, index }: { team: Team; index: number }) {
  const [inviteOpen, setInviteOpen] = useState(false);

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
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold text-text-100">{team.name}</h3>
            <span
              className="text-2xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: team.color + '22', color: team.color }}
            >
              <Shield size={10} />
              Admin
            </span>
          </div>
          <p className="text-xs text-text-300 mt-0.5 leading-relaxed">{team.description}</p>

          <div className="flex items-center justify-between mt-3">
            {/* Member avatars */}
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1.5">
                {team.members.slice(0, 3).map(m => (
                  <MemberAvatar key={m.email} member={m} size="sm" />
                ))}
                {team.members.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-bg-600 border-2 border-bg-700 flex items-center justify-center text-[10px] text-text-300 font-medium">
                    +{team.members.length - 3}
                  </div>
                )}
              </div>
              <span className="text-2xs text-text-300 ml-1.5">
                {team.members.length} member{team.members.length !== 1 ? 's' : ''}
                {team.pendingInvites > 0 && (
                  <span className="text-status-amber"> · {team.pendingInvites} pending</span>
                )}
              </span>
            </div>

            {/* Invite toggle */}
            <motion.button
              onClick={() => setInviteOpen(v => !v)}
              className={`flex items-center gap-1.5 h-7 px-3 rounded-lg text-xs font-medium transition-colors ${
                inviteOpen
                  ? 'bg-accent-bg text-accent-hover'
                  : 'bg-bg-600 text-text-200 hover:bg-bg-500 hover:text-text-100'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <UserPlus size={12} />
              Invite
              <motion.span animate={{ rotate: inviteOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={11} />
              </motion.span>
            </motion.button>
          </div>

          <AnimatePresence>
            {inviteOpen && (
              <InviteForm
                teamId={team.id}
                teamName={team.name}
                existingMemberEmails={team.members.map(m => m.email)}
                onClose={() => setInviteOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default function TeamsScreen() {
  const [teams, setTeams]         = useState<Team[]>(TEAMS);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(name: string, desc: string) {
    const colors = ['#6155DD', '#32B173', '#E09D34', '#6a9eef', '#DC4949'];
    const newTeam: Team = {
      id: `team_${Date.now()}`,
      name,
      description: desc || 'No description yet.',
      color: colors[teams.length % colors.length],
      pendingInvites: 0,
      members: [
        { initials: 'AC', name: 'Arkabrata', email: 'arkabrata@codeclouds.com', role: 'admin' },
      ],
    };
    setTeams(prev => [...prev, newTeam]);
    setShowCreate(false);
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
          <p className="text-sm text-text-300 mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''} you belong to</p>
        </div>
        <motion.button
          onClick={() => setShowCreate(v => !v)}
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
        {STATS.map(stat => (
          <div key={stat.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{stat.label}</p>
            <p className="text-2xl font-semibold text-text-100 mt-1">{stat.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Create form */}
      <AnimatePresence>
        {showCreate && (
          <CreateTeamForm onClose={() => setShowCreate(false)} onCreate={handleCreate} />
        )}
      </AnimatePresence>

      {/* Team list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence>
          {teams.map((team, i) => (
            <TeamCard key={team.id} team={team} index={i} />
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
    </div>
  );
}
