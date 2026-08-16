import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

// Valid unless we can positively prove the token is expired. Missing → invalid.
// Present but not a decodable JWT (or no `exp`) → treated as valid, so a user
// holding an opaque token is never wrongly logged out.
function isTokenValid(token: string | undefined): boolean {
  if (!token) return false;
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  const exp = payload.exp;
  if (typeof exp !== 'number') return true;
  return exp * 1000 > Date.now();
}

export function middleware(request: NextRequest) {
  const accessToken = request.cookies.get('taskflow_access_token')?.value;
  const refreshToken = request.cookies.get('taskflow_refresh_token')?.value;

  // Authenticated when the access token is still valid, OR a valid refresh token
  // exists (the client's axios interceptor will silently refresh it).
  const isAuthenticated = isTokenValid(accessToken) || isTokenValid(refreshToken);

  // Every route in this zone is protected — /login lives in the Shell zone, so an
  // unauthenticated user is sent there (the Worker routes /login to the Shell).
  //
  // Emit the redirect with an explicit Location header rather than
  // NextResponse.redirect(): with basePath '/tasks', the helper can prefix the
  // basePath onto the target (→ /tasks/login), which this zone can't serve. The
  // raw header is passed through untouched, so the browser goes to root /login.
  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    return new NextResponse(null, {
      status: 307,
      headers: { Location: loginUrl.toString() },
    });
  }

  return NextResponse.next();
}

export const config = {
  // Include '/' explicitly so the zone's index route (/tasks) is guarded too —
  // with basePath the regex matcher alone can miss it.
  matcher: ['/', '/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
