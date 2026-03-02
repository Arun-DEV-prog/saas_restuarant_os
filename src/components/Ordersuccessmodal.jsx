"use client";

import { CheckCircle2, Clock, Receipt, X, ChevronRight } from "lucide-react";

export default function OrderSuccessModal({ order, onClose }) {
  if (!order) return null;

  const statusColors = {
    pending: {
      bg: "rgba(249,115,22,0.08)",
      border: "rgba(249,115,22,0.2)",
      dot: "#f97316",
      text: "#c2410c",
    },
    confirmed: {
      bg: "rgba(59,130,246,0.08)",
      border: "rgba(59,130,246,0.2)",
      dot: "#3b82f6",
      text: "#1d4ed8",
    },
    preparing: {
      bg: "rgba(234,179,8,0.08)",
      border: "rgba(234,179,8,0.2)",
      dot: "#eab308",
      text: "#a16207",
    },
    ready: {
      bg: "rgba(34,197,94,0.08)",
      border: "rgba(34,197,94,0.2)",
      dot: "#22c55e",
      text: "#15803d",
    },
  };
  const status = order.status || "pending";
  const sc = statusColors[status] || statusColors.pending;

  const orderId = order._id || order.id || "";
  const shortId = order.orderNumber || String(orderId).slice(-6).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;600;700;800&display=swap');

        .os-root * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'DM Sans', sans-serif; }
        .os-root button { font-family: 'DM Sans', sans-serif; outline: none; border: none; cursor: pointer; }

        @keyframes osBackdropIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes osCardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.96) }
          to   { opacity: 1; transform: translateY(0)    scale(1)    }
        }
        @keyframes osCheckPop {
          0%   { transform: scale(0)    opacity: 0 }
          60%  { transform: scale(1.18) }
          80%  { transform: scale(0.94) }
          100% { transform: scale(1)    opacity: 1 }
        }
        @keyframes osRingPulse {
          0%   { transform: scale(1);    opacity: 0.6 }
          100% { transform: scale(1.9);  opacity: 0   }
        }
        @keyframes osConfettiDrop {
          0%   { transform: translateY(-20px) rotate(0deg);   opacity: 1 }
          100% { transform: translateY(60px)  rotate(360deg); opacity: 0 }
        }
        @keyframes osFadeUp {
          from { opacity: 0; transform: translateY(10px) }
          to   { opacity: 1; transform: translateY(0) }
        }

        .os-backdrop {
          position: fixed; inset: 0; z-index: 700;
          display: flex; align-items: center; justify-content: center; padding: 20px;
          background: rgba(10,8,5,0.75);
          backdrop-filter: blur(8px);
          animation: osBackdropIn .25s ease-out;
        }
        .os-card {
          position: relative;
          background: var(--white, #fff);
          width: 100%; max-width: 400px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.12);
          animation: osCardIn .42s cubic-bezier(.22,1,.36,1);
        }

        /* top accent strip */
        .os-strip {
          height: 5px;
          background: linear-gradient(90deg, var(--pri,#e05a2b), #f59e0b);
        }

        /* close */
        .os-close {
          position: absolute; top: 14px; right: 14px;
          width: 32px; height: 32px; border-radius: 8px;
          background: var(--bg, #faf7f4);
          border: 1px solid rgba(0,0,0,0.07);
          display: flex; align-items: center; justify-content: center;
          color: var(--muted, #7a726a);
          transition: background .18s, color .18s;
          z-index: 2;
        }
        .os-close:hover { background: #f3f4f6; color: var(--ink, #1a1510); }

        /* check ring */
        .os-check-wrap {
          position: relative;
          width: 88px; height: 88px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 20px;
        }
        .os-check-ring {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(34,197,94,0.4);
          animation: osRingPulse 1.6s ease-out infinite;
        }
        .os-check-ring2 {
          position: absolute; inset: 0; border-radius: 50%;
          border: 2px solid rgba(34,197,94,0.25);
          animation: osRingPulse 1.6s ease-out .5s infinite;
        }
        .os-check-circle {
          width: 72px; height: 72px; border-radius: 50%;
          background: linear-gradient(135deg, #dcfce7, #bbf7d0);
          display: flex; align-items: center; justify-content: center;
          animation: osCheckPop .5s cubic-bezier(.22,1,.36,1) .1s both;
          box-shadow: 0 4px 20px rgba(34,197,94,0.3);
        }

        /* confetti dots */
        .os-confetti {
          position: absolute; width: 8px; height: 8px; border-radius: 50%;
          animation: osConfettiDrop 1s ease-out forwards;
          pointer-events: none;
        }

        /* body sections */
        .os-body { padding: 28px 24px 24px; text-align: center; }
        .os-title {
          font-family: 'Playfair Display', Georgia, serif;
          font-size: 1.65rem; font-weight: 900;
          color: var(--ink, #1a1510); line-height: 1.1;
          margin-bottom: 6px;
          animation: osFadeUp .35s ease-out .15s both;
        }
        .os-sub {
          font-size: 0.82rem; color: var(--muted, #7a726a);
          animation: osFadeUp .35s ease-out .2s both;
          margin-bottom: 20px;
        }

        /* order number card */
        .os-num-card {
          background: linear-gradient(135deg, rgba(224,90,43,0.07), rgba(245,158,11,0.06));
          border: 1.5px solid rgba(224,90,43,0.18);
          border-radius: 18px; padding: 14px 18px;
          margin-bottom: 16px;
          animation: osFadeUp .35s ease-out .25s both;
        }
        .os-num-label {
          font-size: 0.62rem; font-weight: 800;
          letter-spacing: 0.15em; text-transform: uppercase;
          color: var(--pri, #e05a2b); margin-bottom: 4px;
        }
        .os-num {
          font-size: 2rem; font-weight: 900;
          color: var(--pri, #e05a2b); line-height: 1;
          letter-spacing: 0.05em;
        }

        /* stat chips */
        .os-stats {
          display: flex; gap: 10px; margin-bottom: 16px;
          animation: osFadeUp .35s ease-out .3s both;
        }
        .os-stat {
          flex: 1; background: var(--bg, #faf7f4);
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 14px; padding: 12px 8px;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
        }
        .os-stat-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: rgba(224,90,43,0.1);
          display: flex; align-items: center; justify-content: center;
          color: var(--pri, #e05a2b);
        }
        .os-stat-val { font-size: 0.9rem; font-weight: 800; color: var(--ink, #1a1510); }
        .os-stat-lbl { font-size: 0.65rem; color: var(--muted, #7a726a); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }

        /* status pill */
        .os-status {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 6px 14px; border-radius: 100px;
          font-size: 0.75rem; font-weight: 700;
          margin-bottom: 16px;
          animation: osFadeUp .35s ease-out .35s both;
        }
        .os-status-dot { width: 7px; height: 7px; border-radius: 50%; }

        /* notice */
        .os-notice {
          font-size: 0.72rem; color: var(--muted, #7a726a);
          line-height: 1.5; margin-bottom: 20px;
          animation: osFadeUp .35s ease-out .38s both;
        }

        /* CTA */
        .os-cta {
          width: 100%; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 14px; border-radius: 16px;
          background: var(--pri, #e05a2b); color: #fff;
          font-size: 0.92rem; font-weight: 800;
          box-shadow: 0 4px 18px rgba(224,90,43,0.35);
          transition: background .18s, transform .12s, box-shadow .18s;
          animation: osFadeUp .35s ease-out .42s both;
        }
        .os-cta:hover {
          background: var(--pri-d, #c44a1e);
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(224,90,43,0.42);
        }
        .os-cta:active { transform: scale(0.97); }
      `}</style>

      <div className="os-root">
        <div className="os-backdrop">
          <div className="os-card">
            {/* top accent */}
            <div className="os-strip" />

            {/* close */}
            <button className="os-close" onClick={onClose}>
              <X size={15} />
            </button>

            <div className="os-body">
              {/* Animated check + confetti */}
              <div className="os-check-wrap">
                <div className="os-check-ring" />
                <div className="os-check-ring2" />
                <div className="os-check-circle">
                  <CheckCircle2 size={36} color="#16a34a" strokeWidth={2} />
                </div>
                {/* confetti dots */}
                {[
                  { top: "-4px", left: "10px", bg: "#f97316", delay: ".1s" },
                  { top: "4px", right: "8px", bg: "#22c55e", delay: ".18s" },
                  { top: "-8px", left: "38px", bg: "#e05a2b", delay: ".08s" },
                  { top: "8px", left: "-4px", bg: "#eab308", delay: ".22s" },
                  { top: "-2px", right: "28px", bg: "#3b82f6", delay: ".15s" },
                ].map((c, i) => (
                  <div
                    key={i}
                    className="os-confetti"
                    style={{
                      top: c.top,
                      left: c.left,
                      right: c.right,
                      background: c.bg,
                      animationDelay: c.delay,
                    }}
                  />
                ))}
              </div>

              <h2 className="os-title">Order Placed! 🎉</h2>
              <p className="os-sub">Your order has been sent to the kitchen</p>

              {/* Order number */}
              <div className="os-num-card">
                <p className="os-num-label">Order Number</p>
                <p className="os-num">#{shortId}</p>
              </div>

              {/* Stats */}
              <div className="os-stats">
                <div className="os-stat">
                  <div className="os-stat-icon">
                    <Clock size={15} />
                  </div>
                  <span className="os-stat-val">~15 min</span>
                  <span className="os-stat-lbl">Est. time</span>
                </div>
                {order.total != null && (
                  <div className="os-stat">
                    <div className="os-stat-icon">
                      <Receipt size={15} />
                    </div>
                    <span className="os-stat-val">
                      ${Number(order.total).toFixed(2)}
                    </span>
                    <span className="os-stat-lbl">Total</span>
                  </div>
                )}
                {order.tableNumber && (
                  <div className="os-stat">
                    <div className="os-stat-icon" style={{ fontSize: "1rem" }}>
                      🪑
                    </div>
                    <span className="os-stat-val">T-{order.tableNumber}</span>
                    <span className="os-stat-lbl">Table</span>
                  </div>
                )}
              </div>

              {/* Status pill */}
              <div>
                <div
                  className="os-status"
                  style={{
                    background: sc.bg,
                    border: `1px solid ${sc.border}`,
                    color: sc.text,
                  }}
                >
                  <div
                    className="os-status-dot"
                    style={{ background: sc.dot }}
                  />
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </div>
              </div>

              <p className="os-notice">
                The restaurant has been notified and will begin preparing your
                order shortly.
              </p>

              <button className="os-cta" onClick={onClose} type="button">
                <span>Back to Menu</span>
                <ChevronRight size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
