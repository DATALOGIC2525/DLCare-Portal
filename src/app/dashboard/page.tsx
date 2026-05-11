import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { RibbonDashboard } from '@/components/ribbon-dashboard';
import { signOut } from '@/auth';

const SERVICE_ACCENTS: Record<string, string> = {
  'DLCare詳細':               '#0BBFDF',
  '最新アップデート':           '#0891B2',
  '専用フリーダイヤル':         '#0EA5E9',
  'く～chat':                  '#E4197A',
  'S/F com-pass 3DView':      '#7C3AED',
  'オンラインセミナー':          '#EA580C',
  'データロジックダイレクト':   '#2563EB',
  'カスタム研修':               '#D97706',
  'スタートサポート':           '#059669',
  'ソフトウェアライセンス交換': '#65A30D',
  '入力代行':                   '#DB2777',
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, tenantId: true, role: true }
  });

  if (!user) {
    return null;
  }

  // テナントがアクセス可能なサービスIDを取得
  const tenantServiceAccesses = await prisma.tenantServiceAccess.findMany({
    where: { tenantId: user.tenantId },
    select: { serviceId: true }
  });
  const allowedServiceIds = new Set(tenantServiceAccesses.map(a => a.serviceId));

  let services = await prisma.service.findMany({
    where: { isActive: true },
    orderBy: [{ groupLabel: 'asc' }, { sortOrder: 'asc' }],
    include: { variants: { orderBy: { sortOrder: 'asc' } } }
  });

  // システム管理者以外はフィルタリング
  if (user.role !== 'SYSTEM_ADMIN' && tenantServiceAccesses.length > 0) {
    services = services.filter(svc => allowedServiceIds.has(svc.id));
  }

  // このテナントがアクセス可能なバリアントIDのセットを取得
  const tenantVariantAccesses = await prisma.tenantVariantAccess.findMany({
    where: { tenantId: user.tenantId },
    select: { variantId: true }
  });
  const allowedVariantIds = new Set(tenantVariantAccesses.map(a => a.variantId));

  // serviceId → 許可済みバリアント のマップ
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
    <div className="flex-1 flex flex-col bg-[#F0F0F0] min-h-0">
      {/* ── メインコンテンツ（リボンUI） ── */}
      <RibbonDashboard
        services={services}
        credMap={credMap}
        accents={SERVICE_ACCENTS}
        variantMap={variantMap}
        userRole={user.role}
      />
    </div>
  );
}
