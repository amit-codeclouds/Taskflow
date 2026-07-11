import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

export async function PATCH(request: NextRequest) {
  const refreshToken = request.cookies.get('taskflow_refresh_token')?.value;

  if (!refreshToken) {
    return NextResponse.json({ message: 'No refresh token' }, { status: 401 });
  }

  try {
    const { data, status } = await axios.patch(`${BACKEND_URL}/auth/refresh`, { refreshToken });

    const response = NextResponse.json(data, { status });

    const accessToken: string | undefined = data.result?.token;
    if (accessToken) {
      let ttl = 3600;
      try {
        const p = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64url').toString());
        if (typeof p.exp === 'number' && typeof p.iat === 'number') ttl = p.exp - p.iat;
      } catch { /* keep 3600 */ }
      response.cookies.set('taskflow_access_token', accessToken, {
        path: '/',
        maxAge: ttl,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      const response = NextResponse.json(err.response.data, { status: err.response.status });
      response.cookies.delete('taskflow_access_token');
      response.cookies.delete('taskflow_refresh_token');
      return response;
    }
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}
