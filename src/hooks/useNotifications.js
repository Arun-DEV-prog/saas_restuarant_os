// hooks/useNotifications.js
"use client";

import { useState, useCallback, useEffect, useRef } from "react";

// ══════════════════════════════════════════════════════════════════════════════
//  🔊  WEB AUDIO SYNTHESIZER
//  No MP3 / file needed — pure browser Web Audio API.
//
//  playOrderSound()     → soft double-ding  C5→E5  (pleasant, "new order")
//  playHotActionSound() → urgent triple-beep A5→A5→C6 (alert, "table needs you")
// ══════════════════════════════════════════════════════════════════════════════

function getAudioCtx() {
  if (typeof window === "undefined") return null;
  if (!window.__notifAudioCtx) {
    try {
      window.__notifAudioCtx = new (
        window.AudioContext || window.webkitAudioContext
      )();
    } catch {
      return null;
    }
  }
  return window.__notifAudioCtx;
}

function playTone(ctx, { freq, start, duration, type = "sine", peak = 0.4 }) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, start);
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(peak, start + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

export function playOrderSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime;
  // Soft double-ding: C5 then E5
  playTone(ctx, {
    freq: 523,
    start: t,
    duration: 0.45,
    type: "sine",
    peak: 0.35,
  });
  playTone(ctx, {
    freq: 523,
    start: t,
    duration: 0.45,
    type: "triangle",
    peak: 0.12,
  });
  playTone(ctx, {
    freq: 659,
    start: t + 0.22,
    duration: 0.55,
    type: "sine",
    peak: 0.4,
  });
  playTone(ctx, {
    freq: 659,
    start: t + 0.22,
    duration: 0.55,
    type: "triangle",
    peak: 0.12,
  });
}

export function playHotActionSound() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume();
  const t = ctx.currentTime;
  // Urgent triple-beep: A5, A5, C6
  playTone(ctx, {
    freq: 880,
    start: t,
    duration: 0.12,
    type: "square",
    peak: 0.25,
  });
  playTone(ctx, {
    freq: 880,
    start: t + 0.18,
    duration: 0.12,
    type: "square",
    peak: 0.25,
  });
  playTone(ctx, {
    freq: 1047,
    start: t + 0.36,
    duration: 0.2,
    type: "square",
    peak: 0.3,
  });
}

// ══════════════════════════════════════════════════════════════════════════════
//  HOOK
// ══════════════════════════════════════════════════════════════════════════════
export function useNotifications(restaurantId) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);
  const [hotActionCount, setHotActionCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Track previous IDs so we only play sound for genuinely NEW items
  const prevOrderIdsRef = useRef(new Set());
  const prevHotIdsRef = useRef(new Set());
  const isFirstLoadRef = useRef(true);

  // ── Main fetch ──────────────────────────────────────────────────────────────
  const loadNotifications = useCallback(async () => {
    if (!restaurantId) {
      setNotifications([]);
      setUnreadCount(0);
      setOrderCount(0);
      setHotActionCount(0);
      return;
    }

    setIsLoading(true);
    try {
      // Get dismissed notification IDs from localStorage
      const dismissedKey = `dismissed_${restaurantId}`;
      const dismissed = JSON.parse(localStorage.getItem(dismissedKey) || "[]");
      const dismissedSet = new Set(dismissed);

      // ✅ Your exact API routes
      const [ordersRes, requestsRes] = await Promise.all([
        fetch(`/api/orders?restaurantId=${restaurantId}`),
        fetch(`/api/restaurants/${restaurantId}/table-requests`),
      ]);

      const orders = ordersRes.ok ? await ordersRes.json() : [];
      const tableRequests = requestsRes.ok ? await requestsRes.json() : [];

      // ── Map orders ──────────────────────────────────────────────────────────
      const orderNotifications = orders
        .slice(0, 50)
        .filter((order) => !dismissedSet.has(order._id))
        .map((order) => ({
          id: order._id,
          rawId: order._id,
          type: "order",
          subType: (order.status || "pending").toLowerCase(),
          title: `Order ${order.orderNumber || order._id}`,
          message: `New order — Table ${order.tableNumber ?? "?"}`,
          itemCount: order.items?.length ?? 0,
          amount: order.totalAmount ?? order.total ?? 0,
          status: order.status,
          tableNumber: order.tableNumber,
          createdAt: order.createdAt,
          read: false,
        }));

      // ── Map table requests (hot actions) ────────────────────────────────────
      const hotActionNotifications = tableRequests
        .slice(0, 50)
        .filter((req) => !dismissedSet.has(req._id))
        .map((req) => ({
          id: req._id,
          rawId: req._id,
          type: "hotAction",
          subType: (req.requestType || req.type || "custom").toLowerCase(),
          title: `Table ${req.tableNumber}`,
          message:
            req.message ||
            hotLabel(req.requestType || req.type, req.tableNumber),
          tableNumber: req.tableNumber,
          status: req.status,
          createdAt: req.createdAt,
          read: false,
        }));

      const allNotifications = [
        ...hotActionNotifications,
        ...orderNotifications,
      ];
      setNotifications(allNotifications);

      // ── Counts (pending/active only) ────────────────────────────────────────
      const pendingOrders = orders.filter(
        (o) => o.status === "pending" || o.status === "confirmed",
      ).length;
      const pendingRequests = tableRequests.filter(
        (r) => r.status === "pending" || r.status === "acknowledged",
      ).length;

      setOrderCount(pendingOrders);
      setHotActionCount(pendingRequests);
      setUnreadCount(pendingOrders + pendingRequests);

      // ── 🔊 Sound — only after first load, only for new IDs ─────────────────
      if (!isFirstLoadRef.current) {
        const currentOrderIds = new Set(orders.map((o) => o._id));
        const currentHotIds = new Set(tableRequests.map((r) => r._id));

        const newOrders = orders.filter(
          (o) => !prevOrderIdsRef.current.has(o._id),
        );
        const newHotActs = tableRequests.filter(
          (r) => !prevHotIdsRef.current.has(r._id),
        );

        if (newHotActs.length > 0) {
          // Hot actions are more urgent — always win over order sound
          playHotActionSound();
        } else if (newOrders.length > 0) {
          playOrderSound();
        }

        prevOrderIdsRef.current = currentOrderIds;
        prevHotIdsRef.current = currentHotIds;
      } else {
        // First load — just snapshot current IDs, no sound
        prevOrderIdsRef.current = new Set(orders.map((o) => o._id));
        prevHotIdsRef.current = new Set(tableRequests.map((r) => r._id));
        isFirstLoadRef.current = false;
      }
    } catch (err) {
      console.error("Error loading notifications:", err);
      setNotifications([]);
      setUnreadCount(0);
      setOrderCount(0);
      setHotActionCount(0);
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  // ── Mark helpers ────────────────────────────────────────────────────────────
  const markRead = useCallback(
    (id) => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setUnreadCount((prev) => Math.max(0, prev - 1));

      // Persist dismissed notifications to localStorage
      try {
        if (restaurantId) {
          const key = `dismissed_${restaurantId}`;
          const dismissed = JSON.parse(localStorage.getItem(key) || "[]");
          if (!dismissed.includes(id)) {
            dismissed.push(id);
            localStorage.setItem(key, JSON.stringify(dismissed));
          }
        }
      } catch (err) {
        console.error("Error persisting dismissed notification:", err);
      }
    },
    [restaurantId],
  );

  const markAllRead = useCallback(() => {
    // Remove all notifications from display
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    setUnreadCount(0);

    // Persist all dismissed notifications to localStorage
    try {
      if (restaurantId) {
        const key = `dismissed_${restaurantId}`;
        const dismissed = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = [...new Set([...dismissed, ...ids])];
        localStorage.setItem(key, JSON.stringify(updated));
      }
    } catch (err) {
      console.error("Error persisting dismissed notifications:", err);
    }
  }, [restaurantId, notifications]);

  const refresh = useCallback(() => loadNotifications(), [loadNotifications]);

  // ── Polling (every 5s as in your original) ──────────────────────────────────
  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 5_000);
    return () => clearInterval(interval);
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    orderCount,
    hotActionCount,
    isLoading,
    markRead,
    markAllRead,
    refresh,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function hotLabel(type, table) {
  const t = (type || "").toLowerCase();
  if (t.includes("bill")) return `🧾 Bill requested — Table ${table}`;
  if (t.includes("waiter")) return `🙋 Waiter called — Table ${table}`;
  return `📣 Alert — Table ${table}`;
}
