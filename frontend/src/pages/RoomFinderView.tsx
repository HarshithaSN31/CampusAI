import React, { useState, useEffect } from "react";
import { Search, ChevronDown } from "lucide-react";
import roomScheduleData from "../data/room_schedule.json";

export const RoomFinderView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>("THUR");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6); // Period 5 (2:15 - 3:10 is period index 6 in data)
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'short', 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: true 
      };
      setCurrentTimeStr(now.toLocaleDateString('en-US', options));
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  const days = [
    { id: "MON", label: "Mon" },
    { id: "TUE", label: "Tue" },
    { id: "WED", label: "Wed" },
    { id: "THUR", label: "Thu" },
    { id: "FRI", label: "Fri" }
  ];

  const periods = [
    { num: 1, label: "P1 · 9:00 – 10:00" },
    { num: 2, label: "P2 · 10:00 – 11:00" },
    { num: 3, label: "P3 · 11:15 – 12:15" },
    { num: 4, label: "P4 · 12:15 – 1:15" },
    { num: 6, label: "P5 · 2:15 – 3:10" },
    { num: 7, label: "P6 · 3:10 – 4:05" },
    { num: 8, label: "P7 · 4:05 – 5:00" },
  ];

  // Exactly 47 primary classrooms as verified in university timetable
  const roomList = [
    "A202", "A203", "A209", "A210", "A212", 
    "A219", "A222", "A225", "A301", "A303", 
    "A304", "A308", "A310", "A312", "A319", 
    "A321", "A322", "A325", "A401", "A403", 
    "A404", "A405", "A407", "A408", "A409",
    "A410", "A411", "A413", "A420", "A422",
    "A423", "A426", "A501", "A503", "A504",
    "A505", "A507", "A508", "A509", "A510",
    "A511", "A513", "A520", "A522", "A525",
    "A526", "A622"
  ];

  const getOccupancy = (room: string) => {
    const key = `${selectedDay}_${selectedPeriod}_${room}`;
    return (roomScheduleData as any)[key] || null;
  };

  const freeCount = roomList.filter(r => !getOccupancy(r)).length;

  const filteredRooms = roomList.filter(r => {
    const occ = getOccupancy(r);
    const matchesSearch = r.toLowerCase().includes(search.toLowerCase());
    const matchesFree = freeOnly ? !occ : true;
    return matchesSearch && matchesFree;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row with Time pill on Right */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
            CLASSROOM UTILISATION
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Room finder
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            {freeCount} of 47 rooms free for this slot.
          </p>
        </div>

        {/* Live time indicator */}
        <div className="px-3 py-1 rounded-full bg-[#121c29] border border-[#1d2d42] text-[11px] font-medium text-slate-300">
          {currentTimeStr || "Fri, 01:22 pm"}
        </div>
      </div>

      {/* Filter & Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-2xl bg-[#0a111a] border border-[#162335]">
        <div className="flex flex-wrap items-center gap-3">
          {/* Day Pills */}
          <div className="flex items-center gap-1 bg-[#060b12] p-1 rounded-xl border border-[#162335]">
            {days.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  selectedDay === d.id
                    ? "bg-[#184e5b] text-cyan-200 border border-[#256c7d] shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          {/* Period Dropdown */}
          <div className="relative">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(Number(e.target.value))}
              className="appearance-none bg-[#0a1522] border border-[#1c2e44] text-slate-200 text-xs font-semibold pl-3 pr-8 py-1.5 rounded-xl cursor-pointer focus:outline-none focus:border-cyan-500"
            >
              {periods.map((p) => (
                <option key={p.num} value={p.num} className="bg-slate-900 text-white">
                  {p.label}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Free only Checkbox */}
          <label className="flex items-center gap-2 text-xs text-slate-300 font-medium cursor-pointer ml-1 select-none">
            <input
              type="checkbox"
              checked={freeOnly}
              onChange={(e) => setFreeOnly(e.target.checked)}
              className="rounded bg-[#0a1522] border-[#22354e] text-cyan-500 focus:ring-0 cursor-pointer w-3.5 h-3.5"
            />
            <span>Free only</span>
          </label>
        </div>

        {/* Search Room */}
        <div className="relative min-w-[200px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room"
            className="w-full bg-[#0a1522] border border-[#1c2e44] rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Room Grid (5 Columns matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredRooms.map((room) => {
          const occ = getOccupancy(room);
          const isFree = !occ;

          return (
            <div
              key={room}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[92px] ${
                isFree
                  ? "bg-[#09141c] border-[#163a3e] hover:border-emerald-500/50"
                  : "bg-[#0c131f] border-[#182638] hover:border-slate-700"
              }`}
            >
              {/* Header: Room Name + Status Dot */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-white font-mono tracking-tight">
                  {room}
                </span>
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isFree
                      ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                      : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                  }`}
                ></span>
              </div>

              {/* Status Content */}
              <div className="mt-2 text-xs">
                {isFree ? (
                  <span className="font-semibold text-emerald-400 text-xs">
                    Available
                  </span>
                ) : (
                  <div className="text-slate-400 text-[11px] font-medium leading-tight truncate">
                    <span>{occ.subject}</span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="text-slate-300 font-mono">{occ.section}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
