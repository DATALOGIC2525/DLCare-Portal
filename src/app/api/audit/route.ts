import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id || null;

    const body = await request.json();
    const { action, target, metadata } = body;

    if (!action) {
      return NextResponse.json({ error: 'Action is required' }, { status: 400 });
    }

    // 非同期でDBに書き込む
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        target,
        metadata: metadata ? JSON.stringify(metadata) : null,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Audit log error:', error);
    // エラーが発生してもクライアントに影響を与えないように200を返すか、静かに失敗させる
    return NextResponse.json({ error: 'Failed to record audit log' }, { status: 500 });
  }
}
