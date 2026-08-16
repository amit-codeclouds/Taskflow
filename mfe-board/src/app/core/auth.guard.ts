import { CanActivateFn } from '@angular/router';

const ACCESS_COOKIE = 'taskflow_access_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Route guard for the Board MFE.
 *
 * Board is a static Angular SPA served under /board — it has no server layer, so
 * this client-side guard is the equivalent of the Shell/Task middleware.
 *
 * It blocks routes when there is no session cookie and sends the user to /login.
 * /login lives in the Shell zone, so this is a hard `window.location` navigation
 * (the Worker routes /login to the Shell) — the Angular router would otherwise
 * stay inside the /board zone.
 *
 * Token *expiry* is handled by `refreshTokenInterceptor`: an expired-but-present
 * token lets the page load, then the first API 401 triggers a silent refresh (or
 * a redirect to /login if the refresh token is gone too). So the guard only needs
 * to catch the fully-logged-out case — no access-token cookie at all.
 */
export const authGuard: CanActivateFn = () => {
  if (getCookie(ACCESS_COOKIE)) return true;

  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  return false;
};
