import React from 'react';
import { NavigationPage } from '../types';
import { 
  Coffee, 
  LayoutDashboard, 
  UtensilsCrossed, 
  ReceiptText, 
  Clock,
  Store,
  X,
  User
} from 'lucide-react';

interface SidebarProps {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  cartItemCount: number;
  todayRevenue: number;
  todayOrderCount: number;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  cartItemCount,
  todayRevenue,
  todayOrderCount,
  isMobileOpen,
  onCloseMobile,
}) => {
  const navItems: { id: NavigationPage; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'pos',
      label: 'POS Register',
      icon: <Coffee className="w-5 h-5 shrink-0" />,
      badge: cartItemCount > 0 ? cartItemCount : undefined,
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'menu',
      label: 'Menu Items',
      icon: <UtensilsCrossed className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'orders',
      label: 'Order History',
      icon: <ReceiptText className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleNavClick = (page: NavigationPage) => {
    onNavigate(page);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-stone-900 text-stone-200 select-none">
      {/* Brand Header */}
      <div className="p-4 md:p-5 border-b border-stone-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
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

        {/* Close button for mobile drawer */}
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          aria-label="Close navigation"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="p-3 space-y-1 flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-semibold tracking-wider text-stone-500 uppercase">
          Workstation
        </div>
        {navItems.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-stone-300 hover:bg-stone-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold shrink-0 ${
                  isActive ? 'bg-white text-amber-700' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Register Stats Card (collapsed neatly on tablets) */}
      <div className="p-3.5 mx-3 mb-3 rounded-xl bg-stone-800/80 border border-stone-700/60 space-y-2">
        <div className="flex items-center justify-between text-xs text-stone-400">
          <span className="flex items-center gap-1.5 truncate">
            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Station 01
          </span>
          <span className="text-emerald-400 font-medium text-[11px]">Online</span>
        </div>
        <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-700/60">
          <div>
            <div className="text-[10px] text-stone-400">Sales Today</div>
            <div className="text-xs lg:text-sm font-bold text-white font-mono tabular-nums">
              ${todayRevenue.toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-[10px] text-stone-400">Orders</div>
            <div className="text-xs lg:text-sm font-bold text-white font-mono tabular-nums">
              {todayOrderCount}
            </div>
          </div>
        </div>
      </div>

      {/* Cashier Footer */}
      <div className="p-3 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-stone-700 flex items-center justify-center text-stone-200 font-bold text-xs shrink-0">
            AC
          </div>
          <div className="leading-tight truncate">
            <div className="text-stone-200 font-medium truncate">Alex Carter</div>
            <div className="text-[10px] text-stone-500">Lead Barista</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside className="hidden md:flex flex-col w-56 lg:w-64 shrink-0 border-r border-stone-800 z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[80vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
