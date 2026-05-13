'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const currentPassword = formData.get('currentPassword') as string;
  const newPassword = formData.get('newPassword') as string;

  if (!contactName || !email) {
    throw new Error('氏名とメールアドレスは必須です');
  }

  // ユーザー情報の取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true }
  });

  if (!user) throw new Error('ユーザーが見つかりません');

  // パスワード変更がある場合
  let passwordHash = user.passwordHash;
  if (newPassword) {
    if (!currentPassword) {
      throw new Error('パスワードを変更するには現在のパスワードを入力してください');
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      throw new Error('現在のパスワードが正しくありません');
    }

    if (newPassword.length < 4) {
      throw new Error('新しいパスワードは4文字以上で入力してください');
    }

    passwordHash = await bcrypt.hash(newPassword, 10);
  }

  const oldPhoneNumber = user.phoneNumber;

  // 更新
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      contactName,
      email,
      phoneNumber,
      passwordHash
    }
  });

  // 電話番号が変更された場合のみログに記録（管理者への通知用）
  if (oldPhoneNumber !== phoneNumber) {
    // 監査ログに記録
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'PHONE_NUMBER_CHANGED',
        target: contactName,
        metadata: JSON.stringify({
          old: oldPhoneNumber || '未登録',
          new: phoneNumber || '削除',
          email: email
        })
      }
    });

    // システム管理者向けに「お知らせ」を作成
    await prisma.announcement.create({
      data: {
        title: `【重要】電話番号変更通知：${user.tenant.name} - ${contactName}`,
        content: `
### 連絡先の変更がありました
以下のユーザーがマイページより電話番号を変更しました。

- **企業名**: ${user.tenant.name}
- **ユーザー名**: ${contactName}
- **旧電話番号**: ${oldPhoneNumber || '未登録'}
- **新電話番号**: ${phoneNumber || '削除'}

担当者への確認が必要な場合は、ユーザー管理画面より詳細をご確認ください。
        `.trim(),
        type: 'SYSTEM',
        targetRole: 'SYSTEM_ADMIN',
        isActive: true
      }
    });
  }

  revalidatePath('/dashboard/mypage');
  return { success: true };
}

export async function updateAvatar(formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');

  const file = formData.get('avatar') as File | null;
  if (!file || file.size === 0) {
    throw new Error('ファイルが選択されていません');
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error('ファイルサイズは5MB以下にしてください');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('画像ファイルを選択してください');
  }

  const { writeFile, mkdir } = await import('fs/promises');
  const { join } = await import('path');

  const uploadDir = join(process.cwd(), 'public', 'uploads', 'avatars');
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Ignore if exists
  }

  const ext = file.name.split('.').pop() || 'png';
  const fileName = `${session.user.id}-${Date.now()}.${ext}`;
  const filePath = join(uploadDir, fileName);

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  await writeFile(filePath, buffer);

  const avatarUrl = `/uploads/avatars/${fileName}`;
  await prisma.user.update({
    where: { id: session.user.id },
    data: { avatarUrl }
  });

  revalidatePath('/dashboard/mypage');
  revalidatePath('/dashboard', 'layout');
  return { success: true, avatarUrl };
}
