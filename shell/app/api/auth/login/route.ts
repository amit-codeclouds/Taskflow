import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

function jwtTTL(jwt: string): number {
  try {
    const payload = JSON.parse(Buffer.from(jwt.split('.')[1], 'base64url').toString());
    return typeof payload.exp === 'number' && typeof payload.iat === 'number'
      ? payload.exp - payload.iat
      : 3600;
  } catch {
    return 3600;
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const { data, status } = await axios.post(`${BACKEND_URL}/auth/login`, body);

    const response = NextResponse.json(data, { status });

    const accessToken: string | undefined = data.result?.token;
    const refreshToken: string | undefined = data.result?.refreshToken;

    if (accessToken) {
      response.cookies.set('taskflow_access_token', accessToken, {
        path: '/',
        maxAge: jwtTTL(accessToken),
        sameSite: 'lax',
      });
    }

    if (refreshToken) {
      response.cookies.set('taskflow_refresh_token', refreshToken, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
      });
    }

    return response;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(err.response.data, { status: err.response.status });
    }
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}
