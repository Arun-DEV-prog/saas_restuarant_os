"use client";

import { useState } from "react";
import MobileSidebar from "./Mobilesideber";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
          >
            ☰
          </button>
          <span className="font-bold text-lg">Dashboard</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Arun Roy</span>
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full"
            alt="user"
          />
        </div>
      </header>

      <MobileSidebar open={open} setOpen={setOpen} />
    </>
  );
}
