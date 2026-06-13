'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Mail, Check, X, Users, UserCheck, Clock } from 'lucide-react';
import { WORKSPACE_MEMBERS, WORKSPACE_TEAMS, type WorkspaceMember } from '@/lib/workspace';

const STATS = [
  { label: 'Total Members',   value: WORKSPACE_MEMBERS.length,                                      color: 'text-text-100'        },
  { label: 'Active',          value: WORKSPACE_MEMBERS.filter(m => m.status === 'active').length,   color: 'text-status-green'    },
  { label: 'Pending Invites', value: WORKSPACE_MEMBERS.filter(m => m.status === 'pending').length,  color: 'text-status-amber'    },
  { label: 'Teams',           value: WORKSPACE_TEAMS.length,                                        color: 'text-accent-hover'    },
];

function InviteToWorkspaceForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent]   = useState(false);
  const [err, setErr]     = useState('');

  function handleSend() {
    if (!email.includes('@')) { setErr('Enter a valid email address.'); return; }
    setErr(''); setSent(true);
    setTimeout(() => { setSent(false); setEmail(''); onClose(); }, 1800);
  }

  return (
    <motion.div
      className="bg-bg-700 border border-accent/30 rounded-xl p-5 mb-4"
      initial={{ opacity: 0, y: -10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-text-100">Invite to workspace</h3>
        <button onClick={onClose} className="text-text-300 hover:text-text-100 transition-colors"><X size={16} /></button>
      </div>
      <p className="text-xs text-text-300 mb-3 leading-relaxed">
        They&apos;ll receive an email and will appear here as <span className="text-status-amber">Pending</span> until they accept.
      </p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
          <input
            type="email" value={email} onChange={e => { setEmail(e.target.value); setErr(''); }}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="colleague@example.com"
            className="w-full h-9 pl-8 pr-3 bg-bg-600 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <motion.button
          onClick={handleSend} disabled={sent}
          className={`flex items-center gap-1.5 h-9 px-4 rounded-lg text-sm font-medium shrink-0 ${sent ? 'bg-green-bg text-status-green' : 'bg-accent text-white hover:bg-accent-hover'}`}
          whileHover={sent ? {} : { scale: 1.02 }} whileTap={sent ? {} : { scale: 0.98 }}
        >
          {sent ? <><Check size={13} />Sent</> : 'Send invite'}
        </motion.button>
      </div>
      {err && <p className="text-xs text-status-red mt-1.5">{err}</p>}
    </motion.div>
  );
}

function MemberRow({ member, index }: { member: WorkspaceMember; index: number }) {
  const teams = WORKSPACE_TEAMS.filter(t => member.teamIds.includes(t.id));

  return (
    <motion.div
      className="flex items-center gap-4 px-5 py-3.5 border-b border-border-subtle last:border-0 hover:bg-bg-600 transition-colors group"
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30, delay: index * 0.04 }}
    >
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
        member.status === 'pending' ? 'bg-bg-600 text-text-300 border border-dashed border-bg-400' : 'bg-accent-bg text-accent'
      }`}>
        {member.initials}
      </div>

      {/* Name + email */}
      <div className="w-44 shrink-0">
        <p className={`text-sm font-medium ${member.status === 'pending' ? 'text-text-300' : 'text-text-100'}`}>
          {member.name}
        </p>
        <p className="text-xs text-text-300 truncate">{member.email}</p>
      </div>

      {/* Title */}
      <div className="w-32 shrink-0 hidden lg:block">
        <p className="text-xs text-text-300">{member.title}</p>
      </div>

      {/* Teams */}
      <div className="flex-1 flex flex-wrap gap-1.5">
        {teams.length === 0 ? (
          <span className="text-xs text-text-300">—</span>
        ) : (
          teams.map(t => (
            <span
              key={t.id}
              className="text-2xs font-medium px-2 py-0.5 rounded-full"
              style={{ background: t.color + '22', color: t.color }}
            >
              {t.name}
            </span>
          ))
        )}
      </div>

      {/* Status */}
      <div className="shrink-0">
        {member.status === 'active' ? (
          <span className="flex items-center gap-1 text-2xs font-medium text-status-green bg-green-bg px-2 py-0.5 rounded-full">
            <UserCheck size={10} />Active
          </span>
        ) : (
          <span className="flex items-center gap-1 text-2xs font-medium text-status-amber bg-amber-bg px-2 py-0.5 rounded-full">
            <Clock size={10} />Pending
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {member.status === 'pending' ? (
          <button className="text-xs text-text-300 hover:text-accent transition-colors px-2 py-1 rounded-md hover:bg-accent-bg">
            Resend
          </button>
        ) : (
          <button className="text-xs text-text-300 hover:text-text-100 transition-colors px-2 py-1 rounded-md hover:bg-bg-500">
            Manage
          </button>
        )}
      </div>
    </motion.div>
  );
}

export default function PeopleScreen() {
  const [members] = useState(WORKSPACE_MEMBERS);
  const [showInvite, setShowInvite] = useState(false);
  const [search, setSearch]         = useState('');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.email.toLowerCase().includes(search.toLowerCase());
    const matchTeam   = teamFilter === 'all' || m.teamIds.includes(teamFilter);
    const matchStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchSearch && matchTeam && matchStatus;
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div className="flex items-start justify-between mb-8"
        initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div>
          <h1 className="text-2xl font-semibold text-text-100">People</h1>
          <p className="text-sm text-text-300 mt-1">Manage everyone who has access to this workspace.</p>
        </div>
        <motion.button
          onClick={() => setShowInvite(v => !v)}
          className="flex items-center gap-2 bg-accent text-white text-sm font-medium px-4 py-2 rounded-lg"
          whileHover={{ scale: 1.02, boxShadow: '0 0 16px rgba(97,85,221,0.3)' }}
          whileTap={{ scale: 0.97 }}
        >
          <UserPlus size={14} />Invite to workspace
        </motion.button>
      </motion.div>

      {/* Stats */}
      <motion.div className="grid grid-cols-4 gap-3 mb-6"
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.05 }}
      >
        {STATS.map(s => (
          <div key={s.label} className="bg-bg-700 rounded-card border border-border-subtle p-4">
            <p className="text-2xs text-text-300 uppercase tracking-widest">{s.label}</p>
            <p className={`text-2xl font-semibold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Invite form */}
      <AnimatePresence>{showInvite && <InviteToWorkspaceForm onClose={() => setShowInvite(false)} />}</AnimatePresence>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-300" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full h-9 pl-8 pr-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-100 placeholder:text-text-300 focus:outline-none focus:border-accent transition-colors"
          />
        </div>
        <select
          value={teamFilter} onChange={e => setTeamFilter(e.target.value)}
          className="h-9 px-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">All teams</option>
          {WORKSPACE_TEAMS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select
          value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="h-9 px-3 bg-bg-700 border border-border-subtle rounded-lg text-sm text-text-200 focus:outline-none focus:border-accent transition-colors"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table header */}
      <div className="flex items-center gap-4 px-5 py-2.5 text-2xs text-text-300 uppercase tracking-widest border-b border-border-subtle">
        <div className="w-9 shrink-0" />
        <div className="w-44 shrink-0">Member</div>
        <div className="w-32 shrink-0 hidden lg:block">Title</div>
        <div className="flex-1">Teams</div>
        <div className="shrink-0 w-20">Status</div>
        <div className="shrink-0 w-16" />
      </div>

      {/* Member rows */}
      <div className="bg-bg-700 rounded-card border border-border-subtle overflow-hidden">
        {filtered.map((m, i) => <MemberRow key={m.id} member={m} index={i} />)}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Users size={24} className="text-text-300 mb-2" strokeWidth={1.3} />
            <p className="text-sm text-text-300">No members match your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
