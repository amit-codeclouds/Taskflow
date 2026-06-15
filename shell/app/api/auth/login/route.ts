import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ ok: false, error: 'Email and password are required' }, { status: 400 });
  }

  const name = email.split('@')[0].replace(/[._-]/g, ' ');

  const response = NextResponse.json({ ok: true });

  response.cookies.set('taskflow_session', `stub-${Date.now()}`, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set('taskflow_name', name, {
    sameSite: 'lax',
    path: '/',
  });
  response.cookies.set('taskflow_email', email, {
    sameSite: 'lax',
    path: '/',
  });

  return response;
}
