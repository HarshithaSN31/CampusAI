import React from "react";
import { 
  Building2, 
  DoorOpen, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight, 
  Search, 
  Zap, 
  Wrench,
  Moon
} from "lucide-react";

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const busiestRooms = [
    { room: "A203", label: "Lecture Hall (Floor 2)", periods: 28, max: 35, util: "80%" },
    { room: "A222", label: "Machine Learning Lab (Floor 2)", periods: 26, max: 35, util: "74%" },
    { room: "A209", label: "Lecture Hall (Floor 2)", periods: 25, max: 35, util: "71%" },
    { room: "A301", label: "Lecture Hall (Floor 3)", periods: 24, max: 35, util: "68%" },
    { room: "A405", label: "Cloud Computing Lab (Floor 4)", periods: 22, max: 35, util: "63%" },
    { room: "A525", label: "Big Data Systems Lab (Floor 5)", periods: 20, max: 35, util: "57%" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="eyebrow mb-1">CSE · 2026–27 · 42 sections</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Campus at a glance
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm md:text-base mt-1.5">
          No class period running right now — all rooms can be powered down.
        </p>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {/* Card 1 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-[var(--primary)]/40 transition-colors">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Rooms in use now</span>
            <Building2 size={16} className="text-[var(--primary)]" />
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-black text-white">0</span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            of 47 rooms
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-[var(--primary)]/40 transition-colors">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Free rooms now</span>
            <DoorOpen size={16} className="text-[var(--success)]" />
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-black text-[var(--success)]">47</span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]"></span>
            <span>Ready to book</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-[var(--primary)]/40 transition-colors">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Avg. weekly utilisation</span>
            <TrendingUp size={16} className="text-[var(--primary)]" />
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-black text-white">59%</span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            Scheduled periods
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass p-5 flex flex-col justify-between hover:border-[var(--warning)]/40 transition-colors">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Room clashes</span>
            <AlertTriangle size={16} className="text-[var(--warning)]" />
          </div>
          <div className="my-3">
            <span className="text-3xl md:text-4xl font-black text-[var(--warning)]">23</span>
          </div>
          <div className="text-[11px] text-[var(--muted-foreground)]">
            Same room, same time
          </div>
        </div>
      </div>

      {/* Happening Now Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white tracking-tight">Happening now</h2>
          <button
            onClick={() => onNavigate("rooms")}
            className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>All rooms</span>
            <ArrowRight size={13} />
          </button>
        </div>

        <div className="glass p-5 border-l-4 border-l-[var(--primary)] flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[var(--accent)] text-[var(--accent-foreground)]">
            <Moon size={20} />
          </div>
          <div className="text-sm text-slate-200">
            No classes running. Lights & AC auto-off recommended.
          </div>
        </div>
      </div>

      {/* 3 Quick Link Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate("rooms")}
          className="glass p-5 text-left hover:border-[var(--primary)]/50 transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-[var(--primary)]">
            <Search size={22} />
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[var(--primary)] transition-colors">
              Find a free room
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Pick a day & period, see what's empty.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("energy")}
          className="glass p-5 text-left hover:border-[var(--primary)]/50 transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-[var(--warning)]">
            <Zap size={22} />
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-[var(--warning)] transition-colors">
              Energy savings
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Idle rooms that can be switched off.
            </p>
          </div>
        </button>

        <button
          onClick={() => onNavigate("maintenance")}
          className="glass p-5 text-left hover:border-[var(--primary)]/50 transition-all group flex flex-col justify-between h-36"
        >
          <div className="flex items-center justify-between text-rose-400">
            <Wrench size={22} />
            <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors">
              Report an issue
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Broken projector, AC, lights…
            </p>
          </div>
        </button>
      </div>

      {/* Busiest Rooms This Week */}
      <div className="glass p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Busiest rooms this week
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Based on 42 section timetables.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {busiestRooms.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-2 border-b border-[var(--border)] last:border-0">
              <div className="w-48">
                <span className="font-extrabold text-white text-sm font-mono mr-2">{r.room}</span>
                <span className="text-[var(--muted-foreground)] text-[11px] block sm:inline">{r.label}</span>
              </div>

              <div className="flex-1 mx-4 max-w-md hidden sm:block">
                <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-teal-400"
                    style={{ width: `${(r.periods / r.max) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="text-right">
                <span className="font-bold text-white">{r.periods} periods</span>
                <span className="text-[10px] text-[var(--muted-foreground)] ml-2">({r.util})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
