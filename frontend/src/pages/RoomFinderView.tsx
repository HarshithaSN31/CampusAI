import React, { useState, useEffect } from "react";
import { Building2, CheckCircle2, DoorOpen, Search } from "lucide-react";

export const RoomFinderView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>("MON");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(1);
  const [search, setSearch] = useState("");

  const days = ["MON", "TUE", "WED", "THUR", "FRI"];
  const periods = [
    { num: 1, label: "Period 1", time: "9:00 - 10:00" },
    { num: 2, label: "Period 2", time: "10:00 - 11:00" },
    { num: 3, label: "Period 3", time: "11:15 - 12:15" },
    { num: 4, label: "Period 4", time: "12:15 - 1:15" },
    { num: 6, label: "Period 5", time: "2:15 - 3:10" },
    { num: 7, label: "Period 6", time: "3:10 - 4:05" },
    { num: 8, label: "Period 7", time: "4:05 - 5:00" },
  ];

  // List of primary 47 classrooms from workbook
  const roomList = [
    "A202", "A203", "A209", "A210", "A212", "A219", "A222", "A225", 
    "A301", "A303", "A304", "A308", "A310", "A312", "A319", "A321", "A322", "A325",
    "A401", "A403", "A404", "A405", "A407", "A408", "A409", "A410", "A411", "A413", "A420", "A422", "A423", "A426",
    "A501", "A503", "A504", "A505", "A507", "A508", "A509", "A510", "A511", "A513", "A520", "A522", "A525", "A526",
    "A622"
  ];

  // Realistic occupancy map keyed by (day, period, room)
  // Matching schedulezen-campus.lovable.app where 5 to 15 rooms are free per slot
  const sampleSchedule: Record<string, { subject: string; section: string }> = {
    "MON-1-A202": { subject: "PEHV 2", section: "5CSE04" },
    "MON-1-A203": { subject: "DM", section: "5CSE02" },
    "MON-1-A209": { subject: "PEHV 1", section: "5CSE03" },
    "MON-1-A210": { subject: "CCT", section: "5CSE05" },
    "MON-1-A212": { subject: "BDT", section: "5CSE06" },
    "MON-1-A219": { subject: "CCT", section: "5CSE07" },
    "MON-1-A222": { subject: "MLL B1/B2 (A222)", section: "5CSE10" },
    "MON-1-A225": { subject: "PEHV 2", section: "5CSE08" },
    "MON-1-A301": { subject: "FLAT", section: "5CSE09" },
    "MON-1-A303": { subject: "PE-2", section: "5CSE11" },
    "MON-1-A304": { subject: "PE-2", section: "5CSE12" },
    "MON-1-A308": { subject: "DM(308)", section: "5CSE14" },
    "MON-1-A310": { subject: "PEHV 1", section: "5CSE15" },
    "MON-1-A312": { subject: "BDT", section: "5CSE19" },
    "MON-1-A319": { subject: "PE-2", section: "5CSE17" },
    "MON-1-A322": { subject: "ML B1/B2 (A322)", section: "5CSE25" },
    "MON-1-A325": { subject: "PE-2", section: "5CSE18" },
    "MON-1-A401": { subject: "DM", section: "5CSE20" },
    "MON-1-A403": { subject: "FLAT", section: "5CSE21" },
    "MON-1-A404": { subject: "CCT", section: "5CSE22" },
    "MON-1-A405": { subject: "CCTL(B1)A405 / BDTL(B2)A625", section: "5CSE01" },
    "MON-1-A407": { subject: "FLAT", section: "5CSE23" },
    "MON-1-A408": { subject: "CCTL(B2)A408 / BDTL(B1)A410", section: "5CSE28" },
    "MON-1-A409": { subject: "DM", section: "5CSE24" },
    "MON-1-A410": { subject: "DM", section: "5CSE26" },
    "MON-1-A411": { subject: "BDT", section: "5CSE27" },
    "MON-1-A413": { subject: "DM(A420)", section: "5CSE29" },
    "MON-1-A420": { subject: "CCTL(B1)321 / BDTL(B2)A422", section: "5CSE16" },
    "MON-1-A422": { subject: "PE-2", section: "5CSE42" },
    "MON-1-A423": { subject: "FLAT", section: "5CSE30" },
    "MON-1-A426": { subject: "CCT", section: "5CSE34" },
    "MON-1-A501": { subject: "FLAT", section: "5CSE32" },
    "MON-1-A503": { subject: "PEHV 1", section: "5CSE33" },
    "MON-1-A504": { subject: "ML", section: "5CSE35" },
    "MON-1-A507": { subject: "DM", section: "5CSE36" },
    "MON-1-A509": { subject: "BDT", section: "5CSE37" },
    "MON-1-A510": { subject: "DM", section: "5CSE38" },
    "MON-1-A511": { subject: "CCT", section: "5CSE39" },
    "MON-1-A513": { subject: "CCTL(B1)A522 / BDTL (B2)A622", section: "5CSE31" },
    "MON-1-A522": { subject: "CCTL(B2)A525/BDTL(B1)A505", section: "5CSE13" },
    "MON-1-A525": { subject: "PE-2", section: "5CSE41" },
    "MON-1-A622": { subject: "MLL A822 B1/B2 A808", section: "5CSE40" },
    // Rooms A321, A505, A508, A520, A526 are intentionally unassigned = FREE (5 free rooms)
  };

  const getOccupancy = (room: string) => {
    const key = `${selectedDay}-${selectedPeriod}-${room}`;
    return sampleSchedule[key] || null;
  };

  const freeCount = roomList.filter(r => !getOccupancy(r)).length;

  const filteredRooms = roomList.filter(r => r.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Classroom utilisation</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Room finder
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            <span className="text-[var(--success)] font-bold">{freeCount}</span> of 47 rooms free for this slot.
          </p>
        </div>

        {/* Day & Period Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Day chips */}
          <div className="glass px-2 py-1 flex items-center gap-1">
            {days.map(d => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedDay === d
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Period chips */}
          <div className="glass px-2 py-1 flex items-center gap-1">
            {periods.map(p => (
              <button
                key={p.num}
                onClick={() => setSelectedPeriod(p.num)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                  selectedPeriod === p.num
                    ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                    : "text-[var(--muted-foreground)] hover:text-white"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-md">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter room (e.g. A203, A222)..."
          className="glass px-4 py-2 text-xs w-full text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
        />
      </div>

      {/* Room Grid (Lovable card layout) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filteredRooms.map((room) => {
          const occ = getOccupancy(room);
          const isFree = !occ;

          return (
            <div
              key={room}
              className={`glass p-4 flex flex-col justify-between transition-all min-h-[110px] ${
                isFree
                  ? "border-[var(--success)]/50 bg-[var(--success)]/5 hover:border-[var(--success)]"
                  : "hover:border-[var(--primary)]/40"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-base text-white font-mono">{room}</span>
                  {isFree && (
                    <span className="w-2 h-2 rounded-full bg-[var(--success)] shadow-sm shadow-[var(--success)]"></span>
                  )}
                </div>

                <div className="mt-2">
                  {isFree ? (
                    <span className="text-xs font-bold text-[var(--success)]">
                      Available
                    </span>
                  ) : (
                    <div className="text-[11px] font-medium text-slate-200 line-clamp-2 leading-tight">
                      {occ.subject}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-2 text-[10px] text-[var(--muted-foreground)] flex items-center justify-between">
                {isFree ? (
                  <span className="text-[var(--success)]/80 font-semibold">Ready to book</span>
                ) : (
                  <span className="font-mono text-cyan-300 font-semibold">{occ.section}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
