"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { use } from "react";
import {
  Search,
  Clock,
  MapPin,
  Phone,
  Mail,
  Download,
  X,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ChevronRight,
  ClipboardList,
  ChevronDown,
} from "lucide-react";
import Image from "next/image";
import OrderSuccessModal from "@/components/Ordersuccessmodal";
import CheckoutModal from "@/components/Menuitemmodal";
import HotActions from "@/components/HotActions";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { playNotificationSound } from "@/lib/notificationSounds";

// ═══════════════════════════════════════════════════════════════════════════════
// ACTIVE ORDERS PANEL
// ═══════════════════════════════════════════════════════════════════════════════
const STATUS_COLOR = {
  pending: { bg: "#fff7ed", text: "#c2410c", dot: "#f97316" },
  confirmed: { bg: "#eff6ff", text: "#1d4ed8", dot: "#3b82f6" },
  preparing: { bg: "#fefce8", text: "#a16207", dot: "#eab308" },
  ready: { bg: "#f0fdf4", text: "#15803d", dot: "#22c55e" },
  completed: { bg: "#f9fafb", text: "#4b5563", dot: "#9ca3af" },
  cancelled: { bg: "#fef2f2", text: "#dc2626", dot: "#ef4444" },
};
const STATUS_LABEL = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready: "Ready!",
  completed: "Completed",
  cancelled: "Cancelled",
};

function OrderCard({ order, expanded, onToggle }) {
  const st = STATUS_COLOR[order.status] || STATUS_COLOR.pending;
  const label = STATUS_LABEL[order.status] || order.status;
  const total =
    order.total ??
    order.items?.reduce(
      (s, i) => s + i.price * (i.quantity || i.qty || 1),
      0,
    ) ??
    0;
  const date = order.createdAt
    ? new Date(order.createdAt).toLocaleString([], {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";
  const id = order._id || order.id || "";
  return (
    <div
      className={`mi-order-card ${!["completed", "cancelled"].includes(order.status) ? "mi-order-card--active" : ""}`}
    >
      <button className="mi-order-head" onClick={onToggle}>
        <div className="mi-order-left">
          <div className="mi-order-dot" style={{ background: st.dot }} />
          <div>
            <div className="mi-order-id">
              Order #{String(id).slice(-6).toUpperCase()}
            </div>
            <div className="mi-order-meta">
              {date}
              {order.tableNumber ? ` · Table ${order.tableNumber}` : ""}
            </div>
          </div>
        </div>
        <div className="mi-order-right">
          <span
            className="mi-order-pill"
            style={{ background: st.bg, color: st.text }}
          >
            {label}
          </span>
          <span className="mi-order-total">${Number(total).toFixed(2)}</span>
          <ChevronDown
            size={15}
            className={`mi-order-chev${expanded ? " mi-order-chev--open" : ""}`}
          />
        </div>
      </button>
      {expanded && order.items?.length > 0 && (
        <div className="mi-order-items">
          {order.items.map((item, i) => (
            <div key={i} className="mi-order-item">
              <span className="mi-order-item-qty">
                {item.quantity || item.qty || 1}×
              </span>
              <span className="mi-order-item-name">{item.name}</span>
              <span className="mi-order-item-price">
                $
                {((item.price || 0) * (item.quantity || item.qty || 1)).toFixed(
                  2,
                )}
              </span>
            </div>
          ))}
          {order.notes && (
            <div className="mi-order-notes">Note: {order.notes}</div>
          )}
        </div>
      )}
    </div>
  );
}

function OrdersPanel({ onClose, restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const socketRef = useRef(null);

  const load = useCallback(() => {
    try {
      const all = JSON.parse(localStorage.getItem("mi_orders") || "[]");
      const filtered = all
        .filter((o) => !restaurantId || o.restaurantId === restaurantId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 30);

      console.log(
        `[OrdersPanel] load() called - restaurantId: ${restaurantId}`,
      );
      console.log(`[OrdersPanel] Total orders in localStorage: ${all.length}`);
      console.log(`[OrdersPanel] Filtered for restaurant: ${filtered.length}`);
      console.log(
        `[OrdersPanel] Sample orders:`,
        filtered.slice(0, 2).map((o) => ({
          _id: o._id,
          orderNumber: o.orderNumber,
          status: o.status,
          restaurantId: o.restaurantId,
        })),
      );

      setOrders(filtered);
    } catch (e) {
      console.error(`[OrdersPanel] Error loading orders:`, e);
      setOrders([]);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [load]);

  // ── Socket.IO for real-time order updates ──
  useEffect(() => {
    if (!restaurantId) {
      console.log("[Socket] No restaurantId, skipping socket connection");
      return;
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`[Socket] OrdersPanel initializing socket connection`);
    console.log(`  restaurantId: ${restaurantId}`);
    console.log(`${"=".repeat(60)}`);

    // Use external socket server URL
    const SOCKET_SERVER =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    console.log(`[Socket] Connecting to: ${SOCKET_SERVER}`);

    const socket = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on("connect", () => {
      console.log("[Socket] ✅ Connected to server, socket ID:", socket.id);
      console.log(
        "[Socket] Joining restaurant room: restaurant-" + restaurantId,
      );
      socket.emit("join-restaurant", restaurantId);
    });

    socket.on("joined-restaurant", (data) => {
      console.log("[Socket] ✅ Successfully joined restaurant room:", data);
    });

    // DEBUG: Log all events
    socket.onAny((eventName, ...args) => {
      console.log(`[Socket] 📨 Event received: ${eventName}`, args);
    });

    socket.on("order-updated", (data) => {
      console.log("[Socket] 📨 Received order-updated event:", data);
      const id = data.orderId || data._id;
      const orderNumber =
        data.orderNumber || `Order #${String(id).slice(-6).toUpperCase()}`;

      if (id) {
        try {
          const all = JSON.parse(localStorage.getItem("mi_orders") || "[]");
          console.log(
            "[Socket] Current orders in localStorage before update:",
            all.length,
          );

          const updated = all.map((o) => {
            const orderId = o._id?.toString ? o._id.toString() : String(o._id);
            const eventId = id.toString ? id.toString() : String(id);
            console.log(
              `[Socket] Comparing orderId: ${orderId} with eventId: ${eventId}`,
            );
            if (orderId === eventId) {
              console.log(
                `[Socket] ✅ MATCH FOUND! Updating order ${orderId} to status: ${data.status}`,
              );

              // Show notification based on status
              if (data.status === "confirmed") {
                playNotificationSound("confirmed");
                toast.success("Order Confirmed! 🎉", {
                  description: `${orderNumber} has been confirmed by the restaurant.`,
                  duration: 4000,
                });
              } else if (data.status === "ready") {
                playNotificationSound("ready");
                toast.success("Order Ready! 🚀", {
                  description: `${orderNumber} is ready for pickup!`,
                  duration: 5000,
                });
              } else if (data.status === "preparing") {
                playNotificationSound("preparing");
                toast.info("Order Preparing 👨‍🍳", {
                  description: `${orderNumber} is being prepared.`,
                  duration: 3000,
                });
              }

              return { ...o, status: data.status, updatedAt: data.updatedAt };
            }
            return o;
          });

          console.log(
            "[Socket] Writing updated orders to localStorage:",
            updated.length,
          );
          localStorage.setItem("mi_orders", JSON.stringify(updated));

          // Update React state directly instead of calling load()
          console.log("[Socket] ✅ Updating React state with new orders");
          setOrders((prevOrders) =>
            prevOrders.map((o) => {
              const orderId = o._id?.toString
                ? o._id.toString()
                : String(o._id);
              const eventId = id.toString ? id.toString() : String(id);
              if (orderId === eventId) {
                return { ...o, status: data.status, updatedAt: data.updatedAt };
              }
              return o;
            }),
          );
        } catch (e) {
          console.error("[Socket] ❌ Error updating order:", e);
        }
      } else {
        console.warn("[Socket] ⚠️ No order ID in event data");
      }
    });

    socket.on("disconnect", () => {
      console.log("[Socket] ❌ Disconnected from server");
    });

    socket.on("error", (error) => {
      console.error("[Socket] ❌ Socket error:", error);
    });

    socketRef.current = socket;

    return () => {
      console.log("[Socket] Cleaning up socket connection");
      socket.emit("leave-restaurant", restaurantId);
      socket.disconnect();
    };
  }, [restaurantId]);

  const active = orders.filter(
    (o) => !["completed", "cancelled"].includes(o.status),
  );
  const past = orders.filter((o) =>
    ["completed", "cancelled"].includes(o.status),
  );

  return (
    <>
      <div className="mi-overlay" onClick={onClose} />
      <div className="mi-panel">
        <div className="mi-panel-hdr">
          <div className="mi-panel-hdr-l">
            <ClipboardList size={20} />
            <span>My Orders</span>
            {active.length > 0 && (
              <span className="mi-badge mi-badge--green">
                {active.length} active
              </span>
            )}
          </div>
          <button className="mi-panel-x" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="mi-panel-body">
          {orders.length === 0 ? (
            <div className="mi-panel-empty">
              <div style={{ fontSize: "3.5rem" }}>📋</div>
              <p className="mi-panel-empty-t">No orders yet</p>
              <p className="mi-panel-empty-s">
                Your placed orders will appear here
              </p>
            </div>
          ) : (
            <>
              {active.length > 0 && (
                <div className="mi-orders-grp">
                  <div className="mi-orders-grp-lbl">Active Orders</div>
                  {active.map((o) => (
                    <OrderCard
                      key={o._id || o.id}
                      order={o}
                      expanded={expanded === (o._id || o.id)}
                      onToggle={() =>
                        setExpanded((p) =>
                          p === (o._id || o.id) ? null : o._id || o.id,
                        )
                      }
                    />
                  ))}
                </div>
              )}
              {past.length > 0 && (
                <div className="mi-orders-grp">
                  <div className="mi-orders-grp-lbl">Past Orders</div>
                  {past.map((o) => (
                    <OrderCard
                      key={o._id || o.id}
                      order={o}
                      expanded={expanded === (o._id || o.id)}
                      onToggle={() =>
                        setExpanded((p) =>
                          p === (o._id || o.id) ? null : o._id || o.id,
                        )
                      }
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// CART SIDEBAR
// ═══════════════════════════════════════════════════════════════════════════════
function CartSidebar({
  cart,
  onClose,
  onUpdateQty,
  onRemove,
  onProceedToCheckout,
}) {
  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const itemCount = cart.reduce((s, i) => s + i.qty, 0);
  return (
    <>
      <div className="mi-overlay" onClick={onClose} />
      <div className="mi-panel">
        <div className="mi-panel-hdr">
          <div className="mi-panel-hdr-l">
            <ShoppingCart size={20} />
            <span>Your Order</span>
            <span className="mi-badge">{itemCount}</span>
          </div>
          <button className="mi-panel-x" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="mi-panel-body">
          {cart.length === 0 ? (
            <div className="mi-panel-empty">
              <div style={{ fontSize: "3.5rem" }}>🛒</div>
              <p className="mi-panel-empty-t">Your cart is empty</p>
              <p className="mi-panel-empty-s">Add some delicious items!</p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item._id} className="mi-cart-item">
                <div className="mi-cart-item-img">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span>🍽️</span>
                  )}
                </div>
                <div className="mi-cart-item-info">
                  <p className="mi-cart-item-name">{item.name}</p>
                  <p className="mi-cart-item-unit">
                    ${Number(item.price).toFixed(2)} each
                  </p>
                  <p className="mi-cart-item-total">
                    ${(item.price * item.qty).toFixed(2)}
                  </p>
                </div>
                <div className="mi-cart-item-actions">
                  <button
                    className="mi-cart-del"
                    onClick={() => onRemove(item._id)}
                  >
                    <Trash2 size={14} />
                  </button>
                  <div className="mi-qty-ctrl">
                    <button onClick={() => onUpdateQty(item._id, item.qty - 1)}>
                      <Minus size={13} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item._id, item.qty + 1)}>
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="mi-cart-footer">
            <div className="mi-cart-subtotal">
              <span>
                Subtotal ({itemCount} item{itemCount !== 1 ? "s" : ""})
              </span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="mi-cart-tax">+ service fee & tax at checkout</p>
            <button className="mi-checkout-btn" onClick={onProceedToCheckout}>
              Proceed to Checkout <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// FOOD CARD
// ═══════════════════════════════════════════════════════════════════════════════
function AddToCartButton({ food, onAdd, isFlashing }) {
  const lastRef = useRef(0);
  function go(e) {
    e.preventDefault();
    e.stopPropagation();
    const now = Date.now();
    if (now - lastRef.current < 300) return;
    lastRef.current = now;
    onAdd(food);
  }
  return (
    <button
      type="button"
      onClick={go}
      className={`mi-add-btn${isFlashing ? " mi-add-btn--flash" : ""}`}
      aria-label={`Add ${food.name}`}
    >
      <Plus size={18} strokeWidth={2.5} />
    </button>
  );
}

function FoodCard({ food, cart, onAdd, onUpdateQty, flashItem }) {
  const cartItem = cart.find((i) => i._id === food._id);
  const inCart = !!cartItem;
  return (
    <div className={`mi-food-card${inCart ? " mi-food-card--in" : ""}`}>
      <div className="mi-food-img-wrap">
        {food.image ? (
          <img src={food.image} alt={food.name} className="mi-food-img" />
        ) : (
          <div className="mi-food-img-ph">
            <span>🍽️</span>
          </div>
        )}
        {inCart && (
          <div className="mi-food-in-badge">
            <ShoppingCart size={10} /> {cartItem.qty}
          </div>
        )}
      </div>
      <div className="mi-food-body">
        <h3 className="mi-food-name">{food.name}</h3>
        {food.description && <p className="mi-food-desc">{food.description}</p>}
        <div className="mi-food-footer">
          <span className="mi-food-price">
            {food.price != null ? `$${Number(food.price).toFixed(2)}` : ""}
          </span>
          {inCart ? (
            <div className="mi-qty-ctrl mi-qty-ctrl--sm">
              <button onClick={() => onUpdateQty(food._id, cartItem.qty - 1)}>
                <Minus size={12} />
              </button>
              <span>{cartItem.qty}</span>
              <button onClick={() => onUpdateQty(food._id, cartItem.qty + 1)}>
                <Plus size={12} />
              </button>
            </div>
          ) : (
            <AddToCartButton
              food={food}
              onAdd={onAdd}
              isFlashing={flashItem === food._id}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BOTTOM NAV — Floating glass pill
// ═══════════════════════════════════════════════════════════════════════════════
function BottomNav({
  cartCount,
  activeOrderCount,
  onOrdersClick,
  onCartClick,
}) {
  return (
    <nav className="mi-bnav">
      {/* LEFT — Orders */}
      <button className="mi-bnav-btn" onClick={onOrdersClick}>
        <div className="mi-bnav-icon-wrap">
          <div className="mi-bnav-icon">
            <ClipboardList size={21} strokeWidth={1.8} />
          </div>
          {activeOrderCount > 0 && (
            <span className="mi-bnav-badge mi-bnav-badge--green">
              {activeOrderCount}
            </span>
          )}
        </div>
        <span className="mi-bnav-lbl">Orders</span>
      </button>

      {/* CENTER — HotActions FAB floats here via CSS */}
      <div className="mi-bnav-center" aria-hidden="true" />

      {/* RIGHT — Cart */}
      <button className="mi-bnav-btn" onClick={onCartClick}>
        <div className="mi-bnav-icon-wrap">
          <div className="mi-bnav-icon">
            <ShoppingCart size={21} strokeWidth={1.8} />
          </div>
          {cartCount > 0 && (
            <span
              key={cartCount}
              className="mi-bnav-badge"
              style={{
                animation: "miBadgePop 0.35s cubic-bezier(.22,1,.36,1)",
              }}
            >
              {cartCount}
            </span>
          )}
        </div>
        <span className="mi-bnav-lbl">Cart</span>
      </button>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════════════════════
export default function PublicMenuPage({ params }) {
  const { slug } = use(params);
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [heroImage, setHeroImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showQRCode, setShowQRCode] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [flashItem, setFlashItem] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [activeOrderCount, setActiveOrderCount] = useState(0);
  const flashRef = useRef(null);

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

  const refreshOrders = useCallback((rid) => {
    try {
      const all = JSON.parse(localStorage.getItem("mi_orders") || "[]");
      setActiveOrderCount(
        all.filter(
          (o) =>
            (!rid || o.restaurantId === rid) &&
            !["completed", "cancelled"].includes(o.status),
        ).length,
      );
    } catch {
      setActiveOrderCount(0);
    }
  }, []);

  useEffect(() => {
    if (restaurant?._id) {
      refreshOrders(restaurant._id);
      const iv = setInterval(() => refreshOrders(restaurant._id), 8000);
      return () => clearInterval(iv);
    }
  }, [restaurant?._id, refreshOrders]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  function addToCart(food) {
    setCart((prev) => {
      const ex = prev.find((i) => i._id === food._id);
      if (ex)
        return prev.map((i) =>
          i._id === food._id ? { ...i, qty: i.qty + 1 } : i,
        );
      return [...prev, { ...food, qty: 1 }];
    });
    if (flashRef.current) clearTimeout(flashRef.current);
    setFlashItem(food._id);
    flashRef.current = setTimeout(() => setFlashItem(null), 700);
  }
  function updateQty(id, qty) {
    if (qty < 1) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((i) => (i._id === id ? { ...i, qty } : i)));
  }
  function removeFromCart(id) {
    setCart((prev) => prev.filter((i) => i._id !== id));
  }
  function handleProceedToCheckout() {
    setCartOpen(false);
    setCheckoutOpen(true);
  }

  function handleOrderSuccess(order) {
    try {
      const all = JSON.parse(localStorage.getItem("mi_orders") || "[]");
      const newO = {
        ...order,
        restaurantId: restaurant?._id,
        createdAt: order.createdAt || new Date().toISOString(),
        status: order.status || "pending",
      };
      const updated = [
        newO,
        ...all.filter((o) => (o._id || o.id) !== (newO._id || newO.id)),
      ].slice(0, 50);
      localStorage.setItem("mi_orders", JSON.stringify(updated));
      refreshOrders(restaurant?._id);
    } catch {}
    setCart([]);
    setCheckoutOpen(false);
    setCartOpen(false);
    setOrderSuccess(order);
  }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(`/api/public/restaurants/${slug}`);
        if (!r.ok) throw new Error("Restaurant not found");
        const d = await r.json();
        setRestaurant(d);
        const cr = await fetch(`/api/restaurants/${d._id}/categories`);
        if (!cr.ok) {
          setCategories([]);
          setFoods({});
          return;
        }
        const cd = await cr.json();
        setCategories(cd);
        const fm = {};
        await Promise.all(
          cd.map(async (cat) => {
            try {
              const fr = await fetch(
                `/api/restaurants/${d._id}/categories/${cat._id}/foods`,
              );
              fm[cat._id] = fr.ok
                ? (await fr.json()).filter((f) => f.isAvailable)
                : [];
            } catch {
              fm[cat._id] = [];
            }
          }),
        );
        setFoods(fm);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    if (slug) load();
  }, [slug]);

  useEffect(() => {
    async function loadHero() {
      if (!restaurant?._id) return;
      try {
        const r = await fetch(`/api/restaurants/${restaurant._id}/hero-image`);
        if (r.ok) {
          const d = await r.json();
          if (d.heroImage) setHeroImage(d.heroImage);
        }
      } catch {}
    }
    loadHero();
  }, [restaurant?._id]);

  const filteredCats = () =>
    categories.filter((cat) => {
      const cf = foods[cat._id] || [];
      if (selectedCategory !== "all" && cat._id !== selectedCategory)
        return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return (
          cat.name.toLowerCase().includes(q) ||
          cf.some((f) => f.name.toLowerCase().includes(q))
        );
      }
      return cf.length > 0;
    });
  const filteredFoods = (catId) => {
    const cf = foods[catId] || [];
    if (!searchQuery) return cf;
    const q = searchQuery.toLowerCase();
    return cf.filter((f) => f.name.toLowerCase().includes(q));
  };

  const downloadQR = () => {
    if (restaurant?.qrCodeBase64) {
      const a = document.createElement("a");
      a.href = restaurant.qrCodeBase64;
      a.download = `${restaurant.name}-qr.png`;
      a.click();
    }
  };

  if (loading)
    return (
      <div className="mi-loading">
        <div className="mi-spinner" />
        <p>Loading menu…</p>
      </div>
    );
  if (error || !restaurant)
    return (
      <div className="mi-error">
        <div style={{ fontSize: "4rem" }}>🍽️</div>
        <h1>Restaurant Not Found</h1>
        <p>{error || "The restaurant you're looking for doesn't exist."}</p>
      </div>
    );

  const checkoutCart = cart.map((i) => ({
    ...i,
    quantity: i.qty,
    cartId: i._id,
  }));

  return (
    <div className="mi-root">
      {/* Modals */}
      {orderSuccess && (
        <OrderSuccessModal
          order={orderSuccess}
          onClose={() => setOrderSuccess(null)}
        />
      )}
      {checkoutOpen && cart.length > 0 && (
        <CheckoutModal
          food={cart[0]}
          initialCart={checkoutCart}
          categoryName={null}
          restaurantId={restaurant._id}
          onClose={() => setCheckoutOpen(false)}
          onOrderSuccess={handleOrderSuccess}
        />
      )}
      {cartOpen && (
        <CartSidebar
          cart={cart}
          onClose={() => setCartOpen(false)}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onProceedToCheckout={handleProceedToCheckout}
        />
      )}
      {ordersOpen && (
        <OrdersPanel
          onClose={() => setOrdersOpen(false)}
          restaurantId={restaurant._id}
        />
      )}

      {/* ── HERO ── */}
      <section className="mi-hero">
        <div className="mi-hero-bg">
          <Image
            src={heroImage || "/restaurant-interior.jpg"}
            alt={restaurant.name}
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center" }}
          />
        </div>
        <div className="mi-hero-ov" />
        <nav className={`mi-nav${scrolled ? " mi-nav--sc" : ""}`}>
          <div className="mi-nav-inner">
            <div className="mi-nav-logo">
              <div className="mi-nav-logo-icon">🍽️</div>
              <span>MALLINSIGHT</span>
            </div>
            <div className="mi-nav-links">
              <a href="#menu" className="mi-nav-link">
                Menu
              </a>
              <a href="#info" className="mi-nav-link">
                Info
              </a>
              <button
                className="mi-nav-link"
                onClick={() => setShowQRCode(true)}
              >
                Share
              </button>
            </div>
            <div className="mi-nav-r">
              <button
                className="mi-nav-share"
                onClick={() => setShowQRCode(true)}
              >
                Share
              </button>
              <button className="mi-nav-cart" onClick={() => setCartOpen(true)}>
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span
                    key={cartCount}
                    className="mi-nav-cart-n"
                    style={{ animation: "miPopIn 0.3s ease-out" }}
                  >
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>
        <div className="mi-hero-content">
          {restaurant.category && (
            <div className="mi-hero-tag">{restaurant.category} Cuisine</div>
          )}
          <h1 className="mi-hero-title">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="mi-hero-desc">{restaurant.description}</p>
          )}
          <div className="mi-hero-meta">
            {restaurant.mallName && (
              <span className="mi-hero-meta-i">
                <MapPin size={15} />
                {restaurant.mallName}
              </span>
            )}
            {restaurant.hours && (
              <span className="mi-hero-meta-i">
                <Clock size={15} />
                {restaurant.hours}
              </span>
            )}
          </div>
          <a href="#menu" className="mi-hero-cta">
            View Menu <ChevronRight size={18} />
          </a>
        </div>
        <div id="info" className="mi-hero-strip">
          <div className="mi-hero-strip-inner">
            {restaurant.address && (
              <span className="mi-info-i">
                <MapPin size={14} />
                {restaurant.address}
              </span>
            )}
            {restaurant.phone && (
              <span className="mi-info-i">
                <Phone size={14} />
                {restaurant.phone}
              </span>
            )}
            {restaurant.email && (
              <span className="mi-info-i">
                <Mail size={14} />
                {restaurant.email}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="mi-filter" id="menu">
        <div className="mi-filter-inner">
          <div className="mi-search-row">
            <div className="mi-search-wrap">
              <Search size={18} className="mi-search-ic" />
              <input
                type="text"
                placeholder="Search dishes…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mi-search-input"
              />
              {searchQuery && (
                <button
                  className="mi-search-clr"
                  onClick={() => setSearchQuery("")}
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <button className="mi-fcart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={18} />
              {cartCount > 0 ? (
                <span className="mi-fcart-n">{cartCount}</span>
              ) : (
                <span className="mi-fcart-lbl">Cart</span>
              )}
            </button>
          </div>
          {!searchQuery && categories.length > 1 && (
            <div className="mi-cats">
              <button
                className={`mi-cat${selectedCategory === "all" ? " mi-cat--on" : ""}`}
                onClick={() => setSelectedCategory("all")}
              >
                All
              </button>
              {categories.map((c) => (
                <button
                  key={c._id}
                  className={`mi-cat${selectedCategory === c._id ? " mi-cat--on" : ""}`}
                  onClick={() => setSelectedCategory(c._id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── MENU GRID ── */}
      <main className="mi-main">
        {filteredCats().length === 0 ? (
          <div className="mi-empty">
            <div style={{ fontSize: "3.5rem" }}>🔍</div>
            <h3>No items found</h3>
            <p>Try adjusting your search or browse all categories</p>
          </div>
        ) : (
          <div className="mi-sections">
            {filteredCats().map((cat) => {
              const cf = filteredFoods(cat._id);
              if (!cf.length) return null;
              return (
                <section key={cat._id} id={cat._id} className="mi-section">
                  <div className="mi-section-hdr">
                    <h2 className="mi-section-title">{cat.name}</h2>
                    {cat.description && (
                      <p className="mi-section-desc">{cat.description}</p>
                    )}
                  </div>
                  <div className="mi-grid">
                    {cf.map((food) => (
                      <FoodCard
                        key={food._id}
                        food={food}
                        cart={cart}
                        onAdd={addToCart}
                        onUpdateQty={updateQty}
                        flashItem={flashItem}
                      />
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* ── QR MODAL ── */}
      {showQRCode && (
        <div className="mi-overlay" onClick={() => setShowQRCode(false)}>
          <div className="mi-qr-modal" onClick={(e) => e.stopPropagation()}>
            <div className="mi-qr-hdr">
              <h2>Share {restaurant.name}</h2>
              <button onClick={() => setShowQRCode(false)}>
                <X size={22} />
              </button>
            </div>
            {restaurant?.qrCodeBase64 ? (
              <img
                src={restaurant.qrCodeBase64}
                alt="QR"
                className="mi-qr-img"
              />
            ) : (
              <div className="mi-qr-ph">QR Code not available</div>
            )}
            {restaurant?.qrCodeBase64 && (
              <button className="mi-qr-dl" onClick={downloadQR}>
                <Download size={18} /> Download QR Code
              </button>
            )}
            <button className="mi-qr-cl" onClick={() => setShowQRCode(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── BOTTOM NAV ── */}
      <BottomNav
        cartCount={cartCount}
        activeOrderCount={activeOrderCount}
        onOrdersClick={() => setOrdersOpen(true)}
        onCartClick={() => setCartOpen(true)}
      />

      {/* ── HOT ACTIONS ── */}
      {restaurant && (
        <HotActions
          restaurantId={restaurant._id}
          tableNumber={""}
          totalTables={restaurant.tablesCount || 20}
        />
      )}

      {/* Footer */}
      <footer className="mi-footer">
        <div className="mi-footer-logo">
          <div className="mi-footer-logo-ic">🍽️</div>
          <span>MALLINSIGHT</span>
        </div>
        <p style={{ fontSize: "0.8rem" }}>Powered by Digital Menu System</p>
        <p style={{ fontSize: "0.72rem" }}>© 2026 All rights reserved</p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600&display=swap');

        :root{
          --pri:#e05a2b; --pri-d:#c44a1e; --pri-l:rgba(224,90,43,0.1);
          --ink:#1a1510; --ink2:#3d3530; --muted:#7a726a;
          --bg:#faf7f4; --white:#ffffff;
          --border:rgba(0,0,0,0.08); --border2:rgba(0,0,0,0.14);
          --sh-sm:0 1px 4px rgba(0,0,0,0.07);
          --sh-md:0 4px 16px rgba(0,0,0,0.1);
          --sh-lg:0 8px 32px rgba(0,0,0,0.14);
          --r:14px;
          /* pill height (64) + bottom offset (16) + gap (16) = 96 */
          --bnav-h:96px;
          --FD:'Playfair Display',serif; --FB:'DM Sans',sans-serif;
        }
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}

        .mi-root{
          min-height:100vh;background:var(--bg);
          font-family:var(--FB);color:var(--ink);
          padding-bottom:calc(var(--bnav-h) + env(safe-area-inset-bottom,0px));
        }

        /* LOADING/ERROR */
        .mi-loading,.mi-error{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1rem;background:var(--bg);font-family:var(--FB);color:var(--muted)}
        .mi-spinner{width:48px;height:48px;border-radius:50%;border:3px solid var(--border2);border-top-color:var(--pri);animation:miSpin 0.8s linear infinite}
        @keyframes miSpin{to{transform:rotate(360deg)}}
        .mi-error h1{font-size:1.5rem;font-weight:700;color:var(--ink)}

        /* ═══ HERO ═══════════════════════════════════════════════════ */
        .mi-hero{position:relative;height:100svh;min-height:560px;max-height:860px;display:flex;flex-direction:column;overflow:hidden}
        .mi-hero-bg{position:absolute;inset:0;z-index:0}
        .mi-hero-ov{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(10,6,2,0.72) 0%,rgba(10,6,2,0.08) 38%,rgba(10,6,2,0.08) 52%,rgba(10,6,2,0.75) 78%,rgba(10,6,2,0.90) 100%)}

        /* NAV */
        .mi-nav{position:fixed;top:0;left:0;right:0;z-index:200;transition:background 0.35s,box-shadow 0.35s}
        .mi-nav--sc{background:rgba(20,12,6,0.92);backdrop-filter:blur(18px);box-shadow:0 1px 0 rgba(255,255,255,0.06)}
        .mi-nav-inner{max-width:1400px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:68px;gap:1.5rem}
        .mi-nav-logo{display:flex;align-items:center;gap:10px;font-family:var(--FD);font-size:1.15rem;font-weight:900;color:#fff;white-space:nowrap;flex-shrink:0}
        .mi-nav-logo-icon{width:36px;height:36px;background:var(--pri);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:1.1rem}
        .mi-nav-links{display:flex;gap:2rem}
        .mi-nav-link{font-size:0.82rem;font-weight:600;color:rgba(255,255,255,0.75);text-decoration:none;background:none;border:none;cursor:pointer;letter-spacing:0.08em;text-transform:uppercase;transition:color 0.2s}
        .mi-nav-link:hover{color:#fff}
        .mi-nav-r{display:flex;align-items:center;gap:10px;flex-shrink:0}
        .mi-nav-share{display:none;padding:0.42rem 1.1rem;background:rgba(255,255,255,0.12);border:1px solid rgba(255,255,255,0.22);border-radius:100px;color:#fff;font-size:0.78rem;font-weight:600;cursor:pointer;transition:background 0.2s}
        .mi-nav-share:hover{background:rgba(255,255,255,0.22)}
        .mi-nav-cart{position:relative;width:44px;height:44px;border-radius:12px;background:var(--pri);border:none;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.2s}
        .mi-nav-cart:hover{background:var(--pri-d)}
        .mi-nav-cart-n{position:absolute;top:-6px;right:-6px;min-width:20px;height:20px;border-radius:10px;background:#fff;color:var(--pri);font-size:0.68rem;font-weight:800;display:flex;align-items:center;justify-content:center;padding:0 4px;box-shadow:0 2px 6px rgba(0,0,0,0.2)}

        /* Hero content */
        .mi-hero-content{position:relative;z-index:2;flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:100px 24px 80px;max-width:780px;margin:0 auto;width:100%}
        .mi-hero-tag{display:inline-block;background:var(--pri);color:#fff;font-size:0.7rem;font-weight:700;letter-spacing:0.15em;text-transform:uppercase;padding:0.32rem 0.9rem;border-radius:100px;margin-bottom:1.2rem}
        .mi-hero-title{font-family:var(--FD);font-size:clamp(2.8rem,7vw,5.5rem);font-weight:900;color:#fff;line-height:1.0;margin-bottom:1rem;letter-spacing:-0.02em;text-shadow:0 2px 24px rgba(0,0,0,0.4)}
        .mi-hero-desc{font-size:clamp(0.95rem,2vw,1.15rem);color:rgba(255,255,255,0.78);max-width:520px;line-height:1.65;margin-bottom:1.4rem}
        .mi-hero-meta{display:flex;flex-wrap:wrap;gap:1rem;justify-content:center;margin-bottom:2rem}
        .mi-hero-meta-i{display:flex;align-items:center;gap:6px;font-size:0.82rem;color:rgba(255,255,255,0.7)}
        .mi-hero-cta{display:inline-flex;align-items:center;gap:6px;background:var(--pri);color:#fff;padding:0.85rem 2rem;border-radius:100px;font-size:0.9rem;font-weight:700;text-decoration:none;transition:background 0.2s,transform 0.2s,box-shadow 0.2s;box-shadow:0 4px 20px rgba(224,90,43,0.45)}
        .mi-hero-cta:hover{background:var(--pri-d);transform:translateY(-2px)}

        /* info strip */
        .mi-hero-strip{position:relative;z-index:2;background:rgba(10,6,2,0.75);backdrop-filter:blur(12px);border-top:1px solid rgba(255,255,255,0.1)}
        .mi-hero-strip-inner{max-width:1400px;margin:0 auto;padding:0.85rem 24px;display:flex;flex-wrap:wrap;gap:1.5rem;justify-content:center}
        .mi-info-i{display:flex;align-items:center;gap:6px;font-size:0.8rem;color:rgba(255,255,255,0.65)}

        /* ═══ FILTER BAR ════════════════════════════════════════════ */
        .mi-filter{position:sticky;top:0;z-index:100;background:var(--white);border-bottom:1px solid var(--border);box-shadow:var(--sh-sm)}
        .mi-filter-inner{max-width:1400px;margin:0 auto;padding:12px 24px;display:flex;flex-direction:column;gap:10px}
        .mi-search-row{display:flex;gap:10px;align-items:center}
        .mi-search-wrap{position:relative;flex:1}
        .mi-search-ic{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--muted);pointer-events:none}
        .mi-search-input{width:100%;padding:0.65rem 2.5rem 0.65rem 2.6rem;border:1.5px solid var(--border2);border-radius:100px;font-size:0.88rem;font-family:var(--FB);background:var(--bg);color:var(--ink);outline:none;transition:border-color 0.2s}
        .mi-search-input:focus{border-color:var(--pri)}
        .mi-search-clr{position:absolute;right:12px;top:50%;transform:translateY(-50%);background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center}
        .mi-fcart-btn{display:flex;align-items:center;gap:8px;padding:0.65rem 1.1rem;background:var(--pri);color:#fff;border:none;border-radius:100px;font-size:0.82rem;font-weight:600;cursor:pointer;transition:background 0.2s;white-space:nowrap;flex-shrink:0}
        .mi-fcart-btn:hover{background:var(--pri-d)}
        .mi-fcart-n{background:#fff;color:var(--pri);width:20px;height:20px;border-radius:50%;font-size:0.7rem;font-weight:800;display:flex;align-items:center;justify-content:center}
        .mi-fcart-lbl{font-size:0.82rem}
        .mi-cats{display:flex;gap:8px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px}
        .mi-cats::-webkit-scrollbar{display:none}
        .mi-cat{padding:0.38rem 1rem;border-radius:100px;border:1.5px solid var(--border2);font-size:0.78rem;font-weight:600;white-space:nowrap;background:transparent;color:var(--ink2);cursor:pointer;transition:all 0.18s;flex-shrink:0}
        .mi-cat:hover{border-color:var(--pri);color:var(--pri)}
        .mi-cat--on{background:var(--pri);border-color:var(--pri);color:#fff}

        /* ═══ MENU MAIN ═════════════════════════════════════════════ */
        .mi-main{max-width:1400px;margin:0 auto;padding:40px 24px 40px}
        .mi-empty{text-align:center;padding:80px 0;display:flex;flex-direction:column;align-items:center;gap:1rem}
        .mi-empty h3{font-size:1.4rem;font-weight:700;color:var(--ink)}
        .mi-empty p{color:var(--muted)}
        .mi-sections{display:flex;flex-direction:column;gap:52px}
        .mi-section-hdr{margin-bottom:24px}
        .mi-section-title{font-family:var(--FD);font-size:clamp(1.6rem,3vw,2.2rem);font-weight:900;color:var(--ink);display:inline-block;position:relative;padding-bottom:8px}
        .mi-section-title::after{content:'';position:absolute;bottom:0;left:0;width:100%;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--pri),transparent)}
        .mi-section-desc{margin-top:8px;color:var(--muted);font-size:0.9rem;line-height:1.5}

        /* 4-col grid */
        .mi-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
        @media(max-width:1100px){.mi-grid{grid-template-columns:repeat(3,1fr)}}
        @media(max-width:760px){.mi-grid{grid-template-columns:repeat(2,1fr);gap:14px}}
        @media(max-width:480px){.mi-grid{grid-template-columns:1fr;gap:12px}}

        /* Food card */
        .mi-food-card{background:var(--white);border-radius:var(--r);border:1.5px solid var(--border);overflow:hidden;transition:transform 0.22s,box-shadow 0.22s,border-color 0.22s;display:flex;flex-direction:column}
        .mi-food-card:hover{transform:translateY(-4px);box-shadow:var(--sh-lg);border-color:rgba(224,90,43,0.25)}
        .mi-food-card--in{border-color:rgba(224,90,43,0.4)}
        .mi-food-img-wrap{position:relative;width:100%;aspect-ratio:4/3;background:#f0ece8;overflow:hidden;flex-shrink:0}
        .mi-food-img{width:100%;height:100%;object-fit:cover;transition:transform 0.35s}
        .mi-food-card:hover .mi-food-img{transform:scale(1.06)}
        .mi-food-img-ph{width:100%;height:100%;background:linear-gradient(135deg,#f5ede4,#fce8d8);display:flex;align-items:center;justify-content:center;font-size:2.5rem}
        .mi-food-in-badge{position:absolute;top:8px;right:8px;background:var(--pri);color:#fff;font-size:0.65rem;font-weight:700;border-radius:100px;padding:3px 8px;display:flex;align-items:center;gap:4px}
        .mi-food-body{padding:14px 14px 12px;flex:1;display:flex;flex-direction:column;gap:6px}
        .mi-food-name{font-size:0.95rem;font-weight:700;color:var(--ink);line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
        .mi-food-desc{font-size:0.76rem;color:var(--muted);line-height:1.45;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;flex:1}
        .mi-food-footer{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:auto;padding-top:8px;border-top:1px solid var(--border)}
        .mi-food-price{font-size:1.05rem;font-weight:800;color:var(--pri)}

        .mi-add-btn{width:36px;height:36px;border-radius:50%;border:none;background:var(--pri);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.18s,transform 0.15s;flex-shrink:0}
        .mi-add-btn:hover{background:var(--pri-d);transform:scale(1.1)}
        .mi-add-btn--flash{background:#22c55e;animation:miPopIn 0.35s ease-out}

        .mi-qty-ctrl{display:flex;align-items:center;gap:6px;background:var(--pri-l);border:1.5px solid rgba(224,90,43,0.25);border-radius:100px;padding:4px 8px}
        .mi-qty-ctrl button{width:26px;height:26px;border-radius:50%;border:none;background:var(--pri);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:background 0.18s}
        .mi-qty-ctrl button:hover{background:var(--pri-d)}
        .mi-qty-ctrl span{font-size:0.82rem;font-weight:700;color:var(--pri);min-width:18px;text-align:center}
        .mi-qty-ctrl--sm button{width:24px;height:24px}

        /* ═══ SHARED PANEL ══════════════════════════════════════════ */
        .mi-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:400;backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center}
        .mi-panel{position:fixed;right:0;top:0;height:100%;width:100%;max-width:440px;background:var(--white);z-index:500;display:flex;flex-direction:column;box-shadow:-8px 0 40px rgba(0,0,0,0.18);animation:miSlideIn 0.32s cubic-bezier(0.32,0.72,0,1)}
        @keyframes miSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}
        .mi-panel-hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 20px;background:var(--pri);flex-shrink:0}
        .mi-panel-hdr-l{display:flex;align-items:center;gap:10px;color:#fff;font-size:1rem;font-weight:700}
        .mi-badge{background:#fff;color:var(--pri);font-size:0.75rem;font-weight:800;padding:2px 8px;border-radius:100px}
        .mi-badge--green{background:#22c55e;color:#fff}
        .mi-panel-x{background:rgba(255,255,255,0.15);border:none;color:#fff;width:36px;height:36px;border-radius:10px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background 0.2s}
        .mi-panel-x:hover{background:rgba(255,255,255,0.25)}
        .mi-panel-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:10px}
        .mi-panel-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:8px;padding:40px}
        .mi-panel-empty-t{font-size:1.1rem;font-weight:700;color:var(--ink)}
        .mi-panel-empty-s{font-size:0.85rem;color:var(--muted)}

        /* Cart items */
        .mi-cart-item{display:flex;gap:12px;background:var(--bg);border-radius:12px;padding:12px;border:1px solid var(--border)}
        .mi-cart-item-img{width:60px;height:60px;border-radius:10px;overflow:hidden;flex-shrink:0;background:#f0ece8;display:flex;align-items:center;justify-content:center;font-size:1.5rem}
        .mi-cart-item-img img{width:100%;height:100%;object-fit:cover}
        .mi-cart-item-info{flex:1;min-width:0;display:flex;flex-direction:column;gap:3px}
        .mi-cart-item-name{font-size:0.88rem;font-weight:600;color:var(--ink)}
        .mi-cart-item-unit{font-size:0.72rem;color:var(--muted)}
        .mi-cart-item-total{font-size:0.92rem;font-weight:700;color:var(--pri)}
        .mi-cart-item-actions{display:flex;flex-direction:column;align-items:flex-end;justify-content:space-between}
        .mi-cart-del{background:none;border:none;cursor:pointer;color:var(--muted);padding:4px;transition:color 0.2s}
        .mi-cart-del:hover{color:#ef4444}
        .mi-cart-footer{padding:16px 20px;border-top:1px solid var(--border);background:var(--bg);display:flex;flex-direction:column;gap:10px}
        .mi-cart-subtotal{display:flex;justify-content:space-between;font-size:0.9rem;font-weight:600;color:var(--ink2)}
        .mi-cart-tax{font-size:0.72rem;color:var(--muted)}
        .mi-checkout-btn{display:flex;align-items:center;justify-content:center;gap:8px;padding:1rem;background:var(--pri);color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:700;cursor:pointer;transition:background 0.2s,transform 0.15s;box-shadow:0 4px 16px rgba(224,90,43,0.35)}
        .mi-checkout-btn:hover{background:var(--pri-d);transform:translateY(-1px)}
        .mi-checkout-btn:active{transform:scale(0.98)}

        /* Order cards */
        .mi-orders-grp{display:flex;flex-direction:column;gap:8px}
        .mi-orders-grp-lbl{font-size:0.7rem;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:var(--muted);padding:0 2px;margin-bottom:2px}
        .mi-order-card{border:1.5px solid var(--border);border-radius:12px;overflow:hidden;background:var(--white);transition:border-color 0.2s}
        .mi-order-card--active{border-color:rgba(224,90,43,0.3)}
        .mi-order-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;background:none;border:none;cursor:pointer;text-align:left;transition:background 0.15s}
        .mi-order-head:hover{background:var(--bg)}
        .mi-order-left{display:flex;align-items:center;gap:10px;flex:1;min-width:0}
        .mi-order-dot{width:10px;height:10px;border-radius:50%;flex-shrink:0}
        .mi-order-id{font-size:0.88rem;font-weight:700;color:var(--ink)}
        .mi-order-meta{font-size:0.72rem;color:var(--muted);margin-top:2px}
        .mi-order-right{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .mi-order-pill{font-size:0.68rem;font-weight:700;padding:3px 8px;border-radius:100px;white-space:nowrap}
        .mi-order-total{font-size:0.88rem;font-weight:700;color:var(--ink)}
        .mi-order-chev{color:var(--muted);transition:transform 0.25s}
        .mi-order-chev--open{transform:rotate(180deg)}
        .mi-order-items{border-top:1px solid var(--border);padding:10px 14px;display:flex;flex-direction:column;gap:6px;background:var(--bg)}
        .mi-order-item{display:flex;align-items:center;gap:8px;font-size:0.82rem}
        .mi-order-item-qty{font-weight:700;color:var(--pri);min-width:20px}
        .mi-order-item-name{flex:1;color:var(--ink2)}
        .mi-order-item-price{font-weight:600;color:var(--ink)}
        .mi-order-notes{font-size:0.75rem;color:var(--muted);font-style:italic;padding-top:4px}

        /* ═══ BOTTOM NAV — Floating glass pill ══════════════════════ */
        .mi-bnav{
          position:fixed;
          bottom:16px;
          left:50%;transform:translateX(-50%);
          z-index:300;
          height:64px;
          width:calc(100% - 32px);
          max-width:420px;
          background:rgba(255,255,255,0.94);
          backdrop-filter:blur(20px);
          -webkit-backdrop-filter:blur(20px);
          border:1px solid rgba(0,0,0,0.07);
          border-radius:24px;
          box-shadow:
            0 8px 32px rgba(0,0,0,0.13),
            0 2px 8px rgba(0,0,0,0.07),
            inset 0 1px 0 rgba(255,255,255,0.95);
          display:grid;
          grid-template-columns:1fr 72px 1fr;
          align-items:stretch;
          overflow:visible;
          padding:0 4px;
          padding-bottom:env(safe-area-inset-bottom,0px);
        }

        .mi-bnav-btn{
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          gap:3px;background:none;border:none;cursor:pointer;
          color:#7a726a;transition:color .2s ease;
          padding:0 8px;border-radius:20px;
        }
        .mi-bnav-btn:hover{color:var(--pri)}
        .mi-bnav-btn:active{transform:scale(0.94)}

        .mi-bnav-icon-wrap{
          position:relative;display:flex;align-items:center;justify-content:center;
          width:38px;height:32px;
        }
        .mi-bnav-icon{
          display:flex;align-items:center;justify-content:center;
          transition:transform .2s cubic-bezier(.22,1,.36,1);
        }
        .mi-bnav-btn:hover .mi-bnav-icon{transform:translateY(-2px)}

        .mi-bnav-badge{
          position:absolute;top:-1px;right:-3px;
          min-width:17px;height:17px;border-radius:100px;
          background:var(--pri);color:#fff;
          font-size:10px;font-weight:800;
          display:flex;align-items:center;justify-content:center;
          padding:0 4px;border:2px solid rgba(255,255,255,0.9);
          line-height:1;
        }
        .mi-bnav-badge--green{background:#22c55e}
        .mi-bnav-lbl{font-size:10.5px;font-weight:600;letter-spacing:0.02em}
        .mi-bnav-center{pointer-events:none}

        /* ═══ HOTACTIONS OVERRIDE — FAB centers above pill ═══════════ */
        .ha-root{
          right:auto !important;
          left:50% !important;
          /* pill bottom(16) + half pill height(32) + gap(6) = 54px */
          bottom:54px !important;
          transform:translateX(-50%) !important;
          z-index:310 !important;
          align-items:center !important;
        }
        .ha-root .ha-actions{align-items:center !important;}

        /* Toast lifts above pill */
        .ha-toast{bottom:calc(16px + 64px + 16px) !important;}

        /* Sheet & backdrop clear nav */
        .ha-sheet{z-index:320 !important;}
        .ha-sheet-backdrop{z-index:319 !important;}

        /* ═══ QR MODAL ══════════════════════════════════════════════ */
        .mi-qr-modal{background:var(--white);border-radius:20px;padding:28px;max-width:360px;width:92%;display:flex;flex-direction:column;gap:16px;box-shadow:var(--sh-lg);animation:miPopIn 0.3s ease-out}
        .mi-qr-hdr{display:flex;align-items:center;justify-content:space-between}
        .mi-qr-hdr h2{font-size:1.2rem;font-weight:700;color:var(--ink)}
        .mi-qr-hdr button{background:none;border:none;cursor:pointer;color:var(--muted);display:flex;align-items:center}
        .mi-qr-img{width:240px;height:240px;object-fit:contain;margin:0 auto;display:block}
        .mi-qr-ph{width:240px;height:240px;background:var(--bg);border-radius:12px;display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:0.85rem;margin:0 auto}
        .mi-qr-dl{display:flex;align-items:center;justify-content:center;gap:8px;padding:0.8rem;background:var(--pri);color:#fff;border:none;border-radius:12px;font-size:0.9rem;font-weight:600;cursor:pointer;transition:background 0.2s}
        .mi-qr-dl:hover{background:var(--pri-d)}
        .mi-qr-cl{padding:0.7rem;background:var(--bg);border:none;border-radius:12px;font-size:0.88rem;font-weight:600;cursor:pointer;color:var(--ink2);transition:background 0.2s}
        .mi-qr-cl:hover{background:var(--border)}

        /* FOOTER */
        .mi-footer{background:var(--ink);color:rgba(255,255,255,0.45);padding:32px 24px;text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center}
        .mi-footer-logo{display:flex;align-items:center;gap:8px;font-family:var(--FD);font-size:1.15rem;font-weight:900;color:#fff}
        .mi-footer-logo-ic{width:32px;height:32px;background:var(--pri);border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:1rem}

        /* KEYFRAMES */
        @keyframes miPopIn{0%{transform:scale(0.7);opacity:0.5}65%{transform:scale(1.12)}100%{transform:scale(1);opacity:1}}
        @keyframes miBadgePop{0%{transform:scale(0) rotate(-15deg)}65%{transform:scale(1.2) rotate(3deg)}100%{transform:scale(1) rotate(0deg)}}

        /* RESPONSIVE NAV */
        @media(max-width:640px){
          .mi-nav-links{display:none}
          .mi-nav-share{display:flex}
          .mi-nav-inner{padding:0 16px}
          .mi-filter-inner{padding:10px 16px}
          .mi-main{padding:24px 16px 32px}
          .mi-hero-content{padding:80px 16px 60px}
          .mi-hero-strip-inner{padding:0.65rem 16px;gap:1rem}
          .mi-bnav{width:calc(100% - 20px);bottom:10px;border-radius:20px}
        }
        @media(min-width:641px){.mi-nav-share{display:flex}.mi-nav-links{display:none}}
        @media(min-width:900px){.mi-nav-links{display:flex}.mi-nav-share{display:none}}
      `}</style>
    </div>
  );
}
