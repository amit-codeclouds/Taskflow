import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL ?? '';

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const { data, status } = await axios.post(`${BACKEND_URL}/auth/signup`, body);
    // Signup returns SignupResponseDto (user info only — no tokens)
    return NextResponse.json(data, { status });
  } catch (err) {
    if (axios.isAxiosError(err) && err.response) {
      return NextResponse.json(err.response.data, { status: err.response.status });
    }
    return NextResponse.json({ message: 'Backend unreachable' }, { status: 502 });
  }
}
