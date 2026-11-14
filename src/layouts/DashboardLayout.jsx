
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#080d18] text-slate-200">

      {/* Desktop and mobile dashboard grid */}
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)]">

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main area */}
        <div className="flex min-w-0 flex-col">

          <Header
            onMenuClick={() => setSidebarOpen(true)}
          />

          <main className="min-w-0 flex-1 overflow-x-hidden p-5 md:p-8">
            <Outlet />
          </main>

        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
