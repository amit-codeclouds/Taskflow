import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Check for JWT access token (set by /api/auth/login proxy)
  const accessToken = request.cookies.get('taskflow_access_token')?.value;

  // Already authenticated → don't let them see login/signup
  if (accessToken && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Not authenticated → redirect to login
  if (!accessToken && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
