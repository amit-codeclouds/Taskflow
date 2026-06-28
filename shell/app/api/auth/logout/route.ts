import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });

  response.cookies.delete('taskflow_access_token');
  response.cookies.delete('taskflow_refresh_token');
  response.cookies.delete('taskflow_session');
  response.cookies.delete('taskflow_name');
  response.cookies.delete('taskflow_email');
  response.cookies.delete('taskflow_title');

  return response;
}
