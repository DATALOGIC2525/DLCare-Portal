'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit2, Plus, Trash2, X, Check } from 'lucide-react';
import { addTenantSoftware, updateTenantSoftware, deleteTenantSoftware } from './actions';

type Software = {
  id: string;
  category: string | null;
  name: string;
  count: number | null;
  ecCount: number | null;
  purchaseDate: string | null;
  lastUpdateDate: string | null;
  version: string | null;
};

export function TenantSoftwareTable({ tenantId, softwares }: { tenantId: string; softwares: Software[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // カテゴリごとにグループ化
  const grouped = softwares.reduce((acc, curr) => {
    const cat = curr.category || 'その他システム';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, Software[]>);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-sm font-bold text-slate-700">システム所有状況</h5>
        <Button size="sm" variant="outline" onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null} className="h-8 text-xs bg-white">
          <Plus className="h-3 w-3 mr-1" /> 行を追加
        </Button>
      </div>

      <div className="border border-slate-200 rounded-md overflow-hidden bg-white shadow-sm text-sm">
        <div className="grid grid-cols-12 gap-2 bg-orange-500 text-white font-bold py-2 px-3 text-xs items-center text-center">
          <div className="col-span-3">販売商品名</div>
          <div className="col-span-1">総数</div>
          <div className="col-span-1">EC台数</div>
          <div className="col-span-2">初回納入日</div>
          <div className="col-span-2">最終更新日</div>
          <div className="col-span-1">Ver.</div>
          <div className="col-span-2">操作</div>
        </div>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <div className="bg-orange-100 text-orange-900 font-bold text-xs py-1 px-3 text-center border-b border-slate-200">
              {category}
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 py-2 px-3 border-b border-slate-100 items-center text-xs hover:bg-slate-50 transition-colors">
                {editingId === item.id ? (
                  <form action={async (fd) => { await updateTenantSoftware(item.id, fd); setEditingId(null); }} className="col-span-12 grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-3 flex flex-col gap-1">
                      <Input name="category" defaultValue={item.category || ''} placeholder="カテゴリ" className="h-7 text-xs px-2 bg-white" />
                      <Input name="name" defaultValue={item.name} required placeholder="商品名" className="h-7 text-xs px-2 bg-white font-bold" />
                    </div>
                    <div className="col-span-1">
                      <Input type="number" name="count" defaultValue={item.count ?? ''} className="h-7 text-xs px-2 bg-white text-center" min={0} />
                    </div>
                    <div className="col-span-1">
                      <Input type="number" name="ecCount" defaultValue={item.ecCount ?? ''} className="h-7 text-xs px-2 bg-white text-center" min={0} />
                    </div>
                    <div className="col-span-2">
                      <Input name="purchaseDate" defaultValue={item.purchaseDate ?? ''} className="h-7 text-xs px-2 bg-white text-center" />
                    </div>
                    <div className="col-span-2">
                      <Input name="lastUpdateDate" defaultValue={item.lastUpdateDate ?? ''} className="h-7 text-xs px-2 bg-white text-center" />
                    </div>
                    <div className="col-span-1">
                      <Input name="version" defaultValue={item.version ?? ''} className="h-7 text-xs px-2 bg-white text-center" />
                    </div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <Button size="icon" type="submit" variant="ghost" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"><Check className="h-4 w-4" /></Button>
                      <Button size="icon" type="button" variant="ghost" onClick={() => setEditingId(null)} className="h-7 w-7 text-slate-400 hover:text-slate-600 hover:bg-slate-100"><X className="h-4 w-4" /></Button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="col-span-3 font-semibold pl-2 truncate" title={item.name}>{item.name}</div>
                    <div className="col-span-1 text-center">{item.count ?? ''}</div>
                    <div className="col-span-1 text-center">{item.ecCount ?? ''}</div>
                    <div className="col-span-2 text-center text-slate-600">{item.purchaseDate ?? ''}</div>
                    <div className="col-span-2 text-center text-slate-600">{item.lastUpdateDate ?? ''}</div>
                    <div className="col-span-1 text-center text-slate-600">{item.version ?? ''}</div>
                    <div className="col-span-2 flex justify-center gap-1">
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(item.id)} disabled={isAdding || (editingId !== null && editingId !== item.id)} className="h-7 w-7 text-slate-400 hover:text-blue-600 hover:bg-blue-50"><Edit2 className="h-3.5 w-3.5" /></Button>
                      <form action={deleteTenantSoftware.bind(null, item.id)}>
                        <Button size="icon" type="submit" variant="ghost" disabled={isAdding || editingId !== null} className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></Button>
                      </form>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ))}

        {isAdding && (
          <div className="grid grid-cols-12 gap-2 py-3 px-3 border-b border-emerald-200 bg-emerald-50 items-center text-xs">
            <form action={async (fd) => { await addTenantSoftware(tenantId, fd); setIsAdding(false); }} className="col-span-12 grid grid-cols-12 gap-2 items-center">
              <div className="col-span-3 flex flex-col gap-1">
                <Input name="category" placeholder="カテゴリ (例: DL Care)" className="h-7 text-xs px-2 bg-white" />
                <Input name="name" required placeholder="販売商品名" className="h-7 text-xs px-2 bg-white font-bold" />
              </div>
              <div className="col-span-1">
                <Input type="number" name="count" placeholder="総数" className="h-7 text-xs px-2 bg-white text-center" min={0} />
              </div>
              <div className="col-span-1">
                <Input type="number" name="ecCount" placeholder="EC台数" className="h-7 text-xs px-2 bg-white text-center" min={0} />
              </div>
              <div className="col-span-2">
                <Input name="purchaseDate" placeholder="初回納入日" className="h-7 text-xs px-2 bg-white text-center" />
              </div>
              <div className="col-span-2">
                <Input name="lastUpdateDate" placeholder="最終更新日" className="h-7 text-xs px-2 bg-white text-center" />
              </div>
              <div className="col-span-1">
                <Input name="version" placeholder="Ver" className="h-7 text-xs px-2 bg-white text-center" />
              </div>
              <div className="col-span-2 flex justify-center gap-1">
                <Button size="icon" type="submit" variant="ghost" className="h-7 w-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-200"><Check className="h-4 w-4" /></Button>
                <Button size="icon" type="button" variant="ghost" onClick={() => setIsAdding(false)} className="h-7 w-7 text-slate-500 hover:text-slate-700 hover:bg-slate-200"><X className="h-4 w-4" /></Button>
              </div>
            </form>
          </div>
        )}

        {softwares.length === 0 && !isAdding && (
          <div className="py-6 text-center text-slate-400 text-xs">
            登録されているシステム情報はありません。
          </div>
        )}
      </div>
    </div>
  );
}
