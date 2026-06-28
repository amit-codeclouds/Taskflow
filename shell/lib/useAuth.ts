'use client';

import { useMe } from '@/lib/hooks/useMe';
import { getInitials } from '@/lib/initials';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  title: string;
  initials: string;
  isPending: boolean;
}

export function useAuth(): AuthUser {
  const { data, isPending } = useMe();

  if (!data) {
    return { id: '', name: '', email: '', title: '', initials: '??', isPending };
  }

  const name = data.name ?? '';
  return {
    id: data.id,
    name,
    email: data.email ?? '',
    title: data.title ?? '',
    initials: data.avatarInitials || getInitials(name),
    isPending,
  };
}
