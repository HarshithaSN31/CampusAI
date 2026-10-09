import React, { useState, useEffect } from "react";
import { Wrench, Plus, CheckCircle2, AlertCircle, Clock, Send } from "lucide-react";
import { fetchMaintenanceTickets, submitMaintenanceTicket } from "../services/api";
import { MaintenanceTicket } from "../types/campus";

export const MaintenanceView: React.FC = () => {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [room, setRoom] = useState("A203");
  const [category, setCategory] = useState("Projector & Display");
  const [priority, setPriority] = useState<any>("HIGH");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const rooms = [
    "A202", "A203", "A209", "A210", "A212", "A222", "A225", "A301", "A303", 
    "A304", "A308", "A310", "A312", "A319", "A321", "A322", "A325", "A401", 
    "A405", "A408", "A422", "A501", "A522", "A525", "A625"
  ];

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchMaintenanceTickets();
        setTickets(data);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);
    try {
      const newT = await submitMaintenanceTicket({
        building: "Academic Block A",
        room,
        category,
        priority,
        description,
        reported_by: "Campus Faculty"
      });
      setTickets(prev => [newT, ...prev]);
      setDescription("");
      setSuccessMsg("Issue ticket created and dispatched to campus facilities!");
      setTimeout(() => setSuccessMsg(""), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="eyebrow mb-1">Facility operations</div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Report an issue
        </h1>
        <p className="text-[var(--muted-foreground)] text-sm md:text-base mt-1.5">
          Broken projector, AC, lights…
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Form */}
        <div className="glass p-6 lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wrench size={18} className="text-[var(--primary)]" />
            <span>Submit new ticket</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div>
              <label className="text-[var(--muted-foreground)] font-semibold block mb-1">
                Room Number
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full glass p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                {rooms.map(r => (
                  <option key={r} value={r} className="bg-slate-900 text-white">{r}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[var(--muted-foreground)] font-semibold block mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full glass p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="Projector & Display">Projector & Display</option>
                <option value="HVAC / Air Conditioning">HVAC / Air Conditioning</option>
                <option value="Electrical & Lighting">Electrical & Lighting</option>
                <option value="Furniture & Seating">Furniture & Seating</option>
                <option value="Network / Wi-Fi">Network / Wi-Fi</option>
              </select>
            </div>

            <div>
              <label className="text-[var(--muted-foreground)] font-semibold block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full glass p-2.5 text-xs text-white focus:outline-none focus:border-[var(--primary)] cursor-pointer"
              >
                <option value="CRITICAL">Critical (Blocks Class)</option>
                <option value="HIGH">High (Urgent)</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="text-[var(--muted-foreground)] font-semibold block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is broken? e.g. Projector turns off after 5 mins, lamp warning light..."
                className="w-full glass p-2.5 text-xs text-white placeholder-[var(--muted-foreground)] focus:outline-none focus:border-[var(--primary)]"
                required
              ></textarea>
            </div>

            {successMsg && (
              <div className="p-2.5 rounded-lg bg-[var(--success)]/20 border border-[var(--success)]/40 text-[var(--success)] text-xs font-semibold flex items-center gap-1.5">
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-full font-bold text-xs brand-mark shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
            >
              <Send size={13} />
              <span>{submitting ? "Submitting..." : "Submit Report"}</span>
            </button>
          </form>
        </div>

        {/* Existing Tickets List */}
        <div className="glass p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white">Active maintenance requests</h2>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                {tickets.length} reported issues across campus
              </p>
            </div>
            <span className="chip text-[11px]">Facility Ops</span>
          </div>

          <div className="space-y-3 pt-2">
            {tickets.map((t) => (
              <div
                key={t.id}
                className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]/40 space-y-2 hover:border-[var(--primary)]/40 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-extrabold text-sm text-white font-mono mr-2">{t.room}</span>
                    <span className="text-xs font-semibold text-[var(--primary)]">{t.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                    t.status === "RESOLVED"
                      ? "bg-[var(--success)]/20 text-[var(--success)] border border-[var(--success)]/40"
                      : t.status === "IN_PROGRESS"
                        ? "bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/40"
                        : "bg-[var(--warning)]/20 text-[var(--warning)] border border-[var(--warning)]/40"
                  }`}>
                    {t.status.replace(/_/g, " ")}
                  </span>
                </div>

                <p className="text-xs text-slate-300">{t.description}</p>

                <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)]">
                  <span>Priority: <strong className={t.priority === "HIGH" ? "text-rose-400" : "text-amber-400"}>{t.priority}</strong></span>
                  <span>Assigned: <strong className="text-slate-200">{t.assigned_to || "Unassigned"}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
