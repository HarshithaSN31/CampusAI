import React, { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { DashboardView } from "./pages/DashboardView";
import { TimetableView } from "./pages/TimetableView";
import { RoomFinderView } from "./pages/RoomFinderView";
import { EnergyView } from "./pages/EnergyView";
import { MaintenanceView } from "./pages/MaintenanceView";
import { fetchSections } from "./services/api";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [selectedSection, setSelectedSection] = useState<string>("5CSE01");
  const [sections, setSections] = useState<string[]>([
    "5CSE01", "5CSE02", "5CSE03", "5CSE04", "5CSE05", "5CSE06", "5CSE07", "5CSE08",
    "5CSE09", "5CSE10", "5CSE11", "5CSE12", "5CSE13", "5CSE14", "5CSE15", "5CSE16",
    "5CSE17", "5CSE18", "5CSE19", "5CSE20", "5CSE21", "5CSE22", "5CSE23", "5CSE24",
    "5CSE25", "5CSE26", "5CSE27", "5CSE28", "5CSE29", "5CSE30", "5CSE31", "5CSE32",
    "5CSE33", "5CSE34", "5CSE35", "5CSE36", "5CSE37", "5CSE38", "5CSE39", "5CSE40",
    "5CSE41", "5CSE42"
  ]);

  useEffect(() => {
    async function load() {
      try {
        const list = await fetchSections();
        if (list && list.length > 0) setSections(list);
      } catch (e) {
        console.warn("Using default section list");
      }
    }
    load();
  }, []);

  const renderView = () => {
    switch (currentTab) {
      case "dashboard":
        return <DashboardView onNavigate={setCurrentTab} />;
      case "timetable":
        return (
          <TimetableView
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
            sections={sections}
          />
        );
      case "rooms":
        return <RoomFinderView />;
      case "energy":
        return <EnergyView />;
      case "maintenance":
        return <MaintenanceView />;
      default:
        return <DashboardView onNavigate={setCurrentTab} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col antialiased selection:bg-[var(--primary)] selection:text-[var(--primary-foreground)]">
      {/* Top Navbar */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Area (Max width 6xl matching Lovable) */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {renderView()}
      </main>

      {/* Subtle Footer */}
      <footer className="border-t border-[var(--border)] py-6 text-center text-xs text-[var(--muted-foreground)]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CampusAI — Smart Campus Intelligence Platform</span>
          <span className="font-mono text-[11px]">Department of Computer Science & Engineering · 2026–27</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
