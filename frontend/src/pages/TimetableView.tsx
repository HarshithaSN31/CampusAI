import React, { useState, useEffect } from "react";
import { fetchTimetableGrid } from "../services/api";
import { TimetableSectionGrid } from "../types/campus";
import { ChevronDown, MapPin, Users, BookOpen } from "lucide-react";

interface TimetableViewProps {
  selectedSection: string;
  setSelectedSection: (sec: string) => void;
  sections: string[];
}

export const TimetableView: React.FC<TimetableViewProps> = ({
  selectedSection,
  setSelectedSection,
  sections
}) => {
  const [gridData, setGridData] = useState<TimetableSectionGrid | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  const days: ("MON" | "TUE" | "WED" | "THUR" | "FRI")[] = ["MON", "TUE", "WED", "THUR", "FRI"];
  const periods = [
    { num: 1, label: "Period 1", time: "9:00 - 10:00" },
    { num: 2, label: "Period 2", time: "10:00 - 11:00" },
    { num: 3, label: "Period 3", time: "11:15 - 12:15" },
    { num: 4, label: "Period 4", time: "12:15 - 1:15" },
    { num: 6, label: "Period 5", time: "2:15 - 3:10" },
    { num: 7, label: "Period 6", time: "3:10 - 4:05" },
    { num: 8, label: "Period 7", time: "4:05 - 5:00" }
  ];

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchTimetableGrid(selectedSection);
        setGridData(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [selectedSection]);

  const getSlotEntries = (d: string, pNum: number) => {
    if (!gridData) return [];
    return gridData.entries.filter(e => e.weekday === d && e.period_number === pNum);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="eyebrow mb-1">Weekly schedule</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Timetable
          </h1>
          <p className="text-[var(--muted-foreground)] text-sm mt-1">
            Semester V · Class advisor <span className="text-white font-medium">{gridData?.metadata?.class_advisor || "Kavya M"}</span>
          </p>
        </div>

        {/* Section & Day Selectors */}
        <div className="flex items-center gap-2">
          <div className="glass px-3 py-1.5 flex items-center gap-2">
            <span className="text-xs text-[var(--muted-foreground)] font-semibold">Section:</span>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
            >
              {sections.map(s => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>

          <div className="glass px-2 py-1 flex items-center gap-1">
            <button
              onClick={() => setSelectedDay("ALL")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedDay === "ALL"
                  ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-white"
              }`}
            >
              All
            </button>
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
        </div>
      </div>

      {/* Timetable Table Grid */}
      <div className="glass overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs min-w-[900px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--card)]/60 text-[var(--muted-foreground)] font-semibold">
                <th className="p-3 w-20 text-center uppercase tracking-wider text-[11px] border-r border-[var(--border)]">
                  Day
                </th>
                {periods.map((p, idx) => (
                  <React.Fragment key={p.num}>
                    {idx === 2 && (
                      <th className="p-2 w-12 text-center text-[10px] text-amber-400/80 bg-slate-950/40 border-r border-[var(--border)]">
                        Tea
                      </th>
                    )}
                    {idx === 4 && (
                      <th className="p-2 w-14 text-center text-[10px] text-amber-400/80 bg-slate-950/40 border-r border-[var(--border)]">
                        Lunch
                      </th>
                    )}
                    <th className="p-3 border-r border-[var(--border)]">
                      <div className="font-bold text-white">{p.label}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)] font-mono">{p.time}</div>
                    </th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {(selectedDay === "ALL" ? days : [selectedDay as any]).map((day) => (
                <tr key={day} className="border-b border-[var(--border)] hover:bg-[var(--glass)] transition-colors">
                  <td className="p-3 font-extrabold text-[var(--primary)] text-center border-r border-[var(--border)] bg-[var(--card)]/30">
                    {day}
                  </td>
                  {periods.map((p, idx) => {
                    const entries = getSlotEntries(day, p.num);
                    return (
                      <React.Fragment key={p.num}>
                        {idx === 2 && (
                          <td className="p-1 border-r border-[var(--border)] text-center text-[10px] text-[var(--muted-foreground)] bg-slate-950/30">
                            11:00
                          </td>
                        )}
                        {idx === 4 && (
                          <td className="p-1 border-r border-[var(--border)] text-center text-[10px] text-[var(--muted-foreground)] bg-slate-950/30">
                            1:15
                          </td>
                        )}
                        <td className="p-2 border-r border-[var(--border)] align-top min-w-[130px]">
                          {entries.length > 0 ? (
                            <div className="space-y-1.5">
                              {entries.map((entry, eIdx) => {
                                const isLab = entry.session_type === "LAB" || entry.subject.includes("Lab") || entry.subject.startsWith("CC") || entry.subject.startsWith("BD") || entry.subject.startsWith("ML");
                                const isElective = entry.session_type === "ELECTIVE" || entry.subject.startsWith("PE");

                                return (
                                  <div
                                    key={eIdx}
                                    className={`p-2.5 rounded-xl border transition-all ${
                                      isLab
                                        ? "bg-teal-950/50 border-teal-800/60 text-teal-200"
                                        : isElective
                                          ? "bg-purple-950/50 border-purple-800/60 text-purple-200"
                                          : "bg-slate-900/60 border-[var(--border)] text-white"
                                    }`}
                                  >
                                    <div className="font-bold text-xs tracking-tight flex items-center justify-between">
                                      <span>{entry.subject}</span>
                                      {entry.lab_group && entry.lab_group !== "ALL" && (
                                        <span className="text-[9px] px-1 py-0.2 rounded bg-black/40 font-mono">
                                          {entry.lab_group}
                                        </span>
                                      )}
                                    </div>
                                    {entry.room && (
                                      <div className="flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] mt-1">
                                        <MapPin size={10} className="text-[var(--primary)] flex-shrink-0" />
                                        <span className="font-mono text-cyan-300 font-semibold">{entry.room}</span>
                                      </div>
                                    )}
                                    {entry.faculty && (
                                      <div className="text-[9px] text-[var(--muted-foreground)] truncate mt-0.5">
                                        {entry.faculty}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="h-12 flex items-center justify-center text-[var(--muted-foreground)]/40 text-[10px] italic">
                              Free
                            </div>
                          )}
                        </td>
                      </React.Fragment>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Courses & Faculty Section */}
      <div className="glass p-6 space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Courses & faculty</h2>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Allocated instructors and course catalog for section {selectedSection}.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
          <table className="w-full text-xs text-left">
            <thead className="bg-[var(--card)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
              <tr>
                <th className="p-3 w-16">Sl. No.</th>
                <th className="p-3">Course Code</th>
                <th className="p-3">Course Name</th>
                <th className="p-3">Short Code</th>
                <th className="p-3">Allocated Faculty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)] text-slate-200">
              {gridData?.courses && Object.values(gridData.courses).map((c, i) => (
                <tr key={i} className="hover:bg-[var(--glass)]">
                  <td className="p-3 font-mono text-[var(--muted-foreground)]">{c.sl_no || i + 1}</td>
                  <td className="p-3 font-mono font-bold text-[var(--primary)]">{c.course_code || "—"}</td>
                  <td className="p-3 font-medium text-white">{c.course_name}</td>
                  <td className="p-3 font-mono font-semibold">{c.short_code}</td>
                  <td className="p-3 text-[var(--muted-foreground)] font-medium">{c.faculty || "Faculty Department"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
