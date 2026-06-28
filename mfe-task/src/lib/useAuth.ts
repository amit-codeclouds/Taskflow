'use client';
import { useState, useEffect } from 'react';

export interface AuthUser {
  name: string;
  email: string;
  title: string;
  initials: string;
}

function getCookie(name: string): string {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : '';
}

export function useAuth(): AuthUser {
  const [user, setUser] = useState<AuthUser>({ name: '', email: '', title: '', initials: '' });

  useEffect(() => {
    const email = getCookie('taskflow_email');
    const rawName = getCookie('taskflow_name') || email.split('@')[0] || 'User';
    const name = rawName.replace(/\+/g, ' ');
    const parts = name.trim().split(/\s+/);
    const initials =
      parts.length >= 2
        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
        : name.slice(0, 2).toUpperCase();
    const title = getCookie('taskflow_title');
    setUser({ name, email, title, initials });
  }, []);

  return user;
}
