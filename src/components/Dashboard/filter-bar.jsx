"use client";

import { useState } from "react";

export default function FilterBar() {
  const [active, setActive] = useState("today");

  const btn = (key, label) => (
    <button
      onClick={() => setActive(key)}
      className={`px-5 py-2 dark:bg-[#0a1020]  rounded-lg border transition ${
        active === key ? "bg-emerald-500 text-white border-emerald-500" : ""
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex dark:bg-[#0a1020]  flex-wrap gap-3 items-center">
      {btn("today", "Today")}
      {btn("week", "Week")}
      {btn("month", "Month")}

      <input
        type="date"
        className="px-4 py-2 rounded-lg border dark:bg-[#0a1020]  bg-white"
      />

      <select className="px-4 py-2 dark:bg-[#0a1020]  rounded-lg border bg-white ml-auto">
        <option>All Stores</option>
        <option>Store 1</option>
        <option>Store 2</option>
      </select>
    </div>
  );
}
