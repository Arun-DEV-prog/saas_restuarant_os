"use client";
// FILE: components/HotActions.jsx  — Redesigned: premium glass speed-dial FAB

import { useState, useEffect, useRef } from "react";

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

  /* ── ROOT ─────────────────────────────────────────────────────────────────── */
  .ha-root {
    position: fixed;
    bottom: 88px;
    right: 24px;
    z-index: 40;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 0;
    font-family: 'DM Sans', sans-serif;
  }

  /* ── ACTIONS LIST ─────────────────────────────────────────────────────────── */
  .ha-actions {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
    margin-bottom: 12px;
    pointer-events: none;
  }
  .ha-actions.open { pointer-events: auto; }

  .ha-action-row {
    display: flex;
    align-items: center;
    gap: 10px;
    opacity: 0;
    transform: translateY(20px) scale(0.85);
    transition: opacity .3s cubic-bezier(.22,1,.36,1), transform .3s cubic-bezier(.22,1,.36,1);
  }
  .ha-actions.open .ha-action-row {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  .ha-actions.open .ha-action-row:nth-child(4) { transition-delay: .04s; }
  .ha-actions.open .ha-action-row:nth-child(3) { transition-delay: .08s; }
  .ha-actions.open .ha-action-row:nth-child(2) { transition-delay: .12s; }
  .ha-actions.open .ha-action-row:nth-child(1) { transition-delay: .16s; }

  /* Label pill — glass */
  .ha-label {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    color: #1a1510;
    font-size: 12.5px;
    font-weight: 600;
    letter-spacing: 0.01em;
    padding: 7px 14px;
    border-radius: 100px;
    border: 1px solid rgba(0,0,0,0.07);
    white-space: nowrap;
    box-shadow: 0 2px 12px rgba(0,0,0,0.10), 0 1px 3px rgba(0,0,0,0.06);
    user-select: none;
  }

  /* Action button */
  .ha-action-btn {
    width: 48px; height: 48px; border-radius: 16px;
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    font-size: 19px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.18), 0 1px 4px rgba(0,0,0,0.1);
    transition: transform .2s cubic-bezier(.22,1,.36,1), box-shadow .2s ease, filter .2s;
    flex-shrink: 0;
    position: relative;
  }
  .ha-action-btn:hover {
    transform: scale(1.08) translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.22);
  }
  .ha-action-btn:active { transform: scale(0.93); }
  .ha-action-btn.sent {
    filter: saturate(0.2) brightness(0.75);
    cursor: default;
    pointer-events: none;
  }

  /* Sent checkmark ring */
  .ha-sent-ring {
    position: absolute; inset: -3px;
    border-radius: 18px;
    border: 2px solid #22c55e;
    animation: sentRingIn .35s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes sentRingIn {
    from { opacity:0; transform:scale(0.75); }
    to   { opacity:1; transform:scale(1); }
  }

  /* ── FAB ─────────────────────────────────────────────────────────────────── */
  .ha-fab {
    width: 60px; height: 60px; border-radius: 20px;
    background: linear-gradient(145deg, #e05a2b 0%, #c44a1e 100%);
    border: none; cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    box-shadow:
      0 8px 28px rgba(224,90,43,0.45),
      0 2px 8px rgba(0,0,0,0.15),
      inset 0 1px 0 rgba(255,255,255,0.2);
    transition: transform .28s cubic-bezier(.22,1,.36,1), box-shadow .28s ease, border-radius .28s ease;
    position: relative;
    z-index: 2;
  }
  .ha-fab:hover {
    transform: scale(1.06) translateY(-2px);
    box-shadow: 0 14px 36px rgba(224,90,43,0.5), 0 4px 12px rgba(0,0,0,0.2);
  }
  .ha-fab:active { transform: scale(0.93); }
  .ha-fab.open {
    border-radius: 50%;
    background: linear-gradient(145deg, #1a1510 0%, #3d3530 100%);
    box-shadow: 0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  /* Pulse ring on FAB when idle */
  .ha-fab-pulse {
    position: absolute; inset: -8px;
    border-radius: 24px;
    background: rgba(224,90,43,0.18);
    animation: fabPulse 2.8s ease-in-out infinite;
    pointer-events: none;
  }
  .ha-fab.open .ha-fab-pulse { display: none; }
  @keyframes fabPulse {
    0%,100% { transform: scale(1); opacity: .7; }
    50%      { transform: scale(1.35); opacity: 0; }
  }

  /* Pending dot badge on FAB */
  .ha-fab-badge {
    position: absolute; top: -5px; right: -5px;
    min-width: 19px; height: 19px; border-radius: 100px;
    background: #22c55e; color: #fff;
    font-size: 10px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    border: 2.5px solid #fff;
    padding: 0 3px;
    animation: badgeIn .3s cubic-bezier(.22,1,.36,1);
    box-shadow: 0 2px 6px rgba(34,197,94,0.4);
  }
  @keyframes badgeIn {
    from { transform: scale(0) rotate(-20deg); }
    to   { transform: scale(1) rotate(0deg); }
  }

  /* FAB icon */
  .ha-fab-icon {
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    transition: transform .35s cubic-bezier(.22,1,.36,1), opacity .25s;
  }
  .ha-fab.open .ha-fab-icon { transform: rotate(45deg); }

  /* ── TABLE PICKER SHEET ───────────────────────────────────────────────────── */
  .ha-sheet-backdrop {
    position: fixed; inset: 0; z-index: 39;
    background: rgba(10,8,6,0.5);
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
    animation: fadeIn .22s ease;
  }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }

  .ha-sheet {
    position: fixed;
    bottom: 0; left: 0; right: 0;
    z-index: 41;
    background: #ffffff;
    border-radius: 24px 24px 0 0;
    border-top: 1px solid rgba(0,0,0,0.06);
    padding: 0 0 36px;
    box-shadow: 0 -20px 60px rgba(0,0,0,0.15);
    animation: sheetUp .38s cubic-bezier(.22,1,.36,1);
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes sheetUp {
    from { transform: translateY(100%); }
    to   { transform: translateY(0); }
  }

  .ha-sheet-handle {
    width: 36px; height: 4px; border-radius: 2px;
    background: rgba(0,0,0,0.12);
    margin: 14px auto 0;
  }

  .ha-sheet-title {
    font-size: 17px; font-weight: 700; color: #1a1510;
    text-align: center; padding: 20px 24px 4px;
    letter-spacing: -0.02em;
  }
  .ha-sheet-sub {
    font-size: 13px; color: #7a726a;
    text-align: center; margin-bottom: 20px;
    padding: 0 24px;
  }

  .ha-table-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    padding: 0 20px;
    max-height: 220px;
    overflow-y: auto;
  }
  .ha-table-btn {
    background: #faf7f4;
    border: 1.5px solid rgba(0,0,0,0.08);
    border-radius: 12px;
    padding: 13px 8px;
    cursor: pointer;
    color: #3d3530;
    font-size: 13px; font-weight: 600;
    text-align: center;
    transition: all .18s cubic-bezier(.22,1,.36,1);
    font-family: 'DM Sans', sans-serif;
  }
  .ha-table-btn:hover {
    background: rgba(224,90,43,0.08);
    border-color: rgba(224,90,43,0.3);
    color: #e05a2b;
    transform: scale(1.04);
  }
  .ha-table-btn.selected {
    background: rgba(224,90,43,0.1);
    border-color: #e05a2b;
    color: #e05a2b;
    box-shadow: 0 0 0 3px rgba(224,90,43,0.12);
  }
  .ha-sheet-confirm {
    margin: 16px 20px 0;
    background: linear-gradient(135deg, #e05a2b 0%, #c44a1e 100%);
    color: #fff; border: none; border-radius: 14px;
    padding: 15px; width: calc(100% - 40px);
    font-size: 14px; font-weight: 700; letter-spacing: 0.03em;
    cursor: pointer; transition: all .22s;
    font-family: 'DM Sans', sans-serif;
    box-shadow: 0 4px 16px rgba(224,90,43,0.35);
  }
  .ha-sheet-confirm:hover { opacity: .92; transform: translateY(-1px); }
  .ha-sheet-confirm:active { transform: scale(0.98); }
  .ha-sheet-confirm:disabled { opacity: .35; cursor: default; transform: none; box-shadow:none; }

  /* ── TOAST ───────────────────────────────────────────────────────────────── */
  .ha-toast {
    position: fixed;
    bottom: 100px; left: 50%; transform: translateX(-50%);
    z-index: 50;
    background: rgba(26,21,16,0.96);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 100px;
    padding: 11px 20px;
    display: flex; align-items: center; gap: 10px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.35);
    animation: toastIn .38s cubic-bezier(.22,1,.36,1);
    white-space: nowrap;
    font-size: 13px; font-weight: 600; color: #fff;
    font-family: 'DM Sans', sans-serif;
  }
  @keyframes toastIn {
    from { opacity:0; transform: translateX(-50%) translateY(20px) scale(0.88); }
    to   { opacity:1; transform: translateX(-50%) translateY(0)    scale(1); }
  }
  .ha-toast-icon { font-size: 16px; }
  .ha-toast-dot { width: 5px; height: 5px; border-radius: 50%; background: #22c55e; flex-shrink:0; }
`;

const ACTIONS = [
  {
    id: "call_waiter",
    emoji: "🙋",
    label: "Call Waiter",
    color: "linear-gradient(145deg,#f59e0b,#d97706)",
    shadow: "rgba(245,158,11,0.35)",
  },
  {
    id: "request_water",
    emoji: "💧",
    label: "Request Water",
    color: "linear-gradient(145deg,#3b82f6,#2563eb)",
    shadow: "rgba(59,130,246,0.35)",
  },
  {
    id: "request_bill",
    emoji: "🧾",
    label: "Request Bill",
    color: "linear-gradient(145deg,#22c55e,#16a34a)",
    shadow: "rgba(34,197,94,0.35)",
  },
  {
    id: "table_cleanup",
    emoji: "🧹",
    label: "Table Cleanup",
    color: "linear-gradient(145deg,#a855f7,#7c3aed)",
    shadow: "rgba(168,85,247,0.35)",
  },
];

export default function HotActions({
  restaurantId,
  tableNumber: initialTable,
  totalTables = 20,
}) {
  const [open, setOpen] = useState(false);
  const [tableNumber, setTableNumber] = useState(initialTable || "");
  const [showSheet, setShowSheet] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [sent, setSent] = useState({});
  const [loading, setLoading] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  function showToast(emoji, text) {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ emoji, text });
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }

  async function submitRequest(action) {
    if (!tableNumber) {
      setPendingAction(action);
      setShowSheet(true);
      return;
    }
    setLoading(action.id);
    try {
      const res = await fetch(
        `/api/restaurants/${restaurantId}/table-requests`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tableNumber,
            action: action.id,
            guestNote: "",
          }),
        },
      );
      if (res.ok) {
        setSent((prev) => ({ ...prev, [action.id]: true }));
        showToast(action.emoji, `${action.label} sent! Staff notified.`);
        setTimeout(
          () => {
            setSent((prev) => {
              const n = { ...prev };
              delete n[action.id];
              return n;
            });
          },
          3 * 60 * 1000,
        );
      } else {
        showToast("⚠️", "Couldn't send request. Try again.");
      }
    } catch {
      showToast("⚠️", "Network error. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  function handleTableConfirm(num) {
    setTableNumber(String(num));
    setShowSheet(false);
    if (pendingAction) {
      const action = pendingAction;
      setPendingAction(null);
      setTimeout(() => submitRequest(action), 200);
    }
  }

  const sentCount = Object.keys(sent).length;

  return (
    <>
      {showSheet && (
        <>
          <div
            className="ha-sheet-backdrop"
            onClick={() => setShowSheet(false)}
          />
          <div className="ha-sheet">
            <div className="ha-sheet-handle" />
            <div className="ha-sheet-title">Which table are you at?</div>
            <div className="ha-sheet-sub">
              Select your table so staff can find you
            </div>
            <div className="ha-table-grid">
              {Array.from({ length: totalTables }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  className={`ha-table-btn${tableNumber === String(n) ? " selected" : ""}`}
                  onClick={() => setTableNumber(String(n))}
                >
                  Table {n}
                </button>
              ))}
            </div>
            <button
              className="ha-sheet-confirm"
              disabled={!tableNumber}
              onClick={() => handleTableConfirm(tableNumber)}
            >
              Confirm Table {tableNumber && `· #${tableNumber}`}
            </button>
          </div>
        </>
      )}

      <div className="ha-root">
        <div className={`ha-actions${open ? " open" : ""}`}>
          {ACTIONS.map((action) => {
            const isSent = sent[action.id];
            const isLoading = loading === action.id;
            return (
              <div className="ha-action-row" key={action.id}>
                <div className="ha-label">{action.label}</div>
                <button
                  className={`ha-action-btn${isSent ? " sent" : ""}`}
                  style={{
                    background: action.color,
                    boxShadow: `0 4px 16px ${action.shadow}`,
                  }}
                  onClick={() => !isSent && submitRequest(action)}
                  title={action.label}
                >
                  {isLoading ? (
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "#fff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "haSpin .7s linear infinite",
                      }}
                    />
                  ) : (
                    action.emoji
                  )}
                  {isSent && <div className="ha-sent-ring" />}
                </button>
              </div>
            );
          })}
        </div>

        <button
          className={`ha-fab${open ? " open" : ""}`}
          onClick={() => setOpen((v) => !v)}
          aria-label="Guest actions"
        >
          <div className="ha-fab-pulse" />
          <span className="ha-fab-icon">
            {open ? (
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                <line x1="6" y1="1" x2="6" y2="4" />
                <line x1="10" y1="1" x2="10" y2="4" />
                <line x1="14" y1="1" x2="14" y2="4" />
              </svg>
            )}
          </span>
          {sentCount > 0 && !open && (
            <span className="ha-fab-badge">{sentCount}</span>
          )}
        </button>
      </div>

      {toast && (
        <div className="ha-toast">
          <span className="ha-toast-icon">{toast.emoji}</span>
          <span className="ha-toast-dot" />
          {toast.text}
        </div>
      )}

      <style>{`@keyframes haSpin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
