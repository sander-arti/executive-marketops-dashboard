
import React from 'react';
import { ViewState } from '../types';
import { cn } from './ui';
import { 
  LayoutDashboard, 
  Radar, 
  Globe, 
  Briefcase, 
  Settings,
  Sparkles,
  Bot
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activePage: ViewState;
  onNavigate: (page: ViewState) => void;
  newCounts?: Record<string, number>; // New prop for badges
}

export const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate, newCounts = {} }) => {
  
  // Grouped Navigation Structure
  const NAV_GROUPS = [
    {
      label: null, // Top section without header
      items: [
        { id: 'home', label: 'Oversikt', icon: LayoutDashboard },
      ]
    },
    {
      label: 'INTELLIGENS',
      items: [
          { id: 'oracle', label: 'Bedriftsorakel', icon: Bot, isPremium: true }
      ]
    },
    {
      label: 'SPOR',
      items: [
        { id: 'product', label: 'Våre produkter', icon: Radar },
        { id: 'landscape', label: 'Markedsrapport', icon: Globe },
        { id: 'portfolio', label: 'Produktradar', icon: Briefcase },
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-shrink-0 flex flex-col fixed h-full z-20 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
        
        {/* Logo & Context Area - Updated placement for "Pharma Nordic" */}
        <div className="h-24 flex items-center px-6 border-b border-slate-100"> 
          <div className="flex items-center gap-3.5">
             <div className="w-10 h-10 rounded-xl bg-[#535bf2] flex items-center justify-center shadow-lg shadow-indigo-500/20 flex-shrink-0">
                <span className="font-bold text-white text-xl">M</span>
             </div>
             <div className="flex flex-col justify-center">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight leading-none">MarketOps</span>
                <span className="text-[11px] font-medium text-slate-500 mt-1 uppercase tracking-wide">Pharma Nordic</span>
             </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-8 space-y-8 overflow-y-auto custom-scrollbar">
          {NAV_GROUPS.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.label && (
                <div className="px-3 mb-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  {group.label}
                  {group.label === 'INTELLIGENS' && <Sparkles size={10} className="text-indigo-400" />}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item: any) => {
                  const Icon = item.icon;
                  const isActive = activePage === item.id;
                  const count = newCounts[item.id] || 0;
                  const isOracle = item.id === 'oracle';

                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id as ViewState)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-200 group relative",
                        isActive 
                          ? "bg-indigo-50 text-indigo-700" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
                        isOracle && !isActive && "text-slate-700 bg-gradient-to-r from-slate-50 to-white border border-slate-100" 
                      )}
                    >
                      <Icon 
                        size={20} 
                        strokeWidth={isActive ? 2 : 1.5}
                        className={cn(
                          "flex-shrink-0 transition-colors", 
                          isActive ? "text-[#535bf2]" : isOracle ? "text-indigo-500" : "text-slate-400 group-hover:text-slate-600"
                        )} 
                      />
                      <span className="flex-1 text-left">{item.label}</span>
                      
                      {/* Notification Badge */}
                      {count > 0 && (
                        <span className={cn(
                          "flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold transition-transform",
                          isActive 
                            ? "bg-indigo-200 text-indigo-800" 
                            : "bg-blue-100 text-blue-700 group-hover:scale-110"
                        )}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Actions & User Profile */}
        <div className="p-4 mt-auto border-t border-slate-100 space-y-2 bg-slate-50/30">
          <button 
            onClick={() => onNavigate('settings')}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[14px] font-medium transition-colors group",
              activePage === 'settings' 
                ? "bg-slate-200 text-slate-900" 
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            )}
          >
            <Settings size={20} strokeWidth={1.5} className="text-slate-400 group-hover:text-slate-600" />
            Innstillinger
          </button>

          {/* User Profile - Moved from Top Header */}
          <div className="flex items-center gap-3 px-3 py-2 mt-2 rounded-lg hover:bg-white hover:shadow-sm hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer">
            <div className="h-8 w-8 rounded-full bg-indigo-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs shadow-sm">
                JD
            </div>
            <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-slate-700 truncate">Jonas Doe</span>
                <span className="text-[10px] text-slate-400 truncate">jonas@pharma.no</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area - Clean & Headerless */}
      <div className="flex-1 flex flex-col ml-64 min-w-0">
        <main className="flex-1 p-10 md:p-12 overflow-y-auto">
          <div className="w-full max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
