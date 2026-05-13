'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

/** テナント管理者が担当者アカウントを直接作成する */
export async function createGeneralUser(formData: FormData) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized');
  }

  const tenantId = session.user.tenantId;
  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'GENERAL_USER';

  if (!contactName || !email || !password) {
    throw new Error('氏名・メールアドレス・パスワードは必須です');
  }

  // ユーザー上限チェック
  const tenant = await prisma.tenant.findUnique({
    where: { id: tenantId },
    include: { _count: { select: { users: true } } }
  });
  if (!tenant) throw new Error('テナントが見つかりません');
  
  // 有効なユーザー数をカウント
  const activeCount = await prisma.user.count({
    where: { tenantId, isActive: true }
  });

  if (activeCount >= tenant.userLimit) {
    throw new Error('ユーザー上限に達しているため、新しいアカウントを作成できません');
  }

  // メール重複チェック
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('このメールアドレスは既に使用されています');

  const passwordHash = await bcrypt.hash(password, 10);
  
  await prisma.$transaction(async (tx) => {
    // 管理者として作成する場合、既存管理者を降格させる
    if (role === 'TENANT_ADMIN') {
      await tx.user.updateMany({
        where: { tenantId, role: 'TENANT_ADMIN' },
        data: { role: 'GENERAL_USER' }
      });
    }

    await tx.user.create({
      data: {
        tenantId,
        role,
        contactName,
        email,
        passwordHash,
      }
    });
  });

  revalidatePath('/dashboard/tenant-users');
}

/** ユーザーのロール（権限）を更新する */
export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized');
  }
  const currentUserRole = session.user.role;

  // 1. 対象ユーザーのテナント情報を取得
  const targetUser = await prisma.user.findUnique({ where: { id: userId } });
  if (!targetUser) throw new Error('ユーザーが見つかりません');

  // システム管理者以外は、自テナントのユーザーのみ操作可能
  if (currentUserRole !== 'SYSTEM_ADMIN' && targetUser.tenantId !== session.user.tenantId) {
    throw new Error('Unauthorized');
  }

  // SYSTEM_ADMINへの変更は許可しない
  if (role === 'SYSTEM_ADMIN') throw new Error('Invalid role');

  await prisma.$transaction(async (tx) => {
    // 2. 管理者に昇格させる場合、既存の全管理者を担当者に降格させる（1人制の維持）
    if (role === 'TENANT_ADMIN') {
      await tx.user.updateMany({
        where: { 
          tenantId: targetUser.tenantId, 
          role: 'TENANT_ADMIN',
          id: { not: userId }
        },
        data: { role: 'GENERAL_USER' }
      });
    } else if (role === 'GENERAL_USER') {
      // 3. 管理者から担当者に降格させる場合、他に管理者が存在するかチェック
      const otherAdmin = await tx.user.findFirst({
        where: { 
          tenantId: targetUser.tenantId, 
          role: 'TENANT_ADMIN',
          id: { not: userId }
        }
      });
      if (!otherAdmin) {
        throw new Error('テナントには少なくとも1名の管理者が必要です。別のユーザーを管理者に指定してください。');
      }
    }

    await tx.user.update({
      where: { id: userId },
      data: { role }
    });
  });

  revalidatePath('/dashboard/tenant-users');
}

/** 担当者のアカウントを停止／再開する */
export async function toggleUserStatus(userId: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user || (session.user.role !== 'TENANT_ADMIN' && session.user.role !== 'SYSTEM_ADMIN')) {
    throw new Error('Unauthorized');
  }

  const tenantId = session.user.tenantId;

  // 自テナントのユーザーかチェック
  const user = await prisma.user.findFirst({ where: { id: userId, tenantId } });
  if (!user) throw new Error('ユーザーが見つかりません');

  await prisma.user.update({
    where: { id: userId },
    data: { isActive }
  });

  revalidatePath('/dashboard/tenant-users');
}
