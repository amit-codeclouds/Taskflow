import { Injectable, signal } from '@angular/core';

const THEME_COOKIE = 'taskflow_theme';

export type Theme = 'dark' | 'light';

function readThemeCookie(): Theme {
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + THEME_COOKIE + '=([^;]+)'));
  return match && decodeURIComponent(match[1]) === 'light' ? 'light' : 'dark';
}

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = signal<Theme>(readThemeCookie());

  toggle() {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    document.cookie = `${THEME_COOKIE}=${encodeURIComponent(next)}; path=/; max-age=31536000; SameSite=Lax`;
    document.documentElement.setAttribute('data-theme', next);
    this.theme.set(next);
  }
}
