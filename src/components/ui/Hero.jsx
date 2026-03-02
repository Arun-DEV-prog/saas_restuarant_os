"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const phrases = [
  "Smarter Dining Experiences",
  "Real-Time Table Insights",
  "Faster Orders. Happier Guests.",
  "More Revenue Per Seat",
];

export default function Hero() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % phrases.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-zinc-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 transition-colors">
      {/* Soft blurred background blobs */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-indigo-300/30 dark:bg-indigo-600/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-violet-300/30 dark:bg-violet-600/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 py-28 grid md:grid-cols-2 gap-16 items-center">
        {/* LEFT SIDE */}
        <div className="space-y-8">
          <span className="inline-flex items-center gap-2 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium px-4 py-1.5 rounded-full">
            Smart Food Court Platform
          </span>

          <h1 className="text-4xl md:text-5xl xl:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 leading-tight">
            Powering the Future of
            <span className="block mt-3 text-indigo-600 dark:text-indigo-400 transition-opacity duration-500">
              {phrases[index]}
            </span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 max-w-lg text-lg leading-relaxed">
            Manage seating, orders, and revenue in real time. Reduce wait times.
            Increase guest satisfaction. Make every seat more profitable.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <Button
              size="lg"
              className="rounded-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Get Started
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="rounded-full text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-slate-800"
            >
              View Demo
            </Button>
          </div>

          <div className="flex flex-wrap gap-6 pt-6 text-sm text-zinc-500">
            <span>⚡ Real-time seating</span>
            <span>💳 Seamless checkout</span>
            <span>📊 Smart analytics</span>
          </div>
        </div>

        {/* RIGHT SIDE IMAGE */}
        {/* RIGHT SIDE VIDEO */}
        <div className="relative w-full h-[380px] md:h-[460px] rounded-3xl overflow-hidden shadow-xl ring-1 ring-black/5 group">
          <video
            src="/QR-table-1.mp4" // put your video inside /public folder
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out"
          />

          {/* Optional dark overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/10" />

          {/* Floating Glass Card */}
          <div className="absolute bottom-6 left-6 bg-white/80 backdrop-blur-md rounded-2xl px-5 py-3 shadow-lg">
            <p className="text-sm font-medium text-zinc-800">
              Avg Wait Time: <span className="text-indigo-600">3 min</span> ·
              Revenue <span className="text-green-600">+28%</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
