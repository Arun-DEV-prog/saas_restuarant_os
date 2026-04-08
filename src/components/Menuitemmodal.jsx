"use client";
// components/Menuitemmodal.jsx
// Restyled to match MallInsight design system (--pri, --ink, --bg, DM Sans / Playfair Display)
// Flow: detail → cart → table → confirm → success

import { useState, useEffect, useCallback } from "react";
import {
  X,
  Plus,
  Minus,
  Users,
  ShoppingBag,
  ChevronRight,
  ArrowLeft,
  Trash2,
  Loader2,
  CheckCircle2,
  Clock,
  MapPin,
  Utensils,
} from "lucide-react";

// ── tiny helpers ──────────────────────────────────────────────────────────────
function localPrice(items) {
  return items.reduce((s, i) => s + parseFloat(i.price || 0) * i.quantity, 0);
}

// ── Stepper ───────────────────────────────────────────────────────────────────
function Stepper({ value, onChange, min = 1 }) {
  return (
    <div style={S.stepper}>
      <button
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        style={{ ...S.stepBtn, ...(value <= min ? S.stepBtnDis : {}) }}
      >
        <Minus size={14} />
      </button>
      <span style={S.stepVal}>{value}</span>
      <button onClick={() => onChange(value + 1)} style={S.stepBtnPlus}>
        <Plus size={14} />
      </button>
    </div>
  );
}

// ── PersonPicker ──────────────────────────────────────────────────────────────
function PersonPicker({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <p style={S.label}>
        <Users size={12} style={{ display: "inline", marginRight: 5 }} />
        Party size
      </p>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <button
            key={n}
            onClick={() => onChange(n)}
            style={{ ...S.personBtn, ...(value === n ? S.personBtnOn : {}) }}
          >
            {n}
          </button>
        ))}
      </div>
      {value > 1 && (
        <span style={S.splitBadge}>Splitting between {value} people</span>
      )}
    </div>
  );
}

// ── PriceLine ─────────────────────────────────────────────────────────────────
function PriceLine({ label, value, bold, accent, green }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        ...(green ? S.priceLineGreen : {}),
        fontSize: bold ? "0.95rem" : "0.82rem",
      }}
    >
      <span
        style={{
          color: bold ? "var(--ink)" : "var(--muted)",
          fontWeight: bold ? 800 : 500,
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: bold ? "var(--pri)" : "var(--ink2)",
          fontWeight: bold ? 900 : 600,
        }}
      >
        {value}
      </span>
    </div>
  );
}

// ── PriceBox ──────────────────────────────────────────────────────────────────
function PriceBox({ pricing, loading }) {
  if (loading)
    return (
      <div style={S.priceBox}>
        {[80, 65, 90, 70].map((w, i) => (
          <div
            key={i}
            style={{
              height: 10,
              borderRadius: 6,
              background: "rgba(224,90,43,0.12)",
              width: `${w}%`,
              marginBottom: 8,
            }}
          />
        ))}
      </div>
    );
  if (!pricing) return null;
  return (
    <div style={S.priceBox}>
      <p style={{ ...S.label, marginBottom: 10 }}>Price Breakdown</p>
      <PriceLine
        label="Food subtotal"
        value={`$${pricing.foodTotal?.toFixed(2)}`}
      />
      {pricing.seatingPrice > 0 && (
        <PriceLine
          label={`Seating (${pricing.areaLabel || "table"})`}
          value={`$${pricing.seatingPrice?.toFixed(2)}`}
        />
      )}
      <PriceLine
        label={`Tax (${(pricing.taxRate * 100).toFixed(0)}%)`}
        value={`+$${pricing.taxAmount?.toFixed(2)}`}
      />
      <div
        style={{
          height: 1,
          background: "rgba(224,90,43,0.15)",
          margin: "8px 0",
        }}
      />
      <PriceLine label="Total" value={`$${pricing.total?.toFixed(2)}`} bold />
      {pricing.persons > 1 && (
        <div style={{ marginTop: 6 }}>
          <PriceLine
            label={`Per person (${pricing.persons}×)`}
            value={`$${pricing.perPerson?.toFixed(2)}`}
            green
            bold
          />
        </div>
      )}
    </div>
  );
}

// ── TableCard ─────────────────────────────────────────────────────────────────
function TableCard({ slot, selected, onSelect, reserving }) {
  const canBook = slot.canAccommodate && !slot.isFull;
  const isSelected = selected?.configId === slot.configId;
  return (
    <button
      onClick={() => canBook && onSelect(slot)}
      disabled={!canBook || reserving}
      style={{
        ...S.tableCard,
        ...(isSelected ? S.tableCardOn : canBook ? {} : S.tableCardOff),
        cursor: canBook ? "pointer" : "not-allowed",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.4rem" }}>
            {slot.areaType === "dine-in" ? "🪑" : "🏪"}
          </span>
          <div style={{ textAlign: "left" }}>
            <p
              style={{
                fontWeight: 800,
                fontSize: "0.88rem",
                color: "var(--ink)",
              }}
            >
              {slot.label}
            </p>
            <p
              style={{
                fontSize: "0.7rem",
                color: "var(--muted)",
                textTransform: "capitalize",
              }}
            >
              {slot.areaType}
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p
            style={{
              fontWeight: 900,
              color: "var(--pri)",
              fontSize: "0.95rem",
            }}
          >
            ${slot.price?.toFixed(2)}
          </p>
          <p style={{ fontSize: "0.65rem", color: "var(--muted)" }}>
            seating fee
          </p>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: "0.68rem",
            fontWeight: 700,
            padding: "2px 8px",
            borderRadius: 100,
            background: slot.isFull
              ? "#fee2e2"
              : slot.available <= 2
                ? "#fef3c7"
                : "#dcfce7",
            color: slot.isFull
              ? "#dc2626"
              : slot.available <= 2
                ? "#92400e"
                : "#15803d",
          }}
        >
          {slot.isFull ? "FULL" : `${slot.available} available`}
        </span>
        {!slot.canAccommodate && (
          <span style={{ fontSize: "0.68rem", color: "var(--muted)" }}>
            Too small for party
          </span>
        )}
        {isSelected && (
          <span
            style={{
              fontSize: "0.72rem",
              fontWeight: 800,
              color: "var(--pri)",
              display: "flex",
              alignItems: "center",
              gap: 3,
            }}
          >
            <CheckCircle2 size={12} /> Selected
          </span>
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function MenuItemModal({
  food,
  initialCart,
  categoryName,
  restaurantId,
  slug,
  onClose,
  onOrderSuccess,
}) {
  const [cart, setCart] = useState(() => {
    if (initialCart?.length > 0) return initialCart;
    return food ? [{ ...food, quantity: 1, cartId: Date.now() }] : [];
  });

  const [step, setStep] = useState(() =>
    initialCart?.length > 0 ? "cart" : "detail",
  );

  const [persons, setPersons] = useState(1);
  const [areaType, setAreaType] = useState("dine-in");
  const [availability, setAvail] = useState([]);
  const [availLoading, setAvailL] = useState(false);
  const [selectedSlot, setSlot] = useState(null);
  const [reservedTable, setReserved] = useState(null);
  const [reserving, setReserving] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPL] = useState(false);
  const [note, setNote] = useState("");
  const [ordering, setOrdering] = useState(false);
  const [error, setError] = useState("");

  function updateQty(cartId, qty) {
    if (qty < 1) return removeItem(cartId);
    setCart((p) =>
      p.map((i) => (i.cartId === cartId ? { ...i, quantity: qty } : i)),
    );
  }
  function removeItem(cartId) {
    setCart((p) => p.filter((i) => i.cartId !== cartId));
  }

  const fetchAvailability = useCallback(async () => {
    setAvailL(true);
    setError("");
    try {
      const res = await fetch(
        `/api/tables/availability?restaurantId=${restaurantId}&areaType=${areaType}&persons=${persons}`,
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAvail(data.availability || []);
      setSlot(null);
    } catch (e) {
      setError(e.message);
    } finally {
      setAvailL(false);
    }
  }, [restaurantId, areaType, persons]);

  useEffect(() => {
    if (step === "table") fetchAvailability();
  }, [step, areaType, fetchAvailability]);

  async function reserveTable(slot) {
    setReserving(true);
    setError("");
    try {
      const res = await fetch("/api/tables/reserve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          configId: slot.configId,
          persons,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Reservation failed");
      setReserved(data);
      setSlot(slot);
      const expiry = new Date(data.expiresAt).getTime();
      const tick = setInterval(() => {
        const left = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
        setCountdown(left);
        if (left === 0) clearInterval(tick);
      }, 1000);
      await fetchCheckoutPricing(data, slot);
      setStep("confirm");
    } catch (e) {
      setError(e.message);
    } finally {
      setReserving(false);
    }
  }

  async function fetchCheckoutPricing(reserved, slot) {
    setPL(true);
    try {
      const res = await fetch("/api/orders/checkout-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          cartItems: cart.map((i) => ({ foodId: i._id, quantity: i.quantity })),
          tableId: reserved.tableId,
          persons,
        }),
      });
      const data = await res.json();
      if (res.ok && data.preview)
        setPricing({ ...data.preview, areaLabel: slot?.label || areaType });
    } catch {
    } finally {
      setPL(false);
    }
  }

  async function placeOrder() {
    if (!reservedTable) return;
    setOrdering(true);
    setError("");
    try {
      // Step 1: Create the order
      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          cartItems: cart.map((i) => ({ foodId: i._id, quantity: i.quantity })),
          tableId: reservedTable.tableId,
          persons,
          areaType,
          customerNote: note || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.tableExpired) {
          setError("Table reservation expired. Please select a table again.");
          setStep("table");
          setReserved(null);
          setPricing(null);
        } else throw new Error(data.error);
        return;
      }

      // Step 2: Create Stripe checkout session for payment
      const order = data.order;
      const orderTotal = Math.round(order.total * 100); // Convert to cents for Stripe

      // Build public URL to pass to payment page
      const publicUrl = slug
        ? `${window.location.origin}/${slug}`
        : window.location.origin;

      const stripeRes = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          amount: orderTotal,
          orderId: order._id,
          publicUrl,
        }),
      });

      const stripeData = await stripeRes.json();
      if (!stripeRes.ok) {
        throw new Error(stripeData.error || "Failed to initiate payment");
      }

      // Step 3: Redirect to Stripe payment page
      if (stripeData.url) {
        window.location.href = stripeData.url;
      } else {
        throw new Error("Payment URL not received");
      }
    } catch (e) {
      setError(e.message);
      setOrdering(false);
    }
  }

  const displayFoodTotal = localPrice(cart);
  const displayTotal =
    pricing?.total ??
    parseFloat(
      ((displayFoodTotal + (reservedTable?.seatingPrice || 0)) * 1.1).toFixed(
        2,
      ),
    );
  const mins = countdown != null ? Math.floor(countdown / 60) : 14;
  const secs = countdown != null ? countdown % 60 : 59;
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const urgent = countdown != null && countdown < 120;

  // step breadcrumb labels
  const STEPS = ["detail", "cart", "table", "confirm"];
  const stepIdx = STEPS.indexOf(step);

  return (
    <>
      {/* Font import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .mi-modal-root *{box-sizing:border-box;margin:0;padding:0;font-family:'DM Sans',sans-serif}
        .mi-modal-root textarea{font-family:'DM Sans',sans-serif}
        .mi-modal-root button{font-family:'DM Sans',sans-serif;cursor:pointer;border:none;outline:none}
        .mi-modal-root input{font-family:'DM Sans',sans-serif;outline:none;border:none}

        /* tab toggle */
        .mi-area-tab{flex:1;padding:10px 0;border-radius:12px;font-size:0.82rem;font-weight:700;border:none;background:transparent;color:var(--muted);transition:all .2s;cursor:pointer}
        .mi-area-tab.on{background:#fff;color:var(--pri);box-shadow:0 2px 8px rgba(0,0,0,0.09)}
        .mi-area-tab:hover:not(.on){color:var(--ink2)}

        /* action button */
        .mi-btn-pri{
          width:100%;display:flex;align-items:center;justify-content:center;gap:8px;
          padding:1rem;border-radius:16px;font-size:0.95rem;font-weight:800;
          background:var(--pri);color:#fff;border:none;cursor:pointer;
          transition:background .18s,transform .12s,box-shadow .18s;
          box-shadow:0 4px 18px rgba(224,90,43,0.35);
        }
        .mi-btn-pri:hover{background:var(--pri-d);transform:translateY(-1px);box-shadow:0 6px 24px rgba(224,90,43,0.42)}
        .mi-btn-pri:active{transform:scale(0.97)}
        .mi-btn-pri:disabled{background:rgba(224,90,43,0.4);box-shadow:none;cursor:not-allowed;transform:none}

        /* refresh link */
        .mi-refresh-link{background:none;border:none;color:var(--muted);font-size:0.75rem;font-weight:700;cursor:pointer;text-align:center;display:block;width:100%;padding:4px;transition:color .2s}
        .mi-refresh-link:hover{color:var(--pri)}

        /* stepper hover */
        .mi-step-dec:hover:not(:disabled){background:rgba(224,90,43,0.08);border-color:var(--pri);color:var(--pri)}
        .mi-step-inc:hover{background:var(--pri-d)}
        
        /* cart item hover */
        .mi-cart-row:hover{background:rgba(224,90,43,0.04)}
        
        /* close btn hover */
        .mi-close-btn:hover{background:#f3f4f6}

        /* table card hover */
        .mi-table-card-can:hover{border-color:rgba(224,90,43,0.45);box-shadow:0 4px 16px rgba(0,0,0,0.08)}

        /* back btn hover */
        .mi-back-btn:hover{background:#f3f4f6}

        /* person btn hover */
        .mi-person-btn:hover:not(.on){border-color:rgba(224,90,43,0.4)}

        /* textarea focus */
        .mi-note-area:focus{border-color:var(--pri)!important;box-shadow:0 0 0 3px rgba(224,90,43,0.1)}

        /* scroll */
        .mi-modal-body::-webkit-scrollbar{width:4px}
        .mi-modal-body::-webkit-scrollbar-track{background:transparent}
        .mi-modal-body::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.12);border-radius:4px}

        @keyframes miModalIn{
          from{opacity:0;transform:translateY(24px) scale(0.98)}
          to{opacity:1;transform:translateY(0) scale(1)}
        }
        @keyframes miFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes miSlideUp{from{transform:translateY(8px);opacity:0}to{transform:translateY(0);opacity:1}}
      `}</style>

      <div className="mi-modal-root" style={S.backdrop}>
        {/* backdrop click closes only on detail */}
        <div
          style={S.backdropClick}
          onClick={step === "detail" ? onClose : undefined}
        />

        <div className="mi-modal-body" style={S.modal}>
          {/* ── HEADER BAR ── */}
          <div style={S.modalHeader}>
            {/* Back or spacer */}
            {step !== "detail" ? (
              <button
                className="mi-back-btn"
                onClick={() => {
                  if (step === "cart") setStep(initialCart ? "cart" : "detail");
                  else if (step === "table") setStep("cart");
                  else if (step === "confirm") {
                    setStep("table");
                    setReserved(null);
                    setPricing(null);
                  }
                }}
                style={S.iconBtn}
              >
                <ArrowLeft size={17} />
              </button>
            ) : (
              <div style={{ width: 36 }} />
            )}

            {/* Step title */}
            <div style={{ textAlign: "center", flex: 1 }}>
              <p style={S.modalTitle}>
                {step === "detail" ? food?.name || "Item" : ""}
                {step === "cart"
                  ? initialCart
                    ? "Review Order"
                    : "Your Cart"
                  : ""}
                {step === "table" ? "Choose Table" : ""}
                {step === "confirm" ? "Confirm Order" : ""}
              </p>
              {/* progress dots */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 5,
                  marginTop: 4,
                }}
              >
                {(initialCart ? ["cart", "table", "confirm"] : STEPS).map(
                  (s, i) => {
                    const active = s === step;
                    const done =
                      (initialCart
                        ? ["cart", "table", "confirm"]
                        : STEPS
                      ).indexOf(step) > i;
                    return (
                      <div
                        key={s}
                        style={{
                          width: active ? 20 : 6,
                          height: 6,
                          borderRadius: 3,
                          background: active
                            ? "var(--pri)"
                            : done
                              ? "rgba(224,90,43,0.4)"
                              : "rgba(0,0,0,0.1)",
                          transition: "all .25s",
                        }}
                      />
                    );
                  },
                )}
              </div>
            </div>

            <button
              className="mi-close-btn"
              onClick={onClose}
              style={S.iconBtn}
            >
              <X size={17} />
            </button>
          </div>

          {/* ════════════════════════════════════════════════════
              STEP 1 — DETAIL
          ════════════════════════════════════════════════════ */}
          {step === "detail" && (
            <div style={{ animation: "miSlideUp .28s ease-out" }}>
              {/* Food image */}
              <div style={S.heroImg}>
                {food?.image ? (
                  <img
                    src={food.image}
                    alt={food.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4rem",
                      opacity: 0.35,
                    }}
                  >
                    🍽️
                  </div>
                )}
                {categoryName && <span style={S.catBadge}>{categoryName}</span>}
                <div style={S.heroGrad} />
              </div>

              <div style={S.padded}>
                {/* Name + price */}
                <div style={{ marginBottom: 16 }}>
                  <h2 style={S.foodName}>{food?.name}</h2>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: 8,
                      marginTop: 4,
                    }}
                  >
                    <span style={S.foodPrice}>
                      ${parseFloat(food?.price || 0).toFixed(2)}
                    </span>
                    <span style={S.foodPriceSub}>per serving</span>
                  </div>
                </div>

                {food?.description && (
                  <p style={S.foodDesc}>{food.description}</p>
                )}

                {/* Quantity */}
                <div style={S.fieldGroup}>
                  <p style={S.label}>Quantity</p>
                  <Stepper
                    value={cart[0]?.quantity ?? 1}
                    onChange={(v) => updateQty(cart[0]?.cartId, v)}
                  />
                </div>

                <PersonPicker value={persons} onChange={setPersons} />

                {/* Est. price */}
                <div style={S.estBox}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "0.82rem",
                    }}
                  >
                    <span style={{ color: "var(--muted)" }}>Food est.</span>
                    <span style={{ fontWeight: 700, color: "var(--ink)" }}>
                      $
                      {(
                        parseFloat(food?.price || 0) * (cart[0]?.quantity ?? 1)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <p
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    + seating + tax at checkout
                  </p>
                </div>

                <button
                  className="mi-btn-pri"
                  onClick={() => setStep("cart")}
                  style={{ marginTop: 4 }}
                >
                  <ShoppingBag size={17} /> Add to Cart{" "}
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 2 — CART
          ════════════════════════════════════════════════════ */}
          {step === "cart" && (
            <div style={{ ...S.padded, animation: "miSlideUp .28s ease-out" }}>
              {cart.length === 0 ? (
                <div style={S.emptyState}>
                  <span style={{ fontSize: "3rem", opacity: 0.3 }}>🛒</span>
                  <p
                    style={{
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginTop: 8,
                    }}
                  >
                    Cart is empty
                  </p>
                </div>
              ) : (
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 10 }}
                >
                  {cart.map((item) => (
                    <div
                      key={item.cartId}
                      className="mi-cart-row"
                      style={S.cartRow}
                    >
                      <div style={S.cartThumb}>
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: "1.4rem" }}>🍽️</span>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            fontWeight: 700,
                            fontSize: "0.88rem",
                            color: "var(--ink)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {item.name}
                        </p>
                        <p
                          style={{
                            fontSize: "0.72rem",
                            color: "var(--muted)",
                            marginTop: 2,
                          }}
                        >
                          ${parseFloat(item.price).toFixed(2)} each
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          flexShrink: 0,
                        }}
                      >
                        <Stepper
                          value={item.quantity}
                          onChange={(v) => updateQty(item.cartId, v)}
                        />
                        <button
                          onClick={() => removeItem(item.cartId)}
                          style={S.deleteBtn}
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <span
                        style={{
                          fontWeight: 800,
                          color: "var(--ink)",
                          fontSize: "0.9rem",
                          width: 56,
                          textAlign: "right",
                          flexShrink: 0,
                        }}
                      >
                        ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <>
                  <div style={{ ...S.estBox, marginTop: 16 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "0.85rem",
                      }}
                    >
                      <span style={{ color: "var(--muted)" }}>
                        Food subtotal
                      </span>
                      <span style={{ fontWeight: 800, color: "var(--ink)" }}>
                        ${displayFoodTotal.toFixed(2)}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.72rem",
                        color: "var(--muted)",
                        marginTop: 4,
                      }}
                    >
                      + seating fee and tax after table selection
                    </p>
                  </div>

                  <div style={{ marginTop: 16 }}>
                    <PersonPicker value={persons} onChange={setPersons} />
                  </div>

                  <button
                    className="mi-btn-pri"
                    onClick={() => setStep("table")}
                    style={{ marginTop: 20 }}
                  >
                    <Utensils size={17} /> Choose Table{" "}
                    <ChevronRight size={15} />
                  </button>
                </>
              )}
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 3 — TABLE
          ════════════════════════════════════════════════════ */}
          {step === "table" && (
            <div style={{ ...S.padded, animation: "miSlideUp .28s ease-out" }}>
              <p
                style={{
                  fontSize: "0.78rem",
                  color: "var(--muted)",
                  marginBottom: 14,
                }}
              >
                Party of {persons} · table held 15 min after selection
              </p>

              {/* Area toggle */}
              <div style={S.areaToggle}>
                {["dine-in", "food-court"].map((t) => (
                  <button
                    key={t}
                    className={`mi-area-tab${areaType === t ? " on" : ""}`}
                    onClick={() => setAreaType(t)}
                  >
                    {t === "dine-in" ? "🪑 Dine-In" : "🏪 Food Court"}
                  </button>
                ))}
              </div>

              {error && <div style={S.errorBox}>{error}</div>}

              {availLoading ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      style={{
                        height: 80,
                        borderRadius: 16,
                        background: "var(--bg)",
                        animation: "pulse 1.5s infinite",
                      }}
                    />
                  ))}
                </div>
              ) : availability.length === 0 ? (
                <div style={S.emptyState}>
                  <MapPin size={32} style={{ opacity: 0.25 }} />
                  <p
                    style={{
                      fontWeight: 700,
                      color: "var(--ink)",
                      marginTop: 10,
                    }}
                  >
                    No tables for {areaType}
                  </p>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--muted)",
                      marginTop: 4,
                    }}
                  >
                    Ask the restaurant to set up tables
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  {availability.map((slot) => (
                    <TableCard
                      key={slot.configId}
                      slot={slot}
                      selected={selectedSlot}
                      onSelect={reserveTable}
                      reserving={reserving}
                    />
                  ))}
                </div>
              )}

              {reserving && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 10,
                    padding: "16px 0",
                    color: "var(--pri)",
                  }}
                >
                  <Loader2
                    size={18}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  <span style={{ fontWeight: 700, fontSize: "0.85rem" }}>
                    Reserving your table for 15 minutes…
                  </span>
                </div>
              )}

              <button
                className="mi-refresh-link"
                onClick={fetchAvailability}
                disabled={availLoading}
                style={{ marginTop: 12 }}
              >
                ↻ Refresh availability
              </button>
            </div>
          )}

          {/* ════════════════════════════════════════════════════
              STEP 4 — CONFIRM
          ════════════════════════════════════════════════════ */}
          {step === "confirm" && reservedTable && (
            <div style={{ ...S.padded, animation: "miSlideUp .28s ease-out" }}>
              {/* Countdown timer */}
              <div
                style={{
                  ...S.timerBadge,
                  ...(urgent ? S.timerBadgeUrgent : {}),
                }}
              >
                <Clock size={15} />
                <span>
                  Table {reservedTable.tableNumber} reserved ·{" "}
                  <strong>
                    {String(mins).padStart(2, "0")}:
                    {String(secs).padStart(2, "0")}
                  </strong>{" "}
                  remaining
                </span>
              </div>

              {/* Order items */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ ...S.label, marginBottom: 8 }}>Order Items</p>
                {cart.map((item) => (
                  <div key={item.cartId} style={S.confirmRow}>
                    <div
                      style={{
                        ...S.cartThumb,
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                      }}
                    >
                      {item.image ? (
                        <img
                          src={item.image}
                          alt=""
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span style={{ fontSize: "1.1rem" }}>🍽️</span>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p
                        style={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          color: "var(--ink)",
                        }}
                      >
                        {item.name}
                      </p>
                      <p
                        style={{
                          fontSize: "0.72rem",
                          color: "var(--muted)",
                          marginTop: 2,
                        }}
                      >
                        ×{item.quantity} · ${parseFloat(item.price).toFixed(2)}{" "}
                        each
                      </p>
                    </div>
                    <span
                      style={{
                        fontWeight: 800,
                        color: "var(--ink)",
                        fontSize: "0.9rem",
                      }}
                    >
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div style={S.fieldGroup}>
                <label style={S.label}>
                  Special Instructions{" "}
                  <span
                    style={{
                      color: "var(--muted)",
                      fontWeight: 400,
                      textTransform: "none",
                      letterSpacing: 0,
                    }}
                  >
                    (optional)
                  </span>
                </label>
                <textarea
                  className="mi-note-area"
                  rows={2}
                  placeholder="No onions, extra sauce…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={S.noteArea}
                />
              </div>

              {error && <div style={S.errorBox}>{error}</div>}

              <PriceBox pricing={pricing} loading={pricingLoading} />

              <button
                className="mi-btn-pri"
                onClick={placeOrder}
                disabled={ordering || !reservedTable}
                style={{ marginTop: 16 }}
              >
                {ordering ? (
                  <>
                    <Loader2
                      size={18}
                      style={{ animation: "spin 1s linear infinite" }}
                    />{" "}
                    Placing Order…
                  </>
                ) : (
                  <>
                    <ShoppingBag size={18} /> Place Order · $
                    {displayTotal.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// STYLE OBJECTS — all using CSS variables from the page design system
// ═══════════════════════════════════════════════════════════════════════════════
const S = {
  backdrop: {
    position: "fixed",
    inset: 0,
    zIndex: 600,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
    background: "rgba(10,8,5,0.72)",
    backdropFilter: "blur(6px)",
  },
  backdropClick: {
    position: "absolute",
    inset: 0,
  },
  modal: {
    position: "relative",
    background: "var(--white, #fff)",
    width: "100%",
    maxWidth: 560,
    borderRadius: "24px 24px 0 0",
    maxHeight: "94dvh",
    overflowY: "auto",
    overflowX: "hidden",
    animation: "miModalIn .32s cubic-bezier(.22,1,.36,1)",
    boxShadow: "0 -8px 48px rgba(0,0,0,0.22)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 16px 10px",
    borderBottom: "1px solid rgba(0,0,0,0.06)",
    position: "sticky",
    top: 0,
    background: "var(--white,#fff)",
    zIndex: 10,
  },
  modalTitle: {
    fontSize: "0.95rem",
    fontWeight: 800,
    color: "var(--ink,#1a1510)",
    fontFamily: "'DM Sans',sans-serif",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: "var(--bg,#faf7f4)",
    border: "1px solid rgba(0,0,0,0.07)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ink2,#3d3530)",
    transition: "background .18s",
    flexShrink: 0,
  },
  heroImg: {
    position: "relative",
    width: "100%",
    height: 220,
    background: "linear-gradient(135deg,#f5ede4,#fce8d8)",
    overflow: "hidden",
  },
  heroGrad: {
    position: "absolute",
    inset: "auto 0 0 0",
    height: 60,
    background: "linear-gradient(to top,rgba(0,0,0,0.28),transparent)",
  },
  catBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    background: "rgba(255,255,255,0.92)",
    backdropFilter: "blur(8px)",
    color: "var(--pri,#e05a2b)",
    fontSize: "0.65rem",
    fontWeight: 800,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    padding: "4px 10px",
    borderRadius: 100,
  },
  padded: { padding: "20px 20px 28px" },
  foodName: {
    fontSize: "1.55rem",
    fontWeight: 900,
    color: "var(--ink,#1a1510)",
    lineHeight: 1.15,
    fontFamily: "'Playfair Display',Georgia,serif",
  },
  foodPrice: {
    fontSize: "1.8rem",
    fontWeight: 900,
    color: "var(--pri,#e05a2b)",
    lineHeight: 1,
  },
  foodPriceSub: {
    fontSize: "0.75rem",
    color: "var(--muted,#7a726a)",
    fontWeight: 500,
  },
  foodDesc: {
    fontSize: "0.84rem",
    color: "var(--muted,#7a726a)",
    lineHeight: 1.6,
    marginBottom: 16,
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    marginBottom: 16,
  },
  label: {
    fontSize: "0.68rem",
    fontWeight: 800,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "var(--muted,#7a726a)",
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  estBox: {
    background: "rgba(224,90,43,0.06)",
    border: "1px solid rgba(224,90,43,0.14)",
    borderRadius: 14,
    padding: "12px 14px",
    marginBottom: 16,
  },
  stepper: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    background: "var(--bg,#faf7f4)",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 14,
    padding: 4,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "var(--white,#fff)",
    border: "1.5px solid rgba(0,0,0,0.1)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "var(--ink2,#3d3530)",
    transition: "all .18s",
    cursor: "pointer",
  },
  stepBtnDis: { opacity: 0.35, cursor: "not-allowed" },
  stepBtnPlus: {
    width: 34,
    height: 34,
    borderRadius: 10,
    background: "var(--pri,#e05a2b)",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    transition: "background .18s",
    cursor: "pointer",
    boxShadow: "0 2px 8px rgba(224,90,43,0.3)",
  },
  stepVal: {
    width: 28,
    textAlign: "center",
    fontWeight: 900,
    fontSize: "1rem",
    color: "var(--ink,#1a1510)",
  },
  personBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    border: "1.5px solid rgba(0,0,0,0.12)",
    background: "var(--white,#fff)",
    color: "var(--ink2,#3d3530)",
    fontSize: "0.82rem",
    fontWeight: 800,
    transition: "all .18s",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  personBtnOn: {
    background: "var(--pri,#e05a2b)",
    border: "1.5px solid var(--pri,#e05a2b)",
    color: "#fff",
    transform: "scale(1.08)",
    boxShadow: "0 4px 12px rgba(224,90,43,0.35)",
  },
  splitBadge: {
    display: "inline-block",
    background: "rgba(34,197,94,0.1)",
    color: "#15803d",
    border: "1px solid rgba(34,197,94,0.2)",
    fontSize: "0.72rem",
    fontWeight: 700,
    padding: "3px 10px",
    borderRadius: 100,
    marginTop: 2,
  },
  cartRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg,#faf7f4)",
    border: "1px solid rgba(0,0,0,0.06)",
    borderRadius: 14,
    padding: "10px 12px",
    transition: "background .15s",
  },
  cartThumb: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "rgba(224,90,43,0.08)",
    overflow: "hidden",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    background: "transparent",
    border: "none",
    color: "#f87171",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "background .15s, color .15s",
  },
  areaToggle: {
    display: "flex",
    gap: 4,
    padding: 4,
    background: "var(--bg,#faf7f4)",
    border: "1.5px solid rgba(0,0,0,0.08)",
    borderRadius: 16,
    marginBottom: 4,
  },
  tableCard: {
    width: "100%",
    textAlign: "left",
    padding: "14px 16px",
    borderRadius: 16,
    border: "1.5px solid rgba(0,0,0,0.09)",
    background: "var(--white,#fff)",
    transition: "all .2s",
  },
  tableCardOn: {
    border: "1.5px solid var(--pri,#e05a2b)",
    background: "rgba(224,90,43,0.04)",
    boxShadow: "0 4px 16px rgba(224,90,43,0.14)",
  },
  tableCardOff: { opacity: 0.55, background: "var(--bg,#faf7f4)" },
  timerBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 14px",
    borderRadius: 14,
    background: "rgba(234,179,8,0.08)",
    border: "1px solid rgba(234,179,8,0.25)",
    color: "#92400e",
    fontSize: "0.82rem",
    fontWeight: 600,
    marginBottom: 16,
  },
  timerBadgeUrgent: {
    background: "rgba(239,68,68,0.07)",
    border: "1px solid rgba(239,68,68,0.2)",
    color: "#dc2626",
  },
  confirmRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "var(--bg,#faf7f4)",
    borderRadius: 12,
    padding: "10px 12px",
    marginBottom: 8,
  },
  noteArea: {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid rgba(0,0,0,0.1)",
    borderRadius: 12,
    fontSize: "0.85rem",
    color: "var(--ink,#1a1510)",
    background: "var(--bg,#faf7f4)",
    resize: "none",
    transition: "border-color .2s, box-shadow .2s",
    fontFamily: "'DM Sans',sans-serif",
  },
  priceBox: {
    background: "rgba(224,90,43,0.05)",
    border: "1px solid rgba(224,90,43,0.14)",
    borderRadius: 16,
    padding: "14px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  priceLineGreen: {
    background: "rgba(34,197,94,0.08)",
    border: "1px solid rgba(34,197,94,0.15)",
    borderRadius: 10,
    padding: "6px 10px",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: "0.82rem",
    color: "#dc2626",
    fontWeight: 500,
    marginBottom: 12,
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 0",
    color: "var(--muted,#7a726a)",
    textAlign: "center",
  },
};
