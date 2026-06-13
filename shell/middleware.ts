import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  // Auth guard disabled in development — no backend yet
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next();
  }

  const session = request.cookies.get('taskflow_session');
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (session && isPublic) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
