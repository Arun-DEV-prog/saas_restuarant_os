"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import MobileSidebar from "./Mobilesideber";
import Topbar from "./topber";

export default function DashboardShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col bg-[#eef2f3] dark:bg-[#0a1020] transition-colors">
      {/* Topbar */}
      <Topbar setOpen={setOpen} />

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar />
        <MobileSidebar open={open} setOpen={setOpen} />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
