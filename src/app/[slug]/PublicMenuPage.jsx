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
  pending: {
    bg: "rgba(251,146,60,0.12)",
    text: "#fb923c",
    dot: "#f97316",
    bar: "#f97316",
  },
  confirmed: {
    bg: "rgba(96,165,250,0.12)",
    text: "#60a5fa",
    dot: "#3b82f6",
    bar: "#3b82f6",
  },
  preparing: {
    bg: "rgba(250,204,21,0.12)",
    text: "#fbbf24",
    dot: "#eab308",
    bar: "#eab308",
  },
  ready: {
    bg: "rgba(74,222,128,0.12)",
    text: "#4ade80",
    dot: "#22c55e",
    bar: "#22c55e",
  },
  completed: {
    bg: "rgba(148,163,184,0.1)",
    text: "#94a3b8",
    dot: "#64748b",
    bar: "#64748b",
  },
  cancelled: {
    bg: "rgba(248,113,113,0.12)",
    text: "#f87171",
    dot: "#ef4444",
    bar: "#ef4444",
  },
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
          <div className="mi-order-dot-wrap">
            <div className="mi-order-dot" style={{ background: st.dot }} />
            {!["completed", "cancelled"].includes(order.status) && (
              <div
                className="mi-order-dot-ring"
                style={{ borderColor: st.dot }}
              />
            )}
          </div>
          <div>
            <div className="mi-order-id">
              #{String(id).slice(-6).toUpperCase()}
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
            <span className="mi-pill-dot" style={{ background: st.dot }} />
            {label}
          </span>
          <span className="mi-order-total">${Number(total).toFixed(2)}</span>
          <ChevronDown
            size={14}
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
            <div className="mi-order-notes">📝 {order.notes}</div>
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
      setOrders(filtered);
    } catch (e) {
      setOrders([]);
    }
  }, [restaurantId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    const iv = setInterval(load, 8000);
    return () => clearInterval(iv);
  }, [load]);

  useEffect(() => {
    if (!restaurantId) return;
    const SOCKET_SERVER =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";
    const socket = io(SOCKET_SERVER, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
    socket.on("connect", () => {
      socket.emit("join-restaurant", restaurantId);
    });
    socket.on("joined-restaurant", (data) => {});
    socket.onAny((eventName, ...args) => {});
    socket.on("order-updated", (data) => {
      const id = data.orderId || data._id;
      const orderNumber =
        data.orderNumber || `Order #${String(id).slice(-6).toUpperCase()}`;
      if (id) {
        try {
          const all = JSON.parse(localStorage.getItem("mi_orders") || "[]");
          const updated = all.map((o) => {
            const orderId = o._id?.toString ? o._id.toString() : String(o._id);
            const eventId = id.toString ? id.toString() : String(id);
            if (orderId === eventId) {
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
          localStorage.setItem("mi_orders", JSON.stringify(updated));
          setOrders((prevOrders) =>
            prevOrders.map((o) => {
              const orderId = o._id?.toString
                ? o._id.toString()
                : String(o._id);
              const eventId = id.toString ? id.toString() : String(id);
              if (orderId === eventId)
                return { ...o, status: data.status, updatedAt: data.updatedAt };
              return o;
            }),
          );
        } catch (e) {}
      }
    });
    socket.on("disconnect", () => {});
    socket.on("error", (error) => {});
    socketRef.current = socket;
    return () => {
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
            <div className="mi-panel-hdr-icon">
              <ClipboardList size={18} />
            </div>
            <span>My Orders</span>
            {active.length > 0 && (
              <span className="mi-badge mi-badge--green">
                {active.length} active
              </span>
            )}
          </div>
          <button className="mi-panel-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="mi-panel-body">
          {orders.length === 0 ? (
            <div className="mi-panel-empty">
              <div className="mi-panel-empty-icon">📋</div>
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
            <div className="mi-panel-hdr-icon">
              <ShoppingCart size={18} />
            </div>
            <span>Your Order</span>
            <span className="mi-badge">{itemCount}</span>
          </div>
          <button className="mi-panel-x" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="mi-panel-body">
          {cart.length === 0 ? (
            <div className="mi-panel-empty">
              <div className="mi-panel-empty-icon">🛒</div>
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
                    <Trash2 size={13} />
                  </button>
                  <div className="mi-qty-ctrl">
                    <button onClick={() => onUpdateQty(item._id, item.qty - 1)}>
                      <Minus size={12} />
                    </button>
                    <span>{item.qty}</span>
                    <button onClick={() => onUpdateQty(item._id, item.qty + 1)}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.length > 0 && (
          <div className="mi-cart-footer">
            <div className="mi-cart-summary">
              <div className="mi-cart-row">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="mi-cart-row mi-cart-row--muted">
                <span>Service fee & tax</span>
                <span>at checkout</span>
              </div>
              <div className="mi-cart-divider" />
              <div className="mi-cart-row mi-cart-row--total">
                <span>
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </span>
                <span>${subtotal.toFixed(2)}+</span>
              </div>
            </div>
            <button className="mi-checkout-btn" onClick={onProceedToCheckout}>
              <span>Proceed to Checkout</span>
              <span className="mi-checkout-arrow">
                <ChevronRight size={18} />
              </span>
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
      <Plus size={16} strokeWidth={2.5} />
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
            <ShoppingCart size={9} /> {cartItem.qty}
          </div>
        )}
        {food.isPopular && (
          <div className="mi-food-popular-badge">🔥 Popular</div>
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
                <Minus size={11} />
              </button>
              <span>{cartItem.qty}</span>
              <button onClick={() => onUpdateQty(food._id, cartItem.qty + 1)}>
                <Plus size={11} />
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
// BOTTOM NAV
// ═══════════════════════════════════════════════════════════════════════════════
function BottomNav({
  cartCount,
  activeOrderCount,
  onOrdersClick,
  onCartClick,
}) {
  return (
    <nav className="mi-bnav">
      <button className="mi-bnav-btn" onClick={onOrdersClick}>
        <div className="mi-bnav-icon-wrap">
          <div className="mi-bnav-icon">
            <ClipboardList size={22} strokeWidth={1.7} />
          </div>
          {activeOrderCount > 0 && (
            <span className="mi-bnav-badge mi-bnav-badge--green">
              {activeOrderCount}
            </span>
          )}
        </div>
        <span className="mi-bnav-lbl">Orders</span>
      </button>
      <div className="mi-bnav-center" aria-hidden="true" />
      <button className="mi-bnav-btn" onClick={onCartClick}>
        <div className="mi-bnav-icon-wrap">
          <div className="mi-bnav-icon">
            <ShoppingCart size={22} strokeWidth={1.7} />
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
        <div className="mi-loading-inner">
          <div className="mi-loading-logo">🍽️</div>
          <div className="mi-spinner" />
          <p className="mi-loading-text">Loading menu…</p>
        </div>
      </div>
    );
  if (error || !restaurant)
    return (
      <div className="mi-error">
        <div className="mi-error-icon">🍽️</div>
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
        {/* Background image */}
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
        <div className="mi-hero-grain" />

        {/* ── TOP BAR (nav) ── */}
        <nav className={`mi-nav${scrolled ? " mi-nav--sc" : ""}`}>
          <div className="mi-nav-inner">
            <div className="mi-nav-logo">
              <div className="mi-nav-logo-icon">🍽️</div>
              <span>MALLINSIGHT</span>
            </div>
            <div className="mi-nav-links">
              <a href="#menu" className="mi-nav-link">Menu</a>
              <a href="#info" className="mi-nav-link">Info</a>
              <button className="mi-nav-link" onClick={() => setShowQRCode(true)}>Share</button>
            </div>
            <div className="mi-nav-r">
              <button className="mi-nav-share" onClick={() => setShowQRCode(true)}>Share QR</button>
              <button className="mi-nav-cart" onClick={() => setCartOpen(true)}>
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span key={cartCount} className="mi-nav-cart-n" style={{ animation: "miPopIn 0.3s ease-out" }}>
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </nav>

        {/* ── COMPACT HERO CONTENT ── */}
        <div className="mi-hero-content">
          <div className="mi-hero-meta-row">
            {restaurant.category && (
              <span className="mi-hero-tag">
                <span className="mi-hero-tag-dot" />
                {restaurant.category} Cuisine
              </span>
            )}
          </div>

          <h1 className="mi-hero-title">{restaurant.name}</h1>

          {restaurant.description && (
            <p className="mi-hero-desc">{restaurant.description}</p>
          )}

          <div className="mi-hero-info-row">
            {restaurant.mallName && (
              <span className="mi-hero-pill">
                <MapPin size={12} />
                {restaurant.mallName}
              </span>
            )}
            {restaurant.hours && (
              <span className="mi-hero-pill">
                <Clock size={12} />
                {restaurant.hours}
              </span>
            )}
            {restaurant.phone && (
              <span className="mi-hero-pill">
                <Phone size={12} />
                {restaurant.phone}
              </span>
            )}
          </div>

          <div className="mi-hero-actions">
            <a href="#menu" className="mi-hero-cta">
              View Menu <ChevronRight size={16} />
            </a>
            <button className="mi-hero-cta-sec" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={16} />
              {cartCount > 0 ? `Cart (${cartCount})` : "Cart"}
            </button>
            <button className="mi-hero-qr-btn" onClick={() => setShowQRCode(true)}>
              Share QR
            </button>
          </div>
        </div>
      </section>

      {/* ── FILTER BAR ── */}
      <div className="mi-filter" id="menu">
        <div className="mi-filter-inner">
          <div className="mi-search-row">
            <div className="mi-search-wrap">
              <Search size={17} className="mi-search-ic" />
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
                  <X size={15} />
                </button>
              )}
            </div>
            <button className="mi-fcart-btn" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={17} />
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
                All Items
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
            <div className="mi-empty-icon">🔍</div>
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
                    <div className="mi-section-hdr-left">
                      <h2 className="mi-section-title">{cat.name}</h2>
                      {cat.description && (
                        <p className="mi-section-desc">{cat.description}</p>
                      )}
                    </div>
                    <div className="mi-section-count">{cf.length} items</div>
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
              <div>
                <h2>Share Restaurant</h2>
                <p className="mi-qr-sub">{restaurant.name}</p>
              </div>
              <button
                className="mi-qr-close"
                onClick={() => setShowQRCode(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="mi-qr-body">
              {restaurant?.qrCodeBase64 ? (
                <div className="mi-qr-frame">
                  <img
                    src={restaurant.qrCodeBase64}
                    alt="QR"
                    className="mi-qr-img"
                  />
                </div>
              ) : (
                <div className="mi-qr-ph">QR Code not available</div>
              )}
              <p className="mi-qr-hint">Scan to view this menu</p>
            </div>
            <div className="mi-qr-footer">
              {restaurant?.qrCodeBase64 && (
                <button className="mi-qr-dl" onClick={downloadQR}>
                  <Download size={16} /> Download QR
                </button>
              )}
              <button className="mi-qr-cl" onClick={() => setShowQRCode(false)}>
                Close
              </button>
            </div>
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
        <div className="mi-footer-inner">
          <div className="mi-footer-logo">
            <div className="mi-footer-logo-ic">🍽️</div>
            <span>MALLINSIGHT</span>
          </div>
          <div className="mi-footer-divider" />
          <p className="mi-footer-sub">Powered by Digital Menu System</p>
          <p className="mi-footer-copy">© 2026 All rights reserved</p>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

        :root {
          --pri: #FF4500;
          --pri-d: #e03d00;
          --pri-l: rgba(255,69,0,0.1);
          --pri-glow: rgba(255,69,0,0.25);
          --ink: #0f0e0d;
          --ink2: #2a2724;
          --muted: #8a8076;
          --bg: #f8f5f2;
          --card: #ffffff;
          --white: #ffffff;
          --border: rgba(0,0,0,0.07);
          --border2: rgba(0,0,0,0.12);
          --panel-bg: #111010;
          --panel-border: rgba(255,255,255,0.07);
          --panel-card: #1c1b1a;
          --panel-card2: #252422;
          --sh-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --sh-md: 0 4px 24px rgba(0,0,0,0.09);
          --sh-lg: 0 12px 48px rgba(0,0,0,0.16);
          --sh-card: 0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04);
          --r: 16px;
          --bnav-h: 96px;
          --FD: 'Syne', sans-serif;
          --FB: 'Plus Jakarta Sans', sans-serif;
        }

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html { scroll-behavior: smooth; }

        .mi-root {
          min-height: 100vh;
          background: var(--bg);
          font-family: var(--FB);
          color: var(--ink);
          padding-bottom: calc(var(--bnav-h) + env(safe-area-inset-bottom, 0px));
        }

        /* ══ LOADING ══════════════════════════════════════════════ */
        .mi-loading {
          min-height: 100svh;
          background: var(--ink);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mi-loading-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .mi-loading-logo {
          width: 64px;
          height: 64px;
          background: var(--pri);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          box-shadow: 0 0 40px var(--pri-glow);
        }
        .mi-spinner {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 2.5px solid rgba(255,255,255,0.1);
          border-top-color: var(--pri);
          animation: miSpin 0.75s linear infinite;
        }
        .mi-loading-text {
          color: rgba(255,255,255,0.45);
          font-size: 0.85rem;
          font-weight: 500;
          letter-spacing: 0.05em;
        }
        @keyframes miSpin { to { transform: rotate(360deg); } }

        /* ══ ERROR ════════════════════════════════════════════════ */
        .mi-error {
          min-height: 100svh;
          background: var(--bg);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          padding: 32px;
          text-align: center;
        }
        .mi-error-icon { font-size: 4rem; }
        .mi-error h1 { font-family: var(--FD); font-size: 1.8rem; font-weight: 800; color: var(--ink); }
        .mi-error p { color: var(--muted); font-size: 0.95rem; }

        /* ══ HERO ═════════════════════════════════════════════════ */
        .mi-hero {
          position: relative;
          height: 380px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .mi-hero-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
        }
        .mi-hero-ov {
          position: absolute;
          inset: 0;
          z-index: 1;
          background: linear-gradient(
            180deg,
            rgba(5,3,1,0.72) 0%,
            rgba(5,3,1,0.28) 38%,
            rgba(5,3,1,0.55) 70%,
            rgba(5,3,1,0.94) 100%
          );
        }
        .mi-hero-grain {
          position: absolute;
          inset: 0;
          z-index: 2;
          opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          background-repeat: repeat;
          background-size: 180px;
          pointer-events: none;
        }

        /* NAV */
        .mi-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 200;
          transition: background 0.4s, backdrop-filter 0.4s, box-shadow 0.4s;
        }
        .mi-nav--sc {
          background: rgba(8,6,4,0.9);
          backdrop-filter: blur(24px) saturate(1.6);
          -webkit-backdrop-filter: blur(24px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.3);
        }
        .mi-nav-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 64px;
          gap: 2rem;
        }
        .mi-nav-logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: var(--FD);
          font-size: 0.95rem;
          font-weight: 900;
          color: #fff;
          white-space: nowrap;
          flex-shrink: 0;
          letter-spacing: 0.07em;
        }
        .mi-nav-logo-icon {
          width: 34px;
          height: 34px;
          background: var(--pri);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 14px var(--pri-glow);
        }
        .mi-nav-links {
          display: flex;
          gap: 2rem;
        }
        .mi-nav-link {
          font-size: 0.72rem;
          font-weight: 600;
          color: rgba(255,255,255,0.55);
          text-decoration: none;
          background: none;
          border: none;
          cursor: pointer;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          transition: color 0.2s;
          font-family: var(--FB);
        }
        .mi-nav-link:hover { color: #fff; }
        .mi-nav-r { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
        .mi-nav-share {
          display: none;
          padding: 0.4rem 1rem;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.14);
          border-radius: 100px;
          color: rgba(255,255,255,0.75);
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          font-family: var(--FB);
          transition: all 0.2s;
          letter-spacing: 0.03em;
        }
        .mi-nav-share:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .mi-nav-cart {
          position: relative;
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--pri);
          border: none;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 18px var(--pri-glow);
        }
        .mi-nav-cart:hover {
          background: var(--pri-d);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px var(--pri-glow);
        }
        .mi-nav-cart-n {
          position: absolute;
          top: -5px;
          right: -5px;
          min-width: 18px;
          height: 18px;
          border-radius: 9px;
          background: #fff;
          color: var(--pri);
          font-size: 0.6rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid transparent;
        }

        /* ── COMPACT HERO CONTENT ── */
        .mi-hero-content {
          position: relative;
          z-index: 3;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: flex-end;
          padding: 76px 36px 28px;
          max-width: 900px;
        }
        .mi-hero-meta-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 10px;
        }
        .mi-hero-tag {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.16);
          backdrop-filter: blur(8px);
          color: rgba(255,255,255,0.85);
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
        }
        .mi-hero-tag-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--pri);
          flex-shrink: 0;
          box-shadow: 0 0 5px var(--pri);
        }
        .mi-hero-title {
          font-family: var(--FD);
          font-size: clamp(1.9rem, 4.5vw, 3.2rem);
          font-weight: 900;
          color: #fff;
          line-height: 1;
          margin-bottom: 8px;
          letter-spacing: -0.03em;
          text-shadow: 0 2px 20px rgba(0,0,0,0.55);
        }
        .mi-hero-desc {
          font-size: 0.82rem;
          color: rgba(255,255,255,0.58);
          max-width: 520px;
          line-height: 1.6;
          margin-bottom: 14px;
          font-weight: 400;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .mi-hero-info-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 18px;
        }
        .mi-hero-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.11);
          color: rgba(255,255,255,0.62);
          font-size: 0.7rem;
          font-weight: 500;
          padding: 0.28rem 0.7rem;
          border-radius: 100px;
          backdrop-filter: blur(6px);
          white-space: nowrap;
        }
        .mi-hero-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }
        .mi-hero-cta {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--pri);
          color: #fff;
          padding: 0.65rem 1.5rem;
          border-radius: 11px;
          font-size: 0.82rem;
          font-weight: 700;
          text-decoration: none;
          transition: all 0.22s cubic-bezier(.22,1,.36,1);
          box-shadow: 0 4px 22px var(--pri-glow);
          letter-spacing: 0.01em;
        }
        .mi-hero-cta:hover {
          background: var(--pri-d);
          transform: translateY(-2px);
          box-shadow: 0 8px 30px var(--pri-glow);
        }
        .mi-hero-cta-sec {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255,255,255,0.09);
          border: 1px solid rgba(255,255,255,0.16);
          color: rgba(255,255,255,0.85);
          padding: 0.65rem 1.2rem;
          border-radius: 11px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.22s;
          backdrop-filter: blur(8px);
          font-family: var(--FB);
        }
        .mi-hero-cta-sec:hover {
          background: rgba(255,255,255,0.16);
          border-color: rgba(255,255,255,0.26);
        }
        .mi-hero-qr-btn {
          display: none;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.14);
          color: rgba(255,255,255,0.5);
          padding: 0.65rem 1rem;
          border-radius: 11px;
          font-size: 0.78rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--FB);
        }
        .mi-hero-qr-btn:hover { color: rgba(255,255,255,0.85); border-color: rgba(255,255,255,0.28); }

        /* ══ FILTER BAR ═══════════════════════════════════════════ */
        .mi-filter {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(248,245,242,0.92);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid var(--border);
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }
        .mi-filter-inner {
          max-width: 1440px;
          margin: 0 auto;
          padding: 14px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .mi-search-row {
          display: flex;
          gap: 10px;
          align-items: center;
        }
        .mi-search-wrap {
          position: relative;
          flex: 1;
        }
        .mi-search-ic {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--muted);
          pointer-events: none;
        }
        .mi-search-input {
          width: 100%;
          padding: 0.72rem 2.6rem 0.72rem 2.8rem;
          border: 1.5px solid var(--border2);
          border-radius: 14px;
          font-size: 0.86rem;
          font-family: var(--FB);
          background: var(--white);
          color: var(--ink);
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          font-weight: 500;
        }
        .mi-search-input::placeholder { color: var(--muted); font-weight: 400; }
        .mi-search-input:focus {
          border-color: var(--pri);
          box-shadow: 0 0 0 3px var(--pri-l);
        }
        .mi-search-clr {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--border);
          border: none;
          cursor: pointer;
          color: var(--muted);
          display: flex;
          align-items: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          justify-content: center;
          transition: background 0.2s;
        }
        .mi-search-clr:hover { background: var(--border2); }
        .mi-fcart-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 0.72rem 1.2rem;
          background: var(--ink);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
          font-family: var(--FB);
          letter-spacing: 0.01em;
        }
        .mi-fcart-btn:hover { background: #2a2724; transform: translateY(-1px); }
        .mi-fcart-n {
          background: var(--pri);
          color: #fff;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          font-size: 0.68rem;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mi-fcart-lbl { font-size: 0.82rem; font-weight: 600; }

        .mi-cats {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
          padding-bottom: 2px;
        }
        .mi-cats::-webkit-scrollbar { display: none; }
        .mi-cat {
          padding: 0.42rem 1.1rem;
          border-radius: 10px;
          border: 1.5px solid var(--border2);
          font-size: 0.76rem;
          font-weight: 600;
          white-space: nowrap;
          background: transparent;
          color: var(--ink2);
          cursor: pointer;
          transition: all 0.18s;
          flex-shrink: 0;
          font-family: var(--FB);
        }
        .mi-cat:hover { border-color: var(--pri); color: var(--pri); background: var(--pri-l); }
        .mi-cat--on { background: var(--ink); border-color: var(--ink); color: #fff; }

        /* ══ MENU MAIN ════════════════════════════════════════════ */
        .mi-main {
          max-width: 1440px;
          margin: 0 auto;
          padding: 44px 28px 48px;
        }
        .mi-empty {
          text-align: center;
          padding: 80px 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .mi-empty-icon { font-size: 3.5rem; }
        .mi-empty h3 { font-family: var(--FD); font-size: 1.5rem; font-weight: 800; color: var(--ink); }
        .mi-empty p { color: var(--muted); font-size: 0.9rem; }

        .mi-sections { display: flex; flex-direction: column; gap: 56px; }

        .mi-section-hdr {
          margin-bottom: 24px;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 16px;
        }
        .mi-section-hdr-left { flex: 1; }
        .mi-section-title {
          font-family: var(--FD);
          font-size: clamp(1.5rem, 2.8vw, 2rem);
          font-weight: 900;
          color: var(--ink);
          letter-spacing: -0.02em;
          line-height: 1.1;
        }
        .mi-section-desc {
          margin-top: 6px;
          color: var(--muted);
          font-size: 0.85rem;
          line-height: 1.5;
          font-weight: 400;
        }
        .mi-section-count {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--muted);
          background: var(--border);
          padding: 0.3rem 0.75rem;
          border-radius: 100px;
          white-space: nowrap;
          letter-spacing: 0.04em;
          flex-shrink: 0;
        }

        /* Grid — 4 cols */
        .mi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }
        @media (max-width: 1100px) { .mi-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 760px)  { .mi-grid { grid-template-columns: repeat(2, 1fr); gap: 14px; } }
        @media (max-width: 480px)  { .mi-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; } }

        /* Food Card */
        .mi-food-card {
          background: var(--card);
          border-radius: 18px;
          border: 1px solid var(--border);
          overflow: hidden;
          transition: transform 0.25s cubic-bezier(.22,1,.36,1), box-shadow 0.25s;
          display: flex;
          flex-direction: column;
          box-shadow: var(--sh-card);
        }
        .mi-food-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 48px rgba(0,0,0,0.12);
        }
        .mi-food-card--in {
          border-color: rgba(255,69,0,0.3);
          box-shadow: 0 0 0 2px var(--pri-l), var(--sh-card);
        }
        .mi-food-img-wrap {
          position: relative;
          width: 100%;
          aspect-ratio: 4/3;
          background: #f0ece8;
          overflow: hidden;
          flex-shrink: 0;
        }
        .mi-food-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s cubic-bezier(.22,1,.36,1);
        }
        .mi-food-card:hover .mi-food-img { transform: scale(1.07); }
        .mi-food-img-ph {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #f5ede4, #fce8d8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.8rem;
        }
        .mi-food-in-badge {
          position: absolute;
          top: 10px;
          right: 10px;
          background: var(--pri);
          color: #fff;
          font-size: 0.62rem;
          font-weight: 800;
          border-radius: 100px;
          padding: 4px 9px;
          display: flex;
          align-items: center;
          gap: 4px;
          box-shadow: 0 2px 10px var(--pri-glow);
          letter-spacing: 0.02em;
        }
        .mi-food-popular-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          background: rgba(15,14,13,0.75);
          backdrop-filter: blur(8px);
          color: #fff;
          font-size: 0.6rem;
          font-weight: 700;
          border-radius: 100px;
          padding: 4px 9px;
          letter-spacing: 0.04em;
        }
        .mi-food-body {
          padding: 14px 14px 12px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .mi-food-name {
          font-size: 0.9rem;
          font-weight: 700;
          color: var(--ink);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          letter-spacing: -0.01em;
        }
        .mi-food-desc {
          font-size: 0.73rem;
          color: var(--muted);
          line-height: 1.5;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
          font-weight: 400;
        }
        .mi-food-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-top: auto;
          padding-top: 10px;
          border-top: 1px solid var(--border);
        }
        .mi-food-price {
          font-size: 1rem;
          font-weight: 800;
          color: var(--ink);
          font-family: var(--FD);
          letter-spacing: -0.02em;
        }

        .mi-add-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          border: none;
          background: var(--ink);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s cubic-bezier(.22,1,.36,1);
          flex-shrink: 0;
        }
        .mi-add-btn:hover { background: var(--pri); transform: scale(1.1); box-shadow: 0 4px 16px var(--pri-glow); }
        .mi-add-btn--flash { background: #16a34a; animation: miPopIn 0.35s ease-out; }

        .mi-qty-ctrl {
          display: flex;
          align-items: center;
          gap: 4px;
          background: var(--bg);
          border: 1.5px solid var(--border2);
          border-radius: 10px;
          padding: 3px;
        }
        .mi-qty-ctrl button {
          width: 26px;
          height: 26px;
          border-radius: 7px;
          border: none;
          background: var(--ink);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.18s;
        }
        .mi-qty-ctrl button:hover { background: var(--pri); }
        .mi-qty-ctrl span {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--ink);
          min-width: 20px;
          text-align: center;
        }
        .mi-qty-ctrl--sm button { width: 24px; height: 24px; border-radius: 6px; }

        /* ══ SHARED PANEL (Cart & Orders) ═════════════════════════ */
        .mi-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.6);
          z-index: 400;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .mi-panel {
          position: fixed;
          right: 0;
          top: 0;
          height: 100%;
          width: 100%;
          max-width: 460px;
          background: var(--panel-bg);
          z-index: 500;
          display: flex;
          flex-direction: column;
          box-shadow: -12px 0 60px rgba(0,0,0,0.4);
          animation: miSlideIn 0.32s cubic-bezier(0.32,0.72,0,1);
          border-left: 1px solid var(--panel-border);
        }
        @keyframes miSlideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }

        .mi-panel-hdr {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 22px;
          border-bottom: 1px solid var(--panel-border);
          flex-shrink: 0;
          background: rgba(255,255,255,0.03);
        }
        .mi-panel-hdr-l {
          display: flex;
          align-items: center;
          gap: 12px;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: -0.01em;
        }
        .mi-panel-hdr-icon {
          width: 36px;
          height: 36px;
          background: var(--pri);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          flex-shrink: 0;
          box-shadow: 0 4px 14px var(--pri-glow);
        }
        .mi-badge {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.7);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: 100px;
          letter-spacing: 0.02em;
        }
        .mi-badge--green { background: rgba(34,197,94,0.2); border-color: rgba(34,197,94,0.3); color: #4ade80; }
        .mi-panel-x {
          background: rgba(255,255,255,0.07);
          border: 1px solid var(--panel-border);
          color: rgba(255,255,255,0.5);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }
        .mi-panel-x:hover { background: rgba(255,255,255,0.12); color: #fff; }

        .mi-panel-body {
          flex: 1;
          overflow-y: auto;
          padding: 16px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scrollbar-width: thin;
          scrollbar-color: rgba(255,255,255,0.1) transparent;
        }
        .mi-panel-body::-webkit-scrollbar { width: 4px; }
        .mi-panel-body::-webkit-scrollbar-track { background: transparent; }
        .mi-panel-body::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }

        .mi-panel-empty {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          gap: 10px;
          padding: 40px;
        }
        .mi-panel-empty-icon { font-size: 3.5rem; filter: grayscale(0.3); }
        .mi-panel-empty-t { font-size: 1.05rem; font-weight: 700; color: rgba(255,255,255,0.85); }
        .mi-panel-empty-s { font-size: 0.82rem; color: rgba(255,255,255,0.35); font-weight: 400; }

        /* Cart Items */
        .mi-cart-item {
          display: flex;
          gap: 12px;
          background: var(--panel-card);
          border-radius: 14px;
          padding: 12px;
          border: 1px solid var(--panel-border);
          transition: border-color 0.2s;
        }
        .mi-cart-item:hover { border-color: rgba(255,255,255,0.12); }
        .mi-cart-item-img {
          width: 58px;
          height: 58px;
          border-radius: 10px;
          overflow: hidden;
          flex-shrink: 0;
          background: rgba(255,255,255,0.06);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.4rem;
        }
        .mi-cart-item-img img { width: 100%; height: 100%; object-fit: cover; }
        .mi-cart-item-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; justify-content: center; }
        .mi-cart-item-name { font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.9); line-height: 1.3; }
        .mi-cart-item-unit { font-size: 0.7rem; color: rgba(255,255,255,0.3); font-weight: 400; }
        .mi-cart-item-total { font-size: 0.88rem; font-weight: 800; color: #fff; font-family: var(--FD); }
        .mi-cart-item-actions { display: flex; flex-direction: column; align-items: flex-end; justify-content: space-between; gap: 8px; }
        .mi-cart-del {
          background: rgba(239,68,68,0.1);
          border: 1px solid rgba(239,68,68,0.15);
          cursor: pointer;
          color: rgba(248,113,113,0.6);
          padding: 5px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
          width: 28px;
          height: 28px;
        }
        .mi-cart-del:hover { background: rgba(239,68,68,0.2); color: #f87171; border-color: rgba(239,68,68,0.3); }

        /* Cart Qty on dark panel */
        .mi-panel .mi-qty-ctrl {
          background: var(--panel-card2);
          border-color: rgba(255,255,255,0.1);
        }
        .mi-panel .mi-qty-ctrl span { color: rgba(255,255,255,0.9); }
        .mi-panel .mi-qty-ctrl button { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }
        .mi-panel .mi-qty-ctrl button:hover { background: var(--pri); color: #fff; }

        .mi-cart-footer {
          padding: 16px 20px 20px;
          border-top: 1px solid var(--panel-border);
          background: rgba(255,255,255,0.02);
          display: flex;
          flex-direction: column;
          gap: 14px;
          flex-shrink: 0;
        }
        .mi-cart-summary { display: flex; flex-direction: column; gap: 8px; }
        .mi-cart-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.84rem;
          font-weight: 500;
          color: rgba(255,255,255,0.55);
        }
        .mi-cart-row--muted { font-size: 0.75rem; color: rgba(255,255,255,0.28); }
        .mi-cart-row--total {
          font-size: 0.95rem;
          font-weight: 800;
          color: #fff;
        }
        .mi-cart-divider { height: 1px; background: var(--panel-border); }
        .mi-checkout-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.2rem;
          background: var(--pri);
          color: #fff;
          border: none;
          border-radius: 14px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.22s;
          box-shadow: 0 6px 28px var(--pri-glow);
          font-family: var(--FB);
          letter-spacing: 0.01em;
        }
        .mi-checkout-btn:hover { background: var(--pri-d); transform: translateY(-1px); }
        .mi-checkout-arrow {
          width: 32px;
          height: 32px;
          background: rgba(255,255,255,0.15);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        /* Orders */
        .mi-orders-grp { display: flex; flex-direction: column; gap: 8px; }
        .mi-orders-grp-lbl {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.25);
          padding: 0 2px;
          margin-bottom: 4px;
          margin-top: 4px;
        }
        .mi-order-card {
          border: 1px solid var(--panel-border);
          border-radius: 14px;
          overflow: hidden;
          background: var(--panel-card);
          transition: border-color 0.2s;
        }
        .mi-order-card--active { border-color: rgba(255,69,0,0.25); }
        .mi-order-head {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 13px 14px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          transition: background 0.15s;
        }
        .mi-order-head:hover { background: rgba(255,255,255,0.03); }
        .mi-order-left { display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0; }
        .mi-order-dot-wrap { position: relative; width: 10px; height: 10px; flex-shrink: 0; }
        .mi-order-dot { width: 10px; height: 10px; border-radius: 50%; position: relative; z-index: 1; }
        .mi-order-dot-ring {
          position: absolute;
          inset: -3px;
          border-radius: 50%;
          border: 1.5px solid;
          opacity: 0.4;
          animation: miPulse 2s ease-in-out infinite;
        }
        @keyframes miPulse { 0%, 100% { transform: scale(1); opacity: 0.4; } 50% { transform: scale(1.4); opacity: 0.15; } }
        .mi-order-id { font-size: 0.85rem; font-weight: 700; color: rgba(255,255,255,0.88); font-family: var(--FD); letter-spacing: 0.04em; }
        .mi-order-meta { font-size: 0.68rem; color: rgba(255,255,255,0.3); margin-top: 3px; font-weight: 400; }
        .mi-order-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .mi-order-pill {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 0.65rem;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 100px;
          white-space: nowrap;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .mi-pill-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
        .mi-order-total { font-size: 0.85rem; font-weight: 800; color: #fff; font-family: var(--FD); }
        .mi-order-chev { color: rgba(255,255,255,0.25); transition: transform 0.25s; }
        .mi-order-chev--open { transform: rotate(180deg); }
        .mi-order-items {
          border-top: 1px solid var(--panel-border);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 7px;
          background: rgba(255,255,255,0.02);
        }
        .mi-order-item { display: flex; align-items: center; gap: 10px; font-size: 0.8rem; }
        .mi-order-item-qty { font-weight: 800; color: var(--pri); min-width: 22px; font-family: var(--FD); }
        .mi-order-item-name { flex: 1; color: rgba(255,255,255,0.55); font-weight: 400; }
        .mi-order-item-price { font-weight: 700; color: rgba(255,255,255,0.8); }
        .mi-order-notes { font-size: 0.72rem; color: rgba(255,255,255,0.3); font-style: italic; padding-top: 6px; border-top: 1px dashed rgba(255,255,255,0.06); margin-top: 4px; }

        /* ══ BOTTOM NAV ═══════════════════════════════════════════ */
        .mi-bnav {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 300;
          height: 64px;
          width: calc(100% - 32px);
          max-width: 400px;
          background: rgba(15,14,13,0.92);
          backdrop-filter: blur(28px) saturate(1.8);
          -webkit-backdrop-filter: blur(28px) saturate(1.8);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 22px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.35), 0 2px 8px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.05);
          display: grid;
          grid-template-columns: 1fr 64px 1fr;
          align-items: stretch;
          overflow: visible;
          padding: 0 6px;
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .mi-bnav-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 3px;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255,255,255,0.35);
          transition: color 0.2s;
          padding: 0 8px;
          border-radius: 16px;
        }
        .mi-bnav-btn:hover { color: rgba(255,255,255,0.85); }
        .mi-bnav-btn:active { transform: scale(0.93); }
        .mi-bnav-icon-wrap {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 28px;
        }
        .mi-bnav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.22s cubic-bezier(.22,1,.36,1);
        }
        .mi-bnav-btn:hover .mi-bnav-icon { transform: translateY(-2px); }
        .mi-bnav-badge {
          position: absolute;
          top: -2px;
          right: -4px;
          min-width: 17px;
          height: 17px;
          border-radius: 100px;
          background: var(--pri);
          color: #fff;
          font-size: 9.5px;
          font-weight: 800;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          border: 2px solid rgba(15,14,13,0.9);
          line-height: 1;
          box-shadow: 0 2px 8px var(--pri-glow);
        }
        .mi-bnav-badge--green { background: #16a34a; box-shadow: 0 2px 8px rgba(22,163,74,0.4); }
        .mi-bnav-lbl { font-size: 10px; font-weight: 600; letter-spacing: 0.03em; }
        .mi-bnav-center { pointer-events: none; }

        /* ══ HOTACTIONS OVERRIDE ══════════════════════════════════ */
        .ha-root {
          right: auto !important;
          left: 50% !important;
          bottom: 54px !important;
          transform: translateX(-50%) !important;
          z-index: 310 !important;
          align-items: center !important;
        }
        .ha-root .ha-actions { align-items: center !important; }
        .ha-toast { bottom: calc(16px + 64px + 16px) !important; }
        .ha-sheet { z-index: 320 !important; }
        .ha-sheet-backdrop { z-index: 319 !important; }

        /* ══ QR MODAL ═════════════════════════════════════════════ */
        .mi-qr-modal {
          background: var(--panel-bg);
          border: 1px solid var(--panel-border);
          border-radius: 24px;
          padding: 28px;
          max-width: 360px;
          width: 92%;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 24px 80px rgba(0,0,0,0.6);
          animation: miPopIn 0.32s cubic-bezier(.22,1,.36,1);
        }
        .mi-qr-hdr { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
        .mi-qr-hdr h2 { font-family: var(--FD); font-size: 1.2rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
        .mi-qr-sub { font-size: 0.78rem; color: rgba(255,255,255,0.35); margin-top: 4px; font-weight: 400; }
        .mi-qr-close {
          background: rgba(255,255,255,0.07);
          border: 1px solid var(--panel-border);
          color: rgba(255,255,255,0.4);
          width: 36px;
          height: 36px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: all 0.2s;
        }
        .mi-qr-close:hover { background: rgba(255,255,255,0.12); color: #fff; }
        .mi-qr-body { display: flex; flex-direction: column; align-items: center; gap: 12px; }
        .mi-qr-frame {
          background: #fff;
          border-radius: 16px;
          padding: 16px;
          display: inline-flex;
        }
        .mi-qr-img { width: 200px; height: 200px; object-fit: contain; display: block; }
        .mi-qr-ph {
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.05);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.3);
          font-size: 0.82rem;
        }
        .mi-qr-hint { font-size: 0.75rem; color: rgba(255,255,255,0.3); font-weight: 400; }
        .mi-qr-footer { display: flex; gap: 10px; }
        .mi-qr-dl {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 0.78rem;
          background: var(--pri);
          color: #fff;
          border: none;
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: var(--FB);
          box-shadow: 0 4px 20px var(--pri-glow);
        }
        .mi-qr-dl:hover { background: var(--pri-d); transform: translateY(-1px); }
        .mi-qr-cl {
          flex: 1;
          padding: 0.78rem;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--panel-border);
          border-radius: 12px;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          color: rgba(255,255,255,0.55);
          transition: all 0.2s;
          font-family: var(--FB);
        }
        .mi-qr-cl:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

        /* ══ FOOTER ═══════════════════════════════════════════════ */
        .mi-footer {
          background: var(--ink);
          padding: 40px 24px;
        }
        .mi-footer-inner {
          max-width: 1440px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          text-align: center;
        }
        .mi-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: var(--FD);
          font-size: 1.1rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: 0.06em;
          margin-bottom: 4px;
        }
        .mi-footer-logo-ic {
          width: 34px;
          height: 34px;
          background: var(--pri);
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1rem;
          box-shadow: 0 4px 14px var(--pri-glow);
        }
        .mi-footer-divider { width: 40px; height: 1px; background: rgba(255,255,255,0.08); }
        .mi-footer-sub { font-size: 0.78rem; color: rgba(255,255,255,0.3); font-weight: 400; }
        .mi-footer-copy { font-size: 0.7rem; color: rgba(255,255,255,0.18); font-weight: 400; }

        /* ══ KEYFRAMES ════════════════════════════════════════════ */
        @keyframes miPopIn {
          0%   { transform: scale(0.88); opacity: 0; }
          65%  { transform: scale(1.03); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes miBadgePop {
          0%   { transform: scale(0) rotate(-15deg); }
          65%  { transform: scale(1.2) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); }
        }

        /* ══ RESPONSIVE ═══════════════════════════════════════════ */
        @media (max-width: 640px) {
          .mi-hero { height: 320px; }
          .mi-nav-links { display: none; }
          .mi-nav-share { display: flex !important; }
          .mi-nav-inner { padding: 0 16px; height: 56px; }
          .mi-filter-inner { padding: 12px 16px; }
          .mi-main { padding: 28px 16px 32px; }
          .mi-hero-content { padding: 68px 18px 22px; }
          .mi-hero-title { font-size: clamp(1.5rem, 8vw, 2.2rem); }
          .mi-hero-desc { display: none; }
          .mi-hero-qr-btn { display: none !important; }
          .mi-bnav { width: calc(100% - 24px); bottom: 12px; border-radius: 18px; }
          .mi-section-hdr { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
        @media (min-width: 641px) { .mi-nav-share { display: flex; } .mi-nav-links { display: none; } }
        @media (min-width: 900px) { 
          .mi-nav-links { display: flex; } 
          .mi-nav-share { display: none !important; } 
          .mi-hero-qr-btn { display: inline-flex; }
        }
      `}</style>
    </div>
  );
}
