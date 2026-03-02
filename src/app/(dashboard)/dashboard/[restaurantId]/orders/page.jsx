"use client";
// app/dashboard/[restaurantId]/orders/page.jsx
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import {
  Bell,
  Clock,
  CheckCircle2,
  ChefHat,
  Utensils,
  Users,
  DollarSign,
  ArrowLeft,
  Search,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  Receipt,
  ShoppingBag,
  Eye,
  Volume2,
  VolumeX,
} from "lucide-react";
import { io } from "socket.io-client";

// ─── Status Config ────────────────────────────────────────────────────────────
const S = {
  pending: {
    label: "New Order",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-400",
    icon: Bell,
    next: "confirmed",
    nextBtn: "Confirm",
    btnCls: "bg-blue-500 hover:bg-blue-600 text-white",
  },
  confirmed: {
    label: "Confirmed",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
    dot: "bg-blue-500",
    icon: CheckCircle2,
    next: "preparing",
    nextBtn: "Start Cooking",
    btnCls: "bg-orange-500 hover:bg-orange-600 text-white",
  },
  preparing: {
    label: "Cooking",
    badge: "bg-orange-100 text-orange-700 border-orange-200",
    dot: "bg-orange-500",
    icon: ChefHat,
    next: "ready",
    nextBtn: "Mark Ready",
    btnCls: "bg-emerald-500 hover:bg-emerald-600 text-white",
  },
  ready: {
    label: "Ready",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: Utensils,
    next: "served",
    nextBtn: "Mark Served",
    btnCls: "bg-stone-600 hover:bg-stone-700 text-white",
  },
  served: {
    label: "Served",
    badge: "bg-stone-100 text-stone-500 border-stone-200",
    dot: "bg-stone-400",
    icon: CheckCircle2,
    next: null,
    nextBtn: null,
    btnCls: null,
  },
  cancelled: {
    label: "Cancelled",
    badge: "bg-red-100 text-red-600 border-red-200",
    dot: "bg-red-400",
    icon: X,
    next: null,
    nextBtn: null,
    btnCls: null,
  },
};

const TAB_ALL = "all";
const TABS = [TAB_ALL, "pending", "confirmed", "preparing", "ready", "served"];

function timeAgo(d) {
  if (!d) return "Just now";
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return `${Math.floor(s / 3600)}h ago`;
}

function formatTime(d) {
  if (!d) return "";
  return new Date(d).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── NEW ORDER NOTIFICATION TOAST ────────────────────────────────────────────
function OrderNotification({ notification, onDismiss, onView }) {
  const [exiting, setExiting] = useState(false);
  const [progress, setProgress] = useState(100);
  const DURATION = 8000;

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - start;
      const remaining = Math.max(0, 100 - (elapsed / DURATION) * 100);
      setProgress(remaining);
      if (remaining === 0) clearInterval(interval);
    }, 50);

    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onDismiss(notification.id), 350);
    }, DURATION);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  function handleDismiss() {
    setExiting(true);
    setTimeout(() => onDismiss(notification.id), 350);
  }

  function handleView() {
    onView(notification.order);
    handleDismiss();
  }

  const { order } = notification;

  return (
    <div
      className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden"
      style={{
        animation: exiting
          ? "toastOut 0.35s cubic-bezier(0.4,0,1,1) forwards"
          : "toastIn 0.4s cubic-bezier(0,0,0.2,1)",
      }}
    >
      {/* Progress bar */}
      <div className="h-1 bg-stone-100">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            {/* Animated bell icon */}
            <div
              className="w-11 h-11 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ animation: "bellRing 0.6s ease-in-out 2" }}
            >
              <Bell size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-amber-600">
                🔔 New Order!
              </p>
              <p className="text-base font-black text-stone-900 leading-tight">
                {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition flex-shrink-0 mt-0.5"
          >
            <X size={12} className="text-stone-500" />
          </button>
        </div>

        {/* Order info */}
        <div className="bg-stone-50 rounded-xl p-3 mb-3 space-y-2">
          {/* Items preview */}
          <div className="space-y-1.5">
            {order.items?.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg overflow-hidden bg-orange-50 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[11px]">
                      🍽️
                    </div>
                  )}
                </div>
                <span className="text-xs text-stone-700 font-medium truncate">
                  {item.quantity}× {item.name}
                </span>
              </div>
            ))}
            {order.items?.length > 2 && (
              <p className="text-[10px] text-stone-400 font-medium pl-9">
                +{order.items.length - 2} more item
                {order.items.length - 2 !== 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-3 pt-1 border-t border-stone-100">
            {order.tableNumber && (
              <span className="text-xs text-stone-500 flex items-center gap-1">
                <Utensils size={10} /> Table {order.tableNumber}
              </span>
            )}
            <span className="text-xs text-stone-500 flex items-center gap-1">
              <Users size={10} /> {order.persons}{" "}
              {order.persons === 1 ? "person" : "people"}
            </span>
            <span className="text-xs font-black text-orange-600 ml-auto">
              ${order.total?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleView}
            className="flex-1 flex items-center justify-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-black py-2.5 rounded-xl transition active:scale-95"
          >
            <Eye size={13} /> View Order
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 text-xs font-bold text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition"
          >
            Dismiss
          </button>
        </div>
      </div>

      <style>{`
        @keyframes toastIn {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        @keyframes toastOut {
          from { transform: translateX(0);    opacity: 1; max-height: 300px; }
          to   { transform: translateX(120%); opacity: 0; max-height: 0;   }
        }
        @keyframes bellRing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(15deg); }
          30%  { transform: rotate(-13deg); }
          45%  { transform: rotate(10deg); }
          60%  { transform: rotate(-8deg); }
          75%  { transform: rotate(5deg); }
          90%  { transform: rotate(-3deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

// ─── NOTIFICATION STACK (renders all active toasts) ──────────────────────────
function NotificationStack({ notifications, onDismiss, onView }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 items-end pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id} className="pointer-events-auto w-full max-w-sm">
          <OrderNotification
            notification={n}
            onDismiss={onDismiss}
            onView={onView}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Single Order Row ─────────────────────────────────────────────────────────
function OrderRow({ order, isNew, isHighlighted, onStatus }) {
  const cfg = S[order.status] || S.pending;
  const Icon = cfg.icon;

  return (
    <>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          {isNew && (
            <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 animate-pulse" />
          )}
          <div>
            <p className="text-sm font-black text-stone-900 dark:text-stone-100">
              {order.orderNumber}
            </p>
            <p className="text-xs text-stone-400 dark:text-slate-500">
              {formatTime(order.createdAt)}
            </p>
          </div>
        </div>
      </td>
      <td className="px-3 py-4">
        <span className="text-sm text-stone-600 dark:text-slate-400">
          {order.tableNumber || (
            <span className="text-stone-300 dark:text-slate-600">—</span>
          )}
        </span>
      </td>
      <td className="px-3 py-4 max-w-[220px]">
        <div className="space-y-1">
          {order.items?.slice(0, 2).map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-lg overflow-hidden bg-orange-50 dark:bg-orange-900/30 flex-shrink-0">
                {item.image ? (
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px]">
                    🍽️
                  </div>
                )}
              </div>
              <span className="text-xs text-stone-700 dark:text-slate-300 truncate font-medium">
                {item.quantity}× {item.name}
              </span>
            </div>
          ))}
          {order.items?.length > 2 && (
            <span className="text-[10px] text-stone-400 dark:text-slate-500 font-medium">
              +{order.items.length - 2} more
            </span>
          )}
        </div>
      </td>
      <td className="px-3 py-4 text-center">
        <div className="flex items-center justify-center gap-1 text-xs text-stone-500 dark:text-slate-400">
          <Users size={11} />
          {order.persons}
        </div>
      </td>
      <td className="px-3 py-4">
        <div>
          <p className="text-sm font-black text-orange-600 dark:text-orange-400">
            ${order.total?.toFixed(2)}
          </p>
          {order.persons > 1 && (
            <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
              ${order.perPerson?.toFixed(2)}/person
            </p>
          )}
        </div>
      </td>
      <td className="px-3 py-4">
        <span
          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          <Icon size={10} />
          {cfg.label}
        </span>
      </td>
      <td className="px-3 py-4">
        <span className="text-xs text-stone-400 dark:text-slate-500 flex items-center gap-1">
          <Clock size={11} />
          {timeAgo(order.createdAt)}
        </span>
      </td>
      <td className="px-4 py-4">
        {cfg.next ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStatus(order._id, cfg.next);
            }}
            className={`text-xs font-black px-3 py-2 rounded-xl transition whitespace-nowrap ${cfg.btnCls}`}
          >
            {cfg.nextBtn}
          </button>
        ) : (
          <span className="text-xs text-stone-300 font-medium">—</span>
        )}
      </td>
    </>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────
function OrderDetailPanel({ order, onClose, onStatus, updatingOrder }) {
  if (!order) return null;
  const cfg = S[order.status] || S.pending;
  const Icon = cfg.icon;

  return (
    <div
      className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-40 flex flex-col border-l border-stone-100"
      style={{ animation: "slideIn 0.25s ease-out" }}
    >
      <style>{`@keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }`}</style>
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-stone-50">
        <div>
          <p className="text-xs text-stone-400 font-medium">Order Details</p>
          <h3 className="text-lg font-black text-stone-900">
            {order.orderNumber}
          </h3>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 flex items-center justify-center hover:bg-stone-100 dark:hover:bg-slate-600 transition"
        >
          <X size={15} className="text-stone-600 dark:text-slate-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <span
          className={`inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl border ${cfg.badge}`}
        >
          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
          <Icon size={14} />
          {cfg.label}
        </span>

        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Table", value: order.tableNumber || "—" },
            { label: "Persons", value: order.persons },
            { label: "Time", value: formatTime(order.createdAt) },
            { label: "Per person", value: `$${order.perPerson?.toFixed(2)}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="bg-stone-50 dark:bg-slate-700/50 rounded-xl p-3"
            >
              <p className="text-[10px] text-stone-400 dark:text-slate-500 uppercase tracking-wider font-bold mb-0.5">
                {label}
              </p>
              <p className="text-sm font-black text-stone-800 dark:text-stone-100">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-stone-400 dark:text-slate-500 mb-3">
            Items
          </p>
          <div className="space-y-3">
            {order.items?.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-orange-50 dark:bg-orange-900/30 flex-shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xl">
                      🍽️
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-stone-800 dark:text-stone-100">
                    {item.name}
                  </p>
                  <p className="text-xs text-stone-400 dark:text-slate-500">
                    ×{item.quantity} · ${item.unitPrice?.toFixed(2)} each
                  </p>
                </div>
                <span className="font-black text-stone-700 dark:text-orange-400 text-sm">
                  ${item.totalPrice?.toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {order.customerNote && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3 text-sm text-amber-800 dark:text-amber-300">
            📝 {order.customerNote}
          </div>
        )}

        <div className="bg-gradient-to-br from-orange-50 dark:from-orange-900/20 to-amber-50 dark:to-amber-900/10 rounded-xl p-4 space-y-2 text-sm border border-orange-100 dark:border-orange-900/30">
          <p className="text-[10px] font-black uppercase tracking-wider text-orange-400 dark:text-orange-300 mb-3">
            Price Breakdown
          </p>
          <div className="flex justify-between text-stone-500 dark:text-slate-400">
            <span>Subtotal</span>
            <span>${order.subtotal?.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-stone-400 dark:text-slate-500">
            <span>Tax ({((order.taxRate || 0.1) * 100).toFixed(0)}%)</span>
            <span>+${order.taxAmount?.toFixed(2)}</span>
          </div>
          <div className="h-px bg-orange-200 dark:bg-orange-900/50" />
          <div className="flex justify-between font-black text-base text-stone-900 dark:text-stone-100">
            <span>Total</span>
            <span className="text-orange-600 dark:text-orange-400">
              ${order.total?.toFixed(2)}
            </span>
          </div>
          {order.persons > 1 && (
            <div className="flex justify-between text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-900/20 rounded-lg px-3 py-2 mt-1 border border-emerald-200 dark:border-emerald-900/50">
              <span>Per person</span>
              <span>${order.perPerson?.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>

      {cfg.next && (
        <div className="p-5 border-t border-stone-100 dark:border-slate-700">
          <button
            onClick={() => {
              onStatus(order._id, cfg.next);
              onClose();
            }}
            disabled={order._id === updatingOrder}
            className={`w-full font-black text-sm py-4 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed ${cfg.btnCls}`}
          >
            {order._id === updatingOrder ? "Updating..." : cfg.nextBtn}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Stats Bar ────────────────────────────────────────────────────────────────
function StatsBar({ orders }) {
  const active = orders.filter(
    (o) => !["served", "cancelled"].includes(o.status),
  ).length;
  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const pending = orders.filter((o) => o.status === "pending").length;
  const served = orders.filter((o) => o.status === "served").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        {
          l: "Active Orders",
          v: active,
          i: Bell,
          bg: "bg-amber-50 dark:bg-amber-950/40",
          ic: "text-amber-500 dark:text-amber-400",
        },
        {
          l: "Pending",
          v: pending,
          i: Clock,
          bg: "bg-red-50 dark:bg-red-950/40",
          ic: "text-red-500 dark:text-red-400",
        },
        {
          l: "Today Revenue",
          v: `$${revenue.toFixed(2)}`,
          i: DollarSign,
          bg: "bg-emerald-50 dark:bg-emerald-950/40",
          ic: "text-emerald-500 dark:text-emerald-400",
        },
        {
          l: "Served Today",
          v: served,
          i: CheckCircle2,
          bg: "bg-blue-50 dark:bg-blue-950/40",
          ic: "text-blue-500 dark:text-blue-400",
        },
      ].map(({ l, v, i: Icon, bg, ic }) => (
        <div
          key={l}
          className={`${bg} rounded-2xl p-4 flex items-center gap-3`}
        >
          <Icon size={20} className={ic} />
          <div>
            <p className="text-xl font-black text-stone-900 dark:text-stone-100 leading-none">
              {v}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              {l}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN ORDERS PAGE ─────────────────────────────────────────────────────────
export default function OrdersPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId;
  const searchParams = useSearchParams();
  const router = useRouter();
  const highlightId = searchParams.get("highlight");

  const [orders, setOrders] = useState([]);
  const [newIds, setNewIds] = useState(new Set());
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(TAB_ALL);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelected] = useState(null);
  const [updatingOrder, setUpdatingOrder] = useState(null);

  // ── Notification state ──
  const [notifications, setNotifications] = useState([]);
  const notifIdRef = useRef(0);

  function pushNotification(order) {
    const id = ++notifIdRef.current;
    setNotifications((prev) => [...prev, { id, order }]);
  }

  function dismissNotification(id) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function viewOrderFromNotif(order) {
    setSelected(order);
    // Switch to "pending" tab so order is visible
    setTab("pending");
  }

  // ── Sound System ──────────────────────────────────────────────────────────
  const [soundEnabled, setSoundEnabled] = useState(true);
  const soundEnabledRef = useRef(true); // ref so socket closure always reads latest value
  const audioCtxRef = useRef(null);
  const unlockedRef = useRef(false); // has user interacted yet?

  // Keep ref in sync with state
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Unlock AudioContext on first user interaction (required by all browsers)
  useEffect(() => {
    function unlock() {
      if (unlockedRef.current) return;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        audioCtxRef.current = ctx;
        // Play a silent buffer to fully unlock
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
        unlockedRef.current = true;
      } catch {}
    }
    ["click", "keydown", "touchstart"].forEach((e) =>
      document.addEventListener(e, unlock, { once: true }),
    );
  }, []);

  function getCtx() {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }
    if (audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }

  function playTone(ctx, freq, type, startTime, duration, gainPeak = 0.3) {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.connect(g);
    g.connect(ctx.destination);
    o.frequency.value = freq;
    o.type = type;
    g.gain.setValueAtTime(0, startTime);
    g.gain.linearRampToValueAtTime(gainPeak, startTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    o.start(startTime);
    o.stop(startTime + duration);
  }

  // 🔔 New order — cheerful 3-note ascending chime (C5 → E5 → G5)
  function playNewOrderSound() {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [523, 659, 784].forEach((freq, i) => {
        playTone(ctx, freq, "sine", t + i * 0.18, 0.65, 0.32);
      });
      playTone(ctx, 130, "sine", t, 0.15, 0.12); // warm low thud
    } catch {}
  }

  // ✅ Status advance — soft double-click confirm
  function playStatusSound() {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      playTone(ctx, 880, "sine", t, 0.12, 0.15);
      playTone(ctx, 1100, "sine", t + 0.1, 0.2, 0.12);
    } catch {}
  }

  // 🍽️ Ready alert — urgent two-tone pulse (repeats twice)
  function playReadySound() {
    try {
      const ctx = getCtx();
      const t = ctx.currentTime;
      [0, 0.35].forEach((offset) => {
        playTone(ctx, 880, "square", t + offset, 0.15, 0.08);
        playTone(ctx, 1108, "square", t + offset + 0.17, 0.15, 0.08);
      });
    } catch {}
  }

  // Unified dispatcher — always reads from ref so it's safe inside socket closures
  function playSound(type = "new") {
    if (!soundEnabledRef.current) return;
    if (type === "new") playNewOrderSound();
    else if (type === "ready") playReadySound();
    else playStatusSound();
  }

  // Load orders
  useEffect(() => {
    if (!restaurantId) return;
    fetch(`/api/orders?restaurantId=${restaurantId}`)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => setOrders(Array.isArray(data) ? data : []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [restaurantId]);

  // Auto-open detail panel if highlight param
  useEffect(() => {
    if (highlightId && orders.length > 0) {
      const o = orders.find((x) => x._id === highlightId);
      if (o) setSelected(o);
    }
  }, [highlightId, orders]);

  // Socket.IO
  useEffect(() => {
    if (!restaurantId) return;

    // Use external socket server URL
    const SOCKET_SERVER =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

    const socket = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-restaurant", restaurantId);
    });
    socket.on("disconnect", () => setConnected(false));
    socket.on("connect_error", () => setConnected(false));

    socket.on("order-created", (order) => {
      setOrders((prev) => [order, ...prev]);
      setNewIds((prev) => new Set([...prev, order._id]));
      playSound("new");
      pushNotification(order); // ← show notification toast
      setTimeout(() => {
        setNewIds((prev) => {
          const n = new Set(prev);
          n.delete(order._id);
          return n;
        });
      }, 8000);
    });

    socket.on("order-updated", (data) => {
      console.log("[Socket] order-updated event received:", data);
      const id = data.orderId || data._id;
      if (id) {
        setOrders((prev) => {
          const updated = prev.map((o) => {
            const orderId = o._id?.toString ? o._id.toString() : String(o._id);
            const eventId = id.toString ? id.toString() : String(id);
            if (orderId === eventId) {
              console.log(
                `[Socket] Updating order ${orderId} to status: ${data.status}`,
              );
              return { ...o, status: data.status, updatedAt: data.updatedAt };
            }
            return o;
          });
          return updated;
        });
        setSelected((prev) => {
          if (!prev) return prev;
          const prevId = prev._id?.toString
            ? prev._id.toString()
            : String(prev._id);
          const eventId = id.toString ? id.toString() : String(id);
          if (prevId === eventId) {
            console.log(
              `[Socket] Updating selected order to status: ${data.status}`,
            );
            return { ...prev, status: data.status, updatedAt: data.updatedAt };
          }
          return prev;
        });
      }
    });

    return () => socket.disconnect();
  }, [restaurantId]);

  async function handleStatus(orderId, status) {
    // Prevent multiple concurrent updates to the same order
    if (updatingOrder === orderId) {
      console.log(
        `[handleStatus] Order ${orderId} is already being updated, skipping...`,
      );
      return;
    }

    console.log(`[handleStatus] Updating order ${orderId} to ${status}`);
    setUpdatingOrder(orderId);

    // Update UI optimistically
    setOrders((prev) =>
      prev.map((o) => (o._id === orderId ? { ...o, status } : o)),
    );
    setSelected((prev) => (prev?._id === orderId ? { ...prev, status } : prev));

    // Play appropriate sound for this status transition
    playSound(status === "ready" ? "ready" : "status");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log("[handleStatus] Success:", result);
    } catch (err) {
      console.error("[handleStatus] Error updating status:", err);
      // Revert UI on error
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: o.status } : o)),
      );
    } finally {
      setUpdatingOrder(null);
    }
  }

  const filtered = orders
    .filter((o) => tab === TAB_ALL || o.status === tab)
    .filter((o) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        o.orderNumber?.toLowerCase().includes(q) ||
        o.tableNumber?.toLowerCase().includes(q) ||
        o.items?.some((i) => i.name?.toLowerCase().includes(q))
      );
    });

  if (!restaurantId) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-stone-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-stone-50 dark:bg-slate-950 transition-colors"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      {/* ── Notification Stack ── */}
      <NotificationStack
        notifications={notifications}
        onDismiss={dismissNotification}
        onView={viewOrderFromNotif}
      />

      {/* ── Order Detail Panel ── */}
      {selectedOrder && (
        <>
          <div
            className="fixed inset-0 bg-black/20 dark:bg-black/40 z-30"
            onClick={() => setSelected(null)}
          />
          <OrderDetailPanel
            order={selectedOrder}
            onClose={() => setSelected(null)}
            onStatus={handleStatus}
            updatingOrder={updatingOrder}
          />
        </>
      )}

      {/* ── Top Nav ── */}
      <div className="bg-white dark:bg-slate-800 border-b border-stone-200 dark:border-slate-700 sticky top-0 z-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(`/dashboard/${restaurantId}`)}
                className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-slate-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-slate-600 transition"
              >
                <ArrowLeft
                  size={16}
                  className="text-stone-600 dark:text-slate-300"
                />
              </button>
              <div>
                <h1 className="text-xl font-black text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Receipt
                    size={20}
                    className="text-orange-500 dark:text-orange-400"
                  />{" "}
                  Orders
                </h1>
                <p className="text-xs text-stone-400 dark:text-slate-500 mt-0.5">
                  {orders.length} total orders
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound toggle */}
              <button
                onClick={() => {
                  const next = !soundEnabledRef.current;
                  soundEnabledRef.current = next;
                  setSoundEnabled(next);
                  if (next) {
                    // Play confirmation chime immediately when re-enabling
                    setTimeout(() => playStatusSound(), 30);
                  }
                }}
                title={
                  soundEnabled
                    ? "Sound ON — click to mute"
                    : "Sound OFF — click to enable"
                }
                className={`w-9 h-9 rounded-xl flex items-center justify-center transition ${
                  soundEnabled
                    ? "bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-900/60"
                    : "bg-stone-100 dark:bg-slate-700 text-stone-400 dark:text-slate-500 hover:bg-stone-200 dark:hover:bg-slate-600"
                }`}
              >
                {soundEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
              </button>

              {/* Notification badge */}
              {notifications.length > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-500 dark:bg-amber-600 text-white text-xs font-black px-3 py-1.5 rounded-full animate-pulse">
                  <Bell size={11} />
                  {notifications.length} new
                </div>
              )}

              <span
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${connected ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}
              >
                {connected ? (
                  <Wifi size={11} className="animate-pulse" />
                ) : (
                  <WifiOff size={11} />
                )}
                {connected ? "Live" : "Offline"}
              </span>
              <button
                onClick={() => window.location.reload()}
                className="w-9 h-9 rounded-xl bg-stone-100 dark:bg-slate-700 flex items-center justify-center hover:bg-stone-200 dark:hover:bg-slate-600 transition"
              >
                <RefreshCw
                  size={15}
                  className="text-stone-500 dark:text-slate-400"
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <StatsBar orders={orders} />

        {/* Search + Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm mb-4 overflow-hidden">
          <div className="px-4 py-3 border-b border-stone-100 dark:border-slate-700 flex items-center gap-3">
            <Search
              size={16}
              className="text-stone-400 dark:text-slate-500 flex-shrink-0"
            />
            <input
              type="text"
              placeholder="Search by order #, table, or item name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 text-sm outline-none text-stone-700 dark:text-slate-100 dark:bg-slate-800 placeholder-stone-300 dark:placeholder-slate-500"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="text-stone-300 dark:text-slate-500 hover:text-stone-500 dark:hover:text-slate-400"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((t) => {
              const cnt =
                t === TAB_ALL
                  ? orders.length
                  : orders.filter((o) => o.status === t).length;
              const hasPending = t === "pending" && cnt > 0;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`flex-shrink-0 px-4 py-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all ${
                    tab === t
                      ? "border-orange-500 text-orange-600 dark:text-orange-400 bg-orange-50/50 dark:bg-orange-950/30"
                      : "border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-300 hover:bg-stone-50 dark:hover:bg-slate-700/40"
                  }`}
                >
                  {t === TAB_ALL ? "All Orders" : S[t]?.label}
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                      tab === t
                        ? "bg-orange-500 text-white"
                        : hasPending
                          ? "bg-amber-500 text-white animate-pulse"
                          : "bg-stone-100 text-stone-500"
                    }`}
                  >
                    {cnt}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-14 bg-stone-50 dark:bg-slate-700 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Receipt
                size={40}
                className="text-stone-200 dark:text-slate-600 mx-auto mb-3"
              />
              <p className="text-stone-500 dark:text-slate-300 font-bold">
                No orders found
              </p>
              <p className="text-stone-400 dark:text-slate-500 text-sm mt-1">
                {search
                  ? "Try a different search term"
                  : "New orders will appear here instantly"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-stone-50 dark:bg-slate-700/50 border-b border-stone-100 dark:border-slate-700">
                    {[
                      "Order #",
                      "Table",
                      "Items",
                      "Persons",
                      "Total",
                      "Status",
                      "Time",
                      "Action",
                    ].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[10px] font-black uppercase tracking-wider text-stone-400 dark:text-slate-400"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((order) => (
                    <tr
                      key={order._id}
                      onClick={() => setSelected(order)}
                      className={`cursor-pointer border-b border-stone-100 dark:border-slate-700 transition-all duration-500 ${
                        order._id === highlightId
                          ? "bg-orange-50 dark:bg-orange-950/30 border-l-4 border-l-orange-500"
                          : newIds.has(order._id)
                            ? "bg-amber-50/60 dark:bg-amber-950/20"
                            : "hover:bg-stone-50/80 dark:hover:bg-slate-700/40"
                      }`}
                    >
                      <OrderRow
                        order={order}
                        isNew={newIds.has(order._id)}
                        isHighlighted={order._id === highlightId}
                        onStatus={handleStatus}
                      />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-xs text-stone-400 dark:text-slate-500 mt-4">
            Showing {filtered.length} of {orders.length} orders · Click any row
            for details
          </p>
        )}
      </div>
    </div>
  );
}
