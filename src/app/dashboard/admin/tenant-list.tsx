'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CopyBadge } from '@/components/copy-badge';
import { TenantUserTable } from './tenant-user-table';
import { TenantSoftwareTable } from './tenant-software-table';
import {
  Users, Lock, Settings, Edit, Monitor,
  LayoutGrid, Download, X,
} from 'lucide-react';
import {
  updateTenantLimit, toggleTenantStatus,
  updateTenantCredential, updateTenantVariantAccess,
  updateTenantInfo, updateTenantServiceAccess,
} from './actions';
import { DeleteTenantButton } from './delete-tenant-button';

type Section = 'info' | 'users' | 'limit' | 'creds' | 'services' | 'downloads' | 'softwares';

// ──────────────────────────────────────────────
// Types (must match the Prisma query shape in page.tsx)
// ──────────────────────────────────────────────
interface Tenant {
  id: string;
  name: string;
  isActive: boolean;
  userLimit: number;
  maintenanceId: string | null;
  startMonth: string | null;
  startYear: string | null;
  paymentMethod: string | null;
  remarks: string | null;
  users: { id: string; contactName: string; email: string; department: string | null; role: string; createdAt: Date }[];
  tenantCredentials: { service: { id: string; name: string }; loginId: string; password: string | null }[];
  serviceAccesses: { serviceId: string }[];
  variantAccesses: { variantId: string }[];
  softwares: any[];
}

interface Service { id: string; name: string }
interface Variant { id: string; label: string; service: { name: string } }

const CREDENTIAL_SERVICES = ['く～chat', 'データロジックダイレクト', 'オンラインセミナー'] as const;

const SECTIONS: { key: Section; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: 'info',      label: '基本情報',     icon: Edit },
  { key: 'softwares', label: '所有システム',  icon: Monitor },
  { key: 'users',     label: '担当者管理',   icon: Users },
  { key: 'limit',     label: '利用上限',     icon: Settings },
  { key: 'creds',     label: '認証情報',     icon: Lock },
  { key: 'services',  label: 'サービス設定', icon: LayoutGrid },
  { key: 'downloads', label: 'DLアクセス権', icon: Download },
];

// ──────────────────────────────────────────────
// Individual section panels
// ──────────────────────────────────────────────
function InfoPanel({ tenant }: { tenant: Tenant }) {
  return (
    <form action={updateTenantInfo.bind(null, tenant.id)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2 space-y-1">
          <Label className="text-xs font-semibold text-slate-600">会社名 <span className="text-red-500">*</span></Label>
          <Input name="name" defaultValue={tenant.name} required className="h-9 bg-white" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">保守ID</Label>
          <Input name="maintenanceId" defaultValue={tenant.maintenanceId ?? ''} placeholder="RDD..." className="h-8 bg-white text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">支払方法</Label>
          <Input name="paymentMethod" defaultValue={tenant.paymentMethod ?? ''} placeholder="年払い" className="h-8 bg-white text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">開始年</Label>
          <Input name="startYear" defaultValue={tenant.startYear ?? ''} placeholder="2025" className="h-8 bg-white text-xs" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">開始月</Label>
          <Input name="startMonth" defaultValue={tenant.startMonth ?? ''} placeholder="4月" className="h-8 bg-white text-xs" />
        </div>
        <div className="col-span-2 space-y-1">
          <Label className="text-xs text-slate-500">備考</Label>
          <Input name="remarks" defaultValue={tenant.remarks ?? ''} placeholder="特記事項など" className="h-8 bg-white text-xs" />
        </div>
      </div>
      <Button size="sm" type="submit" className="w-full bg-slate-800 hover:bg-slate-700 text-white h-9">情報を更新</Button>
    </form>
  );
}

function LimitPanel({ tenant }: { tenant: Tenant }) {
  return (
    <form action={updateTenantLimit.bind(null, tenant.id)} className="space-y-4">
      <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100">
        <Label className="text-sm font-semibold text-slate-700">ユーザー上限</Label>
        <Input type="number" name="userLimit" defaultValue={tenant.userLimit} className="w-24 h-9 bg-white" min={1} />
        <span className="text-xs text-slate-500">名</span>
      </div>
      <Button size="sm" type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9">更新</Button>
    </form>
  );
}

function CredsPanel({ tenant, services }: { tenant: Tenant; services: Service[] }) {
  const credMap = new Map(tenant.tenantCredentials.map(c => [c.service.name, c]));
  return (
    <div className="space-y-3">
      {CREDENTIAL_SERVICES.map((svcName) => {
        const svc = services.find(s => s.name === svcName);
        if (!svc) return null;
        const cred = credMap.get(svcName);
        return (
          <form key={svcName} action={updateTenantCredential.bind(null, tenant.id)} className="bg-slate-50 rounded-lg p-3 border border-slate-100 space-y-2 hover:border-slate-200 transition-colors">
            <input type="hidden" name="serviceId" value={svc.id} />
            <div className="flex items-center gap-2 mb-2">
              <div className={`h-1.5 w-1.5 rounded-full ${cred ? 'bg-emerald-500' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-700">{svcName}</span>
              <span className="ml-auto text-[10px] text-slate-400">{cred ? '設定済み' : '未設定'}</span>
            </div>
            <Input name="loginId" defaultValue={cred?.loginId || ''} placeholder="ログインID" className="h-8 bg-white text-xs" />
            <Input name="password" defaultValue={cred?.password || ''} placeholder="パスワード" className="h-8 bg-white text-xs" />
            <Button size="sm" type="submit" variant="secondary" className="w-full h-8 text-xs bg-white border-slate-200 hover:bg-slate-50">保存</Button>
          </form>
        );
      })}
    </div>
  );
}

function ServicesPanel({ tenant, services }: { tenant: Tenant; services: Service[] }) {
  return (
    <form action={updateTenantServiceAccess.bind(null, tenant.id)} className="space-y-4">
      <input type="hidden" name="allServiceIds" value={services.map(s => s.id).join(',')} />
      <p className="text-xs text-cyan-700 bg-cyan-50 rounded p-2 border border-cyan-100">
        チェックしたサービスのみダッシュボードに表示されます。
      </p>
      <div className="grid grid-cols-1 gap-2">
        {services.map(svc => {
          const isAllowed = tenant.serviceAccesses.length === 0 || tenant.serviceAccesses.some(a => a.serviceId === svc.id);
          return (
            <label key={svc.id} className="flex items-center gap-2.5 cursor-pointer p-2 rounded hover:bg-slate-50 transition-colors">
              <input type="checkbox" name="serviceIds" value={svc.id} defaultChecked={isAllowed}
                className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" />
              <span className="text-sm text-slate-700">{svc.name}</span>
            </label>
          );
        })}
      </div>
      <Button size="sm" type="submit" className="w-full bg-cyan-600 hover:bg-cyan-700 text-white h-9 font-bold">表示設定を保存</Button>
    </form>
  );
}

function DownloadsPanel({ tenant, allVariants }: { tenant: Tenant; allVariants: Variant[] }) {
  const allowedVariantIds = new Set(tenant.variantAccesses.map(a => a.variantId));
  const variantsByService = new Map<string, Variant[]>();
  for (const v of allVariants) {
    const name = v.service.name;
    if (!variantsByService.has(name)) variantsByService.set(name, []);
    variantsByService.get(name)!.push(v);
  }
  return (
    <form action={updateTenantVariantAccess.bind(null, tenant.id)} className="space-y-4">
      <input type="hidden" name="allVariantIds" value={allVariants.map(v => v.id).join(',')} />
      <p className="text-xs text-indigo-700 bg-indigo-50 rounded p-2 border border-indigo-100">
        チェックしたファイルのみダウンロード可能になります。
      </p>
      {Array.from(variantsByService.entries()).map(([svcName, variants]) => (
        <div key={svcName} className="space-y-1">
          <p className="text-[10px] font-bold text-slate-500 uppercase">{svcName}</p>
          {variants.map(v => (
            <label key={v.id} className="flex items-center gap-2 p-1.5 rounded hover:bg-slate-50 cursor-pointer transition-colors">
              <input type="checkbox" name="variantIds" value={v.id} defaultChecked={allowedVariantIds.has(v.id)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span className="text-sm text-slate-700">{v.label}</span>
            </label>
          ))}
        </div>
      ))}
      <Button size="sm" type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-9 font-bold">アクセス権を保存</Button>
    </form>
  );
}

// ──────────────────────────────────────────────
// Single tenant row
// ──────────────────────────────────────────────
function TenantRow({
  tenant, isMaster, services, allVariants,
}: {
  tenant: Tenant;
  isMaster: boolean;
  services: Service[];
  allVariants: Variant[];
}) {
  const [openSection, setOpenSection] = useState<Section | null>(null);

  const toggle = (key: Section) =>
    setOpenSection(prev => (prev === key ? null : key));

  const visibleSections = SECTIONS.filter(s => {
    if (isMaster && (s.key === 'softwares' || s.key === 'users' || s.key === 'services' || s.key === 'downloads')) return false;
    if (s.key === 'downloads' && allVariants.length === 0) return false;
    return true;
  });

  const credMap = new Map(tenant.tenantCredentials.map(c => [c.service.name, c]));
  const settingsCount = CREDENTIAL_SERVICES.filter(s => credMap.has(s)).length;

  return (
    <div className={`rounded-xl border bg-white shadow-sm overflow-hidden transition-shadow hover:shadow-md ${isMaster ? 'border-l-4 border-l-slate-800 border-slate-200' : 'border-slate-200'}`}>
      {/* ── compact summary row ── */}
      <div className="flex items-center gap-4 px-5 py-3.5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 text-sm truncate">{tenant.name}</span>
            <Badge variant={tenant.isActive ? 'default' : 'secondary'} className={`text-[10px] px-1.5 ${tenant.isActive ? 'bg-slate-700' : ''}`}>
              {tenant.isActive ? '有効' : '停止中'}
            </Badge>
            {isMaster && <Badge className="text-[10px] bg-amber-100 text-amber-700 border-amber-200 px-1.5">SYSTEM MASTER</Badge>}
          </div>
          <div className="flex items-center gap-4 mt-1">
            {/* ユーザー数と認証情報のステータス */}
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Users className="h-3 w-3" /> {tenant.users.length} / {tenant.userLimit}名
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Lock className="h-3 w-3" /> 認証 {settingsCount}/{CREDENTIAL_SERVICES.length}
            </span>
          </div>
        </div>

        {/* ── section toggle buttons ── */}
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {visibleSections.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => toggle(key)}
              className={`flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1.5 rounded-md border transition-all
                ${openSection === key
                  ? 'bg-slate-800 text-white border-slate-800 shadow'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}

          {!isMaster && (
            <>
              <form action={toggleTenantStatus.bind(null, tenant.id, !tenant.isActive)}>
                <Button size="sm" type="submit" variant={tenant.isActive ? 'destructive' : 'outline'} className="h-7 text-[11px] px-2">
                  {tenant.isActive ? '停止' : '再開'}
                </Button>
              </form>
              <DeleteTenantButton tenantId={tenant.id} tenantName={tenant.name} />
            </>
          )}
          {isMaster && <span className="text-[10px] text-slate-400 italic ml-1">保護されています</span>}
        </div>
      </div>

      {/* ── slide-down panel ── */}
      {openSection && (
        <div className="border-t border-slate-100 bg-slate-50/50 animate-in slide-in-from-top-1 duration-200">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
                {(() => {
                  const sec = visibleSections.find(s => s.key === openSection)!;
                  const Icon = sec.icon;
                  return <><Icon className="h-4 w-4 text-slate-500" />{sec.label}</>;
                })()}
              </h4>
              <button type="button" onClick={() => setOpenSection(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {openSection === 'info'      && <InfoPanel tenant={tenant} />}
            {openSection === 'softwares' && <TenantSoftwareTable tenantId={tenant.id} softwares={tenant.softwares} />}
            {openSection === 'users'     && <TenantUserTable tenantId={tenant.id} users={tenant.users} />}
            {openSection === 'limit'     && <LimitPanel tenant={tenant} />}
            {openSection === 'creds'     && <CredsPanel tenant={tenant} services={services} />}
            {openSection === 'services'  && <ServicesPanel tenant={tenant} services={services} />}
            {openSection === 'downloads' && <DownloadsPanel tenant={tenant} allVariants={allVariants} />}
          </div>
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────
// Main list component
// ──────────────────────────────────────────────
export function TenantList({
  tenants, services, allVariants,
}: {
  tenants: Tenant[];
  services: Service[];
  allVariants: Variant[];
}) {
  return (
    <div className="space-y-3">
      {tenants.map(t => (
        <TenantRow
          key={t.id}
          tenant={t}
          isMaster={false}
          services={services}
          allVariants={allVariants}
        />
      ))}
    </div>
  );
}

export function MasterTenantRow({ tenant, services, allVariants }: {
  tenant: Tenant; services: Service[]; allVariants: Variant[];
}) {
  return <TenantRow tenant={tenant} isMaster={true} services={services} allVariants={allVariants} />;
}
