import React, { useState, useEffect } from "react";
import { AppSidebar } from "./components/AppSidebar";
import { DashboardView } from "./pages/DashboardView";
import { TimetableView } from "./pages/TimetableView";
import { RoomFinderView } from "./pages/RoomFinderView";
import { EnergyView } from "./pages/EnergyView";
import { MaintenanceView } from "./pages/MaintenanceView";
import { fetchSections } from "./services/api";

export function App() {
  const [currentTab, setCurrentTab] = useState<string>("rooms"); // Default to Room finder as shown in screenshot
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
        return <RoomFinderView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070c14] text-slate-100 flex font-sans antialiased">
      {/* Left Sidebar */}
      <AppSidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8">
          {renderView()}
        </main>

        <footer className="border-t border-[#141e2e] py-4 px-8 text-xs text-slate-500 flex items-center justify-between">
          <span>CampusAI — Smart Campus Intelligence Platform</span>
          <span className="font-mono text-[11px]">Academic Year 2026–2027 · Semester V</span>
        </footer>
      </div>
    </div>
  );
}

export default App;
