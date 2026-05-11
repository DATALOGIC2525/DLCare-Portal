'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  LayoutDashboard, 
  User, 
  Bell, 
  Users, 
  Settings, 
  LayoutGrid, 
  Megaphone, 
  LogOut,
  Menu
} from 'lucide-react';
import { NavItem } from './nav-item';

interface DashboardSidebarProps {
  user: {
    contactName: string;
    avatarUrl?: string | null;
    tenant: {
      name: string;
      userLimit: number;
    };
  };
  activeUsersCount: number;
  unreadAnnouncementsCount: number;
  isAdmin: boolean;
  isTenantAdmin: boolean;
  signOutAction: () => Promise<void>;
}

export function DashboardSidebar({
  user,
  activeUsersCount,
  unreadAnnouncementsCount,
  isAdmin,
  isTenantAdmin,
  signOutAction
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 初回レンダリング時にlocalStorageから状態を復元
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    setIsMounted(true);
  }, []);

  // 状態が変更されたらlocalStorageに保存
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  if (!isMounted) {
    // マウント前はハイドレーションエラーを避けるため
    // デフォルト（展開状態）のスタイルでプレースホルダーを出すか、透明にする
    return <aside className="w-60 shrink-0 flex flex-col h-full shadow-xl z-20 bg-slate-900" />;
  }

  return (
    <aside 
      className={`${
        isCollapsed ? 'w-20' : 'w-60'
      } shrink-0 flex flex-col h-full shadow-xl z-20 transition-all duration-300 ease-in-out overflow-hidden`} 
      style={{ background: '#1E293B' }}
    >
      {/* ロゴ & トグルボタン */}
      <div className={`py-4 border-b border-slate-700 flex items-center overflow-hidden ${isCollapsed ? 'flex-col gap-3 justify-center px-2' : 'px-4 justify-between'}`}>
        <Link href="/dashboard" className={`flex items-center group min-w-0 ${isCollapsed ? 'justify-center' : 'gap-2'}`}>
          <img src="/logo.png" alt="DL Care Logo" width="32" height="32" className="shrink-0 transition-transform group-hover:scale-110 object-contain" />
          {!isCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300 overflow-hidden">
              <div className="text-white font-black text-base tracking-wide leading-tight truncate">DL Care</div>
              <div className="text-slate-400 text-[9px] leading-tight tracking-widest uppercase truncate">Portal</div>
            </div>
          )}
        </Link>
        <button 
          onClick={toggleSidebar}
          className={`p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors shrink-0 ${isCollapsed ? '' : 'ml-auto'}`}
          title={isCollapsed ? "メニューを展開" : "メニューを閉じる"}
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* ユーザー情報 */}
      <div className={`py-3 border-b border-slate-700/60 flex flex-col items-center ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <div className={`flex items-center gap-2 min-w-0 ${isCollapsed ? 'justify-center m-0' : 'mb-1 w-full'}`}>
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.contactName} className="w-7 h-7 rounded-full object-cover shrink-0 shadow-inner border border-slate-700" />
          ) : (
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-xs shadow-inner"
              style={{ background: 'linear-gradient(135deg, #0BBFDF, #E4197A)' }}
            >
              {user.contactName.charAt(0)}
            </div>
          )}
          {!isCollapsed && (
            <div className="min-w-0 animate-in fade-in duration-300">
              <div className="text-white text-xs font-semibold truncate">{user.tenant.name}</div>
              <div className="text-slate-400 text-[10px] truncate">{user.contactName}</div>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <div className="mt-2 flex flex-wrap gap-1 animate-in fade-in duration-300">
            {isAdmin && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                ADMIN
              </span>
            )}
            {isTenantAdmin && (
              <span className="text-[8px] px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-pink-500/20 text-pink-400 border border-pink-500/30">
                USER ADMIN
              </span>
            )}
          </div>
        )}
      </div>

      {/* ナビゲーション */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {/* ユーザー管理者向け状況サマリー */}
        {isTenantAdmin && !isCollapsed && (
          <div className="mb-6 px-2 animate-in fade-in duration-300">
            <div className="text-slate-500 text-[9px] uppercase tracking-widest mb-2 font-bold">利用状況</div>
            <Link href="/dashboard/tenant-users" className="block group">
              <div className="bg-slate-800/40 border border-slate-700/50 rounded-lg p-2.5 transition-all hover:bg-slate-800 hover:border-slate-600 active:scale-[0.98]">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-400 font-medium">ユーザー数</span>
                  <span className="text-[11px] font-bold text-white">{activeUsersCount} / {user.tenant.userLimit}</span>
                </div>
                <div className="w-full h-1 bg-slate-700/50 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-700 ${(activeUsersCount / user.tenant.userLimit) > 0.9 ? 'bg-red-500' : 'bg-cyan-400'}`} 
                    style={{ width: `${Math.min(100, (activeUsersCount / user.tenant.userLimit) * 100)}%` }} 
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[9px] text-slate-500 font-medium group-hover:text-slate-300">
                  <span>管理画面へ</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className={`text-slate-500 text-[9px] uppercase tracking-widest px-2 mb-2 font-bold ${isCollapsed ? 'text-center' : ''}`}>
          {isCollapsed ? '...' : 'メニュー'}
        </div>

        <NavItem href="/dashboard" iconName="LayoutDashboard" label="ダッシュボード" isCollapsed={isCollapsed} />
        <NavItem href="/dashboard/mypage" iconName="User" label="マイページ" isCollapsed={isCollapsed} />
        
        <Link href="/dashboard/announcements"
          title={isCollapsed ? "お知らせ" : undefined}
          className={`flex items-center relative ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] group ${
            false 
              ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
              : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
          }`}
        >
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
            <Bell className="h-4 w-4 shrink-0 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            {!isCollapsed && <span className="animate-in fade-in duration-300">お知らせ</span>}
          </div>
          {unreadAnnouncementsCount > 0 && (
            <span className={`flex items-center justify-center bg-red-500 text-white font-bold h-4 rounded-full shadow-sm animate-pulse ${
              isCollapsed ? 'absolute top-1 right-2 h-2 w-2 min-w-0 px-0' : 'text-[10px] min-w-[16px] px-1'
            }`}>
              {!isCollapsed && (unreadAnnouncementsCount > 99 ? '99+' : unreadAnnouncementsCount)}
            </span>
          )}
        </Link>

        {isTenantAdmin && (
          <NavItem href="/dashboard/tenant-users" iconName="Users" label="ユーザー管理" isCollapsed={isCollapsed} />
        )}

        {isAdmin && (
          <div className="pt-2 space-y-1">
            {!isCollapsed && <div className="text-slate-500 text-[9px] uppercase tracking-widest px-2 mb-2 font-bold animate-in fade-in duration-300">システム管理</div>}
            <NavItem href="/dashboard/admin/users" iconName="Users" label="登録ユーザーリスト" isCollapsed={isCollapsed} />
            <NavItem href="/dashboard/admin" iconName="Settings" label="マスター管理" isCollapsed={isCollapsed} />
            <NavItem href="/dashboard/admin/services" iconName="LayoutGrid" label="サービス管理" isCollapsed={isCollapsed} />
            <NavItem href="/dashboard/admin/announcements" iconName="Megaphone" label="お知らせ管理" isCollapsed={isCollapsed} />
          </div>
        )}
      </nav>

      {/* ログアウト */}
      <div className="px-3 py-3 border-t border-slate-700/60 bg-slate-900/20">
        <form action={async () => {
          await signOutAction();
        }}>
          <button type="submit"
            title={isCollapsed ? "ログアウト" : undefined}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-2'} py-2 rounded-lg text-xs text-slate-400 font-medium hover:bg-red-500/10 hover:text-red-400 transition-all active:scale-95 group`}>
            <LogOut className="h-4 w-4 shrink-0 transition-transform group-hover:-translate-x-1" />
            {!isCollapsed && <span className="animate-in fade-in duration-300">ログアウト</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
