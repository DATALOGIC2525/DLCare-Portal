import { auth } from '@/auth';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { updateServiceInfo, createService, createVariant, updateVariant } from './actions';
import { DeleteServiceButton, DeleteVariantButton } from './delete-service-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Download, LayoutGrid, Link2, Save } from 'lucide-react';
import * as Icons from 'lucide-react';
import { MarkdownEditor } from '@/components/markdown-editor';

export default async function ServicesAdminPage() {
  const session = await auth();
  if (session?.user?.role !== 'SYSTEM_ADMIN') {
    redirect('/dashboard');
  }

  const services = await prisma.service.findMany({
    orderBy: [{ groupLabel: 'asc' }, { sortOrder: 'asc' }],
    include: { variants: { orderBy: { sortOrder: 'asc' } } }
  });

  // グループごとにサービスを分類
  const groupedServices = services.reduce((acc, svc) => {
    const group = svc.groupLabel || '未分類 (リボン非表示)';
    if (!acc[group]) acc[group] = [];
    acc[group].push(svc);
    return acc;
  }, {} as Record<string, typeof services>);

  // グループの表示順序（未分類は最後に）
  const groupNames = Object.keys(groupedServices).sort((a, b) => {
    if (a.startsWith('未分類')) return 1;
    if (b.startsWith('未分類')) return -1;
    return a.localeCompare(b);
  });

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">サービス管理</h2>
          <p className="text-slate-500 text-sm mt-1">ダッシュボードに表示されるサービスアイコンとリンク情報を管理します。</p>
        </div>
      </div>

      {/* ── 新規追加フォーム ── */}
      <Card className="border-blue-100 shadow-sm bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-blue-800">
            <PlusCircle className="h-5 w-5" />
            新規サービス追加
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createService} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">サービス名 <span className="text-red-400">*</span></label>
              <Input name="name" placeholder="例: 新しいサービス" className="h-10 bg-white" required />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">アイコン名</label>
              <Input name="iconName" placeholder="例: Star" className="h-10 bg-white" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">グループ名</label>
              <Input name="groupLabel" placeholder="例: サポート" className="h-10 bg-white" />
            </div>
            <div className="md:col-span-1">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">表示順</label>
              <Input name="sortOrder" type="number" defaultValue="1" min={0} max={99} className="h-10 text-center bg-white" />
            </div>
            <div className="md:col-span-3">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">リンク先URL</label>
              <Input name="url" type="url" placeholder="https://..." className="h-10 bg-white" />
            </div>
            <div className="md:col-span-12">
              <label className="text-xs font-semibold text-slate-600 mb-1.5 block">詳細説明 (マークダウン形式で画像挿入可能)</label>
              <MarkdownEditor name="description" />
            </div>
            <div className="md:col-span-12">
              <Button type="submit" className="h-10 w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm">追加</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* ── サービス一覧（グループ別グリッド表示） ── */}
      <div className="space-y-10">
        {groupNames.map(groupName => (
          <div key={groupName} className="space-y-4">
            <div className="flex items-center gap-2 border-b-2 border-slate-200 pb-2">
              <LayoutGrid className="h-5 w-5 text-slate-400" />
              <h3 className="text-lg font-bold text-slate-700">{groupName}</h3>
              <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">
                {groupedServices[groupName].length} 件
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {groupedServices[groupName].map((service) => {
                const IconComp = (Icons as any)[service.iconName || 'Link'] || Icons.Link;
                return (
                  <div key={service.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col hover:border-slate-300 transition-colors">
                    {/* カードヘッダー */}
                    <div className="bg-slate-50/50 border-b border-slate-100 px-4 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-100 text-blue-600">
                          <IconComp className="h-5 w-5" />
                        </div>
                        <div className="font-bold text-slate-800 tracking-tight">{service.name}</div>
                      </div>
                      <DeleteServiceButton serviceId={service.id} serviceName={service.name} />
                    </div>

                    {/* 基本設定フォーム */}
                    <div className="p-4 flex-1">
                      <form action={updateServiceInfo.bind(null, service.id)} className="space-y-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-500 tracking-wider">サービス名 ＆ アイコン</label>
                          <div className="flex items-center gap-1.5">
                            <Input type="text" name="name" defaultValue={service.name} placeholder="サービス名" className="h-8 text-xs bg-slate-50 font-semibold text-slate-700" required />
                            <Input type="text" name="iconName" defaultValue={service.iconName || ''} placeholder="Icon" className="h-8 w-24 text-xs bg-slate-50 shrink-0" title="アイコン名 (Lucide)" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-500 tracking-wider">グループ ＆ 表示順</label>
                          <div className="flex items-center gap-1.5">
                            <Input type="text" name="groupLabel" defaultValue={service.groupLabel || ''} placeholder="グループ名" className="h-8 text-xs bg-slate-50" />
                            <Input type="number" name="sortOrder" defaultValue={service.sortOrder} min={0} max={99} className="h-8 w-16 text-xs text-center bg-slate-50 shrink-0" title="表示順" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-500 tracking-wider flex items-center gap-1">
                            <Link2 className="h-3 w-3" /> リンク先URL
                          </label>
                          <Input type="url" name="url" defaultValue={service.url || ''} placeholder="未設定" className="w-full h-8 text-xs bg-slate-50 font-mono" />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-semibold text-slate-500 tracking-wider">詳細説明</label>
                          <MarkdownEditor name="description" initialValue={service.description || ''} />
                        </div>
                        
                        <div className="pt-2">
                          <Button size="sm" type="submit" variant="secondary" className="w-full h-8 text-xs bg-white shadow-sm border border-slate-200 hover:bg-slate-50 font-semibold">
                            基本設定を保存
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* バリアント管理フッター */}
                    <div className="bg-indigo-50/40 border-t border-indigo-100/50 p-4 space-y-3">
                      <div className="flex items-center gap-1.5 text-indigo-700 font-semibold text-[11px] tracking-wider">
                        <Download className="h-3.5 w-3.5" /> ダウンロード・バリアント設定
                      </div>
                      
                      {service.variants.length > 0 && (
                        <div className="space-y-2">
                          {service.variants.map(v => (
                            <form key={v.id} action={updateVariant.bind(null, v.id)} className="flex items-center gap-1.5 p-1.5 bg-white border border-indigo-100 rounded-lg shadow-sm group">
                              <Input name="label" defaultValue={v.label} placeholder="名前" className="h-7 w-20 text-[10px] bg-slate-50 border-none focus-visible:ring-1" required />
                              <Input name="url" defaultValue={v.url} placeholder="URL" className="h-7 flex-1 text-[10px] bg-slate-50 border-none focus-visible:ring-1" required />
                              <Input name="sortOrder" type="number" defaultValue={v.sortOrder} className="h-7 w-12 text-[10px] text-center bg-slate-50 border-none focus-visible:ring-1" title="表示順" />
                              <Button type="submit" size="icon" variant="ghost" className="h-7 w-7 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" title="保存">
                                <Save className="h-3.5 w-3.5" />
                              </Button>
                              <DeleteVariantButton variantId={v.id} label={v.label} />
                            </form>
                          ))}
                        </div>
                      )}

                      <div className="pt-1 border-t border-indigo-100/30">
                        <div className="text-[9px] font-bold text-indigo-400 mb-1.5 px-1 uppercase tracking-tighter">新規追加</div>
                        <form action={createVariant.bind(null, service.id)} className="flex items-center gap-1.5">
                          <Input name="label" placeholder="名前 (例: REAL4)" className="h-7 w-20 text-[11px] bg-white border-indigo-100" required />
                          <Input name="url" type="url" placeholder="URL" className="h-7 flex-1 text-[11px] bg-white border-indigo-100" required />
                          <Input name="sortOrder" type="number" defaultValue="0" className="h-7 w-12 text-[11px] text-center bg-white border-indigo-100" title="表示順" />
                          <Button type="submit" size="sm" variant="outline" className="h-7 px-2 text-[11px] shrink-0 bg-white text-indigo-600 hover:text-indigo-700 border-indigo-200 hover:bg-indigo-50">+ 追加</Button>
                        </form>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {services.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            サービスが登録されていません。上のフォームから追加してください。
          </div>
        )}
      </div>
    </div>
  );
}
