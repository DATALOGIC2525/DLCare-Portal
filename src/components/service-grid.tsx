'use client';

import * as Icons from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  iconName: string | null;
  description: string | null;
}

interface ServiceGridProps {
  services: Service[];
  accents: Record<string, string>;
}

export function ServiceGrid({ services, accents }: ServiceGridProps) {
  return (
    <div className="flex-1 p-6 md:p-10 overflow-y-auto bg-white custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((svc, index) => {
            const Icon = (Icons as any)[svc.iconName || 'Link'] || Icons.Link;
            const accent = accents[svc.name] || '#0BBFDF';
            
            return (
              <Link
                key={svc.id}
                href={`/dashboard?service=${svc.id}`}
                className="group relative flex flex-col items-center justify-between p-8 rounded-[32px] border-[3px] border-sky-400 min-h-[260px] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-sky-100 bg-white"
              >
                {/* 番号 */}
                <div className="absolute top-4 left-6 flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-white font-black text-sm">
                  {index + 1}
                </div>

                {/* タイトル */}
                <div className="w-full text-center mt-2 px-10">
                  <h3 className="text-slate-800 font-black text-lg md:text-xl tracking-tight leading-tight line-clamp-1">
                    {svc.name}
                  </h3>
                </div>

                {/* アイコン */}
                <div className="my-4 flex items-center justify-center">
                  <div className="relative">
                    <Icon className="h-16 w-16 text-sky-500" strokeWidth={1.5} />
                    {/* 装飾用のアニメーションサークル */}
                    <div className="absolute inset-0 bg-sky-400/10 rounded-full scale-150 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* 説明文 */}
                <div className="w-full">
                  <p className="text-sky-600 text-xs md:text-sm font-bold text-center leading-relaxed whitespace-pre-wrap">
                    {svc.description || 'サービスの詳細はクリックしてご確認ください。'}
                  </p>
                </div>
                
                {/* ホバー時の装飾 */}
                <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-sky-400">
                  <Icons.ArrowRight className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* 画面下のコピーライト等の装飾 */}
      <div className="mt-20 border-t border-slate-100 pt-8 text-center">
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em]">
          DLCare Support Portal — Service Selection
        </p>
      </div>
    </div>
  );
}
