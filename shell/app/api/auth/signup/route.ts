import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { name, email, password, title } = await request.json();

  if (!name || !email || !password) {
    return NextResponse.json({ ok: false, error: 'All fields are required' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ ok: false, error: 'Password must be at least 6 characters' }, { status: 400 });
  }

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
  if (title) {
    response.cookies.set('taskflow_title', title, {
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}
