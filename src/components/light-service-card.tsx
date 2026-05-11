'use client';

import * as Icons from 'lucide-react';
import { useState } from 'react';

interface Credential {
  loginId: string;
  password?: string | null;
  isShared: boolean;
}

interface Service {
  id: string;
  name: string;
  url: string | null;
  iconName: string | null;
}

interface LightServiceCardProps {
  service: Service;
  cred: Credential | null;
  accent: string;
}

export function LightServiceCard({ service, cred, accent }: LightServiceCardProps) {
  const IconComponent = (Icons as any)[service.iconName || 'Link'] || Icons.Link;

  return (
    <div className="light-service-card flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-100">
      {/* アクセントカラーの上ボーダー */}
      <div style={{ height: '3px', background: `linear-gradient(90deg, ${accent}, ${accent}88)` }} />

      {/* カードヘッダー */}
      <div className="flex items-center gap-2 px-3 pt-2.5 pb-2">
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: `${accent}15` }}
        >
          <IconComponent className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <span className="font-semibold text-slate-700 text-[11px] leading-tight flex-1 truncate">
          {service.name}
        </span>
      </div>

      {/* 認証情報エリア */}
      <div className="px-3 pb-2.5 space-y-1.5">
        {cred ? (
          <>
            {cred.isShared && (
              <span
                className="inline-block text-[8px] px-1.5 py-0.5 rounded-full font-bold tracking-wide uppercase"
                style={{ color: accent, background: `${accent}15` }}
              >
                共通
              </span>
            )}
            {/* ID行 */}
            <div
              className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
              style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
            >
              <span className="text-[8px] font-bold w-4 shrink-0" style={{ color: accent }}>ID</span>
              <span className="text-slate-600 font-mono text-[10px] truncate flex-1">{cred.loginId}</span>
              <CopyBtn text={cred.loginId} />
            </div>
            {/* PW行 */}
            {cred.password && (
              <div
                className="flex items-center gap-1.5 rounded-lg px-2 py-1.5"
                style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}
              >
                <span className="text-[8px] font-bold w-4 shrink-0" style={{ color: accent }}>PW</span>
                <span className="text-slate-400 font-mono text-[10px] flex-1">••••••••</span>
                <CopyBtn text={cred.password} />
              </div>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center py-1">
            <span className="text-[10px] text-slate-300">情報なし</span>
          </div>
        )}

        {/* サービスを開くボタン */}
        {service.url ? (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-bold tracking-wide transition-all hover:opacity-90 hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${accent}, ${accent}BB)`,
              color: '#fff',
              boxShadow: `0 2px 6px ${accent}30`,
            }}
          >
            開く <Icons.ExternalLink className="h-2.5 w-2.5" />
          </a>
        ) : (
          <div className="mt-1 flex items-center justify-center bg-slate-100 rounded-lg py-1.5 text-[10px] text-slate-400">
            準備中
          </div>
        )}
      </div>
    </div>
  );
}

// コピーボタン（ライトテーマ）
function CopyBtn({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-0.5 rounded transition-colors hover:bg-slate-200"
      title="コピー"
    >
      {copied
        ? <Icons.Check className="h-3 w-3 text-emerald-500" />
        : <Icons.Copy className="h-3 w-3 text-slate-300 hover:text-slate-500" />
      }
    </button>
  );
}
