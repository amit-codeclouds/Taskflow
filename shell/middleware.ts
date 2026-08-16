import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

// Decode a JWT payload in the Edge runtime (no Buffer) — base64url → UTF-8 JSON.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length < 2) return null;
  let b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  try {
    const binary = atob(b64);
    const json = decodeURIComponent(
      binary
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// A token counts as valid unless we can positively prove it is expired.
// Missing token → invalid. Present but not a decodable JWT (or no `exp`) → treated
// as valid, so we never wrongly log out a user holding an opaque/non-JWT token.
// Only a decodable token whose `exp` is in the past counts as logged out.
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== 'number') return true;
  return exp * 1000 > Date.now();
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'));

  const accessToken = request.cookies.get('taskflow_access_token')?.value;
  const refreshToken = request.cookies.get('taskflow_refresh_token')?.value;

  // Authenticated when the access token is still valid, OR a valid refresh token
  // exists (the client's axios interceptor will silently refresh the access token).
  // A lingering-but-expired access-token cookie no longer counts as logged in.
  const isAuthenticated = isTokenValid(accessToken) || isTokenValid(refreshToken);

  // Already authenticated → don't let them see login/signup
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Not authenticated → redirect any protected route to login
  if (!isAuthenticated && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
