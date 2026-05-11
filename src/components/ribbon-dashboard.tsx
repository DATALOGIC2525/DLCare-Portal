'use client';

import { useState, useEffect } from 'react';
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
  credMap: Record<string, Credential | null>;
  accents: Record<string, string>;
  variantMap: Record<string, { id: string; label: string; url: string }[]>;
  userRole: string;
}

export function RibbonDashboard({ services, credMap, accents, variantMap, userRole }: RibbonDashboardProps) {
  // 初期値の読み込みをマウント後に行うためのハイドレーション対策
  const [selectedId, setSelectedId] = useState<string>('');
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // マウント時に前回選択していたIDと折りたたみ状態を復旧
  useEffect(() => {
    // 選択IDの復旧
    const savedId = sessionStorage.getItem('dlcare_last_service_id');
    if (savedId && services.some(s => s.id === savedId)) {
      setSelectedId(savedId);
    } else {
      setSelectedId(services[0]?.id ?? '');
    }

    // 折りたたみ状態の復旧
    const savedCollapsed = sessionStorage.getItem('dlcare_ribbon_collapsed');
    if (savedCollapsed === 'true') {
      setIsCollapsed(true);
    }
  }, [services]);

  // 選択変更時に保存
  const handleSelect = (id: string) => {
    setSelectedId(id);
    sessionStorage.setItem('dlcare_last_service_id', id);
  };

  // 折りたたみ切り替え
  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    sessionStorage.setItem('dlcare_ribbon_collapsed', String(newState));
  };

  const selectedService = services.find(s => s.id === selectedId);
  const selectedCred = selectedId ? credMap[selectedId] : null;
  const selectedAccent = selectedService ? (accents[selectedService.name] ?? '#3B82F6') : '#3B82F6';
  const SelectedIcon = selectedService
    ? ((Icons as any)[selectedService.iconName || 'Link'] || Icons.Link)
    : Icons.Link;
  const selectedVariants = selectedId ? (variantMap[selectedId] ?? []) : [];

  // DB の groupLabel でサービスを動的グループ化
  const groupMap = new Map<string, Service[]>();
  for (const svc of services) {
    const label = svc.groupLabel ?? '未分類';
    if (!groupMap.has(label)) groupMap.set(label, []);
    groupMap.get(label)!.push(svc);
  }
  const dynamicGroups = Array.from(groupMap.entries()).map(([label, svcs]) => ({ label, svcs }));

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ background: '#F0F0F0' }}>

      {/* ── リボンバー ── */}
      <div className="shrink-0 border-b-2 border-slate-300 transition-all duration-300 ease-in-out" style={{ background: '#FAFAFA' }}>

        {/* リボンタブ風タイトル */}
        <div className="flex items-center justify-between px-4 py-1.5 border-b border-slate-200"
          style={{ background: '#1E3A8A' }}>
          <div className="flex items-center gap-4">
            <span className="text-white font-bold text-sm tracking-wide">ポータルサービス一覧</span>
            <span className="text-blue-300 text-xs">— ログイン情報を確認・コピーします</span>
          </div>
          
          <button 
            onClick={toggleCollapse}
            className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white flex items-center gap-1.5"
            title={isCollapsed ? "展開する" : "折りたたむ"}
          >
            <span className="text-[10px] font-bold tracking-tighter uppercase opacity-60">
              {isCollapsed ? "Menu" : "Minimize"}
            </span>
            {isCollapsed ? <Icons.ChevronDown className="h-4 w-4" /> : <Icons.ChevronUp className="h-4 w-4" />}
          </button>
        </div>

        {/* リボン本体 - アニメーション付き */}
        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isCollapsed ? 'max-h-0 opacity-0' : 'max-h-[160px] opacity-100'}`}>
          <div className="flex w-full overflow-x-auto">
            {dynamicGroups.map((group) => (
              <div key={group.label} className="flex border-r border-slate-200 last:border-r-0">
                <div className="flex flex-col min-w-[120px]">
                  {/* ボタン行 */}
                  <div className="flex items-start px-2 pt-2 pb-1 gap-1">
                    {group.svcs.map(svc => {
                      const Icon = (Icons as any)[svc.iconName || 'Link'] || Icons.Link;
                      const accent = accents[svc.name] ?? '#3B82F6';
                      const isSelected = svc.id === selectedId;

                      return (
                        <button
                          key={svc.id}
                          onClick={() => handleSelect(svc.id)}
                          className="flex flex-col items-center px-2 py-2 rounded-md transition-all w-20 text-center group"
                          style={{
                            background: isSelected ? `${accent}20` : 'transparent',
                            border: isSelected ? `1px solid ${accent}60` : '1px solid transparent',
                          }}
                          title={svc.name}
                        >
                          <div
                            className="w-14 h-14 rounded-xl flex items-center justify-center mb-1.5 transition-all group-hover:scale-105"
                            style={{
                              background: isSelected
                                ? `linear-gradient(145deg, ${accent}, ${accent}BB)`
                                : `${accent}18`,
                              boxShadow: isSelected ? `0 2px 8px ${accent}50` : 'none',
                            }}
                          >
                            <Icon
                              className="h-7 w-7 transition-all"
                              style={{ color: isSelected ? '#fff' : accent }}
                            />
                          </div>
                          <span
                            className="text-[10px] leading-tight font-medium text-center line-clamp-2"
                            style={{
                              color: isSelected ? accent : '#374151',
                            }}
                          >
                            {svc.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {/* グループラベル */}
                  <div className="px-2 pb-1 border-t border-slate-200 pt-1 text-center">
                    <span className="text-[9px] text-slate-400 tracking-wide font-bold">{group.label}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 詳細パネル ── */}
      <div className="flex-1 p-4 flex flex-col min-h-0 overflow-hidden">
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
              <div className="flex-1 flex items-baseline gap-2">
                <div className="font-bold text-[13px] tracking-tight">{selectedService.name}</div>
                {selectedCred?.isShared && (
                  <span className="text-[9px] text-white/80 font-medium">テナント共通設定</span>
                )}
              </div>
              {selectedService.name === 'く～chat' && selectedCred && (
                <div className="flex items-center bg-white p-1 px-2 rounded-md border border-white/20 shadow-sm shrink-0">
                  <CredentialsMini cred={selectedCred} accent={selectedAccent} />
                </div>
              )}
            </div>

            {/* コンテンツカード */}
            <div className={`bg-white rounded-b-xl shadow-xl border border-t-0 border-slate-200 flex-1 flex flex-col min-h-0 relative ${selectedService.name === 'く～chat' ? 'overflow-hidden' : `p-6 overflow-auto ${selectedService.name === 'オンラインセミナー' ? '' : 'space-y-6'}`}`}>
              
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
                      <CredentialsPanel cred={selectedCred!} accent={selectedAccent} />
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
function CredentialsPanel({ cred, accent }: { cred: Credential; accent: string }) {
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
