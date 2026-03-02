// components/NotificationPanel.jsx
"use client";

import { useEffect, useRef } from "react";
import {
  Bell,
  ShoppingBag,
  Zap,
  CheckCheck,
  X,
  Clock,
  ChevronRight,
} from "lucide-react";

function timeAgo(dateStr) {
  const s = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function NotifIcon({ type, subType }) {
  if (type === "order")
    return (
      <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
        <ShoppingBag
          size={16}
          className="text-emerald-600 dark:text-emerald-400"
        />
      </div>
    );
  const emoji =
    subType === "bill" || subType === "bill_request"
      ? "🧾"
      : subType === "waiter" || subType === "waiter_request"
        ? "🙋"
        : "📣";
  return (
    <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0 text-base leading-none">
      {emoji}
    </div>
  );
}

function NotifRow({ n, onDismiss }) {
  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 transition group
      hover:bg-gray-50 dark:hover:bg-white/5
      ${!n.read ? "bg-orange-50/70 dark:bg-orange-950/20" : ""}
    `}
    >
      <NotifIcon type={n.type} subType={n.subType} />

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm leading-snug ${
            !n.read
              ? "font-semibold text-gray-900 dark:text-white"
              : "text-gray-600 dark:text-gray-400"
          }`}
        >
          {n.message}
        </p>

        {n.type === "order" && (
          <p className="text-xs text-gray-400 mt-0.5">
            {n.itemCount} item{n.itemCount !== 1 ? "s" : ""} · $
            {Number(n.amount).toFixed(2)}
          </p>
        )}

        <div className="flex items-center gap-1.5 mt-1">
          <Clock size={10} className="text-gray-400" />
          <span className="text-[11px] text-gray-400">
            {timeAgo(n.createdAt)}
          </span>
          {!n.read && (
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 flex-shrink-0" />
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(n.id)}
        className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-white/10 transition flex-shrink-0"
        title="Dismiss"
      >
        <X size={12} className="text-gray-400" />
      </button>
    </div>
  );
}

export default function NotificationPanel({
  notifications,
  unreadCount,
  orderCount,
  hotActionCount,
  onMarkAllRead,
  onDismiss,
  onClose,
  onViewOrders,
}) {
  const ref = useRef(null);

  useEffect(() => {
    function down(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, [onClose]);

  const orders = notifications.filter((n) => n.type === "order");
  const hotActions = notifications.filter((n) => n.type === "hotAction");

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-96 max-w-[calc(100vw-1rem)]
                 bg-white dark:bg-[#0f1a2e] rounded-2xl shadow-2xl
                 border border-gray-200 dark:border-white/10 z-50 flex flex-col overflow-hidden"
      style={{ animation: "dropIn 0.15s ease-out" }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/10">
        <div className="flex items-center gap-2">
          <Bell size={16} className="text-gray-600 dark:text-gray-300" />
          <span className="font-bold text-sm text-gray-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-white/10 transition"
          >
            <X size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      {/* Type badges */}
      {(orderCount > 0 || hotActionCount > 0) && (
        <div className="flex gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 border-b border-gray-100 dark:border-white/10">
          {orderCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
              <ShoppingBag size={11} /> {orderCount} Order
              {orderCount !== 1 ? "s" : ""}
            </span>
          )}
          {hotActionCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 font-semibold px-2 py-0.5 rounded-full">
              <Zap size={11} /> {hotActionCount} Alert
              {hotActionCount !== 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div className="overflow-y-auto max-h-[400px] divide-y divide-gray-100 dark:divide-white/5">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-6">
            <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center mb-3">
              <Bell size={22} className="text-gray-300" />
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">
              All caught up!
            </p>
            <p className="text-xs text-gray-400 mt-1">
              New orders & table alerts appear here.
            </p>
          </div>
        ) : (
          <>
            {hotActions.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-orange-50 dark:bg-orange-950/30 sticky top-0">
                  <span className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">
                    ⚡ Table Alerts
                  </span>
                </div>
                {hotActions.map((n) => (
                  <NotifRow key={n.id} n={n} onDismiss={onDismiss} />
                ))}
              </div>
            )}
            {orders.length > 0 && (
              <div>
                <div className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-950/30 sticky top-0">
                  <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">
                    🛒 New Orders
                  </span>
                </div>
                {orders.map((n) => (
                  <NotifRow key={n.id} n={n} onDismiss={onDismiss} />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t border-gray-100 dark:border-white/10 px-4 py-2.5">
          <button
            onClick={onViewOrders}
            className="w-full flex items-center justify-center gap-1.5 text-sm text-emerald-600 dark:text-emerald-400 font-semibold hover:text-emerald-700 transition"
          >
            View all orders <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
