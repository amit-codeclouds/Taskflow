import { CanActivateFn } from '@angular/router';

const ACCESS_COOKIE = 'taskflow_access_token';

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;)\\s*' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

// Decode a JWT payload — base64url → UTF-8 JSON.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  try {
    const json = decodeURIComponent(
      atob(b64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

/**
 * True unless we can positively prove the access token is expired.
 * Missing token → false. Present but not a decodable JWT (or no `exp`) → treated
 * as valid, so an opaque token is never wrongly rejected.
 */
export function isAuthenticated(): boolean {
  const token = getCookie(ACCESS_COOKIE);
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload['exp'];
  if (typeof exp !== 'number') return true;
  return exp * 1000 > Date.now();
}

export function redirectToLogin(): void {
  // /login lives in the Shell zone — hard navigation so the Worker routes it there.
  if (typeof window !== 'undefined') window.location.href = '/login';
}

/**
 * Route guard for the Board MFE (static Angular SPA — no server middleware).
 * The primary gate runs pre-bootstrap in main.ts (so the app chrome / `me` call
 * never fire for an unauthenticated user); this guard is defense-in-depth for a
 * session that expires while the app is already running.
 */
export const authGuard: CanActivateFn = () => {
  if (isAuthenticated()) return true;
  redirectToLogin();
  return false;
};
