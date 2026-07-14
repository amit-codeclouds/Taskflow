import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = (process.env.NEXT_PUBLIC_BACKEND_URL ?? '').replace(/\/$/, '');

async function handler(
  request: NextRequest,
  { params }: { params: { path: string[] } },
) {
  const path = params.path.join('/');
  const { search } = new URL(request.url);
  const target = `${BACKEND_URL}/${path}${search}`;

  const headers: Record<string, string> = {};

  const contentType = request.headers.get('Content-Type');
  headers['Content-Type'] = contentType ?? 'application/json';

  const auth = request.headers.get('Authorization');
  if (auth) headers['Authorization'] = auth;

  // Use arrayBuffer, not text() — text() re-encodes as UTF-8 and corrupts
  // binary bodies like multipart file uploads.
  let body: ArrayBuffer | undefined;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
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
