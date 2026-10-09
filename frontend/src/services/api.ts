import { 
  TimetableSectionGrid, 
  RoomStat, 
  ConflictItem, 
  MaintenanceTicket, 
  EnergyInsights 
} from "../types/campus";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchSections(): Promise<string[]> {
  const res = await fetch(`${API_BASE}/timetable/sections`);
  const data = await res.json();
  return data.sections || [];
}

export async function fetchTimetableGrid(section: string, version: string = "VERSION_17_SEPT_2026_PUBLISHED"): Promise<TimetableSectionGrid> {
  const res = await fetch(`${API_BASE}/timetable?section=${encodeURIComponent(section)}&version=${encodeURIComponent(version)}`);
  if (!res.ok) throw new Error("Failed to load timetable");
  return res.json();
}

export async function fetchRooms(): Promise<RoomStat[]> {
  const res = await fetch(`${API_BASE}/rooms`);
  return res.json();
}

export async function fetchUtilizationAnalytics() {
  const res = await fetch(`${API_BASE}/analytics/utilization`);
  return res.json();
}

export async function fetchConflicts(): Promise<{ summary: any; conflicts: ConflictItem[] }> {
  const res = await fetch(`${API_BASE}/conflicts`);
  return res.json();
}

export async function resolveConflict(conflictId: string, reviewer: string, note: string, action: string) {
  const res = await fetch(`${API_BASE}/conflicts/${conflictId}/resolve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reviewer, resolution_note: note, action })
  });
  return res.json();
}

export async function askCampusAI(message: string, role: string, section: string) {
  const res = await fetch(`${API_BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, role, section })
  });
  return res.json();
}

export async function fetchMaintenanceTickets(): Promise<MaintenanceTicket[]> {
  const res = await fetch(`${API_BASE}/maintenance`);
  return res.json();
}

export async function submitMaintenanceTicket(data: Partial<MaintenanceTicket>) {
  const res = await fetch(`${API_BASE}/maintenance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateMaintenanceTicket(ticketId: string, data: Partial<MaintenanceTicket>) {
  const res = await fetch(`${API_BASE}/maintenance/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchVersions() {
  const res = await fetch(`${API_BASE}/admin/timetable/versions`);
  return res.json();
}
