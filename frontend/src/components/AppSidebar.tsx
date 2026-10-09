import React from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  DoorOpen, 
  Zap, 
  Wrench,
  Sparkles
} from "lucide-react";

interface AppSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "rooms", label: "Room finder", icon: DoorOpen },
    { id: "energy", label: "Energy", icon: Zap },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
  ];

  return (
    <aside className="w-56 bg-[#0a1017] border-r border-[#1a2332] flex flex-col justify-between p-4 flex-shrink-0 min-h-screen">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
            <Sparkles size={18} />
          </div>
          <div>
            <div className="font-extrabold text-white text-base tracking-tight leading-none">
              CampusAI
            </div>
            <div className="text-[9px] font-bold tracking-widest text-slate-400 uppercase mt-1">
              SMART CAMPUS
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5 pt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[#133038] text-cyan-300 border border-[#1d4d5a]"
                    : "text-slate-400 hover:text-slate-200 hover:bg-[#121c29]"
                }`}
              >
                <Icon size={16} className={isActive ? "text-cyan-300" : "text-slate-400"} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Sync Badge */}
      <div className="p-3 rounded-2xl bg-[#0f1724] border border-[#1a2638] text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-bold text-slate-200 text-[11px]">Timetable synced</span>
        </div>
        <div className="text-[10px] text-slate-500">
          CSE · 2026–27 · 42 sections
        </div>
      </div>
    </aside>
  );
};
