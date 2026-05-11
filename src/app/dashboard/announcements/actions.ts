'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user?.id) return;

  const unreadAnnouncements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      reads: {
        none: { userId: session.user.id }
      }
    },
    select: { id: true }
  });

  if (unreadAnnouncements.length > 0) {
    await prisma.userAnnouncementRead.createMany({
      data: unreadAnnouncements.map(a => ({
        userId: session.user.id,
        announcementId: a.id
      }))
    });
    // バッジを更新するためにレイアウトを再検証
    revalidatePath('/', 'layout');
  }
}
