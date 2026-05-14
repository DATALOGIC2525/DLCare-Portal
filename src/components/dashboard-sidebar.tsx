'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import * as Icons from 'lucide-react';
import { 
  ChevronRight, 
  ChevronLeft,
  LayoutDashboard, 
  User, 
  Bell, 
  Users, 
  Settings, 
  LayoutGrid, 
  Megaphone, 
  LogOut,
  Menu,
  Star,
  StarOff,
  HelpCircle
} from 'lucide-react';
import { NavItem } from './nav-item';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { cn } from '@/lib/utils';

interface Service {
  id: string;
  name: string;
  iconName: string | null;
  groupLabel: string | null;
}

interface DashboardSidebarProps {
  user: {
    contactName: string;
    avatarUrl?: string | null;
    tenant: {
      name: string;
    };
  };
  services: Service[];
  unreadAnnouncementsCount: number;
  isAdmin: boolean;
  isTenantAdmin: boolean;
  signOutAction: () => Promise<void>;
}

export function DashboardSidebar({
  user,
  services,
  unreadAnnouncementsCount,
  isAdmin,
  isTenantAdmin,
  signOutAction
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentServiceId = searchParams.get('service');
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [openGroups, setOpenGroups] = useState<string[]>([]);

  // 選択されたサービスのグループを自動展開
  useEffect(() => {
    if (currentServiceId) {
      const selectedService = services.find(s => s.id === currentServiceId);
      if (selectedService) {
        const group = selectedService.groupLabel || 'その他';
        setOpenGroups(prev => prev.includes(group) ? prev : [...prev, group]);
      }
    }
  }, [currentServiceId, services]);

  // 初回レンダリング時にlocalStorageから状態を復元
  useEffect(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }
    
    const savedFavs = localStorage.getItem('dlcare-favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }
    
    setIsMounted(true);
  }, []);

  // 状態が変更されたらlocalStorageに保存
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(f => f !== id)
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('dlcare-favorites', JSON.stringify(newFavs));
  };

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  if (!isMounted) {
    return <aside className="hidden md:flex w-60 shrink-0 flex-col h-full shadow-xl z-20 bg-slate-900" />;
  }

  // サービスをグループ化
  const favoriteServices = services.filter(s => favorites.includes(s.id));
  const groupMap = new Map<string, Service[]>();
  for (const svc of services) {
    const label = svc.groupLabel || 'その他';
    if (!groupMap.has(label)) groupMap.set(label, []);
    groupMap.get(label)!.push(svc);
  }
  const groups = Array.from(groupMap.entries()).sort((a, b) => a[0].localeCompare(b[0]));

  const renderServiceItem = (svc: Service) => {
    const Icon = (Icons as any)[svc.iconName || 'HelpCircle'] || HelpCircle;
    const isSelected = currentServiceId === svc.id;
    const isFav = favorites.includes(svc.id);

    return (
      <Link
        key={svc.id}
        href={`/dashboard?service=${svc.id}`}
        onClick={() => isMobileOpen && setIsMobileOpen(false)}
        className={cn(
          "group flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-bold transition-all relative",
          isSelected 
            ? "bg-primary/10 text-primary border border-primary/20" 
            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
        )}
      >
        <Icon className={cn("h-3.5 w-3.5 shrink-0", isSelected ? "text-primary" : "text-slate-500 group-hover:text-slate-400")} />
        <span className={cn("truncate", isCollapsed && "md:hidden")}>{svc.name}</span>
        
        {!isCollapsed && (
          <button
            onClick={(e) => toggleFavorite(e, svc.id)}
            className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Star className={cn("h-3 w-3", isFav ? "fill-[#D84C7E] text-[#D84C7E]" : "text-slate-600")} />
          </button>
        )}
        
        {isSelected && !isCollapsed && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-primary rounded-l-full" />
        )}
      </Link>
    );
  };

  return (
    <>
      <button 
        onClick={toggleMobileSidebar}
        className="md:hidden fixed top-3 left-4 z-[60] p-2 bg-slate-900 text-white rounded-lg shadow-lg"
      >
        <Menu className="h-5 w-5" />
      </button>

      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[50] animate-in fade-in duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside 
        className={cn(
          "fixed md:relative inset-y-0 left-0 z-[55] md:z-20 transition-all duration-300 ease-in-out flex flex-col h-full shadow-2xl md:shadow-xl overflow-hidden",
          isCollapsed ? "md:w-20" : "md:w-64",
          isMobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        )}
        style={{ background: '#111827' }}
      >
        {/* ロゴ */}
        <div className={cn("py-5 border-b border-slate-800/50 flex items-center px-4 justify-between", isCollapsed && "md:px-0 md:justify-center")}>
          <Link href="/dashboard" className={cn("flex items-center gap-2.5 group", isCollapsed && "md:gap-0")}>
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shrink-0 shadow-lg shadow-white/10 group-hover:scale-110 transition-transform overflow-hidden">
              <img src="/logo.png" alt="Logo" className="h-6 w-6 object-contain" />
            </div>
            {!isCollapsed && (
              <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                <div className="text-white font-black text-sm tracking-tight">DLCare Portal</div>
                <div className="text-slate-500 text-[8px] uppercase tracking-[0.2em] font-bold">Maintenance Center</div>
              </div>
            )}
          </Link>
          {!isCollapsed && (
            <button onClick={toggleSidebar} className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          {isCollapsed && (
             <button onClick={toggleSidebar} className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white mt-1">
               <Menu className="h-4 w-4" />
             </button>
          )}
        </div>

        {/* スクロールエリア */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 py-4 space-y-6">
          
          {/* 基本メニュー */}
          <div className="space-y-1">
            <div className={cn("text-slate-600 text-[9px] uppercase tracking-widest px-2 mb-2 font-black", isCollapsed && "md:hidden")}>
              Portal Home
            </div>
            <NavItem 
              href="/dashboard" 
              iconName="LayoutDashboard" 
              label="TOP" 
              isCollapsed={isCollapsed} 
              forceInactive={!!currentServiceId}
            />
            <NavItem href="/dashboard/mypage" iconName="User" label="マイページ" isCollapsed={isCollapsed} />
            <NavItem href="/dashboard/announcements" iconName="Bell" label="お知らせ" isCollapsed={isCollapsed} />
          </div>

          {/* お気に入りサービス */}
          {favoriteServices.length > 0 && (
            <div className="space-y-1">
              <div className={cn("text-yellow-500/60 text-[9px] uppercase tracking-widest px-2 mb-2 font-black flex items-center gap-1.5", isCollapsed && "md:justify-center px-0")}>
                <Star className="h-3 w-3 fill-yellow-500/20" />
                {!isCollapsed && "Favorites"}
              </div>
              <div className="space-y-0.5">
                {favoriteServices.map(renderServiceItem)}
              </div>
            </div>
          )}

          {/* 全サービス (アコーディオン) */}
          <div className="space-y-1">
            <div className={cn("text-slate-600 text-[9px] uppercase tracking-widest px-2 mb-2 font-black flex items-center gap-1.5", isCollapsed && "md:justify-center px-0")}>
              <LayoutGrid className="h-3 w-3" />
              {!isCollapsed && "Services"}
            </div>
            
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-3 pt-2">
                {services.map(svc => {
                   const Icon = (Icons as any)[svc.iconName || 'HelpCircle'] || HelpCircle;
                   return (
                     <Link key={svc.id} href={`/dashboard?service=${svc.id}`} title={svc.name} className={cn("p-2 rounded-lg transition-colors", currentServiceId === svc.id ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-white hover:bg-slate-800")}>
                        <Icon className="h-5 w-5" />
                     </Link>
                   );
                })}
              </div>
            ) : (
              <Accordion 
                type="multiple" 
                className="w-full space-y-1"
                value={openGroups}
                onValueChange={setOpenGroups}
              >
                {groups.map(([label, svcs]) => (
                  <AccordionItem key={label} value={label} className="border-none">
                    <AccordionTrigger className="py-2 hover:bg-slate-800/50 rounded-lg px-2 no-underline">
                      <span className="text-[11px] font-black text-slate-400">{label}</span>
                    </AccordionTrigger>
                    <AccordionContent className="pt-1 px-1 pb-2 space-y-0.5">
                      {svcs.map(renderServiceItem)}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
          </div>

          {/* 管理メニュー */}
          {(isAdmin || isTenantAdmin) && (
            <div className="space-y-1 pt-4 border-t border-slate-800/50">
              <div className={cn("text-slate-600 text-[9px] uppercase tracking-widest px-2 mb-2 font-black", isCollapsed && "md:hidden")}>
                Administration
              </div>
              {isTenantAdmin && (
                <NavItem href="/dashboard/tenant-users" iconName="Users" label="ユーザー管理" isCollapsed={isCollapsed} />
              )}
              {isAdmin && (
                <>
                  <NavItem href="/dashboard/admin" iconName="Settings" label="マスター管理" isCollapsed={isCollapsed} />
                  <NavItem href="/dashboard/admin/services" iconName="LayoutGrid" label="サービス管理" isCollapsed={isCollapsed} />
                </>
              )}
            </div>
          )}
        </div>

        {/* ユーザーフッター */}
        <div className="p-4 border-t border-slate-800/50 bg-black/20">
          <div className={cn("flex items-center gap-3", isCollapsed && "md:justify-center md:gap-0")}>
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-black text-white">{user.contactName.charAt(0)}</span>
              )}
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <div className="text-[11px] font-black text-white truncate">{user.contactName}</div>
                <div className="text-[9px] font-bold text-slate-500 truncate uppercase tracking-tighter">{user.tenant.name}</div>
              </div>
            )}
            {!isCollapsed && (
              <form action={signOutAction}>
                <button type="submit" className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
