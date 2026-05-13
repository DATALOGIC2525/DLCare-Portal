'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateTenantLimit(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const userLimit = parseInt(formData.get('userLimit') as string);
  
  await prisma.tenant.update({
    where: { id: tenantId },
    data: { userLimit }
  });
  
  revalidatePath('/dashboard/admin');
}

export async function toggleTenantStatus(tenantId: string, isActive: boolean) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { isActive }
  });
  
  revalidatePath('/dashboard/admin');
}

export async function deleteTenant(tenantId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  // システム管理アカウントの削除を防止
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) throw new Error('テナントが見つかりません。');
  if (tenant.name === '株式会社データロジック (システム管理)') {
    throw new Error('システム管理アカウントは削除できません。');
  }

  // トランザクション内で子レコードを先に削除してからテナントを削除
  await prisma.$transaction(async (tx) => {
    // テナントに紐づくユーザーのIDを取得
    const tenantUsers = await tx.user.findMany({ where: { tenantId }, select: { id: true } });
    const userIds = tenantUsers.map(u => u.id);

    // ユーザーの子レコードを先に削除
    if (userIds.length > 0) {
      await tx.userCredential.deleteMany({ where: { userId: { in: userIds } } });
      await tx.userAnnouncementRead.deleteMany({ where: { userId: { in: userIds } } });
      await tx.auditLog.updateMany({ where: { userId: { in: userIds } }, data: { userId: null } });
    }

    // テナント直下の子レコードを削除
    await tx.preIssuedId.deleteMany({ where: { tenantId } });
    await tx.tenantCredential.deleteMany({ where: { tenantId } });
    await tx.tenantVariantAccess.deleteMany({ where: { tenantId } });
    await tx.tenantServiceAccess.deleteMany({ where: { tenantId } });
    await tx.tenantSoftware.deleteMany({ where: { tenantId } });
    await tx.user.deleteMany({ where: { tenantId } });

    // テナント本体を削除
    await tx.tenant.delete({ where: { id: tenantId } });
  });

  revalidatePath('/dashboard/admin');
}


import bcrypt from 'bcryptjs';

/**
 * テナントを新規作成する。
 */
export async function createTenant(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const tenantName = formData.get('tenantName') as string;
  const userLimit = parseInt(formData.get('userLimit') as string) || 10;
  
  // 保守・基本情報
  const maintenanceId = (formData.get('maintenanceId') as string) || null;
  const startMonth = (formData.get('startMonth') as string) || null;
  const startYear = (formData.get('startYear') as string) || null;
  const paymentMethod = (formData.get('paymentMethod') as string) || null;
  const remarks = (formData.get('remarks') as string) || null;
  const invoiceEmail = (formData.get('invoiceEmail') as string) || null;

  if (!tenantName) throw new Error('ユーザー（企業）名は必須です');

  // 会員登録と紐づける内容（付帯サービス申請情報）
  const registrationMetadata = {
    invoiceEmail,
    // EC
    ecRepName: formData.get('ecRepName') as string,
    ecRepEmail: formData.get('ecRepEmail') as string,
    ecPassword: formData.get('ecPassword') as string,
    // Ku~chat
    kuchatRepName: formData.get('kuchatRepName') as string,
    kuchatRepEmail: formData.get('kuchatRepEmail') as string,
    kuchatPassword: formData.get('kuchatPassword') as string,
    // Seminar
    seminarRepName: formData.get('seminarRepName') as string,
    seminarRepEmail: formData.get('seminarRepEmail') as string,
    seminarPassword: formData.get('seminarPassword') as string,
  };

  // サービスの認証情報（共通認証情報として別途保存する場合用）
  const kuchatId = formData.get('kuchat_loginId') as string;
  const kuchatPw = formData.get('kuchat_password') as string;
  const directId = formData.get('direct_loginId') as string;
  const directPw = formData.get('direct_password') as string;
  const seminarId = formData.get('seminar_loginId') as string;
  const seminarPw = formData.get('seminar_password') as string;

  await prisma.$transaction(async (tx) => {
    // テナント作成（メタデータ込み）
    const tenant = await tx.tenant.create({
      data: { 
        name: tenantName, 
        userLimit, 
        maintenanceId, 
        startMonth, 
        startYear, 
        paymentMethod, 
        remarks,
        registrationMetadata: registrationMetadata as any
      }
    });

    // デフォルトですべてのサービスを表示設定にする
    const allActiveServices = await tx.service.findMany({ where: { isActive: true } });
    for (const svc of allActiveServices) {
      await tx.tenantServiceAccess.create({
        data: {
          tenantId: tenant.id,
          serviceId: svc.id,
        }
      });
    }

    // サービス名でServiceレコードを取得して、テナント共通認証情報を保存
    const serviceMap: Record<string, { loginId: string; password: string }> = {};
    if (kuchatId) serviceMap['く～chat'] = { loginId: kuchatId, password: kuchatPw };
    if (directId) serviceMap['データロジックダイレクト'] = { loginId: directId, password: directPw };
    if (seminarId) serviceMap['オンラインセミナー'] = { loginId: seminarId, password: seminarPw };

    if (Object.keys(serviceMap).length > 0) {
      const services = await tx.service.findMany({
        where: { name: { in: Object.keys(serviceMap) } }
      });
      for (const svc of services) {
        const cred = serviceMap[svc.name];
        if (cred?.loginId) {
          await tx.tenantCredential.create({
            data: {
              tenantId: tenant.id,
              serviceId: svc.id,
              loginId: cred.loginId,
              password: cred.password || null,
            }
          });
        }
      }
    }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * システム管理者が特定のテナントにユーザーを直接登録する
 */
export async function registerUserByAdmin(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const contactName = formData.get('contactName') as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'GENERAL_USER';
  const department = (formData.get('department') as string) || null;

  if (!contactName || !email || !password) {
    throw new Error('必須項目が不足しています');
  }

  // 重複チェック
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('このメールアドレスは既に登録されています');

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      tenantId,
      contactName,
      email,
      passwordHash,
      role,
      department,
      isActive: true,
    }
  });

  revalidatePath('/dashboard/admin');
}


/** 既存テナントのサービス認証情報を更新する */
export async function updateTenantCredential(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const serviceId = formData.get('serviceId') as string;
  const loginId = formData.get('loginId') as string;
  const password = formData.get('password') as string;

  if (!loginId) {
    // loginIdが空の場合は削除
    await prisma.tenantCredential.deleteMany({ where: { tenantId, serviceId } });
  } else {
    await prisma.tenantCredential.upsert({
      where: { tenantId_serviceId: { tenantId, serviceId } },
      update: { loginId, password: password || null },
      create: { tenantId, serviceId, loginId, password: password || null }
    });
  }

  revalidatePath('/dashboard/admin');
}

/**
 * テナントのバリアントアクセス権を一括更新する
 * checkedVariantIds: チェックされたバリアントIDの配列
 */
export async function updateTenantVariantAccess(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  // フォームから全バリアントIDと選択状態を取得
  const allVariantIds = (formData.get('allVariantIds') as string).split(',').filter(Boolean);
  const checkedIds = new Set(formData.getAll('variantIds') as string[]);

  await prisma.$transaction(async (tx) => {
    for (const variantId of allVariantIds) {
      if (checkedIds.has(variantId)) {
        // 許可: upsert
        await tx.tenantVariantAccess.upsert({
          where: { tenantId_variantId: { tenantId, variantId } },
          update: {},
          create: { tenantId, variantId },
        });
      } else {
        // 取り消し
        await tx.tenantVariantAccess.deleteMany({ where: { tenantId, variantId } });
      }
    }
  });

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard');
}

/**
 * 既存ユーザー（企業）の基本情報を更新する
 */
export async function updateTenantInfo(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  if (!name) throw new Error('ユーザー（企業）名は必須です');

  const maintenanceId = (formData.get('maintenanceId') as string) || null;
  const startMonth = (formData.get('startMonth') as string) || null;
  const startYear = (formData.get('startYear') as string) || null;
  const paymentMethod = (formData.get('paymentMethod') as string) || null;
  const remarks = (formData.get('remarks') as string) || null;

  await prisma.tenant.update({
    where: { id: tenantId },
    data: { name, maintenanceId, startMonth, startYear, paymentMethod, remarks }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * 所有システム情報を追加する
 */
export async function addTenantSoftware(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const category = (formData.get('category') as string) || null;
  const countStr = formData.get('count') as string;
  const count = countStr ? parseInt(countStr) : null;
  const ecCountStr = formData.get('ecCount') as string;
  const ecCount = ecCountStr ? parseInt(ecCountStr) : null;
  const purchaseDate = (formData.get('purchaseDate') as string) || null;
  const lastUpdateDate = (formData.get('lastUpdateDate') as string) || null;
  const version = (formData.get('version') as string) || null;

  if (!name) throw new Error('販売商品名は必須です');

  await prisma.tenantSoftware.create({
    data: {
      tenantId,
      name,
      category,
      count,
      ecCount,
      purchaseDate,
      lastUpdateDate,
      version
    }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * 所有システム情報を更新する
 */
export async function updateTenantSoftware(softwareId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const name = formData.get('name') as string;
  const category = (formData.get('category') as string) || null;
  const countStr = formData.get('count') as string;
  const count = countStr ? parseInt(countStr) : null;
  const ecCountStr = formData.get('ecCount') as string;
  const ecCount = ecCountStr ? parseInt(ecCountStr) : null;
  const purchaseDate = (formData.get('purchaseDate') as string) || null;
  const lastUpdateDate = (formData.get('lastUpdateDate') as string) || null;
  const version = (formData.get('version') as string) || null;

  if (!name) throw new Error('販売商品名は必須です');

  await prisma.tenantSoftware.update({
    where: { id: softwareId },
    data: { name, category, count, ecCount, purchaseDate, lastUpdateDate, version }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * 所有システム情報を削除する
 */
export async function deleteTenantSoftware(softwareId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  await prisma.tenantSoftware.delete({
    where: { id: softwareId }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * テナントのサービスアクセス権（ダッシュボード表示可否）を一括更新する
 */
export async function updateTenantServiceAccess(tenantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const allServiceIds = (formData.get('allServiceIds') as string).split(',').filter(Boolean);
  const checkedIds = new Set(formData.getAll('serviceIds') as string[]);

  await prisma.$transaction(async (tx) => {
    for (const serviceId of allServiceIds) {
      if (checkedIds.has(serviceId)) {
        // 許可: upsert
        await tx.tenantServiceAccess.upsert({
          where: { tenantId_serviceId: { tenantId, serviceId } },
          update: {},
          create: { tenantId, serviceId },
        });
      } else {
        // 取り消し
        await tx.tenantServiceAccess.deleteMany({ where: { tenantId, serviceId } });
      }
    }
  });

  revalidatePath('/dashboard/admin');
  revalidatePath('/dashboard');
}

/**
 * ユーザーの権限を変更する
 */
export async function updateUserRole(userId: string, role: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  await prisma.user.update({
    where: { id: userId },
    data: { role }
  });

  revalidatePath('/dashboard/admin');
}

/**
 * ユーザーを削除する
 */
export async function deleteUserByAdmin(userId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  // 自分自身を削除できないようにチェック
  if (userId === session.user.id) {
    throw new Error('自分自身のアカウントは削除できません。');
  }

  // SYSTEM_ADMINユーザーの削除を防止
  const targetUser = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (targetUser?.role === 'SYSTEM_ADMIN') {
    throw new Error('システム管理者アカウントは削除できません。');
  }

  // 子レコードを先に削除してからユーザーを削除
  await prisma.$transaction(async (tx) => {
    await tx.userCredential.deleteMany({ where: { userId } });
    await tx.userAnnouncementRead.deleteMany({ where: { userId } });
    // AuditLogはユーザー削除後もログを残す（userId を null に）
    await tx.auditLog.updateMany({ where: { userId }, data: { userId: null } });
    await tx.user.delete({ where: { id: userId } });
  });

  revalidatePath('/dashboard/admin');
}
