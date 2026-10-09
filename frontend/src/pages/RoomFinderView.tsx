import React, { useState, useEffect } from "react";
import { Search, ChevronDown, AlertTriangle, Check, ArrowRight, X, Sparkles } from "lucide-react";
import roomScheduleData from "../data/room_schedule.json";
import clashesData from "../data/schedule_clashes.json";

interface ManualOccupancy {
  room: string;
  section: string;
  subject: string;
  note?: string;
}

export const RoomFinderView: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<string>("THUR");
  const [selectedPeriod, setSelectedPeriod] = useState<number>(6); // Period 5 (2:15 - 3:10)
  const [freeOnly, setFreeOnly] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [currentTimeStr, setCurrentTimeStr] = useState<string>("");

  // User-ticked occupancies: keyed by `${day}_${period}_${room}`
  const [manualOccupancies, setManualOccupancies] = useState<Record<string, ManualOccupancy>>(() => {
    try {
      const saved = localStorage.getItem("campusai_manual_occupancies");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Modal / drawer state for occupying a room
  const [occupyingRoom, setOccupyingRoom] = useState<string | null>(null);
  const [occupySection, setOccupySection] = useState<string>("5CSE01");
  const [occupySubject, setOccupySubject] = useState<string>("Reallocated Session");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("campusai_manual_occupancies", JSON.stringify(manualOccupancies));
    } catch (e) {
      console.error(e);
    }
  }, [manualOccupancies]);

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

  // Check clashes for current day and period (excluding PE-2)
  const currentClashes = (clashesData as any[]).filter(
    (c) => c.day === selectedDay && c.period === selectedPeriod
  );

  // Get occupancy status for a room
  const getOccupancy = (room: string) => {
    const key = `${selectedDay}_${selectedPeriod}_${room}`;
    // Check manual user tick first
    if (manualOccupancies[key]) {
      return {
        ...manualOccupancies[key],
        isManual: true
      };
    }
    // Fallback to timetable schedule
    return (roomScheduleData as any)[key] || null;
  };

  const freeRooms = roomList.filter((r) => !getOccupancy(r));
  const freeCount = freeRooms.length;

  const filteredRooms = roomList.filter((r) => {
    const occ = getOccupancy(r);
    const matchesSearch = r.toLowerCase().includes(search.toLowerCase());
    const matchesFree = freeOnly ? !occ : true;
    return matchesSearch && matchesFree;
  });

  // Handle clicking tick / occupy on an empty room
  const handleOpenOccupyModal = (room: string) => {
    setOccupyingRoom(room);
    // If there's an active clash, prefill with one of the clashed sections
    if (currentClashes.length > 0) {
      const clashedSecs = currentClashes[0].sections.split(",");
      if (clashedSecs.length > 1) {
        setOccupySection(clashedSecs[1].trim());
        setOccupySubject(currentClashes[0].v2 || "Reallocated Class");
      }
    } else {
      setOccupySection("5CSE01");
      setOccupySubject("Relocated Lecture");
    }
  };

  const handleConfirmOccupy = () => {
    if (!occupyingRoom) return;
    const key = `${selectedDay}_${selectedPeriod}_${occupyingRoom}`;
    setManualOccupancies((prev) => ({
      ...prev,
      [key]: {
        room: occupyingRoom,
        section: occupySection,
        subject: occupySubject,
        note: "Manually Occupied (Clash Relocated)"
      }
    }));
    setToastMessage(`✓ Room ${occupyingRoom} ticked as occupied by ${occupySection}!`);
    setTimeout(() => setToastMessage(null), 4000);
    setOccupyingRoom(null);
  };

  const handleReleaseRoom = (room: string) => {
    const key = `${selectedDay}_${selectedPeriod}_${room}`;
    setManualOccupancies((prev) => {
      const updated = { ...prev };
      delete updated[key];
      return updated;
    });
    setToastMessage(`Room ${room} released back to Available.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row with Time pill */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
            CLASSROOM UTILISATION
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Room finder
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            <span className="text-emerald-400 font-bold">{freeCount}</span> of 47 rooms free for this slot.
          </p>
        </div>

        {/* Live time indicator */}
        <div className="px-3 py-1 rounded-full bg-[#121c29] border border-[#1d2d42] text-[11px] font-medium text-slate-300">
          {currentTimeStr || "Fri, 01:25 pm"}
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
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
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

      {/* CLASH ALERT & REALLOCATION BANNER (Excluding PE-2 Elective) */}
      {currentClashes.length > 0 && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 to-slate-900/60 border border-amber-700/60 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 flex-shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Room Clash Detected in this Period (PE-2 Electives Excluded)</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-700 font-mono">
                    {currentClashes.length} Clash{currentClashes.length > 1 ? "es" : ""}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {currentClashes[0].description}
                </p>
              </div>
            </div>

            {freeCount > 0 && (
              <span className="text-xs font-semibold text-emerald-400 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/60 flex items-center gap-1.5 self-start sm:self-auto">
                <Sparkles size={13} />
                <span>{freeCount} Empty Room{freeCount > 1 ? "s" : ""} Available to Relocate</span>
              </span>
            )}
          </div>

          {/* Quick Relocation Options */}
          {freeCount > 0 && (
            <div className="pt-2 border-t border-amber-800/30 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Click to Occupy Free Room:</span>
              {freeRooms.slice(0, 6).map((freeRoom) => (
                <button
                  key={freeRoom}
                  onClick={() => handleOpenOccupyModal(freeRoom)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Occupy {freeRoom}</span>
                  <ArrowRight size={12} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Room Grid (5 Columns matching screenshot) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
        {filteredRooms.map((room) => {
          const occ = getOccupancy(room);
          const isFree = !occ;
          const isManualOcc = occ && occ.isManual;

          return (
            <div
              key={room}
              className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[96px] ${
                isFree
                  ? "bg-[#09141c] border-[#163a3e] hover:border-emerald-500/50"
                  : isManualOcc
                    ? "bg-[#0c1926] border-cyan-700/60 shadow-sm shadow-cyan-500/10"
                    : "bg-[#0c131f] border-[#182638] hover:border-slate-700"
              }`}
            >
              {/* Header: Room Name + Status Dot / Action */}
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-base text-white font-mono tracking-tight">
                  {room}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Status dot */}
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isFree
                        ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"
                        : isManualOcc
                          ? "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.6)]"
                          : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"
                    }`}
                  ></span>
                </div>
              </div>

              {/* Status Content */}
              <div className="mt-2 text-xs">
                {isFree ? (
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-emerald-400 text-xs">
                      Available
                    </span>
                    {/* Tick box to occupy */}
                    <button
                      onClick={() => handleOpenOccupyModal(room)}
                      className="px-2 py-0.5 rounded-md bg-[#132d2b] hover:bg-[#1a403d] border border-emerald-600/50 text-[10px] font-bold text-emerald-300 transition-all flex items-center gap-1 cursor-pointer"
                      title="Tick to occupy this empty classroom"
                    >
                      <span>Tick Occupied</span>
                    </button>
                  </div>
                ) : isManualOcc ? (
                  <div className="flex items-center justify-between gap-1">
                    <div className="text-[11px] font-medium leading-tight truncate text-cyan-300">
                      <span>{occ.subject}</span>
                      <span className="mx-1 text-slate-500">·</span>
                      <span className="font-mono text-white font-bold">{occ.section}</span>
                    </div>
                    {/* Release button */}
                    <button
                      onClick={() => handleReleaseRoom(room)}
                      className="text-[10px] text-slate-400 hover:text-rose-400 px-1 py-0.5 rounded hover:bg-slate-800"
                      title="Release room back to Available"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="text-slate-400 text-[11px] font-medium leading-tight truncate">
                    <span>{occ.subject}</span>
                    <span className="mx-1 text-slate-600">·</span>
                    <span className="text-slate-300 font-mono">{occ.section}</span>
                  </div>
                )}
              </div>

              {/* Bottom footer tag */}
              <div className="pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                {isFree ? (
                  <span className="text-emerald-500/80 font-semibold">Ready to book</span>
                ) : isManualOcc ? (
                  <span className="text-cyan-400 font-semibold flex items-center gap-1">
                    <Check size={11} strokeWidth={3} /> Reallocated
                  </span>
                ) : (
                  <span className="font-mono text-slate-500">{selectedDay} · P{selectedPeriod}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL: Tick to Occupy Empty Room */}
      {occupyingRoom && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0c1420] border border-[#1c2e44] shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#1c2e44] pb-3">
              <div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono font-bold">
                  EMPTY CLASSROOM
                </span>
                <h3 className="text-xl font-bold text-white mt-1">
                  Occupy Room {occupyingRoom}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedDay} • Period {selectedPeriod}
                </p>
              </div>
              <button
                onClick={() => setOccupyingRoom(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Section / Class to Occupy:
                </label>
                <input
                  type="text"
                  value={occupySection}
                  onChange={(e) => setOccupySection(e.target.value)}
                  placeholder="e.g. 5CSE01"
                  className="w-full bg-[#09101a] border border-[#1e2f46] text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-slate-400 font-semibold block mb-1">
                  Subject / Session:
                </label>
                <input
                  type="text"
                  value={occupySubject}
                  onChange={(e) => setOccupySubject(e.target.value)}
                  placeholder="e.g. Machine Learning Lab / Relocated Lecture"
                  className="w-full bg-[#09101a] border border-[#1e2f46] text-white text-xs px-3 py-2 rounded-xl focus:outline-none focus:border-cyan-500"
                />
              </div>

              {currentClashes.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-800/40 text-[11px] text-amber-300">
                  ⚡ <strong>Clash Relocation Note:</strong> Room {currentClashes[0].room} is clashed in this period. Occupying {occupyingRoom} resolves the collision for {occupySection}.
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#1c2e44]">
              <button
                type="button"
                onClick={() => setOccupyingRoom(null)}
                className="px-4 py-2 rounded-xl bg-[#142232] text-slate-300 font-semibold text-xs hover:bg-[#1a2c40]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmOccupy}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Check size={14} strokeWidth={3} />
                <span>Confirm & Tick Occupied</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/90 border border-slate-700 text-white text-xs font-medium shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-4 h-4 rounded-full bg-emerald-400 text-black flex items-center justify-center font-bold">
            <Check size={11} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
