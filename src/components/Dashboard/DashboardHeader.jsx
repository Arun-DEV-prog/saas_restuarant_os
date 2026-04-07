// components/DashboardHeader.jsx
"use client";

import { useCallback, useState } from "react";
import { Copy, QrCode, Bell, ShoppingBag, Zap } from "lucide-react";
import { toast } from "sonner";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationPanel from "@/components/NotificationPanel";

export default function DashboardHeader({ restaurant, user }) {
  const [showQR, setShowQR] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();

  // Fallback to session data if props not provided
  const restaurantData = restaurant || session?.user?.restaurant;
  const userData = user || session?.user;

  // Get notifications and handlers from hook - MUST be called unconditionally
  // (before any guard checks, to follow React's Rules of Hooks)
  const {
    notifications = [],
    unreadCount = 0,
    orderCount = 0,
    hotActionCount = 0,
    markRead = () => {},
    markAllRead = () => {},
    refresh = () => {},
  } = useNotifications(restaurantData?._id) || {};

  // Dismiss handler - MUST be declared before guard check (Rules of Hooks)
  const handleDismiss = useCallback((id) => markRead(id), [markRead]);

  // Guard: Return early if no restaurant data available
  if (!restaurantData) return null;

  // ── Page titles ────────────────────────────────────────────────────────────
  const titles = {
    "/dashboard": {
      title: "Dashboard",
      subtitle: `Hi ${userData?.name || "User"}, Welcome to Menu Tiger Dashboard!`,
    },
    "/dashboard/menu": { title: "Menu", subtitle: "Craft your digital menu" },
    "/dashboard/orders": {
      title: "Orders",
      subtitle: "Manage customer orders",
    },
    "/dashboard/settings": {
      title: "Settings",
      subtitle: "Manage your restaurant preferences",
    },
  };
  const page = titles[pathname] || {
    title: "Dashboard",
    subtitle: "Welcome to Menu Tiger",
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!restaurantData?.publicUrl) {
      toast.error("Restaurant URL not available");
      return;
    }
    await navigator.clipboard.writeText(restaurantData.publicUrl);
    toast.success("Link copied!");
  };

  const handleBellClick = () => {
    const opening = !showNotif;
    setShowNotif(opening);
    if (opening) refresh(); // fresh pull on open
  };

  const handleViewOrders = () => {
    setShowNotif(false);
    router.push(`/dashboard/${restaurantData._id}/orders`);
  };

  return (
    <>
      {/* ── Header bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0a1020] rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left — page title */}
        <div>
          <h1 className="text-2xl font-bold dark:text-white">{page.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">{page.subtitle}</p>
        </div>

        {/* Right — action buttons */}
        <div className="flex items-center gap-2">
          {/* ── 🔔 Bell ───────────────────────────────────────────────────── */}
          <div className="relative">
            <button
              onClick={handleBellClick}
              className="relative border rounded-lg px-3 py-2 bg-white dark:bg-[#0a1020] dark:border-white/10
                         hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center gap-2"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5 dark:text-gray-300" />

              {/* Red unread badge */}
              {unreadCount > 0 && (
                <span
                  key={unreadCount}
                  className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px]
                             bg-red-500 text-white text-[10px] font-black
                             rounded-full flex items-center justify-center px-1 shadow-md"
                  style={{ animation: "popIn 0.25s ease-out" }}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {showNotif && (
              <NotificationPanel
                notifications={notifications}
                unreadCount={unreadCount}
                orderCount={orderCount}
                hotActionCount={hotActionCount}
                onMarkAllRead={markAllRead}
                onDismiss={handleDismiss}
                onClose={() => setShowNotif(false)}
                onViewOrders={handleViewOrders}
              />
            )}
          </div>

          {/* ── 🛒 Order mini-badge (only when there are unread orders) ──── */}
          {orderCount > 0 && (
            <button
              onClick={handleViewOrders}
              className="flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800
                         rounded-lg px-3 py-2 bg-emerald-50 dark:bg-emerald-950/40
                         text-emerald-700 dark:text-emerald-400
                         hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition text-xs font-bold"
              title="New orders waiting"
            >
              <ShoppingBag size={15} />
              {orderCount} new order{orderCount !== 1 ? "s" : ""}
            </button>
          )}

          {/* ── ⚡ Hot-action mini-badge (pulsing — most urgent) ──────────── */}
          {hotActionCount > 0 && (
            <button
              onClick={handleBellClick}
              className="flex items-center gap-1.5 border border-orange-200 dark:border-orange-800
                         rounded-lg px-3 py-2 bg-orange-50 dark:bg-orange-950/40
                         text-orange-700 dark:text-orange-400
                         hover:bg-orange-100 dark:hover:bg-orange-900/50 transition text-xs font-bold
                         animate-pulse"
              title="Table alerts need attention"
            >
              <Zap size={15} />
              {hotActionCount} alert{hotActionCount !== 1 ? "s" : ""}
            </button>
          )}

          {/* ── QR button ── */}
          <button
            onClick={() => setShowQR(true)}
            className="border rounded-lg px-4 py-2 bg-white dark:bg-[#0a1020] dark:border-white/10
                       flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10 transition
                       dark:text-gray-300"
          >
            <QrCode className="w-5 h-5" />
            <span className="hidden md:inline">QR Code</span>
          </button>

          {/* ── Copy link ── */}
          <button
            onClick={handleCopy}
            className="border rounded-lg px-4 py-2 bg-white dark:bg-[#0a1020] dark:border-white/10
                       flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-white/10 transition
                       dark:text-gray-300"
          >
            <Copy className="w-5 h-5" />
            <span className="hidden md:inline">Copy Link</span>
          </button>

          {/* ── Open app ── */}
          {restaurantData?.publicUrl ? (
            <a
              href={restaurantData.publicUrl}
              target="_blank"
              className="bg-emerald-500 text-white px-4 py-2 rounded-lg shadow
                         flex items-center gap-2 hover:bg-emerald-600 transition"
            >
              👁 <span className="hidden sm:inline">Open App</span>
            </a>
          ) : (
            <button
              disabled
              className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg shadow
                         flex items-center gap-2 cursor-not-allowed"
              title="Restaurant URL not available"
            >
              👁 <span className="hidden sm:inline">Open App</span>
            </button>
          )}
        </div>
      </div>

      {/* ── QR Modal ───────────────────────────────────────────────────────── */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0f1a2e] rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5 relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 transition"
            >
              ✕
            </button>
            <h2 className="text-xl font-semibold text-center dark:text-white">
              Restaurant QR Code
            </h2>
            {/* NOTE: Remove stray * that was in original file */}
            {restaurantData?.qrCodeBase64 ? (
              <img
                src={restaurantData.qrCodeBase64}
                alt="QR Code"
                className="w-48 h-48 mx-auto border rounded-xl"
              />
            ) : (
              <div className="w-48 h-48 mx-auto border rounded-xl bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500">
                No QR Code Available
              </div>
            )}
            <div className="text-center text-sm text-gray-600 dark:text-gray-400 break-all">
              {restaurantData?.publicUrl || "URL not available"}
            </div>
            <div className="flex gap-3">
              {restaurantData?.qrCodeBase64 ? (
                <a
                  href={restaurantData.qrCodeBase64}
                  download={`${restaurantData.slug}-qr.png`}
                  className="flex-1 border dark:border-white/10 rounded-lg py-2 text-center flex items-center
                             justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300 transition"
                >
                  ⬇ Download
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 border dark:border-white/10 rounded-lg py-2 text-center flex items-center
                             justify-center gap-2 bg-gray-100 dark:bg-gray-800 text-gray-500 cursor-not-allowed"
                >
                  ⬇ Download
                </button>
              )}
              <button
                onClick={handleCopy}
                className="flex-1 border dark:border-white/10 rounded-lg py-2 flex items-center
                           justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 dark:text-gray-300 transition"
              >
                📋 Copy Link
              </button>
            </div>
            {restaurantData?.publicUrl ? (
              <a
                href={restaurantData.publicUrl}
                target="_blank"
                className="block text-center bg-emerald-500 text-white py-2 rounded-lg mt-2 hover:bg-emerald-600 transition"
              >
                👁 Open Menu
              </a>
            ) : (
              <button
                disabled
                className="block w-full text-center bg-gray-300 text-gray-500 py-2 rounded-lg mt-2 cursor-not-allowed"
              >
                👁 Open Menu (URL not available)
              </button>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0.3); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
