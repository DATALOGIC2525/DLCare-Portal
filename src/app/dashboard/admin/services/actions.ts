'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateServiceInfo(serviceId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const name       = (formData.get('name') as string).trim();
  const iconName   = (formData.get('iconName') as string).trim() || null;
  const groupLabel = (formData.get('groupLabel') as string).trim() || null;
  const sortOrder  = parseInt(formData.get('sortOrder') as string, 10) || 0;
  const url        = (formData.get('url') as string).trim() || null;
  const description = (formData.get('description') as string)?.trim() || null;

  if (!name) throw new Error('サービス名は必須です');

  await prisma.service.update({
    where: { id: serviceId },
    data: { name, iconName, groupLabel, sortOrder, url, description }
  });

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard');
}

export async function createService(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const name       = (formData.get('name') as string).trim();
  const url        = (formData.get('url') as string).trim() || null;
  const iconName   = (formData.get('iconName') as string).trim() || null;
  const groupLabel = (formData.get('groupLabel') as string).trim() || null;
  const sortOrder  = parseInt(formData.get('sortOrder') as string, 10) || 0;
  const description = (formData.get('description') as string)?.trim() || null;

  if (!name) throw new Error('サービス名は必須です');

  const service = await prisma.service.create({
    data: { name, url, iconName, groupLabel, sortOrder, description }
  });

  // 既存の全テナントに対して、この新規サービスへのアクセス権をデフォルトで付与する
  const tenants = await prisma.tenant.findMany({ select: { id: true } });
  if (tenants.length > 0) {
    await prisma.tenantServiceAccess.createMany({
      data: tenants.map(t => ({
        tenantId: t.id,
        serviceId: service.id
      })),
      skipDuplicates: true
    });
  }

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard');
}

export async function deleteService(serviceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  await prisma.$transaction(async (tx) => {
    // 関連する認証情報を削除
    await tx.userCredential.deleteMany({ where: { serviceId } });
    await tx.tenantCredential.deleteMany({ where: { serviceId } });
    
    // テナントのアクセス権を削除
    await tx.tenantServiceAccess.deleteMany({ where: { serviceId } });

    // バリアントに関連するアクセス権とバリアント本体を削除
    const variants = await tx.serviceVariant.findMany({ 
      where: { serviceId },
      select: { id: true }
    });
    const variantIds = variants.map(v => v.id);
    
    if (variantIds.length > 0) {
      await tx.tenantVariantAccess.deleteMany({
        where: { variantId: { in: variantIds } }
      });
      await tx.serviceVariant.deleteMany({
        where: { id: { in: variantIds } }
      });
    }

    // 最後にサービス本体を削除
    await tx.service.delete({ where: { id: serviceId } });
  });

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard');
}

export async function createVariant(serviceId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const label     = (formData.get('label') as string).trim();
  const url       = (formData.get('url') as string).trim();
  const sortOrder = parseInt(formData.get('sortOrder') as string, 10) || 0;

  if (!label || !url) throw new Error('ラベルとURLは必須です');

  await prisma.serviceVariant.create({
    data: { serviceId, label, url, sortOrder }
  });

  revalidatePath('/dashboard/admin/services');
}

export async function deleteVariant(variantId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  await prisma.tenantVariantAccess.deleteMany({ where: { variantId } });
  await prisma.serviceVariant.delete({ where: { id: variantId } });

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard/admin');
}

export async function updateVariant(variantId: string, formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  const label     = (formData.get('label') as string).trim();
  const url       = (formData.get('url') as string).trim();
  const sortOrder = parseInt(formData.get('sortOrder') as string, 10) || 0;

  if (!label || !url) throw new Error('ラベルとURLは必須です');

  await prisma.serviceVariant.update({
    where: { id: variantId },
    data: { label, url, sortOrder }
  });

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard');
}

