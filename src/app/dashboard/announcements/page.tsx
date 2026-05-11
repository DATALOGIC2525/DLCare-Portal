import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { AnnouncementsList } from './announcements-list';

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  // ユーザーの権限とテナントに基づいてお知らせを取得
  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) redirect('/login');

  const announcements = await prisma.announcement.findMany({
    where: { 
      isActive: true,
      publishedAt: { lte: new Date() },
      OR: [
        // ターゲット指定なし（全員）
        { AND: [{ targetRole: null }, { targetTenantId: null }] },
        // 権限指定が一致
        { targetRole: user.role },
        // テナント指定が一致
        { targetTenantId: user.tenantId }
      ]
    },
    orderBy: { publishedAt: 'desc' },
    include: {
      reads: {
        where: { userId: session.user.id }
      }
    }
  });

  // 未読フラグを付与してクライアントに渡す
  const formattedAnnouncements = announcements.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    createdAt: a.publishedAt.toISOString(),
    isRead: a.reads.length > 0,
  }));

  return (
    <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-slate-800">お知らせ</h1>
      </div>
      <AnnouncementsList initialAnnouncements={formattedAnnouncements} />
    </div>
  );
}
