import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { contactName, email, preIssuedId, password, department } = body;

    if (!contactName || !email || !preIssuedId || !password) {
      return new Response(JSON.stringify({ error: '必須項目が不足しています' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // トランザクションで処理
    const result = await prisma.$transaction(async (tx) => {
      // 事前発行IDの検証
      const issuedIdRecord = await tx.preIssuedId.findUnique({
        where: { issuedId: preIssuedId },
        include: { tenant: { include: { _count: { select: { users: true } } } } }
      });

      if (!issuedIdRecord) {
        throw new Error('無効な発行済みIDです');
      }

      if (issuedIdRecord.isUsed) {
        throw new Error('この発行済みIDは既に使用されています');
      }

      const tenant = issuedIdRecord.tenant;
      if (tenant._count.users >= tenant.userLimit) {
        throw new Error('テナントのユーザー上限数を超過しているため登録できません');
      }

      // メールアドレスの重複チェック
      const existingUser = await tx.user.findUnique({ where: { email } });
      if (existingUser) {
        throw new Error('このメールアドレスは既に登録されています');
      }

      const passwordHash = await bcrypt.hash(password, 10);
      
      // 既存の管理者がいれば降格させる（管理者は常に1人）
      await tx.user.updateMany({
        where: { tenantId: tenant.id, role: 'TENANT_ADMIN' },
        data: { role: 'GENERAL_USER' }
      });

      // ユーザー作成（テナント管理者として登録）
      const newUser = await tx.user.create({
        data: {
          tenantId: tenant.id,
          role: 'TENANT_ADMIN',
          contactName,
          email,
          preIssuedId,
          passwordHash,
          department,
        }
      });

      // IDを使用済みに更新
      await tx.preIssuedId.update({
        where: { id: issuedIdRecord.id },
        data: { isUsed: true }
      });

      return newUser;
    });

    return new Response(JSON.stringify({ success: true, user: { id: result.id, email: result.email } }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Registration API Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'サーバーエラーが発生しました' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
