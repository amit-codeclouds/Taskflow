'use client';

const THEME_COOKIE = 'taskflow_theme';

export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'dark';
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + THEME_COOKIE + '=([^;]+)'));
  return match && decodeURIComponent(match[1]) === 'light' ? 'light' : 'dark';
}

export function setTheme(theme: Theme): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${THEME_COOKIE}=${encodeURIComponent(theme)}; path=/; max-age=31536000; SameSite=Lax`;
}
