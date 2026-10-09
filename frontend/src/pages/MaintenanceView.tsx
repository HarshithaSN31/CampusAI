import React, { useState } from "react";
import { CheckCircle2, ChevronDown, Check } from "lucide-react";

interface Ticket {
  id: string;
  room: string;
  category: string;
  details: string;
  status: "Open" | "In progress" | "Fixed";
}

export const MaintenanceView: React.FC = () => {
  const [room, setRoom] = useState("A202");
  const [selectedCategory, setSelectedCategory] = useState("AC / Fan");
  const [details, setDetails] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const rooms = [
    "A202", "A203", "A209", "A210", "A212", "A219", "A222", "A225",
    "A301", "A303", "A304", "A308", "A310", "A312", "A319", "A321", "A322", "A325",
    "A401", "A403", "A404", "A405", "A407", "A408", "A409", "A410", "A411", "A413",
    "A420", "A422", "A423", "A426", "A501", "A503", "A504", "A505", "A507", "A508",
    "A509", "A510", "A511", "A513", "A520", "A522", "A525", "A526", "A622"
  ];

  const problemOptions = [
    "Projector",
    "AC / Fan",
    "Lights",
    "Wi-Fi",
    "Furniture",
    "Other"
  ];

  // Initial tickets matching user's exact screenshot
  const [tickets, setTickets] = useState<Ticket[]>([
    {
      id: "t-1",
      room: "A202",
      category: "AC / Fan",
      details: "—",
      status: "Open"
    },
    {
      id: "t-2",
      room: "A203",
      category: "Projector",
      details: "No HDMI signal",
      status: "Fixed"
    },
    {
      id: "t-3",
      room: "A405",
      category: "AC / Fan",
      details: "Fan making noise",
      status: "Fixed"
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket: Ticket = {
      id: `t-${Date.now()}`,
      room,
      category: selectedCategory,
      details: details.trim() || "—",
      status: "Open"
    };

    setTickets([newTicket, ...tickets]);
    setDetails("");
    setToastMessage(`Issue reported for ${room}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Progression handler: Open -> In progress -> Fixed
  const handleNextStatus = (ticketId: string) => {
    setTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          if (t.status === "Open") return { ...t, status: "In progress" };
          if (t.status === "In progress") return { ...t, status: "Fixed" };
          return t;
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Top Header Row with Time pill */}
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-bold tracking-wider text-cyan-400 uppercase">
            MAINTENANCE
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight mt-1">
            Report an issue
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Takes 10 seconds. The facilities team is notified instantly.
          </p>
        </div>

        <div className="px-3 py-1 rounded-full bg-[#121c29] border border-[#1d2d42] text-[11px] font-medium text-slate-300">
          Fri, 01:25 pm
        </div>
      </div>

      {/* Main Grid: Form on Left, Open Tickets on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Takes 5 columns */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#0c1420] border border-[#182638] space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Room Selector */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">
                Room
              </label>
              <div className="relative">
                <select
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  className="w-full appearance-none bg-[#09101a] border border-[#1e2f46] text-white text-xs font-semibold px-3 py-2.5 rounded-xl cursor-pointer focus:outline-none focus:border-cyan-500"
                >
                  {rooms.map((r) => (
                    <option key={r} value={r} className="bg-slate-900 text-white">
                      {r}
                    </option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Problem Category Chips */}
            <div>
              <label className="text-slate-400 font-semibold block mb-2">
                Problem
              </label>
              <div className="flex flex-wrap gap-2">
                {problemOptions.map((opt) => (
                  <button
                    type="button"
                    key={opt}
                    onClick={() => setSelectedCategory(opt)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      selectedCategory === opt
                        ? "bg-[#18535f] text-cyan-200 border border-[#2b7e90] shadow-sm"
                        : "bg-[#09101a] text-slate-400 border border-[#1b2b3f] hover:text-white hover:bg-slate-800"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Details (Optional) */}
            <div>
              <label className="text-slate-400 font-semibold block mb-1.5">
                Details (optional)
              </label>
              <textarea
                rows={3}
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder=""
                className="w-full bg-[#09101a] border border-[#1e2f46] text-white text-xs p-3 rounded-xl focus:outline-none focus:border-cyan-500 resize-none"
              ></textarea>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-xs bg-[#1db5a4] hover:bg-[#189e8f] text-slate-950 shadow-md transition-all cursor-pointer"
            >
              Submit report
            </button>
          </form>
        </div>

        {/* Right List: Takes 7 columns */}
        <div className="lg:col-span-7 p-6 rounded-2xl bg-[#0c1420] border border-[#182638] space-y-4">
          <h2 className="text-base font-bold text-white tracking-tight">
            Open tickets
          </h2>

          <div className="space-y-3">
            {tickets.map((t) => {
              const isOpen = t.status === "Open";
              const isInProgress = t.status === "In progress";
              const isFixed = t.status === "Fixed";

              return (
                <div
                  key={t.id}
                  className="p-3.5 rounded-xl border border-[#182638] bg-[#09101a] flex items-center justify-between gap-4"
                >
                  {/* Left: Room Badge + Title & details */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="px-3 py-1.5 rounded-xl bg-[#0e1d2c] border border-[#1c3650] text-cyan-300 font-mono font-bold text-xs">
                      {t.room}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-white truncate">
                        {t.category}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {t.details}
                      </div>
                    </div>
                  </div>

                  {/* Right Status & Next Action Button */}
                  <div className="flex items-center gap-2.5 flex-shrink-0">
                    {/* Status Text Badge */}
                    <span
                      className={`text-xs font-semibold ${
                        isOpen
                          ? "text-rose-400"
                          : isInProgress
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}
                    >
                      {t.status}
                    </span>

                    {/* Next Progression Button */}
                    {!isFixed && (
                      <button
                        onClick={() => handleNextStatus(t.id)}
                        className="px-2.5 py-1 rounded-lg bg-[#142232] hover:bg-[#1c3046] border border-[#223952] text-[11px] font-semibold text-slate-200 transition-all cursor-pointer"
                      >
                        {isOpen ? "Next" : "Mark Fixed"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Bottom Toast Alert matching user screenshot */}
      {toastMessage && (
        <div className="fixed bottom-6 right-8 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-black/90 border border-slate-700 text-white text-xs font-medium shadow-2xl animate-in slide-in-from-bottom-3 duration-200">
          <div className="w-4 h-4 rounded-full bg-white text-black flex items-center justify-center">
            <Check size={11} strokeWidth={3} />
          </div>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
