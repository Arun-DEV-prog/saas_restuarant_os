"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";
import {
  ChefHat,
  Zap,
  BarChart3,
  Users,
  Clock,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  ArrowRight,
  Star,
  Check,
  Menu,
  X,
  Send,
  Play,
  Pause,
  Sparkles,
  Globe,
  Award,
} from "lucide-react";

/* ─── Global CSS ─────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Serif:ital@0;1&display=swap');
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,300;12..96,400;12..96,500;12..96,700;12..96,800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream:   #F5F0E8;
    --cream2:  #EDE6D6;
    --warm:    #D4C5A9;
    --sand:    #C4A882;
    --brown:   #8B6914;
    --ember:   #C4622D;
    --ember2:  #E07B45;
    --forest:  #1C3A2A;
    --forest2: #2A5040;
    --forest3: #3D6B52;
    --ink:     #0E1A12;
    --gold:    #D4A843;
    --gold2:   #F0C96A;
    --text:    #1A1208;
    --text2:   #4A3E2C;
    --text3:   #7A6B52;
    --border:  rgba(139,105,20,0.15);
    --border2: rgba(139,105,20,0.3);
    --surface: #FDFAF4;
    --surface2:#F7F2E8;
    --surface3:#EEE7D4;
    --nav-h:   72px;
  }

  html { scroll-behavior: smooth; font-size: 16px; }

  body {
    background: var(--surface);
    color: var(--text);
    font-family: 'Bricolage Grotesque', sans-serif;
    overflow-x: hidden;
    -webkit-font-smoothing: antialiased;
    line-height: 1.6;
  }

  /* ── Typography classes ── */
  .display   { font-family: 'Cormorant Garamond', serif; font-weight: 700; letter-spacing: -0.02em; line-height: 1.05; }
  .serif     { font-family: 'Instrument Serif', serif; font-style: italic; }
  .grotesk   { font-family: 'Bricolage Grotesque', sans-serif; }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--cream2); }
  ::-webkit-scrollbar-thumb { background: var(--sand); border-radius: 2px; }

  /* ── Keyframes ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(32px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }
  @keyframes slideLeft {
    from { opacity: 0; transform: translateX(-40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes slideRight {
    from { opacity: 0; transform: translateX(40px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes floatSlow {
    0%,100% { transform: translateY(0) rotate(0deg); }
    33%     { transform: translateY(-14px) rotate(1deg); }
    66%     { transform: translateY(-7px) rotate(-0.5deg); }
  }
  @keyframes pulseSoft {
    0%,100% { opacity: 0.6; transform: scale(1); }
    50%     { opacity: 1; transform: scale(1.04); }
  }
  @keyframes rotateSlow {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes shimmerGold {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes drawLine {
    from { stroke-dashoffset: 1000; }
    to   { stroke-dashoffset: 0; }
  }
  @keyframes scaleIn {
    from { transform: scale(0.88); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }
  @keyframes borderDance {
    0%,100% { border-color: rgba(212,168,67,0.2); }
    50%     { border-color: rgba(212,168,67,0.6); }
  }
  @keyframes marquee {
    from { transform: translateX(0); }
    to   { transform: translateX(-50%); }
  }
  @keyframes grain {
    0%,100% { transform: translate(0,0); }
    10%     { transform: translate(-2%,-3%); }
    20%     { transform: translate(2%,2%); }
    30%     { transform: translate(-1%,3%); }
    40%     { transform: translate(3%,-1%); }
    50%     { transform: translate(-2%,2%); }
    60%     { transform: translate(1%,-2%); }
    70%     { transform: translate(-3%,1%); }
    80%     { transform: translate(2%,3%); }
    90%     { transform: translate(-1%,-1%); }
  }
  @keyframes numberTick {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.5; }
    100% { transform: scale(4); opacity: 0; }
  }
  @keyframes blink {
    0%,100% { opacity: 1; } 50% { opacity: 0; }
  }

  /* ── Reveal on scroll ── */
  .reveal {
    opacity: 0;
    transform: translateY(28px);
    transition: opacity 0.75s cubic-bezier(0.22,1,0.36,1),
                transform 0.75s cubic-bezier(0.22,1,0.36,1);
  }
  .reveal.visible { opacity: 1; transform: translateY(0); }

  /* ── Hover card lift ── */
  .lift {
    transition: transform 0.35s cubic-bezier(0.34,1.4,0.64,1),
                box-shadow 0.35s ease;
  }
  .lift:hover {
    transform: translateY(-6px);
    box-shadow: 0 24px 48px rgba(14,26,18,0.12), 0 4px 12px rgba(14,26,18,0.06);
  }

  /* ── Tilt card ── */
  .tilt { transform-style: preserve-3d; transition: transform 0.12s ease; }

  /* ── Gold shimmer text ── */
  .gold-shimmer {
    background: linear-gradient(90deg, var(--gold) 0%, var(--gold2) 40%, var(--brown) 60%, var(--gold) 100%);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: shimmerGold 4s linear infinite;
  }

  /* ── Noise grain overlay ── */
  .grain::after {
    content: '';
    position: fixed;
    inset: -50%;
    width: 200%;
    height: 200%;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E");
    opacity: 0.028;
    pointer-events: none;
    z-index: 9998;
    animation: grain 8s steps(10) infinite;
  }

  /* ── Nav link ── */
  .nav-link {
    position: relative;
    color: var(--text2);
    text-decoration: none;
    font-size: 14px;
    font-weight: 500;
    padding: 4px 0;
    transition: color 0.2s;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: -2px; left: 0;
    height: 1px; width: 0;
    background: var(--ember);
    transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .nav-link:hover { color: var(--text); }
  .nav-link:hover::after { width: 100%; }

  /* ── Btn base ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 4px;
    background: var(--forest); color: var(--cream);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px; font-weight: 600; letter-spacing: 0.02em;
    border: none; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
    position: relative; overflow: hidden;
  }
  .btn-primary::after {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(212,168,67,0.15), transparent);
    opacity: 0; transition: opacity 0.3s;
  }
  .btn-primary:hover { background: var(--forest2); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,58,42,0.25); }
  .btn-primary:hover::after { opacity: 1; }
  .btn-primary:active { transform: translateY(0); }

  .btn-ghost {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 22px; border-radius: 4px;
    background: transparent; color: var(--text);
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px; font-weight: 500;
    border: 1.5px solid var(--border2); cursor: pointer;
    transition: all 0.25s ease;
  }
  .btn-ghost:hover { background: var(--surface3); border-color: var(--sand); }

  .btn-gold {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 13px 26px; border-radius: 4px;
    background: linear-gradient(135deg, var(--brown), var(--gold));
    color: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px; font-weight: 700;
    border: none; cursor: pointer;
    transition: all 0.25s cubic-bezier(0.22,1,0.36,1);
    box-shadow: 0 4px 16px rgba(212,168,67,0.3);
  }
  .btn-gold:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(212,168,67,0.45); }

  /* ── Tag pill ── */
  .tag {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 2px;
    background: var(--surface3);
    border: 1px solid var(--border2);
    font-size: 11px; font-weight: 600;
    letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--text2);
  }

  /* ── Card ── */
  .card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 32px;
    transition: border-color 0.3s, box-shadow 0.3s;
  }
  .card:hover {
    border-color: var(--border2);
    box-shadow: 0 16px 40px rgba(14,26,18,0.07);
  }

  /* ── Marquee ticker ── */
  .marquee-track {
    display: flex;
    width: max-content;
    animation: marquee 28s linear infinite;
  }
  .marquee-track:hover { animation-play-state: paused; }

  /* ── Feature tab ── */
  .feat-tab {
    padding: 18px 20px;
    border-radius: 6px;
    cursor: pointer;
    border: 1px solid transparent;
    transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
  }
  .feat-tab:hover { background: var(--surface2); border-color: var(--border); }
  .feat-tab.active {
    background: var(--forest);
    border-color: var(--forest2);
  }
  .feat-tab.active .tab-icon { color: var(--gold2); }
  .feat-tab.active .tab-title { color: var(--cream); }
  .feat-tab.active .tab-stat  { color: rgba(212,201,106,0.85); }

  /* ── Pricing card ── */
  .price-card {
    border-radius: 8px;
    padding: 40px 32px;
    border: 1px solid var(--border);
    background: #fff;
    transition: all 0.4s cubic-bezier(0.34,1.3,0.64,1);
    position: relative;
    overflow: hidden;
  }
  .price-card:hover { transform: translateY(-8px); box-shadow: 0 32px 64px rgba(14,26,18,0.1); }
  .price-card.popular {
    background: var(--forest);
    border-color: var(--forest2);
    color: var(--cream);
  }
  .price-card.popular .price-desc,
  .price-card.popular .feat-item { color: rgba(245,240,232,0.65); }

  /* ── Testimonial card ── */
  .testi-card {
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 36px;
    position: relative;
    overflow: hidden;
    transition: all 0.35s ease;
  }
  .testi-card::before {
    content: '"';
    position: absolute;
    top: -10px; left: 20px;
    font-family: 'Cormorant Garamond', serif;
    font-size: 120px;
    color: rgba(212,168,67,0.08);
    line-height: 1;
    pointer-events: none;
  }
  .testi-card:hover {
    border-color: var(--border2);
    box-shadow: 0 20px 48px rgba(14,26,18,0.09);
    transform: translateY(-4px);
  }

  /* ── Input style ── */
  .email-input {
    flex: 1;
    padding: 13px 18px;
    border-radius: 4px;
    border: 1.5px solid var(--border2);
    background: #fff;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 14px;
    color: var(--text);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .email-input:focus {
    border-color: var(--forest2);
    box-shadow: 0 0 0 3px rgba(42,80,64,0.1);
  }
  .email-input::placeholder { color: var(--text3); }

  /* ── Ripple ── */
  .ripple-origin { position: relative; overflow: hidden; }
  .ripple-dot {
    position: absolute; border-radius: 50%;
    background: rgba(212,168,67,0.3);
    transform: scale(0);
    animation: ripple 0.65s linear;
    pointer-events: none;
  }

  /* ── Section divider ── */
  .divider {
    width: 48px; height: 2px;
    background: linear-gradient(90deg, var(--ember), var(--gold));
    border-radius: 1px;
    margin-bottom: 24px;
  }

  /* ── Stat number ── */
  .stat-num {
    font-family: 'Cormorant Garamond', serif;
    font-weight: 700;
    font-size: clamp(44px,5vw,72px);
    color: var(--forest);
    line-height: 1;
    letter-spacing: -0.03em;
  }

  /* ── Responsive grids ── */
  .hero-grid   { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 64px; align-items: center; }
  .stats-grid  { display: grid; grid-template-columns: repeat(4,1fr); gap: 32px; }
  .feat-tabs   { display: grid; grid-template-columns: 340px 1fr; gap: 32px; align-items: start; }
  .feat-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
  .price-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: start; }
  .testi-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
  .footer-grid { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; }

  @media (max-width: 1100px) {
    .feat-tabs  { grid-template-columns: 280px 1fr; }
    .feat-grid  { grid-template-columns: repeat(2,1fr); }
  }
  @media (max-width: 900px) {
    .hero-grid  { grid-template-columns: 1fr; }
    .stats-grid { grid-template-columns: repeat(2,1fr); }
    .feat-tabs  { grid-template-columns: 1fr; }
    .price-grid { grid-template-columns: 1fr; max-width: 420px; margin: 0 auto; }
    .testi-grid { grid-template-columns: 1fr; }
    .footer-grid{ grid-template-columns: 1fr 1fr; gap: 32px; }
    .hide-mob   { display: none !important; }
    .show-mob   { display: flex !important; }
  }
  @media (max-width: 600px) {
    .stats-grid { grid-template-columns: 1fr 1fr; }
    .feat-grid  { grid-template-columns: 1fr; }
    .footer-grid{ grid-template-columns: 1fr; }
  }
  @media (min-width: 901px) {
    .show-mob { display: none !important; }
  }
`;

/* ─── Ripple helper ──────────────────────────────────────── */
function addRipple(e, el) {
  const rect = el.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const dot = document.createElement("div");
  dot.className = "ripple-dot";
  dot.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size / 2}px;top:${e.clientY - rect.top - size / 2}px`;
  el.appendChild(dot);
  dot.addEventListener("animationend", () => dot.remove());
}

/* ─── Scroll reveal hook ──────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        }),
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* ─── Animated counter ───────────────────────────────────── */
function Counter({ target, suffix = "", decimals = 0 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !started.current) {
          started.current = true;
          const num = parseFloat(String(target).replace(/[^0-9.]/g, ""));
          const t0 = Date.now();
          const tick = () => {
            const p = Math.min((Date.now() - t0) / 2200, 1);
            const ease = 1 - Math.pow(1 - p, 4);
            setVal(+(num * ease).toFixed(decimals));
            if (p < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) io.observe(ref.current);
    return () => io.disconnect();
  }, [target, decimals]);
  return (
    <span ref={ref}>
      {val.toFixed(decimals)}
      {suffix}
    </span>
  );
}

/* ─── Typewriter ─────────────────────────────────────────── */
function Typewriter({ words, speed = 75, pauseMs = 2200 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [del, setDel] = useState(false);
  useEffect(() => {
    const word = words[wi % words.length];
    const id = setTimeout(
      () => {
        if (!del) {
          setText(word.slice(0, text.length + 1));
          if (text.length + 1 === word.length)
            setTimeout(() => setDel(true), pauseMs);
        } else {
          setText(word.slice(0, text.length - 1));
          if (text.length - 1 === 0) {
            setDel(false);
            setWi((w) => w + 1);
          }
        }
      },
      del ? speed / 2.2 : speed,
    );
    return () => clearTimeout(id);
  }, [text, del, wi, words, speed, pauseMs]);
  return (
    <span>
      {text}
      <span
        style={{
          display: "inline-block",
          width: 2,
          height: "0.85em",
          background: "var(--ember)",
          marginLeft: 3,
          verticalAlign: "middle",
          animation: "blink 1s step-end infinite",
        }}
      />
    </span>
  );
}

/* ─── Particle Canvas ────────────────────────────────────── */
function Particles() {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    let W = c.offsetWidth,
      H = c.offsetHeight;
    c.width = W;
    c.height = H;
    const pts = Array.from({ length: 55 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.2 + 0.3,
      dx: (Math.random() - 0.5) * 0.3,
      dy: (Math.random() - 0.5) * 0.3,
      o: Math.random() * 0.4 + 0.15,
    }));
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      pts.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139,105,20,${p.o})`;
        ctx.fill();
        pts.forEach((p2) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139,105,20,${(1 - d / 90) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      W = c.offsetWidth;
      H = c.offsetHeight;
      c.width = W;
      c.height = H;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return (
    <canvas
      ref={ref}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.7,
      }}
    />
  );
}

/* ─── Dashboard Preview Card ─────────────────────────────── */
function DashboardPreview() {
  const bars = [52, 71, 45, 88, 65, 93, 78, 61, 84, 70, 95, 82];
  return (
    <div
      style={{
        background: "var(--forest)",
        borderRadius: 12,
        border: "1px solid rgba(255,255,255,0.08)",
        overflow: "hidden",
        boxShadow:
          "0 48px 80px rgba(14,26,18,0.35), 0 0 0 1px rgba(212,168,67,0.1)",
        animation: "slideRight 0.9s 0.2s cubic-bezier(0.22,1,0.36,1) both",
      }}
    >
      {/* Window bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div style={{ display: "flex", gap: 7 }}>
          {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
            <div
              key={c}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: c,
              }}
            />
          ))}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "rgba(212,200,170,0.5)",
            fontFamily: "monospace",
          }}
        >
          RestaurantOS · Dashboard
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <div
            style={{
              width: 6,
              height: 6,
              background: "#28C840",
              borderRadius: "50%",
              animation: "pulseSoft 2s infinite",
            }}
          />
          <span style={{ fontSize: 10, color: "rgba(212,200,170,0.5)" }}>
            LIVE
          </span>
        </div>
      </div>

      <div style={{ padding: "20px 22px" }}>
        {/* Stat row */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            {
              label: "Revenue Today",
              val: "$14,820",
              diff: "+18.2%",
              up: true,
            },
            { label: "Active Tables", val: "26/32", diff: "81%", up: true },
            { label: "Avg Order", val: "$47.30", diff: "+$4.20", up: true },
          ].map((s) => (
            <div
              key={s.label}
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 8,
                padding: "12px 14px",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  color: "rgba(212,200,170,0.5)",
                  marginBottom: 4,
                }}
              >
                {s.label}
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: "#F5F0E8",
                  fontFamily: "'Bricolage Grotesque',sans-serif",
                  marginBottom: 3,
                }}
              >
                {s.val}
              </div>
              <div style={{ fontSize: 10, color: "#4ADE80" }}>{s.diff}</div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontSize: 10,
              color: "rgba(212,200,170,0.4)",
              marginBottom: 10,
            }}
          >
            Monthly Revenue
          </div>
          <div
            style={{
              display: "flex",
              gap: 4,
              alignItems: "flex-end",
              height: 60,
            }}
          >
            {bars.map((h, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                }}
              >
                <div
                  style={{
                    height: `${h}%`,
                    borderRadius: "2px 2px 0 0",
                    background:
                      i === bars.length - 1
                        ? "linear-gradient(to top, var(--brown), var(--gold2))"
                        : "rgba(212,168,67,0.25)",
                    transition: "height 0.5s ease",
                  }}
                />
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map(
              (m, i) => (
                <div
                  key={i}
                  style={{
                    fontSize: 8,
                    color: "rgba(212,200,170,0.3)",
                    flex: 1,
                    textAlign: "center",
                  }}
                >
                  {m}
                </div>
              ),
            )}
          </div>
        </div>

        {/* Order list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[
            {
              t: "12",
              item: "Grilled Salmon",
              status: "Ready",
              col: "#4ADE80",
            },
            {
              t: "8",
              item: "Truffle Risotto",
              status: "Cooking",
              col: "#F0C96A",
            },
            { t: "3", item: "Beef Tartare", status: "New", col: "#60A5FA" },
          ].map((o) => (
            <div
              key={o.item}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 10px",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  style={{
                    fontSize: 9,
                    color: "rgba(212,200,170,0.4)",
                    width: 20,
                  }}
                >
                  {o.t}m
                </div>
                <div style={{ fontSize: 12, color: "rgba(245,240,232,0.8)" }}>
                  {o.item}
                </div>
              </div>
              <div
                style={{
                  fontSize: 9,
                  fontWeight: 600,
                  color: o.col,
                  background: `${o.col}15`,
                  padding: "2px 8px",
                  borderRadius: 3,
                }}
              >
                {o.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function RestaurantLanding() {
  const { settings: platformSettings } = usePlatformSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  useReveal();

  // Auto-rotate features
  useEffect(() => {
    const id = setInterval(
      () => setActiveFeature((f) => (f + 1) % features.length),
      3500,
    );
    return () => clearInterval(id);
  }, []);

  // Progress bars
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            e.target
              .querySelectorAll(".pbar")
              .forEach((b) => b.classList.add("go"));
        });
      },
      { threshold: 0.3 },
    );
    document.querySelectorAll(".stats-section").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const handleSubmit = (e) => {
    if (email.trim()) setSubmitted(true);
  };

  const features = [
    {
      icon: <BarChart3 size={20} />,
      title: "Real-Time Analytics",
      description:
        "Track every dollar, every table, every guest — with live dashboards that update in seconds. Make data-driven decisions before service even ends.",
      stat: "↑ 47% avg revenue",
      color: "#2A5040",
    },
    {
      icon: <Clock size={20} />,
      title: "Smart Table Management",
      description:
        "AI-powered seating suggestions, auto-release timers, and reservation sync keep your floor running at peak efficiency — night after night.",
      stat: "↑ 32% table turnover",
      color: "#C4622D",
    },
    {
      icon: <ChefHat size={20} />,
      title: "Kitchen Display System",
      description:
        "Orders flow directly from guest to kitchen screen, colour-coded by priority. No lost tickets, no shouted orders, no chaos.",
      stat: "↓ 40% ticket time",
      color: "#8B6914",
    },
    {
      icon: <Zap size={20} />,
      title: "QR Ordering",
      description:
        "Guests scan, customise, and pay — all without waiting. Higher check averages, faster turns, and staff free to deliver real hospitality.",
      stat: "↑ 28% check size",
      color: "#1C3A2A",
    },
    {
      icon: <Users size={20} />,
      title: "Team & Shifts",
      description:
        "Role-based access, live performance tracking, and intelligent scheduling across every location. Manage a team of 5 or 500 with equal ease.",
      stat: "↓ 60% admin time",
      color: "#4A3E2C",
    },
    {
      icon: <ShieldCheck size={20} />,
      title: "Enterprise Security",
      description:
        "SOC 2 Type II compliant. Bank-grade encryption at rest and in transit. Daily off-site backups and a 99.99% uptime SLA.",
      stat: "0 breaches ever",
      color: "#2A3F6A",
    },
  ];

  const testimonials = [
    {
      name: "Marco Rossi",
      role: "Owner, Bella Italia — Rome",
      text: "Revenue up 35% in the first month. The analytics dashboard alone paid for three years of the subscription. I genuinely couldn't operate without it now.",
      stars: 5,
      avatar: "MR",
      highlight: "+35% revenue",
    },
    {
      name: "Sarah Chen",
      role: "GM, Urban Bistro — Singapore",
      text: "We switched from a patchwork of five tools to RestaurantOS in a weekend. The kitchen display system cut our ticket times almost in half.",
      stars: 5,
      avatar: "SC",
      highlight: "-44% ticket time",
    },
    {
      name: "James O'Brien",
      role: "CEO, 12-location Group — Dublin",
      text: "Managing 12 sites from one screen is the single greatest change we've made in five years. Centralised reporting alone saves my team eight hours a week.",
      stars: 5,
      avatar: "JO",
      highlight: "12 sites, 1 view",
    },
  ];

  const stats = [
    {
      label: "Active Restaurants",
      value: "12000",
      suffix: "+",
      note: "across 42 countries",
    },
    {
      label: "Orders Monthly",
      value: "5",
      suffix: "M+",
      note: "processed in real-time",
    },
    {
      label: "Revenue Tracked",
      value: "1.2",
      suffix: "B",
      note: "USD this year alone",
      decimals: 1,
    },
    {
      label: "Customer ROI",
      value: "340",
      suffix: "%",
      note: "average 90-day return",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/mo",
      desc: "For independent restaurants ready to grow",
      features: [
        "Up to 30 tables",
        "Live sales dashboard",
        "QR code menu",
        "Mobile app",
        "Email support",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "$299",
      period: "/mo",
      desc: "For restaurants serious about scaling",
      features: [
        "Up to 100 tables",
        "Advanced analytics",
        "Kitchen display system",
        "Staff management",
        "Multi-location",
        "Custom branding",
        "Priority 24/7 support",
      ],
      cta: "Start Free Trial",
      popular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      desc: "For large-scale operations with complex needs",
      features: [
        "Unlimited tables",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "On-premise option",
        "99.99% SLA",
        "Full onboarding & training",
      ],
      cta: "Talk to Sales",
    },
  ];

  const marqueeItems = [
    "⭐ Real-Time Analytics",
    "🍽️ QR Ordering",
    "📊 Kitchen Display",
    "👨‍🍳 Staff Scheduling",
    "💳 Integrated Payments",
    "📱 Mobile App",
    "🔒 SOC 2 Compliant",
    "🌍 42 Countries",
    "⭐ Real-Time Analytics",
    "🍽️ QR Ordering",
    "📊 Kitchen Display",
    "👨‍🍳 Staff Scheduling",
    "💳 Integrated Payments",
    "📱 Mobile App",
    "🔒 SOC 2 Compliant",
    "🌍 42 Countries",
  ];

  const name = platformSettings?.platformName || "RestaurantOS";

  return (
    <div
      className="grain"
      style={{
        background: "var(--surface)",
        color: "var(--text)",
        fontFamily: "'Bricolage Grotesque', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{globalCSS}</style>

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(253,250,244,0.88)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border)",
          height: "var(--nav-h)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 32px",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--forest)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {platformSettings?.platformLogo ? (
                <img
                  src={platformSettings.platformLogo}
                  alt="logo"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: 7,
                  }}
                />
              ) : (
                <ChefHat size={18} color={`#F0C96A`} />
              )}
            </div>
            <span
              className="display"
              style={{ fontSize: 20, color: "var(--forest)" }}
            >
              {name}
            </span>
          </div>

          {/* Links */}
          <div
            className="hide-mob"
            style={{ display: "flex", gap: 36, alignItems: "center" }}
          >
            {["features", "pricing", "testimonials"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                className="nav-link"
                style={{ textTransform: "capitalize" }}
              >
                {s}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Link href="/login" className="hide-mob">
              <button
                className="btn-ghost"
                style={{ padding: "9px 18px", fontSize: 13 }}
              >
                Sign In
              </button>
            </Link>
            <Link href="/register">
              <button
                className="btn-primary ripple-origin"
                onClick={(e) => addRipple(e, e.currentTarget)}
                style={{ padding: "10px 20px", fontSize: 13 }}
              >
                Get Started <ArrowRight size={13} />
              </button>
            </Link>
            <button
              className="show-mob"
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "var(--text)",
                padding: 4,
              }}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              background: "#fff",
              borderBottom: "1px solid var(--border)",
              padding: "16px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 0,
            }}
          >
            {["features", "pricing", "testimonials"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  padding: "13px 0",
                  color: "var(--text)",
                  textDecoration: "none",
                  textTransform: "capitalize",
                  fontSize: 15,
                  borderBottom: "1px solid var(--border)",
                  fontWeight: 500,
                }}
              >
                {s}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        style={{
          position: "relative",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          paddingTop: "var(--nav-h)",
          overflow: "hidden",
        }}
      >
        <Particles />

        {/* Background decorative shapes */}
        <div
          style={{
            position: "absolute",
            top: "8%",
            right: "-8%",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,168,130,0.12), transparent 65%)",
            pointerEvents: "none",
            animation: "floatSlow 8s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "10%",
            left: "-6%",
            width: 360,
            height: 360,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(196,98,45,0.07), transparent 65%)",
            pointerEvents: "none",
            animation: "floatSlow 10s 2s ease-in-out infinite",
          }}
        />

        {/* Large background text */}
        <div
          className="display"
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            fontSize: "clamp(120px,18vw,260px)",
            fontWeight: 700,
            color: "rgba(28,58,42,0.04)",
            whiteSpace: "nowrap",
            pointerEvents: "none",
            userSelect: "none",
            letterSpacing: "-0.04em",
          }}
        >
          DINE
        </div>

        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "80px 32px",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="hero-grid">
            {/* Left: copy */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              {/* Trust pill */}
              <div style={{ animation: "slideLeft 0.7s 0.1s both" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(28,58,42,0.06)",
                    border: "1px solid rgba(28,58,42,0.12)",
                    borderRadius: 3,
                    padding: "6px 14px 6px 10px",
                    marginBottom: 24,
                  }}
                >
                  <div style={{ display: "flex" }}>
                    {["#C4622D", "#8B6914", "#2A5040"].map((c, i) => (
                      <div
                        key={c}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: c,
                          border: "2px solid var(--surface)",
                          marginLeft: i === 0 ? 0 : -6,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <span style={{ fontSize: 10 }}>{"🧑👨👩"[i]}</span>
                      </div>
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: "var(--forest)",
                    }}
                  >
                    Trusted by <strong>12,000+</strong> restaurants
                  </span>
                  <div style={{ display: "flex", gap: 2 }}>
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} fill="#D4A843" color="#D4A843" />
                    ))}
                  </div>
                </div>
              </div>

              {/* Headline */}
              <h1
                className="display"
                style={{
                  fontSize: "clamp(42px,5.5vw,80px)",
                  lineHeight: 1.0,
                  letterSpacing: "-0.035em",
                  marginBottom: 20,
                  animation: "slideLeft 0.8s 0.18s both",
                }}
              >
                The operating
                <br />
                system for{" "}
                <span
                  className="serif gold-shimmer"
                  style={{ WebkitTextFillColor: "transparent" }}
                >
                  great&nbsp;restaurants.
                </span>
              </h1>

              {/* Role typewriter */}
              <div
                style={{
                  fontSize: 16,
                  color: "var(--text2)",
                  marginBottom: 20,
                  animation: "slideLeft 0.8s 0.26s both",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Built for</span>
                <span style={{ color: "var(--forest)", fontWeight: 600 }}>
                  <Typewriter
                    words={[
                      "fine dining",
                      "fast casual",
                      "cloud kitchens",
                      "café groups",
                      "food trucks",
                    ]}
                    speed={70}
                  />
                </span>
              </div>

              {/* Description */}
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text2)",
                  lineHeight: 1.8,
                  marginBottom: 30,
                  animation: "slideLeft 0.8s 0.34s both",
                  maxWidth: 520,
                  borderLeft: "2px solid var(--ember)",
                  paddingLeft: 16,
                }}
              >
                From the moment a guest sits down to the moment the deposit
                clears — RestaurantOS handles every moving part so you can focus
                on the food and the people.
              </p>

              {/* Benefit chips */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 30,
                  animation: "slideLeft 0.8s 0.40s both",
                }}
              >
                {[
                  { icon: "⚡", t: "Live in under 5 min" },
                  { icon: "📊", t: "Real-time sales data" },
                  { icon: "📱", t: "QR menus included" },
                  { icon: "🌍", t: "42 countries" },
                ].map(({ icon, t }) => (
                  <div
                    key={t}
                    className="tag lift"
                    style={{ cursor: "default" }}
                  >
                    <span>{icon}</span> {t}
                  </div>
                ))}
              </div>

              {/* CTA row */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 24,
                  animation: "slideLeft 0.8s 0.46s both",
                }}
              >
                <button
                  className="btn-primary ripple-origin"
                  onClick={(e) => addRipple(e, e.currentTarget)}
                  style={{ padding: "15px 28px", fontSize: 15 }}
                >
                  Start for Free <ArrowRight size={14} />
                </button>
                <button
                  className="btn-ghost"
                  style={{
                    fontSize: 14,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "var(--surface3)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play
                      size={11}
                      fill="var(--ember)"
                      color="var(--ember)"
                      style={{ marginLeft: 2 }}
                    />
                  </div>
                  Watch 2-min demo
                </button>
              </div>

              {/* Micro-trust */}
              <div
                style={{
                  animation: "slideLeft 0.8s 0.52s both",
                  fontSize: 12,
                  color: "var(--text3)",
                  display: "flex",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                {[
                  "No credit card required",
                  "14-day free trial",
                  "Cancel any time",
                ].map((t) => (
                  <span
                    key={t}
                    style={{ display: "flex", alignItems: "center", gap: 5 }}
                  >
                    <Check size={10} color="var(--forest2)" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: dashboard preview */}
            <div style={{ position: "relative" }}>
              <DashboardPreview />

              {/* Floating chips */}
              <div
                style={{
                  position: "absolute",
                  top: -20,
                  left: -28,
                  background: "#fff",
                  border: "1px solid var(--border2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  boxShadow: "0 12px 32px rgba(14,26,18,0.1)",
                  animation: "floatSlow 4s ease-in-out infinite",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text3)",
                    marginBottom: 3,
                  }}
                >
                  New order · Table 7
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: "var(--text)",
                    marginBottom: 2,
                  }}
                >
                  Wagyu Ribeye ×2
                </div>
                <div style={{ fontSize: 10, color: "#4ADE80" }}>
                  ✓ Sent to kitchen
                </div>
              </div>

              <div
                style={{
                  position: "absolute",
                  bottom: 28,
                  right: -24,
                  background: "#fff",
                  border: "1px solid var(--border2)",
                  borderRadius: 8,
                  padding: "12px 16px",
                  boxShadow: "0 12px 32px rgba(14,26,18,0.1)",
                  animation: "floatSlow 5s 1.2s ease-in-out infinite",
                  zIndex: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text3)",
                    marginBottom: 3,
                  }}
                >
                  Tonight's occupancy
                </div>
                <div
                  className="display"
                  style={{
                    fontSize: 26,
                    color: "var(--forest)",
                    lineHeight: 1,
                  }}
                >
                  94%
                </div>
                <div style={{ fontSize: 10, color: "var(--ember2)" }}>
                  ↑ 12% vs last Sat
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ──────────────────────────────────────── */}
      <div
        style={{
          background: "var(--forest)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "14px 0",
          overflow: "hidden",
        }}
      >
        <div className="marquee-track">
          {marqueeItems.map((item, i) => (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: "rgba(212,200,170,0.65)",
                letterSpacing: "0.08em",
                padding: "0 40px",
                whiteSpace: "nowrap",
              }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* ── STATS ────────────────────────────────────────── */}
      <section
        className="stats-section"
        style={{
          padding: "100px 32px",
          background: "var(--surface2)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <div className="divider" style={{ margin: "0 auto 20px" }} />
            <h2
              className="display reveal"
              style={{ fontSize: "clamp(32px,4vw,56px)", marginBottom: 12 }}
            >
              Numbers that matter
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: 16,
                color: "var(--text2)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Real results from real restaurants across 42 countries.
            </p>
          </div>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div
                key={i}
                className="reveal"
                style={{
                  transitionDelay: `${i * 0.1}s`,
                  textAlign: "center",
                  padding: "32px 24px",
                  background: "#fff",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: `hsl(${[120, 30, 45, 200][i]},45%,35%)`,
                  }}
                />
                <div className="stat-num">
                  <Counter
                    target={s.value}
                    suffix={s.suffix}
                    decimals={s.decimals ?? 0}
                  />
                </div>
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 14,
                    marginTop: 10,
                    marginBottom: 4,
                    color: "var(--text)",
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--text3)" }}>
                  {s.note}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section
        id="features"
        style={{
          padding: "120px 32px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="divider" style={{ margin: "0 auto 20px" }} />
            <div className="tag reveal" style={{ marginBottom: 16 }}>
              <Sparkles size={10} /> Platform Features
            </div>
            <h2
              className="display reveal"
              style={{ fontSize: "clamp(32px,4vw,58px)", marginBottom: 16 }}
            >
              Everything your team needs,
              <br />
              <span className="serif" style={{ color: "var(--ember)" }}>
                nothing they don't.
              </span>
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: 16,
                color: "var(--text2)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              One platform. Every role. Built to survive even the most brutal
              Friday night service.
            </p>
          </div>

          {/* Tabs */}
          <div className="feat-tabs reveal" style={{ marginBottom: 72 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  className={`feat-tab ${activeFeature === i ? "active" : ""}`}
                  onClick={() => setActiveFeature(i)}
                >
                  <div
                    style={{ display: "flex", alignItems: "center", gap: 12 }}
                  >
                    <div
                      className="tab-icon"
                      style={{
                        color:
                          activeFeature === i ? "var(--gold2)" : "var(--text3)",
                        transition: "color 0.3s",
                      }}
                    >
                      {f.icon}
                    </div>
                    <div>
                      <div
                        className="tab-title"
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color:
                            activeFeature === i
                              ? "var(--cream)"
                              : "var(--text)",
                          transition: "color 0.3s",
                        }}
                      >
                        {f.title}
                      </div>
                      {activeFeature === i && (
                        <div
                          className="tab-stat"
                          style={{ fontSize: 11, marginTop: 2 }}
                        >
                          {f.stat}
                        </div>
                      )}
                    </div>
                    {activeFeature === i && (
                      <ArrowRight
                        size={14}
                        style={{ marginLeft: "auto", color: "var(--gold2)" }}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Detail panel */}
            <div
              style={{
                background: "var(--surface2)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "48px 44px",
                transition: "all 0.4s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: -40,
                  right: -40,
                  width: 200,
                  height: 200,
                  borderRadius: "50%",
                  background: `radial-gradient(circle, rgba(196,98,45,0.06), transparent 60%)`,
                  pointerEvents: "none",
                }}
              />
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 12,
                  background: `${features[activeFeature].color}12`,
                  border: `1px solid ${features[activeFeature].color}25`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: features[activeFeature].color,
                  marginBottom: 22,
                  boxShadow: `0 0 24px ${features[activeFeature].color}15`,
                }}
              >
                {features[activeFeature].icon}
              </div>
              <h3
                className="display"
                style={{ fontSize: 34, marginBottom: 14 }}
              >
                {features[activeFeature].title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text2)",
                  lineHeight: 1.85,
                  marginBottom: 28,
                }}
              >
                {features[activeFeature].description}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: `${features[activeFeature].color}10`,
                  border: `1px solid ${features[activeFeature].color}25`,
                  padding: "9px 16px",
                  borderRadius: 4,
                }}
              >
                <TrendingUp size={13} color={features[activeFeature].color} />
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: features[activeFeature].color,
                  }}
                >
                  {features[activeFeature].stat}
                </span>
              </div>
            </div>
          </div>

          {/* Grid */}
          <div className="feat-grid">
            {features.map((f, i) => (
              <div
                key={i}
                className="card reveal lift"
                style={{ transitionDelay: `${i * 0.08}s`, cursor: "pointer" }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: `${f.color}10`,
                    border: `1px solid ${f.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.color,
                    marginBottom: 18,
                    transition: "all 0.4s cubic-bezier(0.34,1.4,0.64,1)",
                  }}
                >
                  {f.icon}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>
                  {f.title}
                </h3>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    lineHeight: 1.65,
                    marginBottom: 14,
                  }}
                >
                  {f.description}
                </p>
                <div style={{ fontSize: 12, fontWeight: 700, color: f.color }}>
                  {f.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF BAND ─────────────────────────────── */}
      <div
        style={{
          background: "var(--surface3)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
          padding: "32px",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: 32,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {[
            { icon: <Award size={18} />, text: "G2 Leader Spring 2025" },
            {
              icon: <Star size={18} fill="var(--gold)" color="var(--gold)" />,
              text: "4.9/5 from 2,400+ reviews",
            },
            { icon: <Globe size={18} />, text: "Available in 42 countries" },
            {
              icon: <ShieldCheck size={18} />,
              text: "SOC 2 Type II Certified",
            },
            { icon: <Users size={18} />, text: "12,000+ restaurants" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "var(--text2)",
                fontSize: 14,
                fontWeight: 500,
              }}
            >
              <span style={{ color: "var(--forest)" }}>{icon}</span>
              {text}
            </div>
          ))}
        </div>
      </div>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "120px 32px",
          background: "var(--surface2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="divider" style={{ margin: "0 auto 20px" }} />
            <div className="tag reveal" style={{ marginBottom: 16 }}>
              Pricing
            </div>
            <h2
              className="display reveal"
              style={{ fontSize: "clamp(32px,4vw,58px)", marginBottom: 16 }}
            >
              Straightforward pricing.
              <br />
              <span className="serif" style={{ color: "var(--ember)" }}>
                No surprises.
              </span>
            </h2>
            <p
              className="reveal"
              style={{
                fontSize: 16,
                color: "var(--text2)",
                maxWidth: 440,
                margin: "0 auto",
              }}
            >
              Start free for 14 days on any plan. No credit card needed. Scale
              up when you're ready.
            </p>
          </div>

          <div className="price-grid">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`price-card reveal ripple-origin ${plan.popular ? "popular" : ""}`}
                onClick={(e) => addRipple(e, e.currentTarget)}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                style={{ transitionDelay: `${i * 0.1}s` }}
              >
                {plan.popular && (
                  <div
                    style={{
                      position: "absolute",
                      top: 20,
                      right: 20,
                      background: "var(--gold)",
                      color: "var(--forest)",
                      fontSize: 9,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 3,
                      letterSpacing: "0.1em",
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 3,
                    background: plan.popular
                      ? "linear-gradient(90deg, var(--gold), var(--ember))"
                      : "var(--border)",
                    borderRadius: "8px 8px 0 0",
                  }}
                />

                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: plan.popular
                      ? "rgba(212,201,106,0.8)"
                      : "var(--text3)",
                    marginBottom: 12,
                    marginTop: 8,
                  }}
                >
                  {plan.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 4,
                    marginBottom: 6,
                  }}
                >
                  <span
                    className="display"
                    style={{
                      fontSize: 52,
                      color: plan.popular ? "var(--cream)" : "var(--forest)",
                    }}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      style={{
                        fontSize: 14,
                        color: plan.popular
                          ? "rgba(245,240,232,0.5)"
                          : "var(--text3)",
                      }}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className="price-desc"
                  style={{
                    fontSize: 13,
                    color: "var(--text2)",
                    marginBottom: 28,
                  }}
                >
                  {plan.desc}
                </p>

                <button
                  className={
                    plan.popular
                      ? "btn-gold ripple-origin"
                      : "btn-primary ripple-origin"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    addRipple(e, e.currentTarget);
                  }}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    marginBottom: 28,
                    fontSize: 14,
                    padding: "13px",
                  }}
                >
                  {plan.cta}
                </button>

                <div
                  style={{ display: "flex", flexDirection: "column", gap: 11 }}
                >
                  {plan.features.map((f, j) => (
                    <div
                      key={j}
                      className="feat-item"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: plan.popular
                          ? "rgba(245,240,232,0.75)"
                          : "var(--text2)",
                      }}
                    >
                      <Check
                        size={13}
                        color={plan.popular ? "var(--gold2)" : "var(--forest2)"}
                        style={{ flexShrink: 0 }}
                      />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────── */}
      <section
        id="testimonials"
        style={{ padding: "120px 32px", overflow: "hidden" }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 72 }}>
            <div className="divider" style={{ margin: "0 auto 20px" }} />
            <div className="tag reveal" style={{ marginBottom: 16 }}>
              What chefs & owners say
            </div>
            <h2
              className="display reveal"
              style={{ fontSize: "clamp(32px,4vw,58px)", marginBottom: 16 }}
            >
              Kitchens don't lie.
              <br />
              <span className="serif" style={{ color: "var(--ember)" }}>
                Neither do these reviews.
              </span>
            </h2>
          </div>

          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="testi-card reveal"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star
                      key={j}
                      size={13}
                      fill="var(--gold)"
                      color="var(--gold)"
                    />
                  ))}
                </div>
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(28,58,42,0.07)",
                    border: "1px solid rgba(28,58,42,0.12)",
                    color: "var(--forest)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 3,
                    marginBottom: 14,
                    letterSpacing: "0.05em",
                  }}
                >
                  {t.highlight}
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text2)",
                    lineHeight: 1.8,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  "{t.text}"
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    borderTop: "1px solid var(--border)",
                    paddingTop: 20,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: "50%",
                      background: "var(--forest)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: "var(--gold2)",
                      flexShrink: 0,
                    }}
                  >
                    {t.avatar}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 11, color: "var(--text3)" }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "80px 32px 120px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 780, margin: "0 auto" }}>
          <div
            className="reveal"
            style={{
              background: "var(--forest)",
              borderRadius: 12,
              padding: "72px 60px",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              boxShadow: "0 40px 80px rgba(14,26,18,0.2)",
            }}
          >
            {/* Decorative ring */}
            <div
              style={{
                position: "absolute",
                top: -80,
                right: -80,
                width: 300,
                height: 300,
                border: "1px solid rgba(212,168,67,0.15)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: -60,
                left: -60,
                width: 220,
                height: 220,
                border: "1px solid rgba(212,168,67,0.1)",
                borderRadius: "50%",
                pointerEvents: "none",
              }}
            />

            <div
              className="tag"
              style={{
                background: "rgba(212,168,67,0.12)",
                border: "1px solid rgba(212,168,67,0.25)",
                color: "var(--gold2)",
                marginBottom: 24,
                display: "inline-flex",
              }}
            >
              <Sparkles size={10} /> Get started today
            </div>
            <h2
              className="display"
              style={{
                fontSize: "clamp(30px,4vw,52px)",
                color: "var(--cream)",
                marginBottom: 16,
                lineHeight: 1.1,
              }}
            >
              Ready to transform
              <br />
              <span className="serif gold-shimmer">your restaurant?</span>
            </h2>
            <p
              style={{
                fontSize: 15,
                color: "rgba(245,240,232,0.65)",
                marginBottom: 40,
                lineHeight: 1.8,
                maxWidth: 460,
                margin: "0 auto 40px",
              }}
            >
              Join 12,000+ restaurants already running smarter with {name}. Your
              first 14 days are completely free.
            </p>

            {!submitted ? (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  maxWidth: 460,
                  margin: "0 auto 20px",
                  flexWrap: "wrap",
                }}
              >
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  className="email-input"
                  style={{ flex: 1, minWidth: 180 }}
                />
                <button
                  className="btn-gold ripple-origin"
                  onClick={(e) => {
                    addRipple(e, e.currentTarget);
                    handleSubmit();
                  }}
                  style={{ whiteSpace: "nowrap" }}
                >
                  <Send size={13} /> Start Free Trial
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "16px 24px",
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.25)",
                  borderRadius: 6,
                  marginBottom: 20,
                  animation: "scaleIn 0.4s ease",
                }}
              >
                <Check size={16} color="#4ADE80" />
                <span
                  style={{ color: "#4ADE80", fontWeight: 600, fontSize: 14 }}
                >
                  You're on the list — we'll be in touch shortly.
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              {["No credit card", "14-day free trial", "Cancel any time"].map(
                (t) => (
                  <span
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "rgba(245,240,232,0.45)",
                    }}
                  >
                    <Check size={10} color="rgba(245,240,232,0.45)" /> {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        style={{
          background: "var(--ink)",
          borderTop: "1px solid rgba(255,255,255,0.06)",
          padding: "72px 32px 32px",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div className="footer-grid" style={{ marginBottom: 56 }}>
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 7,
                    background: "var(--forest2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ChefHat size={16} color="var(--gold2)" />
                </div>
                <span
                  className="display"
                  style={{ fontSize: 18, color: "var(--cream)" }}
                >
                  {name}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "rgba(245,240,232,0.4)",
                  lineHeight: 1.75,
                  maxWidth: 240,
                }}
              >
                The all-in-one operating system for modern restaurants to grow,
                scale, and thrive.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                {["𝕏", "in", "gh"].map((s) => (
                  <a
                    key={s}
                    href="#"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 6,
                      background: "rgba(255,255,255,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 12,
                      color: "rgba(245,240,232,0.4)",
                      textDecoration: "none",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.1)";
                      e.currentTarget.style.color = "var(--cream)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.05)";
                      e.currentTarget.style.color = "rgba(245,240,232,0.4)";
                    }}
                  >
                    {s}
                  </a>
                ))}
              </div>
            </div>
            {[
              {
                label: "Product",
                links: ["Features", "Pricing", "Security", "Changelog", "API"],
              },
              {
                label: "Company",
                links: ["About", "Blog", "Careers", "Press", "Partners"],
              },
              {
                label: "Legal",
                links: ["Privacy", "Terms", "Cookies", "GDPR", "Contact"],
              },
            ].map((col) => (
              <div key={col.label}>
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "rgba(245,240,232,0.3)",
                    marginBottom: 18,
                  }}
                >
                  {col.label}
                </div>
                {col.links.map((l) => (
                  <a
                    key={l}
                    href="#"
                    style={{
                      display: "block",
                      fontSize: 13,
                      color: "rgba(245,240,232,0.5)",
                      textDecoration: "none",
                      marginBottom: 11,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--cream)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "rgba(245,240,232,0.5)")
                    }
                  >
                    {l}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div
            style={{
              borderTop: "1px solid rgba(255,255,255,0.06)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <p style={{ fontSize: 12, color: "rgba(245,240,232,0.25)" }}>
              © 2026 {name}. All rights reserved.
            </p>
            <p style={{ fontSize: 12, color: "rgba(245,240,232,0.2)" }}>
              Made with care · Serving restaurants in 42 countries
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
