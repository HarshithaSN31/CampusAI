import React from "react";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Building2, 
  Zap, 
  Wrench,
  GraduationCap
} from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "timetable", label: "Timetable", icon: CalendarDays },
    { id: "rooms", label: "Room finder", icon: Building2 },
    { id: "energy", label: "Energy", icon: Zap },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setCurrentTab("dashboard")}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-lg brand-mark flex items-center justify-center font-bold text-sm shadow-md">
              <GraduationCap size={18} />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-white text-base tracking-tight leading-none group-hover:text-[var(--primary)] transition-colors">
                CampusAI
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[var(--muted-foreground)] uppercase mt-0.5">
                SMART CAMPUS
              </span>
            </div>
          </button>
        </div>

        {/* Navigation Tabs (Lovable Style) */}
        <nav className="hidden md:flex items-center gap-1 bg-[var(--card)] p-1 rounded-full border border-[var(--border)] shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm"
                    : "text-[var(--muted-foreground)] hover:text-white hover:bg-[var(--glass)]"
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Pill */}
        <div className="flex items-center gap-2">
          <div className="hidden lg:flex items-center chip">
            <span className="text-[var(--muted-foreground)]">CSE · 2026–27 · 42 sections</span>
          </div>
          <div className="flex items-center chip gap-2">
            <span className="pulse-dot"></span>
            <span className="text-white text-xs font-semibold">Good to see you</span>
          </div>
        </div>
      </div>

      {/* Mobile nav row */}
      <div className="md:hidden flex items-center justify-around border-t border-[var(--border)] py-2 px-2 bg-[var(--card)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                isActive
                  ? "text-[var(--primary)]"
                  : "text-[var(--muted-foreground)] hover:text-white"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
