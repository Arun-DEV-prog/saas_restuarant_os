"use client";
// FILE: components/TableRequestsPanel.jsx
// Drop into your restaurant dashboard layout.
// Polls /api/restaurants/[id]/table-requests every 8s.
// Plays a subtle sound + shows badge when new requests arrive.
//
// Usage:
//   <TableRequestsPanel restaurantId={restaurant._id} />

import { useState, useEffect, useRef, useCallback } from "react";

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');

  .trp-root {
    --bg:       #05050a;
    --surface:  #0c0c14;
    --card:     #111118;
    --border:   rgba(255,255,255,0.07);
    --gold:     #d4a853;
    --gold-dim: rgba(212,168,83,0.1);
    --cream:    #f0e6d0;
    --muted:    rgba(240,230,208,0.4);
    --green:    #27ae60;
    --blue:     #2980b9;
    --purple:   #8e44ad;
    --red:      #c0392b;

    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    color: var(--cream);
    width: 100%;
  }

  /* ── HEADER BAR ── */
  .trp-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px 16px;
    border-bottom: 1px solid var(--border);
    background: var(--surface);
    border-radius: 8px 8px 0 0;
  }
  .trp-header-left { display: flex; align-items: center; gap: 12px; }
  .trp-header-icon {
    width: 36px; height: 36px; border-radius: 6px; flex-shrink: 0;
    background: var(--gold-dim);
    border: 1px solid rgba(212,168,83,0.2);
    display: flex; align-items: center; justify-content: center;
    font-size: 16px;
  }
  .trp-header-title {
    font-size: 15px; font-weight: 600; color: var(--cream);
  }
  .trp-header-sub {
    font-size: 11px; color: var(--muted); margin-top: 1px;
    font-family: 'DM Mono', monospace; letter-spacing: 0.06em;
  }
  .trp-header-right { display: flex; align-items: center; gap: 10px; }

  /* Live indicator */
  .trp-live {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--green);
    font-family: 'DM Mono', monospace;
  }
  .trp-live-dot {
    width: 6px; height: 6px; border-radius: 50%; background: var(--green);
    animation: livePulse 2s infinite;
  }
  @keyframes livePulse {
    0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(1.3)}
  }

  /* Pending badge */
  .trp-badge {
    min-width: 22px; height: 22px; border-radius: 100px;
    background: var(--red); color: #fff;
    font-size: 11px; font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    padding: 0 5px;
    animation: badgeIn .3s ease;
  }
  @keyframes badgeIn { from{transform:scale(0)} to{transform:scale(1)} }

  /* Filter tabs */
  .trp-tabs {
    display: flex; gap: 0;
    background: var(--bg);
    border-bottom: 1px solid var(--border);
    overflow-x: auto;
  }
  .trp-tab {
    flex: 1; padding: 12px 16px;
    font-size: 12px; font-weight: 500; letter-spacing: 0.06em;
    cursor: pointer; border: none; background: transparent;
    color: var(--muted); border-bottom: 2px solid transparent;
    transition: all .2s; font-family: 'Outfit', sans-serif;
    white-space: nowrap;
  }
  .trp-tab:hover { color: var(--cream); }
  .trp-tab.active { color: var(--gold); border-bottom-color: var(--gold); }

  /* ── REQUEST LIST ── */
  .trp-list {
    background: var(--bg);
    border-radius: 0 0 8px 8px;
    border: 1px solid var(--border);
    border-top: none;
    min-height: 200px;
    max-height: 520px;
    overflow-y: auto;
  }
  .trp-list::-webkit-scrollbar { width: 4px; }
  .trp-list::-webkit-scrollbar-track { background: transparent; }
  .trp-list::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  /* Empty state */
  .trp-empty {
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    padding: 60px 20px;
    color: var(--muted); text-align: center; gap: 10px;
  }
  .trp-empty-icon { font-size: 40px; opacity: .5; }
  .trp-empty-text { font-size: 14px; }

  /* Request card */
  .trp-item {
    display: flex; align-items: flex-start; gap: 14px;
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    transition: background .2s;
    animation: itemIn .35s cubic-bezier(.22,1,.36,1);
    position: relative;
  }
  @keyframes itemIn {
    from { opacity:0; transform: translateX(12px); }
    to   { opacity:1; transform: translateX(0); }
  }
  .trp-item:last-child { border-bottom: none; }
  .trp-item:hover { background: rgba(255,255,255,0.02); }
  .trp-item.new { background: rgba(212,168,83,0.05); }

  /* Action icon bubble */
  .trp-item-icon {
    width: 42px; height: 42px; border-radius: 10px; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
  }

  .trp-item-body { flex: 1; min-width: 0; }
  .trp-item-top {
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 4px;
  }
  .trp-item-action {
    font-size: 14px; font-weight: 600; color: var(--cream);
  }
  .trp-item-table {
    font-family: 'DM Mono', monospace;
    font-size: 11px; color: var(--gold);
    background: var(--gold-dim);
    border: 1px solid rgba(212,168,83,0.2);
    padding: 2px 8px; border-radius: 100px;
    letter-spacing: 0.06em;
  }
  .trp-item-time {
    font-size: 11px; color: var(--muted);
    font-family: 'DM Mono', monospace;
    margin-left: auto; flex-shrink: 0;
  }
  .trp-item-note {
    font-size: 12px; color: var(--muted); margin-top: 2px;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* Status chip */
  .trp-status {
    font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 9px; border-radius: 100px;
    font-family: 'DM Mono', monospace;
  }
  .trp-status.pending      { background: rgba(212,168,83,0.15); color: #d4a853; border: 1px solid rgba(212,168,83,0.25); }
  .trp-status.acknowledged { background: rgba(41,128,185,0.15); color: #2980b9; border: 1px solid rgba(41,128,185,0.25); }
  .trp-status.resolved     { background: rgba(39,174,96,0.12);  color: #27ae60; border: 1px solid rgba(39,174,96,0.2); }

  /* Action buttons */
  .trp-item-actions { display: flex; align-items: center; gap: 6px; margin-top: 8px; }
  .trp-btn {
    font-size: 11px; font-weight: 500; padding: 5px 12px; border-radius: 6px;
    border: 1px solid var(--border); background: transparent; color: var(--muted);
    cursor: pointer; transition: all .2s; font-family: 'Outfit', sans-serif;
  }
  .trp-btn:hover { color: var(--cream); border-color: rgba(255,255,255,0.15); background: rgba(255,255,255,0.04); }
  .trp-btn.ack {
    border-color: rgba(41,128,185,0.3); color: #2980b9;
    background: rgba(41,128,185,0.08);
  }
  .trp-btn.ack:hover { background: rgba(41,128,185,0.15); }
  .trp-btn.resolve {
    border-color: rgba(39,174,96,0.3); color: #27ae60;
    background: rgba(39,174,96,0.08);
  }
  .trp-btn.resolve:hover { background: rgba(39,174,96,0.15); }
  .trp-btn.del { color: rgba(192,57,43,0.6); }
  .trp-btn.del:hover { color: #c0392b; border-color: rgba(192,57,43,0.3); background: rgba(192,57,43,0.06); }

  /* New request pulse bar */
  .trp-new-bar {
    position: absolute; left: 0; top: 0; bottom: 0; width: 3px;
    background: var(--gold); border-radius: 2px 0 0 2px;
  }

  /* ── STATS ROW ── */
  .trp-stats {
    display: grid; grid-template-columns: repeat(4, 1fr);
    gap: 1px; background: var(--border);
    border: 1px solid var(--border);
    border-radius: 8px; margin-bottom: 12px;
    overflow: hidden;
  }
  .trp-stat {
    background: var(--surface); padding: 16px 14px; text-align: center;
    transition: background .2s;
  }
  .trp-stat:hover { background: var(--card); }
  .trp-stat-num {
    font-size: 24px; font-weight: 300; color: var(--gold);
    display: block; font-family: 'DM Mono', monospace;
  }
  .trp-stat-label {
    font-size: 10px; color: var(--muted); letter-spacing: 0.08em;
    text-transform: uppercase; margin-top: 2px; display: block;
  }

  /* ── SOUND TOGGLE ── */
  .trp-sound-btn {
    background: var(--gold-dim); border: 1px solid rgba(212,168,83,0.2);
    color: var(--gold); border-radius: 6px; padding: 6px 10px;
    font-size: 14px; cursor: pointer; transition: all .2s;
  }
  .trp-sound-btn:hover { background: rgba(212,168,83,0.18); }
  .trp-sound-btn.muted { opacity: .4; }

  /* ── REFRESH SPIN ── */
  .trp-refreshing .trp-live-dot { animation: spin .6s linear infinite; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

// ── Action meta ───────────────────────────────────────────────────────────────
const ACTION_META = {
  call_waiter: {
    emoji: "🙋",
    label: "Call Waiter",
    color: "rgba(212,168,83,0.15)",
    iconBg: "#d4a85322",
  },
  request_water: {
    emoji: "💧",
    label: "Request Water",
    color: "rgba(41,128,185,0.12)",
    iconBg: "#2980b922",
  },
  request_bill: {
    emoji: "🧾",
    label: "Request Bill",
    color: "rgba(39,174,96,0.12)",
    iconBg: "#27ae6022",
  },
  table_cleanup: {
    emoji: "🧹",
    label: "Table Cleanup",
    color: "rgba(142,68,173,0.12)",
    iconBg: "#8e44ad22",
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  return `${Math.floor(m / 60)}h ago`;
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function TableRequestsPanel({ restaurantId }) {
  const [requests, setRequests] = useState([]);
  const [filter, setFilter] = useState("pending");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [newIds, setNewIds] = useState(new Set());
  const prevIds = useRef(new Set());
  const audioCtx = useRef(null);
  const pollTimer = useRef(null);

  // Inject styles
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = styles;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // Play a subtle notification chime using Web Audio API (no external assets)
  function playChime() {
    if (!soundOn) return;
    try {
      if (!audioCtx.current) {
        audioCtx.current = new (
          window.AudioContext || window.webkitAudioContext
        )();
      }
      const ctx = audioCtx.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      /* AudioContext might be blocked */
    }
  }

  // Fetch requests
  const fetchRequests = useCallback(
    async (silent = false) => {
      if (!restaurantId) return;
      if (!silent) setRefreshing(true);
      try {
        const url = `/api/restaurants/${restaurantId}/table-requests${filter !== "all" ? `?status=${filter}` : ""}`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = await res.json();
        setRequests(data);

        // Detect new items
        const incoming = new Set(data.map((r) => r._id));
        const fresh = [...incoming].filter((id) => !prevIds.current.has(id));
        if (fresh.length > 0 && prevIds.current.size > 0) {
          setNewIds(new Set(fresh));
          playChime();
          // Clear "new" highlight after 5s
          setTimeout(() => setNewIds(new Set()), 5000);
        }
        prevIds.current = incoming;
      } catch {
        /* network hiccup */
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [restaurantId, filter, soundOn],
  );

  // Polling — every 8 seconds
  useEffect(() => {
    fetchRequests();
    pollTimer.current = setInterval(() => fetchRequests(true), 8000);
    return () => clearInterval(pollTimer.current);
  }, [fetchRequests]);

  // Update status
  async function updateStatus(id, status) {
    // Optimistic UI
    setRequests((prev) =>
      prev.map((r) => (r._id === id ? { ...r, status } : r)),
    );
    try {
      await fetch(`/api/restaurants/${restaurantId}/table-requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
    } catch {
      fetchRequests(true); // rollback on error
    }
  }

  async function deleteRequest(id) {
    setRequests((prev) => prev.filter((r) => r._id !== id));
    try {
      await fetch(`/api/restaurants/${restaurantId}/table-requests/${id}`, {
        method: "DELETE",
      });
    } catch {
      fetchRequests(true);
    }
  }

  // Stats
  const counts = {
    pending: requests.filter((r) => r.status === "pending").length,
    acknowledged: requests.filter((r) => r.status === "acknowledged").length,
    resolved: requests.filter((r) => r.status === "resolved").length,
    total: requests.length,
  };

  const displayed =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const TABS = [
    { key: "pending", label: "Pending", count: counts.pending },
    { key: "acknowledged", label: "In Progress", count: counts.acknowledged },
    { key: "resolved", label: "Resolved", count: counts.resolved },
    { key: "all", label: "All", count: counts.total },
  ];

  return (
    <div className="trp-root">
      {/* ── Stats ── */}
      <div className="trp-stats">
        {[
          { label: "Pending", num: counts.pending, color: "#d4a853" },
          { label: "In Progress", num: counts.acknowledged, color: "#2980b9" },
          { label: "Resolved", num: counts.resolved, color: "#27ae60" },
          { label: "Total Today", num: counts.total, color: "#f0e6d0" },
        ].map((s) => (
          <div className="trp-stat" key={s.label}>
            <span className="trp-stat-num" style={{ color: s.color }}>
              {s.num}
            </span>
            <span className="trp-stat-label">{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── Panel ── */}
      <div className={refreshing ? "trp-refreshing" : ""}>
        {/* Header */}
        <div className="trp-header">
          <div className="trp-header-left">
            <div className="trp-header-icon">🔔</div>
            <div>
              <div className="trp-header-title">Table Requests</div>
              <div className="trp-header-sub">
                LIVE · auto-refreshes every 8s
              </div>
            </div>
          </div>
          <div className="trp-header-right">
            {counts.pending > 0 && (
              <div className="trp-badge">{counts.pending}</div>
            )}
            <div className="trp-live">
              <div className="trp-live-dot" />
              Live
            </div>
            <button
              className={`trp-sound-btn${soundOn ? "" : " muted"}`}
              onClick={() => setSoundOn((v) => !v)}
              title={soundOn ? "Mute alerts" : "Unmute alerts"}
            >
              {soundOn ? "🔔" : "🔕"}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="trp-tabs">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`trp-tab${filter === t.key ? " active" : ""}`}
              onClick={() => setFilter(t.key)}
            >
              {t.label}
              {t.count > 0 && (
                <span
                  style={{
                    marginLeft: 6,
                    background:
                      filter === t.key
                        ? "rgba(212,168,83,0.18)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      filter === t.key ? "#d4a853" : "rgba(240,230,208,0.4)",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 100,
                  }}
                >
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="trp-list">
          {loading ? (
            <div className="trp-empty">
              <div
                style={{
                  width: 28,
                  height: 28,
                  border: "2px solid rgba(212,168,83,0.2)",
                  borderTopColor: "#d4a853",
                  borderRadius: "50%",
                  animation: "spin .7s linear infinite",
                }}
              />
              <span className="trp-empty-text" style={{ marginTop: 12 }}>
                Loading requests…
              </span>
            </div>
          ) : displayed.length === 0 ? (
            <div className="trp-empty">
              <div className="trp-empty-icon">
                {filter === "pending"
                  ? "✅"
                  : filter === "resolved"
                    ? "🎉"
                    : "📭"}
              </div>
              <div className="trp-empty-text">
                {filter === "pending"
                  ? "No pending requests"
                  : filter === "resolved"
                    ? "No resolved requests yet"
                    : "No requests found"}
              </div>
            </div>
          ) : (
            displayed.map((req) => {
              const meta = ACTION_META[req.action] || {
                emoji: "📋",
                label: req.action,
              };
              const isNew = newIds.has(req._id);
              return (
                <div key={req._id} className={`trp-item${isNew ? " new" : ""}`}>
                  {isNew && <div className="trp-new-bar" />}

                  {/* Icon */}
                  <div
                    className="trp-item-icon"
                    style={{ background: meta.iconBg }}
                  >
                    {meta.emoji}
                  </div>

                  {/* Body */}
                  <div className="trp-item-body">
                    <div className="trp-item-top">
                      <span className="trp-item-action">{meta.label}</span>
                      <span className="trp-item-table">
                        Table {req.tableNumber}
                      </span>
                      <span className={`trp-status ${req.status}`}>
                        {req.status === "acknowledged"
                          ? "In Progress"
                          : req.status}
                      </span>
                      <span className="trp-item-time">
                        {timeAgo(req.createdAt)}
                      </span>
                    </div>

                    {req.guestNote && (
                      <div className="trp-item-note">"{req.guestNote}"</div>
                    )}

                    {/* Action buttons */}
                    <div className="trp-item-actions">
                      {req.status === "pending" && (
                        <button
                          className="trp-btn ack"
                          onClick={() => updateStatus(req._id, "acknowledged")}
                        >
                          👋 Acknowledge
                        </button>
                      )}
                      {req.status !== "resolved" && (
                        <button
                          className="trp-btn resolve"
                          onClick={() => updateStatus(req._id, "resolved")}
                        >
                          ✓ Resolve
                        </button>
                      )}
                      <button
                        className="trp-btn del"
                        onClick={() => deleteRequest(req._id)}
                      >
                        ✕ Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
