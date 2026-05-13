import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ChevronRight, LayoutDashboard, User, Bell, Users, Settings, LayoutGrid, Megaphone, LogOut } from 'lucide-react';
import { signOut } from '@/auth';
import { redirect } from 'next/navigation';
import { KasanareScript } from '@/components/kasanare-script';
import { NavItem } from '@/components/nav-item';

import { DashboardSidebar } from '@/components/dashboard-sidebar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { tenant: true },
  });

  if (!user) {
    redirect('/login');
  }

  // 統計情報を並列で取得
  const [activeUsersCount, unreadAnnouncementsCount] = await Promise.all([
    prisma.user.count({
      where: { tenantId: user.tenantId, isActive: true }
    }),
    prisma.announcement.count({
      where: {
        isActive: true,
        publishedAt: { lte: new Date() },
        OR: [
          { AND: [{ targetRole: null }, { targetTenantId: null }] },
          { targetRole: user.role },
          { targetTenantId: user.tenantId }
        ],
        reads: {
          none: { userId: user.id }
        }
      }
    })
  ]);

  const isAdmin = user.role === 'SYSTEM_ADMIN';
  const isTenantAdmin = user.role === 'TENANT_ADMIN';

  const handleSignOut = async () => {
    'use server';
    await signOut({ redirectTo: '/login' });
  };

  return (
    <div className="h-screen flex overflow-hidden bg-slate-50">
      {/* ── サイドバー（共通レイアウト） ── */}
      <DashboardSidebar 
        user={{
          contactName: user.contactName,
          avatarUrl: user.avatarUrl,
          tenant: {
            name: user.tenant.name,
            userLimit: user.tenant.userLimit
          }
        }}
        activeUsersCount={activeUsersCount}
        unreadAnnouncementsCount={unreadAnnouncementsCount}
        isAdmin={isAdmin}
        isTenantAdmin={isTenantAdmin}
        signOutAction={handleSignOut}
      />
      {/* ── メインコンテンツエリア ── */}
      <main className="flex-1 relative overflow-y-auto bg-slate-50 flex flex-col pt-14 md:pt-0">
        {children}
      </main>

      {/* ── く～chat (Kasanare) 埋め込み ── */}
    </div>
  );
}
