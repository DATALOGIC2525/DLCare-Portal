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

  await prisma.service.create({
    data: { name, url, iconName, groupLabel, sortOrder, description }
  });

  revalidatePath('/dashboard/admin/services');
  revalidatePath('/dashboard');
}

export async function deleteService(serviceId: string) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') throw new Error('Unauthorized');

  // 関連するクレデンシャルを先に削除
  await prisma.userCredential.deleteMany({ where: { serviceId } });
  await prisma.tenantCredential.deleteMany({ where: { serviceId } });

  // バリアントとそのアクセス権も削除
  const variants = await prisma.serviceVariant.findMany({ where: { serviceId } });
  for (const v of variants) {
    await prisma.tenantVariantAccess.deleteMany({ where: { variantId: v.id } });
  }
  await prisma.serviceVariant.deleteMany({ where: { serviceId } });

  await prisma.service.delete({ where: { id: serviceId } });

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

