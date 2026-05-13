import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { RibbonDashboard } from '@/components/ribbon-dashboard';
import { ServiceGrid } from '@/components/service-grid';
import { signOut } from '@/auth';

const SERVICE_ACCENTS: Record<string, string> = {
  '最新版アップデート':           '#0BBFDF',
  '専用フリーダイヤル':         '#0BBFDF',
  'く～chat':                  '#0BBFDF',
  'com-pass 3DView':         '#0BBFDF',
  'DATALOGICDIRECT':          '#0BBFDF',
  'スタートサポート':           '#0BBFDF',
  'ソフトウェアライセンス交換': '#0BBFDF',
  'オンラインセミナー':          '#0BBFDF',
  'カスタム研修':               '#0BBFDF',
  '入力代行':                   '#0BBFDF',
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string }>;
}) {
  const { service } = await searchParams;
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, tenantId: true, role: true }
  });

  if (!user) return null;

  // テナントがアクセス可能なサービスIDを取得
  const tenantServiceAccesses = await prisma.tenantServiceAccess.findMany({
    where: { tenantId: user.tenantId },
    select: { serviceId: true }
  });
  const allowedServiceIds = new Set(tenantServiceAccesses.map(a => a.serviceId));

  let services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }], // 番号順に並べるため
    include: { variants: { orderBy: { sortOrder: 'asc' } } }
  });

  // システム管理者以外はフィルタリング
  if (user.role !== 'SYSTEM_ADMIN' && tenantServiceAccesses.length > 0) {
    services = services.filter(svc => allowedServiceIds.has(svc.id));
  }

  // serviceId → 許可済みバリアント のマップ
  const tenantVariantAccesses = await prisma.tenantVariantAccess.findMany({
    where: { tenantId: user.tenantId },
    select: { variantId: true }
  });
  const allowedVariantIds = new Set(tenantVariantAccesses.map(a => a.variantId));

  const variantMap: Record<string, { id: string; label: string; url: string }[]> = {};
  for (const svc of services) {
    variantMap[svc.id] = svc.variants.filter(v => allowedVariantIds.has(v.id));
  }

  const [userCredentials, tenantCredentials] = await Promise.all([
    prisma.userCredential.findMany({ where: { userId: user.id } }),
    prisma.tenantCredential.findMany({ where: { tenantId: user.tenantId } })
  ]);

  const userCredsMap = new Map(userCredentials.map(c => [c.serviceId, c]));
  const tenantCredsMap = new Map(tenantCredentials.map(c => [c.serviceId, c]));

  const credMap: Record<string, { loginId: string; password?: string | null; isShared: boolean } | null> = {};
  for (const svc of services) {
    const u = userCredsMap.get(svc.id);
    if (u) { credMap[svc.id] = { ...u, isShared: false }; continue; }
    const t = tenantCredsMap.get(svc.id);
    if (t) { credMap[svc.id] = { ...t, isShared: true }; continue; }
    credMap[svc.id] = null;
  }

  return (
    <div className="flex-1 flex flex-col bg-white min-h-0">
      {service ? (
        /* 詳細表示 */
        <RibbonDashboard
          services={services}
          selectedId={service}
          credMap={credMap}
          accents={SERVICE_ACCENTS}
          variantMap={variantMap}
          userRole={user.role}
        />
      ) : (
        /* TOPページ (グリッド表示) */
        <ServiceGrid services={services} accents={SERVICE_ACCENTS} />
      )}
    </div>
  );
}
