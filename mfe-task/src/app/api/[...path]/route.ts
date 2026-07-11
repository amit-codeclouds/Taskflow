import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join('/');
  const { search } = new URL(request.url);
  const target = `${BACKEND_URL}/${path}${search}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  let body: string | undefined;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.text();
  }

  try {
    const upstream = await fetch(target, {
      method: request.method,
      headers,
      body,
    });

    const text = await upstream.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      return new NextResponse(text, {
        status: upstream.status,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    return NextResponse.json(data, { status: upstream.status });
  } catch {
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}

export const GET    = handler;
export const POST   = handler;
export const PUT    = handler;
export const PATCH  = handler;
export const DELETE = handler;
