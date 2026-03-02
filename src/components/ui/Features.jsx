"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  LayoutDashboard,
  UtensilsCrossed,
  QrCode,
  Users,
  CreditCard,
  BarChart3,
} from "lucide-react";

const features = [
  {
    icon: LayoutDashboard,
    title: "Live Mall Dashboard",
    desc: "Monitor tables, revenue, and footfall in real time from one centralized dashboard.",
  },
  {
    icon: UtensilsCrossed,
    title: "Digital Menus & Ordering",
    desc: "Guests scan, browse menus, and order instantly — no queues, no confusion.",
  },
  {
    icon: CreditCard,
    title: "Fast & Secure Payments",
    desc: "Supports card, QR, and wallet payments with instant confirmation.",
  },
  {
    icon: Users,
    title: "Smart Table Allocation",
    desc: "Automatically assigns tables based on group size and availability.",
  },
  {
    icon: QrCode,
    title: "QR Table Sessions",
    desc: "Each table has a QR code to continue ordering and request services.",
  },
  {
    icon: BarChart3,
    title: "Revenue & Analytics",
    desc: "Understand peak hours, top vendors, and average order value with insights.",
  },
];

export default function Features() {
  return (
    <section id="features" className="relative bg-white py-24 overflow-hidden">
      {/* Soft background glow */}
      <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl" />

      <div className="relative container mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block bg-indigo-100 text-indigo-700 text-xs px-4 py-1.5 rounded-full font-medium mb-4">
            Platform Features
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
            Everything You Need to Run a Modern Food Court
          </h2>
          <p className="mt-4 text-slate-600 text-lg">
            One system to manage guests, vendors, seating, orders, and revenue —
            in real time.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <Card
              key={i}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group border border-slate-200/60 hover:border-indigo-300/60 hover:shadow-xl transition-all duration-300 rounded-2xl"
            >
              <CardContent className="p-6 space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center text-white shadow-md group-hover:scale-110 transition">
                  <f.icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  {f.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {f.desc}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
