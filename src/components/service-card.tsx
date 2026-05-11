'use client';

import * as Icons from 'lucide-react';
import { CopyButton } from './copy-button';

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

interface ServiceCardProps {
  service: Service;
  cred: Credential | null;
  accent: string;
}

export function ServiceCard({ service, cred, accent }: ServiceCardProps) {
  const IconComponent = (Icons as any)[service.iconName || 'Link'] || Icons.Link;

  return (
    <div
      className="service-card flex flex-col rounded-xl overflow-hidden border"
      style={{
        background: 'rgba(30, 41, 59, 0.7)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderColor: 'rgba(255,255,255,0.08)',
        borderLeftColor: accent,
        borderLeftWidth: '3px',
        // CSS変数としてアクセントカラーを渡す（hover glowで使用）
        ['--accent' as any]: accent,
      }}
    >
      {/* カードヘッダー */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-white/5">
        <div className="p-1.5 rounded-lg shrink-0" style={{ background: `${accent}20` }}>
          <IconComponent className="h-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <span className="text-white/90 font-semibold text-xs leading-tight">{service.name}</span>
      </div>

      {/* 認証情報エリア */}
      <div className="flex-1 flex flex-col px-3 py-2 gap-2">
        {cred ? (
          <div className="flex-1 space-y-1.5">
            {cred.isShared && (
              <span
                className="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
                style={{ color: accent, background: `${accent}20` }}
              >
                テナント共通
              </span>
            )}
            {/* ログインID */}
            <div
              className="flex items-center justify-between rounded-lg px-2 py-1.5"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <div className="min-w-0 flex-1">
                <div className="text-[9px] font-medium mb-0.5" style={{ color: accent }}>ID</div>
                <div className="text-white/80 font-mono text-[11px] truncate">{cred.loginId}</div>
              </div>
              <CopyButton text={cred.loginId} />
            </div>
            {/* パスワード */}
            {cred.password && (
              <div
                className="flex items-center justify-between rounded-lg px-2 py-1.5"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <div className="text-[9px] font-medium mb-0.5" style={{ color: accent }}>PW</div>
                  <div className="text-white/40 font-mono text-[11px]">••••••••</div>
                </div>
                <CopyButton text={cred.password} />
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-white/25 text-[11px] text-center">ログイン情報なし</span>
          </div>
        )}

        {/* サービスへのリンク */}
        {service.url ? (
          <a
            href={service.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[11px] font-semibold transition-opacity hover:opacity-80"
            style={{
              background: `linear-gradient(135deg, ${accent}CC, ${accent}88)`,
              color: '#fff',
              boxShadow: `0 2px 8px ${accent}40`,
            }}
          >
            開く <Icons.ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <div
            className="flex items-center justify-center rounded-lg py-1.5 text-[11px]"
            style={{
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(255,255,255,0.25)',
            }}
          >
            準備中
          </div>
        )}
      </div>
    </div>
  );
}
