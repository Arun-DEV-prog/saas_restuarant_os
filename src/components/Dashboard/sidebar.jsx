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

  const menus = [
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
            { name: "All Stores", href: `/dashboard/${restaurantId}/stores` },
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
  ];

  const toggleSubmenu = (name) => {
    setExpandedItems((prev) => ({
      ...prev,
      [name]: !prev[name],
    }));
  };

  if (!restaurantId) {
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
        <div className="flex items-center gap-2.5 mb-1">
          <span className="text-2xl">🐯</span>
          <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
            MenuTiger
          </h1>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {restaurantName}
        </p>
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
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {section.section}
              </p>
            </div>
            <div className="space-y-1.5">
              {section.items.map((item, i) =>
                item.children ? (
                  <div key={i}>
                    <button
                      onClick={() => toggleSubmenu(item.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                        expandedItems[item.name]
                          ? "bg-gray-100 dark:bg-gray-800/50 text-gray-900 dark:text-white"
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
                      <div className="ml-2 mt-1.5 space-y-1.5 border-l-2 border-gray-200 dark:border-gray-700">
                        {item.children.map((sub) => (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                              pathname === sub.href
                                ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/20"
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
                    className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      pathname === item.href
                        ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-medium"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/30"
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
