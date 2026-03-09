"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { X } from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import { useState } from "react";

export default function MobileSidebar({ open, setOpen }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { settings } = usePlatformSettings();
  const [expandedItems, setExpandedItems] = useState({});

  // ✅ Always available from session — no URL parsing needed
  const restaurantId = session?.user?.restaurantId;
  const userRole = session?.user?.role || "user";
  const restaurantName = session?.user?.restaurantName || "Restaurant";
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";

  const toggleSubmenu = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  const menus = [
    // Owner-only section
    ...(isOwner
      ? [
          {
            section: "👑 OWNER PANEL",
            items: [
              {
                name: "Admin Dashboard",
                href: `/dashboard/admin`,
                icon: "📊",
                badge: "Admin",
              },
              { name: "Users", href: `/dashboard/admin/users`, icon: "👥" },
              {
                name: "Restaurants",
                href: `/dashboard/admin/restaurants`,
                icon: "🏢",
              },
              {
                name: "Restaurant Plans",
                href: `/dashboard/admin/restaurants-plans`,
                icon: "💳",
              },
              {
                name: "Platform Analytics",
                href: `/dashboard/admin/analytics`,
                icon: "📈",
              },
              {
                name: "Activity Logs",
                href: `/dashboard/admin/activity`,
                icon: "📋",
              },
              {
                name: "System Settings",
                href: `/dashboard/admin/settings`,
                icon: "⚙️",
              },
            ],
          },
        ]
      : []),
    // Admin section - for admin role
    ...(isAdmin && !isOwner
      ? [
          {
            section: "Admin",
            items: [
              { name: "Admin Dashboard", href: `/dashboard/admin`, icon: "👑" },
              { name: "Users", href: `/dashboard/admin/users`, icon: "👥" },
              {
                name: "Restaurants",
                href: `/dashboard/admin/restaurants`,
                icon: "🏢",
              },
              {
                name: "Restaurant Plans",
                href: `/dashboard/admin/restaurants-plans`,
                icon: "💳",
              },
              {
                name: "Analytics",
                href: `/dashboard/admin/analytics`,
                icon: "📊",
              },
              {
                name: "Activity Log",
                href: `/dashboard/admin/activity`,
                icon: "📋",
              },
            ],
          },
        ]
      : []),
    // Restaurant management section - only show if user has restaurantId
    ...(restaurantId && !isOwner
      ? [
          {
            section: "Main",
            items: [
              { name: "Dashboard", href: `/dashboard`, icon: "📊" },
              {
                name: "Orders",
                href: `/dashboard/${restaurantId}/orders`,
                icon: "🛒",
              },
            ],
          },
          {
            section: "Management",
            items: [
              { name: "Menus", href: `/dashboard/menu`, icon: "📋" },
              {
                name: "Table Management",
                href: `/dashboard/${restaurantId}/tables`,
                icon: "🪑",
              },
              {
                name: "Kitchen Display",
                href: `/dashboard/${restaurantId}/kitchen`,
                icon: "🍳",
                badge: "Beta",
              },
            ],
          },
          {
            section: "Business",
            items: [
              {
                name: "Stores",
                icon: "🏪",
                children: [
                  {
                    name: "All Stores",
                    href: `/dashboard/${restaurantId}/stores`,
                  },
                  {
                    name: "Add Store",
                    href: `/dashboard/${restaurantId}/stores/new`,
                  },
                ],
              },
              {
                name: "Marketing",
                icon: "📣",
                children: [
                  {
                    name: "Campaigns",
                    href: `/dashboard/${restaurantId}/marketing/campaigns`,
                  },
                  {
                    name: "Coupons",
                    href: `/dashboard/${restaurantId}/marketing/coupons`,
                  },
                ],
              },
              {
                name: "Reports",
                href: `/dashboard/${restaurantId}/reports`,
                icon: "📈",
              },
            ],
          },
          {
            section: "Integrations",
            items: [
              {
                name: "Integrations",
                href: `/dashboard/${restaurantId}/integrations`,
                icon: "🔌",
              },
            ],
          },
          {
            section: "Billing",
            items: [
              {
                name: "Pricing Plans",
                href: `/dashboard/${restaurantId}/pricing`,
                icon: "💳",
              },
            ],
          },
          {
            section: "Other",
            items: [
              {
                name: "Hot Actions",
                href: `/dashboard/${restaurantId}/hotactions`,
                icon: "🔥",
              },
              {
                name: "Settings",
                href: `/dashboard/${restaurantId}/setting`,
                icon: "⚙️",
                badge: "New",
              },
            ],
          },
        ]
      : []),
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 dark:bg-black/60">
      <aside className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-slate-800 shadow-lg overflow-y-auto">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-6 font-bold border-b border-gray-200 dark:border-slate-700 sticky top-0 bg-white dark:bg-slate-800">
          <div className="flex items-center gap-2 flex-1">
            {settings?.platformLogo ? (
              <img
                src={settings.platformLogo}
                alt="Platform Logo"
                className="w-5 h-5 rounded"
              />
            ) : (
              <span className="text-lg">🐯</span>
            )}
            <span className="text-gray-900 dark:text-stone-100 truncate text-sm">
              {settings?.platformName || "Restaurant SaaS"}
            </span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition ml-2"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-6">
          {menus.map((section, idx) => (
            <div key={idx}>
              <div className="px-3 mb-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {section.section}
                </p>
              </div>
              <div className="space-y-1.5">
                {section.items.map((item, i) =>
                  item.children ? (
                    <div key={i}>
                      <button
                        onClick={() => toggleSubmenu(item.name)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      >
                        <span className="flex items-center gap-3 text-sm font-medium">
                          <span className="text-base">{item.icon}</span>
                          {item.name}
                        </span>
                        <span
                          className={`transition-transform duration-200 ${
                            expandedItems[item.name] ? "rotate-180" : ""
                          }`}
                        >
                          ▼
                        </span>
                      </button>
                      {expandedItems[item.name] && (
                        <div className="ml-2 mt-1.5 space-y-1.5 border-l-2 border-gray-200 dark:border-slate-700">
                          {item.children.map((sub) => (
                            <Link
                              key={sub.href}
                              href={sub.href}
                              onClick={() => setOpen(false)}
                              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                                pathname === sub.href
                                  ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium"
                                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                              }`}
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        pathname === item.href
                          ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 font-medium"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-sm">{item.name}</span>
                      </span>
                      {item.badge && (
                        <span className="ml-auto text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  ),
                )}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </div>
  );
}
