'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { useInvitations, useAcceptInvite, useDeclineInvite } from '@/lib/hooks/useInvitations';
import { useMe } from '@/lib/hooks/useMe';
import type { Invitation } from '@/lib/types/invite.types';

function formatDate(iso: string): string {
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function InviteScreen() {
  // Always load the logged-in user's invitations whenever the Invite tab opens
  // (the hook stays disabled until the user id is available).
  const router = useRouter();
  const { data: me } = useMe();
  const { data: invitations, isPending } = useInvitations(me?.id ?? '');

  const accept = useAcceptInvite();
  const decline = useDeclineInvite();

  // Which invitation row is currently being acted on (accept or decline).
  const [actingId, setActingId] = useState<string | null>(null);

  useEffect(() => {
    if (invitations) console.log('Invitation list response:', invitations);
  }, [invitations]);

  function handleAccept(inv: Invitation) {
    if (!me?.id) return;
    setActingId(inv.id);
    accept.mutate(
      { workspaceId: inv.workspaceId, userId: me.id },
      {
        // On successful accept, go to that workspace's details page.
        onSuccess: () => router.push(`/workspace/${inv.workspaceId}`),
        onSettled: () => setActingId(null),
      },
    );
  }
  function handleReject(inv: Invitation) {
    if (!me?.id) return;
    setActingId(inv.id);
    decline.mutate(
      { workspaceId: inv.workspaceId, userId: me.id },
      { onSettled: () => setActingId(null) },
    );
  }

  const loading = isPending;
  const rows = invitations ?? [];
  const busy = accept.isPending || decline.isPending;

  return (
    <div className="max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <header className="flex items-start gap-3 pb-6 border-b border-border-subtle">
        <div className="w-10 h-10 rounded-xl bg-accent-bg flex items-center justify-center text-accent shrink-0">
          <UserPlus size={18} strokeWidth={1.5} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-text-100">Invite</h1>
          <p className="text-sm text-text-300 mt-1">Pending invitations to join a workspace.</p>
        </div>
      </header>

      {/* Body — invitations table */}
      <div className="flex-1 py-8">
        <div className="rounded-xl border border-border-subtle bg-bg-700 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-subtle text-left text-2xs uppercase tracking-wider text-text-300">
                <th className="px-4 py-3 font-medium">Workspace</th>
                <th className="px-4 py-3 font-medium">Invited By</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Expires</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-300">Loading invitations…</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-text-300">No pending invitations.</td>
                </tr>
              ) : (
                rows.map((inv) => (
                  <tr key={inv.id} className="border-b border-border-subtle last:border-0 hover:bg-bg-600 transition-colors">
                    <td className="px-4 py-3 text-text-100">{inv.workspaceName}</td>
                    <td className="px-4 py-3 text-text-200">{inv.invitedBy}</td>
                    <td className="px-4 py-3 text-text-200">{inv.email}</td>
                    <td className="px-4 py-3 text-text-300">{formatDate(inv.expiresAt)}</td>
                    <td className="px-4 py-3 text-text-300">{formatDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleAccept(inv)}
                          disabled={busy}
                          className="h-8 px-3 rounded-lg text-xs font-medium text-white bg-accent hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actingId === inv.id && accept.isPending ? 'Accepting…' : 'Accept'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(inv)}
                          disabled={busy}
                          className="h-8 px-3 rounded-lg text-xs font-medium text-status-red bg-red-bg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {actingId === inv.id && decline.isPending ? 'Rejecting…' : 'Reject'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-5 border-t border-border-subtle flex items-center justify-between text-xs text-text-300">
        <span>Taskflow · Invite</span>
        <span>More coming soon</span>
      </footer>
    </div>
  );
}
