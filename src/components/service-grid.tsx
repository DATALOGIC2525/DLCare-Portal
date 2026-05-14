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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {services.map((svc, index) => {
            const Icon = (Icons as any)[svc.iconName || 'Link'] || Icons.Link;
            const accent = accents[svc.name] || '#0BBFDF';
            
            return (
              <Link
                key={svc.id}
                href={`/dashboard?service=${svc.id}`}
                className="group relative flex flex-col items-center justify-between p-6 rounded-[24px] border-[2px] border-primary/20 min-h-[200px] transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 bg-white"
              >
                {/* 番号 */}
                <div className="absolute top-3 left-4 flex items-center justify-center w-7 h-7 rounded-full bg-slate-800 text-white font-black text-xs">
                  {index + 1}
                </div>

                {/* タイトル */}
                <div className="w-full text-center mt-2 px-6">
                  <h3 className="text-slate-800 font-black text-base md:text-lg tracking-tight leading-tight line-clamp-1">
                    {svc.name}
                  </h3>
                </div>

                {/* アイコン */}
                <div className="my-3 flex items-center justify-center">
                  <div className="relative">
                    <Icon className="h-12 w-12 text-primary" strokeWidth={1.5} />
                    {/* 装飾用のアニメーションサークル */}
                    <div className="absolute inset-0 bg-primary/10 rounded-full scale-125 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>

                {/* 説明文 */}
                <div className="w-full">
                  <p className="text-primary/70 text-[10px] md:text-xs font-bold text-center leading-relaxed whitespace-pre-wrap">
                    {svc.description || 'サービスの詳細はクリックしてご確認ください。'}
                  </p>
                </div>
                
                {/* ホバー時の装飾 */}
                <div className="absolute bottom-3 right-4 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                  <Icons.ArrowRight className="h-4 w-4" />
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
