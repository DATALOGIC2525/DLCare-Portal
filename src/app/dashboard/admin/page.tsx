import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createTenantWithId } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { Building2, Settings } from 'lucide-react';
import { CsvImportForm } from './csv-import-form';
import { TenantList, MasterTenantRow } from './tenant-list';

const MASTER_TENANT_NAME = '株式会社データロジック (システム管理)';

export default async function AdminDashboard(props: { searchParams?: Promise<{ page?: string; q?: string }> }) {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    redirect('/dashboard');
  }

  const searchParams = await props.searchParams;
  const page = parseInt(searchParams?.page || '1', 10);
  const q = searchParams?.q || '';
  const pageSize = 10;

  const whereCondition: any = q ? {
    OR: [
      { name: { contains: q } },
      { users: { some: { OR: [{ contactName: { contains: q } }, { email: { contains: q } }] } } }
    ]
  } : {};

  const [totalCount, tenants, services, allVariants] = await Promise.all([
    prisma.tenant.count({ where: whereCondition }),
    prisma.tenant.findMany({
      where: whereCondition,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        users: { orderBy: { createdAt: 'asc' } },
        preIssuedIds: true,
        tenantCredentials: { include: { service: true } },
        variantAccesses: { select: { variantId: true } },
        serviceAccesses: { select: { serviceId: true } },
        softwares: { orderBy: [{ category: 'asc' }, { createdAt: 'asc' }] }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.service.findMany({ where: { isActive: true }, orderBy: [{ groupLabel: 'asc' }, { sortOrder: 'asc' }] }),
    prisma.serviceVariant.findMany({
      orderBy: [{ service: { name: 'asc' } }, { sortOrder: 'asc' }],
      include: { service: { select: { name: true } } }
    })
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);
  const masterTenant = tenants.find(t => t.name === MASTER_TENANT_NAME) ?? null;
  const regularTenants = tenants.filter(t => t.name !== MASTER_TENANT_NAME);

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">マスター管理</h2>
          <p className="text-slate-500 text-sm mt-1">ユーザー（顧客企業）の登録と、各ユーザーの権限・認証情報を管理します。</p>
        </div>
      </div>

      {/* テナント新規作成 */}
      <Card className="border-emerald-100 shadow-sm bg-emerald-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-emerald-800">
            <Building2 className="h-4 w-4" />
            新規ユーザー（顧客企業）登録
          </CardTitle>
          <CardDescription className="text-xs">新しい顧客企業を登録し、初期の管理者用IDを発行します。</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTenantWithId} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="tenantName" className="text-xs font-bold text-slate-700">ユーザー（企業）名 <span className="text-red-500">*</span></Label>
              <Input id="tenantName" name="tenantName" placeholder="例：株式会社〇〇" required className="h-9 bg-white" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userLimit" className="text-xs font-bold text-slate-700">利用可能ユーザー数（上限）</Label>
              <Input id="userLimit" name="userLimit" type="number" defaultValue="10" className="h-9 bg-white" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-emerald-100/50">
              <div className="space-y-1">
                <Label htmlFor="maintenanceId" className="text-[10px] font-bold text-emerald-700">保守ID</Label>
                <Input id="maintenanceId" name="maintenanceId" placeholder="M-12345" className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startYear" className="text-[10px] font-bold text-emerald-700">開始年度</Label>
                <Input id="startYear" name="startYear" placeholder="2024" className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="startMonth" className="text-[10px] font-bold text-emerald-700">開始月</Label>
                <Input id="startMonth" name="startMonth" placeholder="4" className="h-8 text-xs bg-white" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="paymentMethod" className="text-[10px] font-bold text-emerald-700">支払方法</Label>
                <Input id="paymentMethod" name="paymentMethod" placeholder="振込" className="h-8 text-xs bg-white" />
              </div>
            </div>
            <div className="md:col-span-2 lg:col-span-3 space-y-1">
              <Label htmlFor="remarks" className="text-[10px] font-bold text-emerald-700">備考</Label>
              <Input id="remarks" name="remarks" placeholder="特記事項があれば入力" className="h-8 text-xs bg-white" />
            </div>
            <div className="md:col-span-2 lg:col-span-3 pt-2">
              <Button type="submit" className="w-full md:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-9">
                ユーザーを登録して管理IDを発行
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* システム管理アカウント（特別枠） */}
      {masterTenant && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 px-1">
            <div className="p-1.5 bg-slate-800 rounded-md">
              <Settings className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">システム管理（マスターアカウント）</h3>
          </div>
          <MasterTenantRow tenant={masterTenant} services={services} allVariants={allVariants} />
        </div>
      )}

      {/* 登録済みテナント一覧 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-cyan-50 rounded-md">
              <Building2 className="h-4 w-4 text-cyan-600" />
            </div>
            <h3 className="font-bold text-slate-800">
              登録済みユーザー（顧客企業）一覧
              <span className="ml-2 text-xs font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                {totalCount - (masterTenant ? 1 : 0)}件
              </span>
            </h3>
          </div>
          <div className="flex items-center gap-4">
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                {page > 1 ? (
                  <Link href={`/dashboard/admin?page=${page - 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>
                    <Button variant="outline" size="sm" className="h-9 px-3 bg-white shadow-sm hover:bg-slate-50">← 前へ</Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-9 px-3 bg-slate-50/50">← 前へ</Button>
                )}
                <span className="text-xs font-bold text-slate-500 min-w-[70px] text-center bg-white border border-slate-200 h-9 flex items-center justify-center rounded-md px-2">
                  {page} / {totalPages}
                </span>
                {page < totalPages ? (
                  <Link href={`/dashboard/admin?page=${page + 1}${q ? `&q=${encodeURIComponent(q)}` : ''}`}>
                    <Button variant="outline" size="sm" className="h-9 px-3 bg-white shadow-sm hover:bg-slate-50">次へ →</Button>
                  </Link>
                ) : (
                  <Button variant="outline" size="sm" disabled className="h-9 px-3 bg-slate-50/50">次へ →</Button>
                )}
              </div>
            )}
            <form className="flex gap-2 w-full max-w-sm">
              <Input name="q" placeholder="企業名・ユーザー名・メールで検索" defaultValue={q} className="h-9 bg-white" />
              <Button type="submit" variant="secondary" className="h-9 px-4 shrink-0 font-bold">検索</Button>
            </form>
          </div>
        </div>

        {regularTenants.length === 0 ? (
          <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <p className="text-slate-400 text-sm">ユーザーが見つかりませんでした。</p>
          </div>
        ) : (
          <TenantList tenants={regularTenants} services={services} allVariants={allVariants} />
        )}
      </div>

      {/* CSVインポート */}
      <CsvImportForm />
    </div>
  );
}
