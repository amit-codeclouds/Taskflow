'use client';

import { useMe } from '@/lib/hooks/useMe';
import { getInitials } from '@/lib/initials';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title: string;
  initials: string;
  avatarUrl?: string;
  workspaceId: string;
  workspaceName: string;
  isPending: boolean;
}

export function useAuth(): AuthUser {
  const { data, isPending } = useMe();

  if (!data) {
    return { id: '', name: '', email: '', title: '', initials: '??', workspaceId: '', workspaceName: '', isPending };
  }

  const name = data.name ?? '';
  // Prefer the workspace the user owns — `workspaces[]` order isn't guaranteed,
  // so picking index 0 could land on a workspace they were merely invited into.
  const workspace = data.workspaces?.find((w) => w.role === 'owner') ?? data.workspaces?.[0];
  return {
    id: data.id,
    name,
    email: data.email ?? '',
    title: data.title ?? '',
    initials: data.avatarInitials || getInitials(name),
    avatarUrl: data.avatarUrl,
    workspaceId: workspace?.workspaceId ?? '',
    workspaceName: workspace?.name ?? '',
    isPending,
  };
}
