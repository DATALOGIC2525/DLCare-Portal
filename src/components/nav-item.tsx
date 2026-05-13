'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Users, Settings, LayoutGrid, Megaphone, HelpCircle } from 'lucide-react';

const IconMap: Record<string, any> = {
  LayoutDashboard,
  User,
  Users,
  Settings,
  LayoutGrid,
  Megaphone,
};

export function NavItem({ 
  href, 
  iconName, 
  label, 
  isCollapsed,
  forceInactive = false
}: { 
  href: string; 
  iconName: string; 
  label: string;
  isCollapsed?: boolean;
  forceInactive?: boolean;
}) {
  const pathname = usePathname();
  const isActive = forceInactive ? false : (pathname === href);
  
  const Icon = IconMap[iconName] || HelpCircle;

  return (
    <Link href={href}
      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-xs font-semibold transition-all active:scale-[0.98] group relative ${
        isActive 
          ? 'bg-cyan-600/20 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
          : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
      }`}
      title={isCollapsed ? label : undefined}
    >
      <Icon className={`h-4 w-4 shrink-0 transition-colors ${
        isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
      }`} />
      
      {!isCollapsed && (
        <span className="truncate animate-in fade-in duration-300">{label}</span>
      )}
      
      {isActive && !isCollapsed && (
        <div className="ml-auto w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
      )}
    </Link>
  );
}
