import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'API is alive' });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    return NextResponse.json({ success: true, message: 'API is reachable', received: body });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to parse JSON' }, { status: 400 });
  }
}
