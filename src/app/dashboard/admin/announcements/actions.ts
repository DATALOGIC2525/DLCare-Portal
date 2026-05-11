'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    throw new Error('Unauthorized');
  }
}

export async function createAnnouncement(formData: FormData) {
  await checkAdmin();
  
  const title = (formData.get('title') as string).trim();
  const content = (formData.get('content') as string).trim();
  const isActive = formData.get('isActive') === 'true';
  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

  if (!title || !content) {
    throw new Error('タイトルと本文は必須です');
  }

  await prisma.announcement.create({
    data: {
      title,
      content,
      isActive,
      publishedAt,
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin/announcements');
  revalidatePath('/dashboard/announcements');
}

export async function updateAnnouncement(id: string, formData: FormData) {
  await checkAdmin();
  
  const title = (formData.get('title') as string).trim();
  const content = (formData.get('content') as string).trim();
  const isActive = formData.get('isActive') === 'true';
  const publishedAtStr = formData.get('publishedAt') as string;
  const publishedAt = publishedAtStr ? new Date(publishedAtStr) : new Date();

  if (!title || !content) {
    throw new Error('タイトルと本文は必須です');
  }

  await prisma.announcement.update({
    where: { id },
    data: {
      title,
      content,
      isActive,
      publishedAt,
    }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin/announcements');
  revalidatePath('/dashboard/announcements');
}

export async function deleteAnnouncement(id: string) {
  await checkAdmin();
  
  await prisma.announcement.delete({
    where: { id }
  });

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/admin/announcements');
  revalidatePath('/dashboard/announcements');
}
