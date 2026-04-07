"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import {
  ChevronDown,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  BarChart3,
  ShoppingCart,
  BookOpen,
  Layers,
  Zap,
  Store,
  Megaphone,
  TrendingUp,
  Plug,
  CreditCard,
  Flame,
  Bot,
  LayoutDashboard,
  Users,
  Building2,
  Package,
  Activity,
} from "lucide-react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

// Icon config map
const ICON_MAP = {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  BarChart3,
  Activity,
  Settings,
  ShoppingCart,
  BookOpen,
  Layers,
  Zap,
  Store,
  Megaphone,
  TrendingUp,
  Plug,
  CreditCard,
  Flame,
  Bot,
  HelpCircle,
  LogOut,
  Menu,
};

// Icon Wrapper Component
const IconWrapper = ({ Icon, size = 20 }) => {
  if (!Icon) return null;
  if (typeof Icon !== "function") return null;
  return <Icon size={size} />;
};

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { settings } = usePlatformSettings();
  const [expandedItems, setExpandedItems] = useState({});

  // Helper function to render icons safely
  const renderIcon = (iconKey) => {
    if (!iconKey) return null;

    // If it's a string, look it up in the map
    if (typeof iconKey === "string") {
      const IconComponent = ICON_MAP[iconKey];
      if (IconComponent) {
        return <IconWrapper Icon={IconComponent} size={20} />;
      }
      return <span className="text-lg">{iconKey}</span>;
    }

    // If it's already a function, use it directly
    if (typeof iconKey === "function") {
      return <IconWrapper Icon={iconKey} size={20} />;
    }

    return null;
  };

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
                icon: LayoutDashboard,
                badge: "Admin",
              },
              { name: "Users", href: `/dashboard/admin/users`, icon: Users },
              {
                name: "Restaurants",
                href: `/dashboard/admin/restaurants`,
                icon: Building2,
              },
              {
                name: "Restaurant Plans",
                href: `/dashboard/admin/restaurants-plans`,
                icon: Package,
              },
              {
                name: "Platform Analytics",
                href: `/dashboard/admin/analytics`,
                icon: BarChart3,
              },
              {
                name: "Activity Logs",
                href: `/dashboard/admin/activity`,
                icon: Activity,
              },
              {
                name: "System Settings",
                href: `/dashboard/admin/settings`,
                icon: Settings,
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
              {
                name: "Admin Dashboard",
                href: `/dashboard/admin`,
                icon: LayoutDashboard,
              },
              { name: "Users", href: `/dashboard/admin/users`, icon: Users },
              {
                name: "Restaurants",
                href: `/dashboard/admin/restaurants`,
                icon: Building2,
              },
              {
                name: "Restaurant Plans",
                href: `/dashboard/admin/restaurants-plans`,
                icon: Package,
              },
              {
                name: "Analytics",
                href: `/dashboard/admin/analytics`,
                icon: BarChart3,
              },
              {
                name: "Activity Log",
                href: `/dashboard/admin/activity`,
                icon: Activity,
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
              { name: "Dashboard", href: `/dashboard`, icon: LayoutDashboard },
              {
                name: "Orders",
                href: `/dashboard/${restaurantId}/orders`,
                icon: ShoppingCart,
              },
            ],
          },
          {
            section: "Management",
            items: [
              { name: "Menus", href: `/dashboard/menu`, icon: BookOpen },
              {
                name: "Table Management",
                href: `/dashboard/${restaurantId}/tables`,
                icon: Layers,
              },
              {
                name: "Kitchen Display",
                href: `/dashboard/${restaurantId}/kitchen`,
                icon: Zap,
                badge: "Beta",
              },
            ],
          },
          {
            section: "Business",
            items: [
              {
                name: "Stores",
                icon: Store,
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
                icon: Megaphone,
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
                icon: TrendingUp,
              },
              {
                name: "AI Automation",
                href: `/dashboard/ai-assistant`,
                icon: Bot,
                badge: "New",
              },
            ],
          },
          {
            section: "Integrations",
            items: [
              {
                name: "Integrations",
                href: `/dashboard/${restaurantId}/integrations`,
                icon: Plug,
              },
            ],
          },
          {
            section: "Billing",
            items: [
              {
                name: "Pricing Plans",
                href: `/dashboard/${restaurantId}/pricing`,
                icon: CreditCard,
              },
            ],
          },
          {
            section: "Other",
            items: [
              {
                name: "Hot Actions",
                href: `/dashboard/${restaurantId}/hotactions`,
                icon: Flame,
              },
              {
                name: "Settings",
                href: `/dashboard/${restaurantId}/setting`,
                icon: Settings,
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
    <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-[#0f172a] border-r border-gray-200 dark:border-gray-800 transition-colors max-h-screen overflow-hidden">
      {/* Header */}
      <div className="h-20 flex flex-col justify-center px-6 border-b border-gray-200 dark:border-gray-800/50 flex-shrink-0">
        {isOwner ? (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              {settings?.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Platform Logo"
                  className="w-7 h-7 rounded"
                />
              ) : (
                <span className="text-2xl">👑</span>
              )}
              <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-500 bg-clip-text text-transparent">
                {settings?.platformName || "Owner Panel"}
              </h1>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              SaaS Platform Control
            </p>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2.5 mb-1">
              {settings?.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Platform Logo"
                  className="w-7 h-7 rounded"
                />
              ) : (
                <span className="text-2xl">🐯</span>
              )}
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
                {settings?.platformName || "MenuTiger"}
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
                        {renderIcon(item.icon)}
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
                      {renderIcon(item.icon)}
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
    </aside>
  );
}
