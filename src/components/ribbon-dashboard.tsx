'use client';

import { useState, useEffect, useRef } from 'react';
import * as Icons from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MarkdownPreview } from '@/components/markdown-preview';

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
  groupLabel: string | null;
  sortOrder: number;
  description: string | null;
}

interface RibbonDashboardProps {
  services: Service[];
  selectedId: string; // プロップとして受け取る
  credMap: Record<string, Credential | null>;
  accents: Record<string, string>;
  variantMap: Record<string, { id: string; label: string; url: string }[]>;
  userRole: string;
}

export function RibbonDashboard({ services, selectedId, credMap, accents, variantMap, userRole }: RibbonDashboardProps) {
  // 以前の選択状態管理ロジックを削除
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedService = services.find(s => s.id === selectedId);
  const selectedCred = selectedId ? credMap[selectedId] : null;
  const selectedAccent = selectedService ? (accents[selectedService.name] ?? '#3B82F6') : '#3B82F6';
  const SelectedIcon = selectedService
    ? ((Icons as any)[selectedService.iconName || 'Link'] || Icons.Link)
    : Icons.Link;
  const selectedVariants = selectedId ? (variantMap[selectedId] ?? []) : [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F8FAFC' }}>
      {/* 詳細パネル */}
      <div className="flex-1 p-2 md:p-4 flex flex-col min-h-0 overflow-hidden">
        {selectedService ? (
          <div className="flex-1 w-full flex flex-col min-h-0">
            {/* パネルタイトルバー */}
            <div
              className="shrink-0 flex items-center gap-2.5 px-3 py-1.5 rounded-t-xl text-white shadow-md"
              style={{ background: `linear-gradient(135deg, ${selectedAccent}, ${selectedAccent}AA)` }}
            >
              <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center shrink-0">
                <SelectedIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 flex items-baseline gap-2 overflow-hidden">
                <div className="font-bold text-[12px] md:text-[13px] tracking-tight truncate">{selectedService.name}</div>
                {selectedCred?.isShared && (
                  <span className="hidden sm:inline text-[8px] md:text-[9px] text-white/80 font-medium">テナント共通</span>
                )}
              </div>
              {selectedService.name === 'く～chat' && selectedCred && (
                <div className="hidden sm:flex items-center bg-white p-1 px-2 rounded-md border border-white/20 shadow-sm shrink-0">
                  <CredentialsMini cred={selectedCred} accent={selectedAccent} />
                </div>
              )}
            </div>

            {/* コンテンツカード */}
            <div className={`bg-white rounded-b-xl shadow-xl border border-t-0 border-slate-200 flex-1 flex flex-col min-h-0 relative ${selectedService.name === 'く～chat' || selectedService.name === 'スタートサポート' ? 'overflow-hidden' : `p-4 md:p-6 overflow-auto ${selectedService.name === 'オンラインセミナー' ? '' : 'space-y-4 md:space-y-6'}`}`}>
              
              {/* サービス別 特別コンテンツ */}
              {selectedService.name === 'く～chat' ? (
                <div className="absolute inset-0">
                  <iframe 
                    src="https://kasanare.com/user/datalogic2"
                    className="w-full h-full border-0 rounded-b-xl"
                    title="Kasanare Chat"
                  />
                </div>
              ) : selectedService.name === 'スタートサポート' ? (
                <div className="absolute inset-0">
                  <iframe 
                    src="https://schedule-set.vercel.app/"
                    className="w-full h-full border-0 rounded-b-xl"
                    title="Start Support Dashboard"
                  />
                </div>
              ) : selectedService.name === 'オンラインセミナー' ? (
                <div className="space-y-6 flex flex-col">
                  {/* 動画プレイヤー */}
                  <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 w-full min-h-[700px] relative shrink-0">
                    <iframe 
                      src="/seminar-player.html"
                      className="absolute inset-0 w-full h-full border-0"
                      title="Online Seminar Player"
                      allow="autoplay; fullscreen; encrypted-media"
                    />
                  </div>
                  
                  {/* アクションバー: 認証情報とボタン */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-wrap items-center justify-between gap-8">
                    <div className="flex-1 min-w-[300px]">
                      {selectedCred ? (
                        <CredentialsPanel cred={selectedCred} accent={selectedAccent} />
                      ) : (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs text-slate-400 font-medium italic">
                          ログイン情報が設定されていません
                        </div>
                      )}
                    </div>
                    
                    <div className="flex flex-col items-end gap-4 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 font-bold">
                          <div className="w-3 h-3 bg-orange-500 rounded-full animate-ping" />
                          <span className="tracking-wider">ON-DEMAND SEMINAR</span>
                        </div>
                        <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-100 px-4 py-1 font-bold text-xs">ULIZA PLAYER</Badge>
                      </div>

                      <a
                        href="https://dlcare.site.p.uliza.jp/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:scale-105 shadow-xl active:scale-95"
                        style={{ background: `linear-gradient(135deg, ${selectedAccent}, ${selectedAccent}BB)` }}
                      >
                        <Icons.ExternalLink className="h-5 w-5" />
                        セミナーサイトを開く
                      </a>
                    </div>
                  </div>
                </div>
              ) : selectedCred ? (
                /* データロジックダイレクトかつ担当者の場合は非表示 */
                selectedService.name === 'データロジックダイレクト' && userRole === 'GENERAL_USER' ? (
                  <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-8 text-center">
                    <Icons.Lock className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500 font-medium">ログイン情報は管理者に公開されています</p>
                  </div>
                ) : (
                  <CredentialsPanel cred={selectedCred} accent={selectedAccent} />
                )
              ) : null}

              {/* ダウンロードバリアント */}
              {selectedVariants.length > 0 && (
                <div className="pt-6 border-t border-slate-100">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-3">ダウンロード</label>
                  <div className="flex flex-wrap gap-3">
                    {selectedVariants.map(v => (
                      <a
                        key={v.id}
                        href={v.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm text-white transition-all hover:-translate-y-0.5 shadow-md"
                        style={{ background: `linear-gradient(135deg, ${selectedAccent}, ${selectedAccent}BB)` }}
                      >
                        <Icons.Download className="h-4 w-4" />
                        {v.label}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* 詳細説明 (Markdown) */}
              {selectedService.description && (
                <div className="pt-6 border-t border-slate-100">
                  <MarkdownPreview source={selectedService.description} />
                </div>
              )}

              {/* サービスを開くボタン */}
              <div className="pt-6 border-t border-slate-100 flex justify-center">
                {selectedService.name === 'く～chat' || selectedService.name === 'オンラインセミナー' || selectedService.name === 'スタートサポート' ? null : selectedService.url ? (
                  <a
                    href={selectedService.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-3 px-10 py-3.5 rounded-xl font-bold text-base text-white transition-all hover:scale-105 shadow-xl active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${selectedAccent}, ${selectedAccent}BB)` }}
                  >
                    <Icons.ExternalLink className="h-5 w-5" />
                    {selectedService.name} を開く
                  </a>
                ) : (
                  <button
                    disabled
                    className="inline-flex items-center gap-3 px-10 py-3.5 rounded-xl font-bold text-base text-slate-500 bg-slate-200 cursor-not-allowed shadow-inner"
                  >
                    <Icons.Clock className="h-5 w-5" />
                    Coming Soon
                  </button>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-4">
            <Icons.MousePointer2 className="h-10 w-10 opacity-20" />
            <p className="font-bold tracking-widest text-sm opacity-40">SELECT A SERVICE</p>
          </div>
        )}
      </div>
    </div>
  );
}

// 認証情報パネル（標準）
function CredentialsPanel({ cred, accent }: { cred: Credential | null; accent: string }) {
  if (!cred) return null;
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-1.5">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">ログインID</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-700 shadow-inner">
            {cred.loginId}
          </div>
          <CopyBtn text={cred.loginId} accent={accent} label="IDコピー" />
        </div>
      </div>
      {cred.password && (
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">パスワード</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-mono text-sm text-slate-400 tracking-[0.5em] shadow-inner">
              ••••••••••
            </div>
            <CopyBtn text={cred.password} accent={accent} label="PWコピー" />
          </div>
        </div>
      )}
    </div>
  );
}

// 認証情報ミニ（ヘッダー用）
function CredentialsMini({ cred, accent }: { cred: Credential; accent: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] font-bold text-slate-400 uppercase">ID</span>
        <span className="text-[11px] font-mono text-slate-700 font-bold">{cred.loginId}</span>
        <CopyBtn text={cred.loginId} accent={accent} label="コピー" compact />
      </div>
      {cred.password && (
        <div className="flex items-center gap-1.5 border-l border-slate-200 pl-3">
          <span className="text-[8px] font-bold text-slate-400 uppercase">PW</span>
          <span className="text-[11px] font-mono text-slate-400 tracking-widest">••••••</span>
          <CopyBtn text={cred.password} accent={accent} label="コピー" compact />
        </div>
      )}
    </div>
  );
}

// コピーボタン
function CopyBtn({ text, accent, label, compact = false }: { text: string; accent: string; label: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className={`shrink-0 flex items-center gap-1.5 font-bold border transition-all active:scale-90 ${compact ? 'px-1.5 py-0.5 text-[9px] rounded-md' : 'px-4 py-3 text-xs rounded-xl'}`}
      style={{
        border: compact ? `1px solid ${accent}40` : `2px solid ${accent}40`,
        color: copied ? '#059669' : accent,
        background: copied ? '#ECFDF5' : 'white',
      }}
    >
      {copied ? <Icons.Check className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} /> : <Icons.Copy className={compact ? "h-2.5 w-2.5" : "h-3 w-3"} />}
      {copied ? '完了' : label}
    </button>
  );
}
