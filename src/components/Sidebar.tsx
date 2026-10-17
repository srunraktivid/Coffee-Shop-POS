import React from 'react';
import { NavigationPage } from '../types';
import { 
  Coffee, 
  LayoutDashboard, 
  UtensilsCrossed, 
  ReceiptText, 
  Sparkles,
  Clock,
  Store
} from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  cartItemCount: number;
  todayRevenue: number;
  todayOrderCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  cartItemCount,
  todayRevenue,
  todayOrderCount,
}) => {
  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'pos',
      label: 'POS Register',
      icon: <Coffee className="w-5 h-5" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'menu',
      label: 'Menu Management',
      icon: <UtensilsCrossed className="w-5 h-5" />,
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: <ReceiptText className="w-5 h-5" />,
    },
  ];

  return (
    <aside className="w-64 bg-stone-900 text-stone-200 flex flex-col shrink-0 border-r border-stone-800 select-none">
      {/* Brand Header */}
      <div className="p-5 border-b border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight flex items-center gap-1.5">
              BaristaPro
              <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded">
                POS
              </span>
            </h1>
            <p className="text-xs text-stone-400">The Coffee Atelier</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-3 space-y-1 flex-1">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
          Workstation
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-white text-amber-700' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Register Quick Stats */}
      <div className="p-4 mx-3 mb-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-2.5">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Station 01 Active
          </span>
          <span className="text-emerald-400 font-medium">Online</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-700/60">
          <div>
            <div className="text-[11px] text-stone-400">Today Sales</div>
            <div className="text-sm font-bold text-white font-mono tabular-nums">
              ${todayRevenue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[11px] text-stone-400">Orders</div>
            <div className="text-sm font-bold text-white font-mono tabular-nums">
              {todayOrderCount}
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Footer */}
      <div className="p-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-stone-200 font-bold text-xs">
            AC
          </div>
          <div className="leading-tight">
            <div className="text-stone-200 font-medium">Alex Carter</div>
            <div className="text-[11px] text-stone-500">Lead Barista</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
