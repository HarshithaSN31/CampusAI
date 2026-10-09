import React from "react";
import { Zap, Clock, IndianRupee, Leaf, ArrowRight, ShieldCheck } from "lucide-react";

export const EnergyView: React.FC = () => {
  const leastUsedRooms = [
    { room: "A520", type: "Lecture Hall", idleHours: 27, wasteMonth: "₹2,160", action: "Schedule auto-off" },
    { room: "A508", type: "Seminar Room", idleHours: 25, wasteMonth: "₹2,000", action: "Schedule auto-off" },
    { room: "A526", type: "Lecture Hall", idleHours: 24, wasteMonth: "₹1,920", action: "Schedule auto-off" },
    { room: "A505", type: "Computer Lab", idleHours: 22, wasteMonth: "₹1,760", action: "Schedule auto-off" },
    { room: "A321", type: "Computer Lab", idleHours: 21, wasteMonth: "₹1,680", action: "Schedule auto-off" },
    { room: "A225", type: "Lecture Hall", idleHours: 19, wasteMonth: "₹1,520", action: "Schedule auto-off" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="eyebrow mb-1">Energy insights</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Save power in empty rooms
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm md:text-base mt-1.5 max-w-2xl">
          If rooms are left on during free periods, this is the estimated waste. Smart switches can turn them off automatically.
        </p>
      </div>

      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="glass p-6 flex flex-col justify-between">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Idle room-hours / week</span>
            <Clock size={18} className="text-[var(--primary)]" />
          </div>
          <div className="my-4">
            <span className="text-4xl font-black text-white">667</span>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            Across 47 campus rooms
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass p-6 flex flex-col justify-between">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>Possible saving / week</span>
            <Zap size={18} className="text-[var(--warning)]" />
          </div>
          <div className="my-4">
            <span className="text-4xl font-black text-[var(--warning)]">1668 kWh</span>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            at 2.5 kW per room
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass p-6 flex flex-col justify-between">
          <div className="text-xs font-semibold text-[var(--muted-foreground)] flex items-center justify-between">
            <span>≈ Cost saved / month</span>
            <IndianRupee size={18} className="text-[var(--success)]" />
          </div>
          <div className="my-4">
            <span className="text-4xl font-black text-[var(--success)]">₹53,376</span>
          </div>
          <div className="text-xs text-[var(--muted-foreground)]">
            at ₹8 per kWh
          </div>
        </div>
      </div>

      {/* Least-used rooms Section */}
      <div className="glass p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Least-used rooms</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Best candidates for auto-off, merging classes or other use.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          {leastUsedRooms.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0 text-xs">
              <div className="w-48">
                <span className="font-extrabold text-white text-sm font-mono mr-2">{r.room}</span>
                <span className="text-[var(--muted-foreground)]">{r.type}</span>
              </div>

              <div className="text-center">
                <span className="font-bold text-white">{r.idleHours} hrs idle</span>
                <span className="text-[10px] text-[var(--muted-foreground)] block">/ week</span>
              </div>

              <div className="text-center font-mono font-bold text-[var(--warning)]">
                {r.wasteMonth}
                <span className="text-[10px] text-[var(--muted-foreground)] block font-sans">wasted / mo</span>
              </div>

              <div>
                <button
                  onClick={() => alert(`Eco-switch policy scheduled for Room ${r.room}`)}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[var(--accent)] text-[var(--accent-foreground)] hover:bg-[var(--primary)] hover:text-[var(--primary-foreground)] transition-all flex items-center gap-1"
                >
                  <span>{r.action}</span>
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
