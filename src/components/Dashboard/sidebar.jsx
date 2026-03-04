"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ChevronDown, Settings, HelpCircle, LogOut, Menu } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [expandedItems, setExpandedItems] = useState({});

  const restaurantId = session?.user?.restaurantId;
  const restaurantName = session?.user?.restaurantName || "Restaurant";
  const userRole = session?.user?.role || "user";
  const isOwner = userRole === "owner";
  const isAdmin = userRole === "admin";

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

  const toggleSubmenu = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  if (!restaurantId && !isOwner && !isAdmin) {
    return (
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800">
        <div className="h-20 flex items-center px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1 space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 animate-pulse" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24 animate-pulse" />
          </div>
        </div>
        <div className="flex-1 px-4 py-6 space-y-3">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="h-10 bg-gray-100 dark:bg-gray-800 rounded animate-pulse"
            />
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 transition-colors h-screen">
      {/* Header */}
      <div className="h-20 flex flex-col justify-center px-6 border-b border-gray-200 dark:border-gray-800/50">
        {isOwner ? (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">👑</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                Owner Panel
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SaaS Platform Control
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">🐯</span>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                MenuTiger
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {restaurantName}
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav
        className="flex-1 overflow-y-auto px-4 py-6 space-y-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
        suppressHydrationWarning
      >
        <style>{`
          nav::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        {menus.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-3">
              <p
                className={`text-xs font-semibold uppercase tracking-wider ${
                  section.section.includes("OWNER PANEL")
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-gray-500 dark:text-gray-400"
                }`}
              >
                {section.section}
              </p>
            </div>
            <div className="space-y-1.5">
              {section.items.map((item, i) => {
                const isOwnerSection = section.section.includes("OWNER PANEL");
                const activeColor = isOwnerSection
                  ? "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                  : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";

                return item.children ? (
                  <div key={i}>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        expandedItems[item.name]
                          ? isOwnerSection
                            ? "bg-yellow-100 dark:bg-yellow-900/20 text-yellow-900 dark:text-yellow-200"
                            : "bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-white"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-base">{item.icon}</span>
                        {item.name}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          expandedItems[item.name] ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {expandedItems[item.name] && (
                      <div
                        className={`ml-2 mt-1.5 space-y-1.5 border-l-2 ${
                          isOwnerSection
                            ? "border-yellow-200 dark:border-yellow-700"
                            : "border-gray-200 dark:border-gray-700"
                        }`}
                      >
                        {item.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              pathname === sub.href
                                ? activeColor + " font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/20"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                isOwnerSection
                                  ? "bg-yellow-300 dark:bg-yellow-600"
                                  : "bg-gray-300 dark:bg-gray-600"
                              }`}
                            />
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
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      pathname === item.href
                        ? activeColor + " font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-sm">{item.name}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`ml-auto text-xs font-semibold px-2 py-1 rounded-full ${
                          isOwnerSection
                            ? "bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300"
                            : "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 dark:border-gray-800/50 px-4 py-4 space-y-2">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200 text-sm">
          <HelpCircle size={16} />
          Help & Support
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30 rounded-lg transition-all duration-200 text-sm">
          <Settings size={16} />
          Account Settings
        </button>
      </div>
    </aside>
  );
}
