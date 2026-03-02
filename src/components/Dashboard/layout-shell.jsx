"use client";

import { useState } from "react";
import Sidebar from "./sidebar";
import MobileSidebar from "./Mobilesideber";
import Topbar from "./topber";

export default function DashboardShell({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#eef2f3] dark:bg-[#0a1020] transition-colors">
      <Sidebar />
      <MobileSidebar open={open} setOpen={setOpen} />

      <div className="flex flex-col flex-1">
        <Topbar setOpen={setOpen} />
        <main className="flex-1 p-4 md:p-6 space-y-6">{children}</main>
      </div>
    </div>
  );
}
