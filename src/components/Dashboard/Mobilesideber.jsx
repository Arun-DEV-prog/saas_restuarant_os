"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";

export default function MobileSidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  // ✅ Always available from session — no URL parsing needed
  const restaurantId = session?.user?.restaurantId;
  const userRole = session?.user?.role || "user";

  const menus = [
    // Admin links
    ...(userRole === "owner" || userRole === "admin"
      ? [
          { name: "👑 Admin Dashboard", href: "/dashboard/admin" },
          { name: "👥 Users", href: "/dashboard/admin/users" },
          { name: "🏢 Restaurants", href: "/dashboard/admin/restaurants" },
          { name: "📊 Analytics", href: "/dashboard/admin/analytics" },
          { name: "📋 Activity Log", href: "/dashboard/admin/activity" },
          ...(userRole === "owner"
            ? [{ name: "⚙️ Settings", href: "/dashboard/admin/settings" }]
            : []),
          { name: "---", href: "#" }, // Divider
        ]
      : []),
    // Regular menu items
    { name: "📊 Dashboard", href: "/dashboard" },
    { name: "📋 Menus", href: "/dashboard/menu" },
    { name: "🛒 Orders", href: `/dashboard/${restaurantId}/orders` },
    { name: "🪑 Tables", href: `/dashboard/${restaurantId}/tables` },
    { name: "🔥 Hot Actions", href: `/dashboard/${restaurantId}/hotactions` },
    { name: "📣 Marketing", href: "/marketing" },
    { name: "📈 Reports", href: "/reports" },
    { name: "💰 Accounting", href: "/accounting" },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60">
      <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg">
        <div className="h-16 flex items-center justify-between px-6 font-bold border-b border-gray-200 dark:border-slate-700">
          <span className="text-gray-900 dark:text-stone-100">
            🐯 MallInsight
          </span>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menus.map((item) =>
            item.name === "---" ? (
              <div
                key={item.href}
                className="my-3 border-t border-gray-200 dark:border-slate-700"
              />
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-lg transition ${
                  pathname === item.href
                    ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                    : "text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {item.name}
              </Link>
            ),
          )}
        </nav>
      </aside>
    </div>
  );
}
