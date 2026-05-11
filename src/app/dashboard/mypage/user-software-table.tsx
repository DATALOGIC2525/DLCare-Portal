'use client';

import { Monitor } from 'lucide-react';

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

export function UserSoftwareTable({ softwares }: { softwares: Software[] }) {
  // カテゴリごとにグループ化
  const grouped = softwares.reduce((acc, curr) => {
    const cat = curr.category || 'その他システム';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(curr);
    return acc;
  }, {} as Record<string, Software[]>);

  return (
    <div className="space-y-4">
      <div className="border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm text-sm">
        <div className="grid grid-cols-12 gap-2 bg-slate-800 text-white font-bold py-2.5 px-4 text-xs items-center text-center uppercase tracking-wider">
          <div className="col-span-4 text-left pl-2">販売商品名</div>
          <div className="col-span-1">総数</div>
          <div className="col-span-1">EC台数</div>
          <div className="col-span-2">初回納入日</div>
          <div className="col-span-3">最終更新日</div>
          <div className="col-span-1">Ver.</div>
        </div>

        {Object.entries(grouped).map(([category, items]) => (
          <div key={category} className="border-b border-slate-200 last:border-b-0">
            <div className="bg-slate-100 text-slate-600 font-bold text-[10px] py-1.5 px-4 uppercase tracking-widest border-b border-slate-200">
              {category}
            </div>
            {items.map(item => (
              <div key={item.id} className="grid grid-cols-12 gap-2 py-3 px-4 border-b border-slate-50 last:border-b-0 items-center text-xs hover:bg-slate-50/80 transition-colors">
                <div className="col-span-4 font-bold text-slate-700 pl-2 truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="col-span-1 text-center font-semibold text-slate-600">{item.count ?? '-'}</div>
                <div className="col-span-1 text-center text-slate-500">{item.ecCount ?? '-'}</div>
                <div className="col-span-2 text-center text-slate-500">{item.purchaseDate || '-'}</div>
                <div className="col-span-3 text-center text-slate-500">{item.lastUpdateDate || '-'}</div>
                <div className="col-span-1 text-center text-slate-600 font-medium">{item.version || '-'}</div>
              </div>
            ))}
          </div>
        ))}

        {softwares.length === 0 && (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Monitor className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">登録されているシステム情報はありません。</p>
          </div>
        )}
      </div>
    </div>
  );
}
