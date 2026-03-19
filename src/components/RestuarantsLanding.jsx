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
} from "lucide-react";

/* ─── Global CSS ─────────────────────────────────────────── */
const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  :root {
    --green: #00e87a;
    --green-mid: #00b85f;
    --green-dark: #007a40;
    --blue: #0080ff;
    --blue-mid: #0055cc;
    --gold: #ffd166;
    --surface: #0a0f0d;
    --surface2: #111a14;
    --surface3: #182118;
    --text: #e8f5ec;
    --text-dim: #7a9a82;
    --border: rgba(0,232,122,0.12);
  }

  html { scroll-behavior: smooth; }

  body {
    margin: 0;
    background: var(--surface);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    overflow-x: hidden;
  }

  .syne { font-family: 'Syne', sans-serif; }

  /* Noise texture overlay */
  body::before {
    content: '';
    position: fixed;
    inset: 0;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
    pointer-events: none;
    z-index: 1000;
    opacity: 0.35;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--surface); }
  ::-webkit-scrollbar-thumb { background: var(--green-dark); border-radius: 2px; }

  /* Magnetic button base */
  .mag-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.15s ease;
  }

  /* Glow pulse */
  @keyframes glowPulse {
    0%, 100% { box-shadow: 0 0 20px rgba(0,232,122,0.3), 0 0 60px rgba(0,232,122,0.1); }
    50% { box-shadow: 0 0 40px rgba(0,232,122,0.6), 0 0 100px rgba(0,232,122,0.2); }
  }

  @keyframes floatY {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-18px); }
  }

  @keyframes rotateOrbit {
    from { transform: rotate(0deg) translateX(120px) rotate(0deg); }
    to   { transform: rotate(360deg) translateX(120px) rotate(-360deg); }
  }

  @keyframes textReveal {
    from { clip-path: inset(0 100% 0 0); opacity: 0; }
    to   { clip-path: inset(0 0% 0 0); opacity: 1; }
  }

  @keyframes scanline {
    from { transform: translateY(-100%); }
    to   { transform: translateY(100vh); }
  }

  @keyframes counterUp {
    from { transform: translateY(100%); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  @keyframes shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
  }

  @keyframes borderFlow {
    0%, 100% { border-color: rgba(0,232,122,0.2); }
    50% { border-color: rgba(0,232,122,0.7); }
  }

  @keyframes particleFade {
    0%   { opacity: 1; transform: translate(0,0) scale(1); }
    100% { opacity: 0; transform: translate(var(--dx), var(--dy)) scale(0.2); }
  }

  @keyframes ripple {
    0%   { transform: scale(0); opacity: 0.6; }
    100% { transform: scale(4); opacity: 0; }
  }

  @keyframes spin3d {
    0%   { transform: rotateY(0deg) rotateX(0deg); }
    25%  { transform: rotateY(90deg) rotateX(15deg); }
    50%  { transform: rotateY(180deg) rotateX(0deg); }
    75%  { transform: rotateY(270deg) rotateX(-15deg); }
    100% { transform: rotateY(360deg) rotateX(0deg); }
  }

  @keyframes slideInLeft {
    from { transform: translateX(-60px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInRight {
    from { transform: translateX(60px); opacity: 0; }
    to   { transform: translateX(0); opacity: 1; }
  }

  @keyframes slideInUp {
    from { transform: translateY(40px); opacity: 0; }
    to   { transform: translateY(0); opacity: 1; }
  }

  @keyframes scaleIn {
    from { transform: scale(0.7); opacity: 0; }
    to   { transform: scale(1); opacity: 1; }
  }

  .animate-float { animation: floatY 4s ease-in-out infinite; }
  .animate-glow { animation: glowPulse 3s ease-in-out infinite; }
  .animate-shimmer {
    background: linear-gradient(90deg, transparent 0%, rgba(0,232,122,0.15) 50%, transparent 100%);
    background-size: 200% 100%;
    animation: shimmer 2.5s linear infinite;
  }

  .tilt-card {
    transform-style: preserve-3d;
    transition: transform 0.1s ease;
  }
  .tilt-card:hover { box-shadow: 0 30px 60px rgba(0,0,0,0.5); }

  .hover-lift {
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1),
                box-shadow 0.3s ease;
  }
  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 30px rgba(0,232,122,0.15);
  }

  .card-reveal {
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.7s ease, transform 0.7s cubic-bezier(0.34,1.3,0.64,1);
  }
  .card-reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }

  .number-ticker {
    overflow: hidden;
    display: inline-block;
  }
  .number-ticker span {
    display: inline-block;
    transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  }

  /* Particle canvas */
  #hero-particles {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 0;
  }

  /* Cursor glow */
  #cursor-glow {
    position: fixed;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    background: radial-gradient(circle, rgba(0,232,122,0.07) 0%, transparent 70%);
    transition: opacity 0.3s ease;
  }

  /* Scanline effect */
  .scanline::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(transparent 50%, rgba(0,0,0,0.03) 50%);
    background-size: 100% 4px;
    pointer-events: none;
    z-index: 10;
  }

  /* Nav pill active */
  .nav-link {
    position: relative;
    padding: 6px 0;
  }
  .nav-link::after {
    content: '';
    position: absolute;
    bottom: 0; left: 0;
    height: 1.5px;
    width: 0;
    background: var(--green);
    transition: width 0.3s ease;
  }
  .nav-link:hover::after { width: 100%; }

  /* Pricing highlight border animation */
  .pricing-popular {
    position: relative;
    background: linear-gradient(135deg, #0a1a0f, #0f2018);
  }
  .pricing-popular::before {
    content: '';
    position: absolute;
    inset: -1px;
    border-radius: 17px;
    background: conic-gradient(from var(--angle), transparent 0deg, var(--green) 60deg, transparent 120deg);
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    padding: 1px;
    animation: rotateBorder 4s linear infinite;
  }
  @property --angle {
    syntax: '<angle>';
    initial-value: 0deg;
    inherits: false;
  }
  @keyframes rotateBorder {
    to { --angle: 360deg; }
  }

  /* Feature icon spin on hover */
  .feat-icon-wrap {
    transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .feat-card:hover .feat-icon-wrap {
    transform: rotate(15deg) scale(1.15);
  }

  /* Progress bar in stats */
  .progress-bar {
    height: 2px;
    background: var(--border);
    border-radius: 1px;
    overflow: hidden;
    margin-top: 8px;
  }
  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--green-dark), var(--green));
    border-radius: 1px;
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 1.5s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .progress-fill.animated { transform: scaleX(1); }

  /* Ripple on click */
  .ripple-container {
    position: relative;
    overflow: hidden;
  }
  .ripple-circle {
    position: absolute;
    border-radius: 50%;
    background: rgba(0,232,122,0.25);
    transform: scale(0);
    animation: ripple 0.6s linear;
    pointer-events: none;
  }

  canvas { display: block; }

  /* Tooltip */
  .tooltip {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) translateY(6px);
    background: var(--surface3);
    border: 1px solid var(--border);
    color: var(--text);
    font-size: 12px;
    padding: 5px 10px;
    border-radius: 6px;
    white-space: nowrap;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s, transform 0.2s;
    z-index: 100;
  }
  .has-tooltip:hover .tooltip {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }

  /* Mobile */
  @media (max-width: 640px) {
    canvas { min-height: 220px; }
  }
`;

/* ─── Three.js loader (handles ESM named + default export) ── */
async function loadThree() {
  const mod = await import("three");
  // Next.js bundler gives named exports; CJS interop gives .default
  return mod.Scene ? mod : (mod.default ?? mod);
}

/* ─── Ripple helper ──────────────────────────────────────── */
function addRipple(e, container) {
  const rect = container.getBoundingClientRect();
  const size = Math.max(rect.width, rect.height) * 2;
  const x = e.clientX - rect.left - size / 2;
  const y = e.clientY - rect.top - size / 2;
  const ripple = document.createElement("div");
  ripple.className = "ripple-circle";
  ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px`;
  container.appendChild(ripple);
  ripple.addEventListener("animationend", () => ripple.remove());
}

/* ─── Magnetic Button ────────────────────────────────────── */
function MagBtn({
  children,
  className = "",
  onClick,
  href,
  as: Tag = "button",
}) {
  const ref = useRef(null);
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) * 0.35;
    const dy = (e.clientY - cy) * 0.35;
    el.style.transform = `translate(${dx}px, ${dy}px)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "";
  }, []);
  const handleClick = useCallback(
    (e) => {
      if (ref.current) addRipple(e, ref.current);
      if (onClick) onClick(e);
    },
    [onClick],
  );
  return (
    <Tag
      ref={ref}
      className={`mag-btn ripple-container ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      href={href}
    >
      {children}
    </Tag>
  );
}

/* ─── Tilt Card ──────────────────────────────────────────── */
function TiltCard({ children, className = "", style = {}, cardRef }) {
  const fallbackRef = useRef(null);
  const ref = cardRef || fallbackRef;
  const handleMove = useCallback((e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateX(${-y * 12}deg) rotateY(${x * 12}deg) translateZ(10px)`;
  }, []);
  const handleLeave = useCallback(() => {
    if (ref.current)
      ref.current.style.transform =
        "perspective(800px) rotateX(0) rotateY(0) translateZ(0)";
  }, []);
  return (
    <div
      ref={ref}
      className={`tilt-card ${className}`}
      style={style}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      {children}
    </div>
  );
}

/* ─── Animated Counter ───────────────────────────────────── */
function AnimatedCounter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const numTarget = parseFloat(target.replace(/[^0-9.]/g, ""));
          const start = Date.now();
          const tick = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 4);
            setCount(Math.round(numTarget * ease * 10) / 10);
            if (progress < 1) requestAnimationFrame(tick);
          };
          tick();
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  const isDecimal = target.includes(".");
  const display = isDecimal ? count.toFixed(1) : Math.round(count);
  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

/* ─── Particle Canvas ────────────────────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let w = canvas.offsetWidth,
      h = canvas.offsetHeight;
    canvas.width = w;
    canvas.height = h;
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      opacity: Math.random() * 0.6 + 0.2,
    }));
    let mouse = { x: -999, y: -999 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    canvas.addEventListener("mousemove", onMove);
    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      particles.forEach((p) => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        const dist = Math.hypot(p.x - mouse.x, p.y - mouse.y);
        const scale = dist < 100 ? 1 + (100 - dist) / 60 : 1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,232,122,${p.opacity * (dist < 100 ? 1.5 : 1)})`;
        ctx.fill();
        particles.forEach((p2) => {
          const d = Math.hypot(p.x - p2.x, p.y - p2.y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(0,232,122,${(1 - d / 100) * 0.12})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    const onResize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      id="hero-particles"
      style={{ width: "100%", height: "100%" }}
    />
  );
}

/* ─── 3D Restaurant Scene ────────────────────────────────── */
function RestaurantScene() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cleanup;
    const timer = setTimeout(() => {
      const init = async () => {
        const THREE = await loadThree();
        if (!THREE || !THREE.Scene) return;
        const w = Math.max(canvas.clientWidth, 100),
          h = Math.max(canvas.clientHeight, 100);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000);
        camera.position.set(3, 2.5, 4);
        camera.lookAt(0, 1, 0);
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

        scene.add(new THREE.AmbientLight(0xffffff, 0.6));
        const pl1 = new THREE.PointLight(0x00e87a, 2, 50);
        pl1.position.set(2, 4, 2);
        scene.add(pl1);
        const pl2 = new THREE.PointLight(0x0080ff, 1, 50);
        pl2.position.set(-3, 3, 1);
        scene.add(pl2);
        const pl3 = new THREE.PointLight(0xffd166, 0.8, 30);
        pl3.position.set(0, 2, -2);
        scene.add(pl3);

        const mat = (c, s = 80) =>
          new THREE.MeshPhongMaterial({ color: c, shininess: s });
        const box = (w, h, d, c, x, y, z) => {
          const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c));
          m.position.set(x, y, z);
          scene.add(m);
          return m;
        };
        const cyl = (r, h, c, x, y, z) => {
          const m = new THREE.Mesh(
            new THREE.CylinderGeometry(r, r, h, 16),
            mat(c),
          );
          m.position.set(x, y, z);
          scene.add(m);
          return m;
        };
        const sph = (r, c, x, y, z) => {
          const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 24), mat(c));
          m.position.set(x, y, z);
          scene.add(m);
          return m;
        };

        // Floor
        box(8, 0.05, 6, 0x0d1f10, 0, -0.02, 0);

        // Table
        box(3, 0.15, 1.8, 0x3d1a00, 0, 1.2, 0);
        [
          [-1.2, -0.7],
          [1.2, -0.7],
          [-1.2, 0.7],
          [1.2, 0.7],
        ].forEach(([x, z]) => cyl(0.07, 1.2, 0x1a0800, x, 0.6, z));

        // Chair
        box(0.6, 0.08, 0.55, 0x00603a, -1.7, 0.5, 0);
        box(0.6, 0.75, 0.08, 0x00603a, -1.7, 1.1, -0.27);
        [
          [-1.42, -0.18],
          [-1.42, 0.18],
          [-1.98, -0.18],
          [-1.98, 0.18],
        ].forEach(([x, z]) => cyl(0.04, 0.5, 0x004d2e, x, 0.25, z));

        // Person
        const head = sph(0.18, 0xf4b880, -1.7, 2.0, 0);
        const torso = box(0.28, 0.55, 0.18, 0x1a4fff, -1.7, 1.45, 0);
        const lArm = cyl(0.045, 0.45, 0xf4b880, -1.9, 1.4, 0);
        lArm.rotation.z = 0.4;
        const rArm = cyl(0.045, 0.45, 0xf4b880, -1.5, 1.4, 0);
        rArm.rotation.z = -0.4;
        cyl(0.045, 0.45, 0x111, -1.82, 0.6, 0);
        cyl(0.045, 0.45, 0x111, -1.58, 0.6, 0);

        // Plate + food
        cyl(0.32, 0.04, 0xfff8e7, 0.4, 1.28, 0);
        sph(0.13, 0xb5500a, 0.4, 1.45, 0); // burger
        sph(0.1, 0xff3c00, -0.35, 1.42, 0.3); // tomato
        cyl(0.07, 0.22, 0xff9900, 0.85, 1.38, 0); // drink
        box(0.18, 0.09, 0.13, 0xd4a855, -0.5, 1.37, 0.2); // bread
        sph(0.12, 0x1aaa60, 0.2, 1.45, -0.38); // salad

        // Floating digital screen
        const screenGeo = new THREE.BoxGeometry(1.2, 0.8, 0.05);
        const screenMat = new THREE.MeshPhongMaterial({
          color: 0x0a1a0f,
          emissive: 0x003320,
          emissiveIntensity: 0.5,
        });
        const screen = new THREE.Mesh(screenGeo, screenMat);
        screen.position.set(1.8, 2.2, -0.5);
        screen.rotation.y = -0.5;
        scene.add(screen);
        const screenLight = new THREE.PointLight(0x00e87a, 1.5, 3);
        screenLight.position.set(1.8, 2.2, 0);
        scene.add(screenLight);

        const onResize = () => {
          const w2 = canvas.clientWidth,
            h2 = canvas.clientHeight;
          camera.aspect = w2 / h2;
          camera.updateProjectionMatrix();
          renderer.setSize(w2, h2);
        };
        window.addEventListener("resize", onResize);

        let raf;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          const t = Date.now() * 0.001;
          scene.rotation.y = t * 0.15;
          scene.rotation.x = Math.sin(t * 0.3) * 0.05;
          lArm.rotation.z = 0.4 + Math.sin(t * 2) * 0.25;
          rArm.rotation.z = -0.4 - Math.sin(t * 2) * 0.18;
          head.position.y = 2.0 + Math.sin(t * 1.5) * 0.04;
          torso.position.x = -1.7 + Math.sin(t) * 0.03;
          screen.position.y = 2.2 + Math.sin(t * 0.8) * 0.15;
          screen.rotation.y = -0.5 + Math.sin(t * 0.5) * 0.1;
          screenLight.intensity = 1.2 + Math.sin(t * 2) * 0.3;
          pl1.position.x = Math.sin(t * 0.7) * 3 + 2;
          pl2.position.x = Math.cos(t * 0.5) * 3 - 2;
          renderer.render(scene, camera);
        };
        animate();
        cleanup = () => {
          cancelAnimationFrame(raf);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      };
      init();
    }, 50);
    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, []);
  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 320,
        display: "block",
      }}
    />
  );
}

/* ─── Floating Orb ───────────────────────────────────────── */
function FloatingOrb({
  size = 300,
  x = "10%",
  y = "20%",
  color = "rgba(0,232,122,0.08)",
  blur = 80,
  delay = 0,
}) {
  return (
    <div
      style={{
        position: "absolute",
        width: size,
        height: size,
        left: x,
        top: y,
        background: `radial-gradient(circle, ${color}, transparent 70%)`,
        filter: `blur(${blur}px)`,
        borderRadius: "50%",
        pointerEvents: "none",
        animation: `floatY ${4 + delay}s ${delay}s ease-in-out infinite`,
      }}
    />
  );
}

/* ─── Type Writer ────────────────────────────────────────── */
function TypeWriter({ words, speed = 80, pause = 2000 }) {
  const [text, setText] = useState("");
  const [wi, setWi] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const word = words[wi % words.length];
    const timeout = setTimeout(
      () => {
        if (!deleting) {
          setText(word.slice(0, text.length + 1));
          if (text.length + 1 === word.length)
            setTimeout(() => setDeleting(true), pause);
        } else {
          setText(word.slice(0, text.length - 1));
          if (text.length - 1 === 0) {
            setDeleting(false);
            setWi((w) => w + 1);
          }
        }
      },
      deleting ? speed / 2 : speed,
    );
    return () => clearTimeout(timeout);
  }, [text, deleting, wi, words, speed, pause]);
  return (
    <span>
      {text}
      <span
        style={{
          borderRight: "2px solid var(--green)",
          marginLeft: 2,
          animation: "glowPulse 1s ease-in-out infinite",
        }}
      >
        &nbsp;
      </span>
    </span>
  );
}

/* ─── Food 3D Scene ──────────────────────────────────────── */
function FoodScene3D() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let cleanupFn;

    // Wait a tick so canvas has layout dimensions
    const timer = setTimeout(() => {
      const init = async () => {
        const THREE = await loadThree();
        if (!THREE || !THREE.Scene) {
          console.error("Three.js failed to load");
          return;
        }
        const w = Math.max(canvas.clientWidth, 100),
          h = Math.max(canvas.clientHeight, 100);
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 200);
        camera.position.set(0, 0, 14);
        const renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: true,
        });
        renderer.setSize(w, h);
        renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
        renderer.shadowMap.enabled = true;

        // Lighting
        scene.add(new THREE.AmbientLight(0xffffff, 0.7));
        const sun = new THREE.DirectionalLight(0xfff4e0, 1.8);
        sun.position.set(6, 10, 8);
        sun.castShadow = true;
        scene.add(sun);
        const fill = new THREE.PointLight(0x00e87a, 1.2, 40);
        fill.position.set(-8, 4, 4);
        scene.add(fill);
        const rim = new THREE.PointLight(0x0080ff, 0.8, 30);
        rim.position.set(8, -4, -4);
        scene.add(rim);
        const warm = new THREE.PointLight(0xff6b35, 0.6, 25);
        warm.position.set(0, -6, 6);
        scene.add(warm);

        const mat = (color, opts = {}) =>
          new THREE.MeshPhongMaterial({
            color,
            shininess: opts.shiny ?? 80,
            ...opts,
          });
        const box = (w, h, d, c, opts) =>
          new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(c, opts));
        const cyl = (r1, r2, h, segs, c, opts) =>
          new THREE.Mesh(
            new THREE.CylinderGeometry(r1, r2, h, segs),
            mat(c, opts),
          );
        const sph = (r, ws, hs, c, opts) =>
          new THREE.Mesh(new THREE.SphereGeometry(r, ws, hs), mat(c, opts));
        const tor = (r, t, rs, ts, c, opts) =>
          new THREE.Mesh(new THREE.TorusGeometry(r, t, rs, ts), mat(c, opts));

        const foodItems = [];

        // ── BURGER GROUP ──────────────────────────────
        const burger = new THREE.Group();
        // Bottom bun
        const bbun = cyl(0.7, 0.75, 0.28, 32, 0xd4822a);
        bbun.position.y = -0.55;
        burger.add(bbun);
        // Sesame seeds on bottom bun
        for (let i = 0; i < 5; i++) {
          const seed = sph(0.045, 8, 8, 0xf5e6c8);
          const angle = (i / 5) * Math.PI * 2;
          seed.position.set(
            Math.cos(angle) * 0.38,
            -0.41,
            Math.sin(angle) * 0.38,
          );
          burger.add(seed);
        }
        // Patty
        const patty = cyl(0.65, 0.68, 0.2, 32, 0x5c2800);
        patty.position.y = -0.22;
        burger.add(patty);
        // Patty rim darker edge
        const pattyRim = tor(0.66, 0.06, 8, 32, 0x3a1500);
        pattyRim.position.y = -0.22;
        pattyRim.rotation.x = Math.PI / 2;
        burger.add(pattyRim);
        // Cheese slice (square-ish, hanging over)
        const cheese = box(1.5, 0.06, 1.5, 0xffcc00);
        cheese.position.y = -0.02;
        cheese.rotation.y = 0.4;
        burger.add(cheese);
        // Lettuce (green wavy disk using torus)
        const lettuce = cyl(0.78, 0.85, 0.1, 32, 0x1a8c3a);
        lettuce.position.y = 0.06;
        burger.add(lettuce);
        const letEdge = tor(0.8, 0.08, 6, 32, 0x25b050);
        letEdge.position.y = 0.06;
        letEdge.rotation.x = Math.PI / 2;
        burger.add(letEdge);
        // Tomato slice
        const tomato = cyl(0.6, 0.62, 0.1, 32, 0xdd2200);
        tomato.position.y = 0.2;
        burger.add(tomato);
        // Top bun
        const tbun = sph(0.72, 32, 16, 0xe8922a);
        tbun.scale.y = 0.58;
        tbun.position.y = 0.58;
        burger.add(tbun);
        // Sesame on top
        for (let i = 0; i < 6; i++) {
          const seed = sph(0.048, 8, 8, 0xf5e6c8);
          const angle = (i / 6) * Math.PI * 2 + 0.3;
          const r = 0.28 + (i % 2) * 0.18;
          seed.position.set(Math.cos(angle) * r, 0.88, Math.sin(angle) * r);
          burger.add(seed);
        }
        burger.position.set(-3.5, 2.2, 0);
        burger.scale.setScalar(1.0);
        scene.add(burger);
        foodItems.push({
          group: burger,
          spin: 0.008,
          float: { amp: 0.4, speed: 1.2, offset: 0 },
          baseY: 2.2,
          baseX: -3.5,
        });

        // ── PIZZA SLICE GROUP ──────────────────────────
        const pizza = new THREE.Group();
        // Crust (wedge shape via custom geometry)
        const crustShape = new THREE.Shape();
        crustShape.moveTo(0, 0);
        crustShape.arc(0, 0, 1.1, -Math.PI / 6, Math.PI / 6, false);
        crustShape.lineTo(0, 0);
        const crustGeo = new THREE.ShapeGeometry(crustShape, 32);
        const crustMesh = new THREE.Mesh(crustGeo, mat(0xf0c06a));
        crustMesh.rotation.x = -Math.PI / 2;
        pizza.add(crustMesh);
        // Sauce layer
        const sauceShape = new THREE.Shape();
        sauceShape.moveTo(0, 0);
        sauceShape.arc(0, 0, 0.92, -Math.PI / 6.5, Math.PI / 6.5, false);
        sauceShape.lineTo(0, 0);
        const sauceMesh = new THREE.Mesh(
          new THREE.ShapeGeometry(sauceShape, 32),
          mat(0xcc2200),
        );
        sauceMesh.rotation.x = -Math.PI / 2;
        sauceMesh.position.y = 0.04;
        pizza.add(sauceMesh);
        // Cheese top
        const cheeseShape = new THREE.Shape();
        cheeseShape.moveTo(0, 0);
        cheeseShape.arc(0, 0, 0.85, -Math.PI / 7, Math.PI / 7, false);
        cheeseShape.lineTo(0, 0);
        const cheeseMesh = new THREE.Mesh(
          new THREE.ShapeGeometry(cheeseShape, 32),
          mat(0xffe066),
        );
        cheeseMesh.rotation.x = -Math.PI / 2;
        cheeseMesh.position.y = 0.07;
        pizza.add(cheeseMesh);
        // Pepperoni circles
        [
          [0.45, 0.1],
          [0.3, -0.1],
          [0.55, -0.08],
          [0.22, 0.18],
        ].forEach(([x, z]) => {
          const pep = cyl(0.1, 0.1, 0.06, 16, 0xaa1100);
          pep.position.set(x, 0.1, z);
          pizza.add(pep);
        });
        // Crust edge
        const crustEdge = new THREE.Mesh(
          new THREE.CylinderGeometry(
            0.12,
            0.14,
            0.18,
            16,
            1,
            false,
            -Math.PI / 6,
            Math.PI / 3,
          ),
          mat(0xe8a840),
        );
        crustEdge.position.set(Math.cos(0) * 1.1, 0.08, 0);
        crustEdge.rotation.y = Math.PI / 2;
        pizza.add(crustEdge);
        pizza.position.set(3.5, 2.0, 0);
        pizza.rotation.x = 0.3;
        scene.add(pizza);
        foodItems.push({
          group: pizza,
          spin: -0.007,
          float: { amp: 0.35, speed: 1.0, offset: 1.1 },
          baseY: 2.0,
          baseX: 3.5,
        });

        // ── SUSHI ROLL ────────────────────────────────
        const sushi = new THREE.Group();
        // Nori wrap (outer black cylinder)
        const nori = cyl(0.52, 0.52, 0.55, 32, 0x1a1a1a);
        nori.rotation.z = Math.PI / 2;
        sushi.add(nori);
        // Rice layer
        const rice = cyl(0.44, 0.44, 0.58, 32, 0xf8f4ee);
        rice.rotation.z = Math.PI / 2;
        sushi.add(rice);
        // Salmon filling
        const salmon = cyl(0.2, 0.2, 0.6, 16, 0xff8c50);
        salmon.rotation.z = Math.PI / 2;
        sushi.add(salmon);
        // Avocado
        const avo = cyl(0.12, 0.12, 0.6, 12, 0x5a9e3a);
        avo.rotation.z = Math.PI / 2;
        avo.position.set(0, 0.22, 0);
        sushi.add(avo);
        // Sesame seeds on top
        for (let i = 0; i < 8; i++) {
          const s = sph(0.035, 6, 6, 0xf0e8d0);
          const angle = (i / 8) * Math.PI * 2;
          s.position.set(Math.cos(angle) * 0.3, 0.55, Math.sin(angle) * 0.18);
          s.rotation.z = Math.PI / 2;
          sushi.add(s);
        }
        // Wasabi blob
        const wasabi = sph(0.15, 12, 10, 0x6abf4b);
        wasabi.position.set(0.7, -0.1, 0.3);
        wasabi.scale.set(1, 0.6, 0.9);
        sushi.add(wasabi);
        sushi.position.set(0, -2.2, 1);
        scene.add(sushi);
        foodItems.push({
          group: sushi,
          spin: 0.01,
          float: { amp: 0.45, speed: 1.4, offset: 2.2 },
          baseY: -2.2,
          baseX: 0,
        });

        // ── STRAWBERRY ────────────────────────────────
        const berry = new THREE.Group();
        // Berry body (cone-ish sphere)
        const bodyGeo = new THREE.SphereGeometry(0.55, 24, 20);
        const bodyPos = bodyGeo.attributes.position;
        for (let i = 0; i < bodyPos.count; i++) {
          const y = bodyPos.getY(i);
          if (y < 0) {
            bodyPos.setY(i, y * 1.35);
          }
        }
        bodyPos.needsUpdate = true;
        bodyGeo.computeVertexNormals();
        const body = new THREE.Mesh(bodyGeo, mat(0xee1133, { shininess: 120 }));
        berry.add(body);
        // Seeds (tiny yellow ovals on surface)
        for (let i = 0; i < 20; i++) {
          const seed = sph(0.04, 6, 6, 0xffee88);
          const phi = Math.acos(-1 + (2 * i) / 20);
          const theta = Math.sqrt(20 * Math.PI) * phi;
          seed.position.setFromSphericalCoords(0.55, phi, theta);
          if (seed.position.y > -0.3) berry.add(seed);
        }
        // Leaf cap
        for (let i = 0; i < 5; i++) {
          const leaf = box(0.08, 0.35, 0.06, 0x228822);
          const angle = (i / 5) * Math.PI * 2;
          leaf.position.set(
            Math.cos(angle) * 0.18,
            0.55,
            Math.sin(angle) * 0.18,
          );
          leaf.rotation.z = angle + Math.PI / 2;
          leaf.rotation.x = -0.5;
          berry.add(leaf);
        }
        // Stem
        const stem = cyl(0.04, 0.03, 0.35, 8, 0x2d5c1e);
        stem.position.y = 0.78;
        berry.add(stem);
        berry.position.set(-3.2, -2.0, 0.5);
        scene.add(berry);
        foodItems.push({
          group: berry,
          spin: 0.012,
          float: { amp: 0.5, speed: 1.6, offset: 3.4 },
          baseY: -2.0,
          baseX: -3.2,
        });

        // ── DONUT ─────────────────────────────────────
        const donut = new THREE.Group();
        // Base torus
        const donutBody = tor(0.55, 0.3, 20, 48, 0xf0b050, { shininess: 100 });
        donut.add(donutBody);
        // Pink glaze on top half
        const glazeGeo = new THREE.TorusGeometry(0.55, 0.31, 10, 48, Math.PI);
        const glazeMesh = new THREE.Mesh(
          glazeGeo,
          mat(0xff80b0, { shininess: 150 }),
        );
        glazeMesh.rotation.x = -Math.PI / 2;
        glazeMesh.position.y = 0.05;
        donut.add(glazeMesh);
        // Sprinkles
        const sprinkleColors = [
          0xff2244, 0x22aaff, 0xffee00, 0x44dd66, 0xff8800,
        ];
        for (let i = 0; i < 18; i++) {
          const sp = box(
            0.06,
            0.18,
            0.06,
            sprinkleColors[i % sprinkleColors.length],
          );
          const angle = (i / 18) * Math.PI * 2;
          const r = 0.48 + (i % 3) * 0.05;
          sp.position.set(Math.cos(angle) * r, 0.28, Math.sin(angle) * r);
          sp.rotation.y = angle;
          sp.rotation.x = 0.4;
          donut.add(sp);
        }
        donut.position.set(3.3, -2.0, 0.5);
        scene.add(donut);
        foodItems.push({
          group: donut,
          spin: -0.009,
          float: { amp: 0.38, speed: 1.1, offset: 4.5 },
          baseY: -2.0,
          baseX: 3.3,
        });

        // ── COCKTAIL GLASS ────────────────────────────
        const cocktail = new THREE.Group();
        // Glass body (inverted cone shape)
        const glassBody = cyl(0.7, 0.08, 0.9, 32, 0xaaddff, {
          transparent: true,
          opacity: 0.35,
          shininess: 200,
        });
        glassBody.position.y = 0.1;
        cocktail.add(glassBody);
        // Liquid (slightly smaller, colored)
        const liquid = cyl(0.65, 0.06, 0.75, 32, 0xff6688, {
          transparent: true,
          opacity: 0.8,
          shininess: 100,
        });
        liquid.position.y = 0.05;
        cocktail.add(liquid);
        // Stem
        const glStem = cyl(0.04, 0.04, 0.7, 12, 0xaaddff, {
          transparent: true,
          opacity: 0.5,
        });
        glStem.position.y = -0.5;
        cocktail.add(glStem);
        // Base
        const glBase = cyl(0.35, 0.38, 0.07, 32, 0xaaddff, {
          transparent: true,
          opacity: 0.5,
        });
        glBase.position.y = -0.88;
        cocktail.add(glBase);
        // Garnish (orange slice)
        const garnish = cyl(0.22, 0.22, 0.05, 16, 0xff9900);
        garnish.position.set(0.55, 0.55, 0);
        garnish.rotation.z = 0.6;
        cocktail.add(garnish);
        // Straw
        const straw = cyl(0.04, 0.04, 1.1, 8, 0xff4488);
        straw.position.set(0.2, 0.5, 0);
        straw.rotation.z = -0.3;
        cocktail.add(straw);
        // Bubbles
        for (let i = 0; i < 5; i++) {
          const bub = sph(0.04 + Math.random() * 0.04, 8, 8, 0xffffff, {
            transparent: true,
            opacity: 0.5,
          });
          bub.position.set(
            (Math.random() - 0.5) * 0.8,
            -0.1 + i * 0.15,
            (Math.random() - 0.5) * 0.5,
          );
          cocktail.add(bub);
        }
        cocktail.position.set(0, 2.3, -1.5);
        scene.add(cocktail);
        foodItems.push({
          group: cocktail,
          spin: 0.006,
          float: { amp: 0.42, speed: 0.9, offset: 5.5 },
          baseY: 2.3,
          baseX: 0,
        });

        // ── SPARKLE PARTICLES around food ─────────────
        const sparkles = [];
        for (let i = 0; i < 60; i++) {
          const spark = sph(0.035, 6, 6, 0x00e87a, {
            transparent: true,
            opacity: 0.7,
          });
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.random() * Math.PI;
          const r = 3.5 + Math.random() * 3;
          spark.position.set(
            Math.sin(phi) * Math.cos(theta) * r,
            Math.sin(phi) * Math.sin(theta) * r * 0.8,
            Math.cos(phi) * r * 0.4,
          );
          spark.userData = {
            theta,
            phi,
            r,
            speed: 0.002 + Math.random() * 0.004,
            phase: Math.random() * Math.PI * 2,
          };
          scene.add(spark);
          sparkles.push(spark);
        }

        // Mouse interaction
        let mouseX = 0,
          mouseY = 0;
        const onMouseMove = (e) => {
          const rect = canvas.getBoundingClientRect();
          mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
          mouseY = -((e.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        canvas.addEventListener("mousemove", onMouseMove);

        // Touch support
        const onTouch = (e) => {
          const rect = canvas.getBoundingClientRect();
          const t = e.touches[0];
          mouseX = ((t.clientX - rect.left) / rect.width - 0.5) * 2;
          mouseY = -((t.clientY - rect.top) / rect.height - 0.5) * 2;
        };
        canvas.addEventListener("touchmove", onTouch, { passive: true });

        // Resize
        const onResize = () => {
          const nw = canvas.clientWidth,
            nh = canvas.clientHeight;
          camera.aspect = nw / nh;
          camera.updateProjectionMatrix();
          renderer.setSize(nw, nh);
        };
        window.addEventListener("resize", onResize);

        let raf;
        const animate = () => {
          raf = requestAnimationFrame(animate);
          const t = Date.now() * 0.001;

          // Subtle camera drift following mouse
          camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
          camera.position.y += (mouseY * 1.0 - camera.position.y) * 0.04;
          camera.lookAt(0, 0, 0);

          // Animate each food item
          foodItems.forEach(({ group, spin, float: f }) => {
            group.rotation.y += spin;
            group.position.y =
              f.baseY ?? 0 + Math.sin(t * f.speed + f.offset) * f.amp;
            // Gentle wobble
            group.rotation.x = Math.sin(t * 0.7 + f.offset) * 0.08;
            group.rotation.z = Math.cos(t * 0.5 + f.offset) * 0.05;
          });

          // Fix Y position (group.position.y assignment above has precedence issue)
          foodItems.forEach(({ group, float: f, baseY }) => {
            group.position.y = baseY + Math.sin(t * f.speed + f.offset) * f.amp;
          });

          // Animate sparkles
          sparkles.forEach((sp, i) => {
            const d = sp.userData;
            d.theta += d.speed;
            sp.position.x = Math.sin(d.phi + t * 0.2) * Math.cos(d.theta) * d.r;
            sp.position.y =
              Math.sin(d.phi + t * 0.2) * Math.sin(d.theta) * d.r * 0.8;
            sp.position.z = Math.cos(d.phi + t * 0.2) * d.r * 0.4;
            sp.material.opacity = 0.3 + Math.sin(t * 3 + d.phase) * 0.4;
            const sc = 0.6 + Math.sin(t * 2.5 + d.phase) * 0.4;
            sp.scale.setScalar(sc);
          });

          // Animate point lights
          fill.position.x = Math.sin(t * 0.4) * 8;
          fill.position.z = Math.cos(t * 0.3) * 5;
          rim.position.x = Math.cos(t * 0.3) * 8;

          renderer.render(scene, camera);
        };
        animate();

        cleanupFn = () => {
          cancelAnimationFrame(raf);
          canvas.removeEventListener("mousemove", onMouseMove);
          canvas.removeEventListener("touchmove", onTouch);
          window.removeEventListener("resize", onResize);
          renderer.dispose();
        };
      };

      init();
    }, 50); // end setTimeout — wait for canvas layout

    return () => {
      clearTimeout(timer);
      if (cleanupFn) cleanupFn();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "grab",
      }}
    />
  );
}

/* ─── Scroll Observer Hook ───────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" },
    );
    document
      .querySelectorAll(".card-reveal")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

/* ─── Main Component ─────────────────────────────────────── */
export default function RestaurantLanding() {
  const { settings: platformSettings } = usePlatformSettings();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  useScrollReveal();

  // Cursor glow
  useEffect(() => {
    const glow = document.getElementById("cursor-glow");
    if (!glow) return;
    const move = (e) => {
      glow.style.left = e.clientX + "px";
      glow.style.top = e.clientY + "px";
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  // Progress bars
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target
              .querySelectorAll(".progress-fill")
              .forEach((f) => f.classList.add("animated"));
          }
        });
      },
      { threshold: 0.3 },
    );
    document
      .querySelectorAll(".stats-section")
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Feature auto-rotate
  useEffect(() => {
    const interval = setInterval(
      () => setActiveFeature((f) => (f + 1) % features.length),
      3000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e) => {
    if (e.currentTarget) addRipple(e, e.currentTarget);
    if (email) setSubmitted(true);
  };

  const features = [
    {
      icon: <BarChart3 size={22} />,
      title: "Real-Time Analytics",
      description:
        "Track orders, revenue, and customer behavior with live dashboards and predictive insights.",
      stat: "↑ 47% avg revenue",
      color: "#00e87a",
    },
    {
      icon: <Clock size={22} />,
      title: "Smart Table Management",
      description:
        "Auto-release tables, manage reservations, and optimize seating with AI-powered suggestions.",
      stat: "↑ 32% table turnover",
      color: "#0080ff",
    },
    {
      icon: <ChefHat size={22} />,
      title: "Kitchen Integration",
      description:
        "Sync orders directly to kitchen displays in real-time with priority queue management.",
      stat: "↓ 40% ticket time",
      color: "#ffd166",
    },
    {
      icon: <Zap size={22} />,
      title: "QR Code Menu",
      description:
        "Digital menus with no setup cost — customers scan, customize, and order instantly.",
      stat: "↑ 28% avg check size",
      color: "#ff6b6b",
    },
    {
      icon: <Users size={22} />,
      title: "Team Collaboration",
      description:
        "Manage staff roles, track performance, and coordinate shifts across all locations.",
      stat: "↓ 60% admin time",
      color: "#c77dff",
    },
    {
      icon: <ShieldCheck size={22} />,
      title: "Enterprise Security",
      description:
        "Bank-level security with daily backups, SOC2 compliance, and 99.99% uptime SLA.",
      stat: "0 breaches ever",
      color: "#4cc9f0",
    },
  ];

  const testimonials = [
    {
      name: "Marco Rossi",
      role: "Owner, Bella Italia",
      text: "Revenue increased by 35% in the first month. The analytics dashboard is genuinely addictive.",
      stars: 5,
      flag: "🇮🇹",
      highlight: "35% revenue boost",
    },
    {
      name: "Sarah Chen",
      role: "Manager, Urban Bistro",
      text: "The analytics dashboard alone has saved us thousands. Real data finally drives our decisions.",
      stars: 5,
      flag: "🇸🇬",
      highlight: "$48K saved annually",
    },
    {
      name: "James O'Brien",
      role: "CEO, 12-location Group",
      text: "Managing 12 locations is seamless. Centralized reporting saves our team hours every day.",
      stars: 5,
      flag: "🇮🇪",
      highlight: "12 locations unified",
    },
  ];

  const stats = [
    {
      label: "Active Restaurants",
      value: "12000",
      suffix: "+",
      progress: 0.85,
      desc: "globally",
    },
    {
      label: "Orders Processed",
      value: "5",
      suffix: "M+",
      progress: 0.92,
      desc: "this month",
    },
    {
      label: "Revenue Tracked",
      value: "1.2",
      suffix: "B+",
      progress: 0.78,
      desc: "USD total",
    },
    {
      label: "Average ROI",
      value: "340",
      suffix: "%",
      progress: 0.97,
      desc: "for customers",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "/mo",
      description: "Perfect for independent restaurants",
      features: [
        "Up to 30 tables",
        "Basic analytics",
        "Mobile app access",
        "Email support",
        "QR code menu",
      ],
      cta: "Start Free Trial",
    },
    {
      name: "Professional",
      price: "$299",
      period: "/mo",
      description: "For restaurants serious about growth",
      features: [
        "Up to 100 tables",
        "Advanced analytics",
        "Kitchen display system",
        "Staff management",
        "Priority 24/7 support",
        "Multi-location",
        "Custom branding",
      ],
      highlight: true,
      cta: "Start Free Trial",
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "pricing",
      description: "For large-scale operations",
      features: [
        "Unlimited tables",
        "Custom integrations",
        "Dedicated account manager",
        "API access",
        "On-premise option",
        "SLA guarantee",
        "Training included",
      ],
      cta: "Contact Sales",
    },
  ];

  return (
    <div
      style={{
        background: "var(--surface)",
        color: "var(--text)",
        fontFamily: "'DM Sans', sans-serif",
        minHeight: "100vh",
        overflowX: "hidden",
      }}
    >
      <style>{globalCSS}</style>

      {/* Cursor glow */}
      <div id="cursor-glow" />

      {/* ── NAV ──────────────────────────────────────────── */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 200,
          background: "rgba(10,15,13,0.85)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--border)",
          transition: "all 0.3s ease",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "16px 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {platformSettings.platformLogo ? (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(0,232,122,0.3)",
                  overflow: "hidden",
                }}
              >
                <img
                  src={platformSettings.platformLogo}
                  alt="Platform logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
            ) : (
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 10,
                  background:
                    "linear-gradient(135deg, var(--green-dark), var(--blue-mid))",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 0 20px rgba(0,232,122,0.3)",
                  animation: "glowPulse 3s ease-in-out infinite",
                }}
              >
                <ChefHat size={20} color="#fff" />
              </div>
            )}
            <span
              className="syne"
              style={{ fontSize: 18, fontWeight: 700, letterSpacing: -0.5 }}
            >
              {platformSettings.platformName}
            </span>
          </div>

          <div
            style={{ display: "flex", gap: 32, alignItems: "center" }}
            className="hidden-mobile"
          >
            {["features", "pricing", "testimonials"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                className="nav-link"
                style={{
                  color: "var(--text-dim)",
                  fontSize: 14,
                  fontWeight: 500,
                  textDecoration: "none",
                  textTransform: "capitalize",
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.color = "var(--text)")}
                onMouseLeave={(e) => (e.target.style.color = "var(--text-dim)")}
              >
                {s}
              </a>
            ))}
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <Link href="/login">
              <MagBtn
                className="hidden-mobile"
                style={{
                  background: "transparent",
                  border: "1px solid var(--border)",
                  color: "var(--text)",
                  padding: "8px 18px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Sign In
              </MagBtn>
            </Link>
            <Link href="/register">
              <MagBtn
                style={{
                  background:
                    "linear-gradient(135deg, var(--green-dark), var(--green-mid))",
                  color: "#000",
                  padding: "9px 20px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 0 20px rgba(0,232,122,0.25)",
                }}
              >
                Get Started
              </MagBtn>
            </Link>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text)",
                cursor: "pointer",
                padding: 4,
              }}
              className="mobile-only"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div
            style={{
              background: "var(--surface2)",
              padding: "16px 24px",
              borderTop: "1px solid var(--border)",
            }}
          >
            {["features", "pricing", "testimonials"].map((s) => (
              <a
                key={s}
                href={`#${s}`}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: "block",
                  padding: "12px 0",
                  color: "var(--text)",
                  textDecoration: "none",
                  textTransform: "capitalize",
                  fontSize: 15,
                  borderBottom: "1px solid var(--border)",
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
          paddingTop: 80,
          overflow: "hidden",
        }}
      >
        <ParticleField />
        <FloatingOrb
          size={500}
          x="-10%"
          y="-5%"
          color="rgba(0,232,122,0.07)"
          blur={100}
          delay={0}
        />
        <FloatingOrb
          size={350}
          x="60%"
          y="30%"
          color="rgba(0,128,255,0.06)"
          blur={80}
          delay={1}
        />
        <FloatingOrb
          size={250}
          x="80%"
          y="70%"
          color="rgba(255,209,102,0.05)"
          blur={60}
          delay={2}
        />

        <div
          style={{
            maxWidth: 1400,
            margin: "0 auto",
            padding: "60px 24px",
            width: "100%",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div className="hero-grid">
            {/* ── Left: Hero Text ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
              <div
                style={{
                  animation: "slideInLeft 0.6s 0.05s ease both",
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    background: "rgba(255,209,102,0.07)",
                    border: "1px solid rgba(255,209,102,0.2)",
                    borderRadius: 100,
                    padding: "7px 16px 7px 10px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {["🧑‍🍳", "👨‍🍳", "👩‍🍳"].map((e, i) => (
                      <div
                        key={i}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: `hsl(${i * 40 + 20},60%,50%)`,
                          border: "2px solid var(--surface)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 11,
                          marginLeft: i === 0 ? 0 : -6,
                        }}
                      >
                        {e}
                      </div>
                    ))}
                  </div>
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--gold)",
                      fontWeight: 600,
                    }}
                  >
                    Trusted by <strong>12,000+</strong> restaurant owners
                  </span>
                </div>
              </div>

              {/* Main headline — clear, human benefit-first */}
              <h1
                className="syne"
                style={{
                  fontSize: "clamp(32px, 3.8vw, 62px)",
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: -2,
                  marginBottom: 16,
                  animation: "slideInLeft 0.8s 0.15s ease both",
                }}
              >
                Run your restaurant{" "}
                <span
                  style={{
                    position: "relative",
                    display: "inline-block",
                    background:
                      "linear-gradient(135deg, var(--green), #a8ffcd)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  smarter,
                </span>
                <br />
                not harder.
              </h1>

              {/* Typewriter sub-role line */}
              <div
                style={{
                  fontSize: 15,
                  color: "var(--text-dim)",
                  marginBottom: 18,
                  animation: "slideInLeft 0.8s 0.22s ease both",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <span>Perfect for</span>
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  <TypeWriter
                    words={[
                      "cafés & bistros",
                      "fast food chains",
                      "fine dining",
                      "cloud kitchens",
                      "food trucks",
                    ]}
                    speed={65}
                  />
                </span>
              </div>

              {/* Human-readable description */}
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-dim)",
                  lineHeight: 1.8,
                  marginBottom: 28,
                  animation: "slideInLeft 0.8s 0.3s ease both",
                  borderLeft: "2px solid rgba(0,232,122,0.25)",
                  paddingLeft: 14,
                }}
              >
                From taking orders to tracking revenue — RestaurantOS handles
                the heavy lifting so you can focus on what you love:{" "}
                <em
                  style={{
                    color: "var(--text)",
                    fontStyle: "normal",
                    fontWeight: 500,
                  }}
                >
                  great food and happy guests.
                </em>
              </p>

              {/* Key benefit pills */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 8,
                  marginBottom: 28,
                  animation: "slideInLeft 0.8s 0.38s ease both",
                }}
              >
                {[
                  { icon: "⚡", label: "Setup in 5 mins" },
                  { icon: "📊", label: "Live sales data" },
                  { icon: "🍽️", label: "QR ordering" },
                  { icon: "💬", label: "24/7 support" },
                ].map(({ icon, label }) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "var(--surface2)",
                      border: "1px solid var(--border)",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: 12,
                      fontWeight: 500,
                      color: "var(--text)",
                      transition: "all 0.2s",
                      cursor: "default",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--green)";
                      e.currentTarget.style.background = "rgba(0,232,122,0.06)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                      e.currentTarget.style.background = "var(--surface2)";
                    }}
                  >
                    <span>{icon}</span> {label}
                  </div>
                ))}
              </div>

              {/* CTA buttons */}
              <div
                style={{
                  display: "flex",
                  gap: 12,
                  flexWrap: "wrap",
                  marginBottom: 22,
                  animation: "slideInLeft 0.8s 0.46s ease both",
                }}
              >
                <MagBtn
                  style={{
                    background:
                      "linear-gradient(135deg, var(--green-dark), var(--green))",
                    color: "#000",
                    padding: "14px 26px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    boxShadow:
                      "0 0 30px rgba(0,232,122,0.35), 0 8px 24px rgba(0,0,0,0.3)",
                  }}
                >
                  🚀 Start for Free <ArrowRight size={15} />
                </MagBtn>
                <MagBtn
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "var(--text)",
                    padding: "14px 20px",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 500,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <Play size={13} /> Watch 2-min demo
                </MagBtn>
              </div>

              {/* Trust micro-copy */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  animation: "slideInLeft 0.8s 0.54s ease both",
                }}
              >
                <div style={{ display: "flex", gap: 1 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} fill="#ffd166" color="#ffd166" />
                  ))}
                </div>
                <span style={{ fontSize: 12, color: "var(--text-dim)" }}>
                  <strong style={{ color: "var(--text)" }}>4.9/5</strong> from
                  2,400+ reviews · No credit card · Cancel anytime
                </span>
              </div>
            </div>

            {/* Right — 3D Scene */}
            <div
              style={{
                animation: "slideInRight 1s 0.2s ease both",
                position: "relative",
              }}
            >
              <div
                style={{
                  borderRadius: 20,
                  overflow: "hidden",
                  border: "1px solid var(--border)",
                  boxShadow:
                    "0 40px 80px rgba(0,0,0,0.6), 0 0 60px rgba(0,232,122,0.1)",
                  background: "linear-gradient(135deg, #091510, #0d2018)",
                  position: "relative",
                }}
              >
                {/* Status bar */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    borderBottom: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
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
                      color: "var(--text-dim)",
                      fontFamily: "monospace",
                    }}
                  >
                    restaurant_scene.3d
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      color: "var(--green)",
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        background: "var(--green)",
                        borderRadius: "50%",
                        animation: "glowPulse 1s infinite",
                      }}
                    />{" "}
                    LIVE
                  </div>
                </div>
                <div style={{ height: 380 }}>
                  <RestaurantScene />
                </div>
              </div>

              {/* Floating chips */}
              <div
                style={{
                  position: "absolute",
                  top: -16,
                  right: -20,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  animation: "floatY 3s 0s ease-in-out infinite",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    marginBottom: 2,
                  }}
                >
                  Today&apos;s Revenue
                </div>
                <div
                  className="syne"
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "var(--green)",
                  }}
                >
                  $12,847
                </div>
                <div style={{ fontSize: 10, color: "#4ade80" }}>
                  ↑ 23.4% vs yesterday
                </div>
              </div>
              <div
                style={{
                  position: "absolute",
                  bottom: 30,
                  left: -24,
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  padding: "10px 14px",
                  animation: "floatY 3.5s 0.5s ease-in-out infinite",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    color: "var(--text-dim)",
                    marginBottom: 2,
                  }}
                >
                  Tables Active
                </div>
                <div
                  className="syne"
                  style={{ fontSize: 20, fontWeight: 700, color: "#0080ff" }}
                >
                  24/30
                </div>
                <div style={{ fontSize: 10, color: "var(--text-dim)" }}>
                  80% occupancy
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────── */}
      <section
        className="stats-section"
        style={{
          padding: "80px 24px",
          background: "var(--surface2)",
          borderTop: "1px solid var(--border)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="stats-grid">
            {stats.map((s, i) => (
              <div
                key={i}
                className="card-reveal"
                style={{ transitionDelay: `${i * 0.1}s`, textAlign: "center" }}
              >
                <div
                  className="syne"
                  style={{
                    fontSize: "clamp(32px,4vw,52px)",
                    fontWeight: 800,
                    color: "var(--green)",
                    lineHeight: 1,
                  }}
                >
                  <AnimatedCounter target={s.value} suffix={s.suffix} />
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--text)",
                    marginTop: 6,
                    marginBottom: 2,
                  }}
                >
                  {s.label}
                </div>
                <div style={{ fontSize: 11, color: "var(--text-dim)" }}>
                  {s.desc}
                </div>
                <div className="progress-bar" style={{ marginTop: 10 }}>
                  <div
                    className="progress-fill"
                    style={{ width: `${s.progress * 100}%` }}
                  />
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
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FloatingOrb
          size={400}
          x="50%"
          y="0%"
          color="rgba(0,128,255,0.05)"
          blur={100}
        />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: "var(--green)",
                textTransform: "uppercase",
                marginBottom: 16,
                background: "rgba(0,232,122,0.08)",
                padding: "5px 14px",
                borderRadius: 100,
              }}
            >
              Platform Features
            </div>
            <h2
              className="syne card-reveal"
              style={{
                fontSize: "clamp(28px,4vw,52px)",
                fontWeight: 800,
                letterSpacing: -1.5,
                marginBottom: 16,
              }}
            >
              Everything you need to grow
            </h2>
            <p
              className="card-reveal"
              style={{
                fontSize: 16,
                color: "var(--text-dim)",
                maxWidth: 480,
                margin: "0 auto",
              }}
            >
              Powerful tools designed specifically for modern restaurants
            </p>
          </div>

          {/* Interactive Feature Tabs */}
          <div className="feat-tabs" style={{ marginBottom: 60 }}>
            {/* Tab list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {features.map((f, i) => (
                <div
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  style={{
                    padding: "16px 20px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: `1px solid ${activeFeature === i ? f.color + "40" : "var(--border)"}`,
                    background:
                      activeFeature === i ? `${f.color}08` : "transparent",
                    transition: "all 0.3s cubic-bezier(0.34,1.2,0.64,1)",
                    transform:
                      activeFeature === i ? "translateX(6px)" : "translateX(0)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}
                >
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 9,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background:
                        activeFeature === i
                          ? `${f.color}20`
                          : "var(--surface3)",
                      color: activeFeature === i ? f.color : "var(--text-dim)",
                      transition: "all 0.3s ease",
                      flexShrink: 0,
                    }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          activeFeature === i
                            ? "var(--text)"
                            : "var(--text-dim)",
                        transition: "color 0.2s",
                      }}
                    >
                      {f.title}
                    </div>
                    {activeFeature === i && (
                      <div
                        style={{
                          fontSize: 12,
                          color: f.color,
                          marginTop: 2,
                          fontWeight: 600,
                        }}
                      >
                        {f.stat}
                      </div>
                    )}
                  </div>
                  {activeFeature === i && (
                    <div
                      style={{
                        marginLeft: "auto",
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: f.color,
                        boxShadow: `0 0 10px ${f.color}`,
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Feature detail */}
            <TiltCard
              style={{
                background: `linear-gradient(135deg, ${features[activeFeature].color}08, var(--surface2))`,
                border: `1px solid ${features[activeFeature].color}25`,
                borderRadius: 20,
                padding: 40,
                minHeight: 340,
                transition: "background 0.5s ease, border-color 0.5s ease",
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: `${features[activeFeature].color}20`,
                  color: features[activeFeature].color,
                  marginBottom: 20,
                  fontSize: 28,
                  boxShadow: `0 0 30px ${features[activeFeature].color}30`,
                }}
              >
                {features[activeFeature].icon}
              </div>
              <h3
                className="syne"
                style={{ fontSize: 26, fontWeight: 700, marginBottom: 12 }}
              >
                {features[activeFeature].title}
              </h3>
              <p
                style={{
                  fontSize: 15,
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                  marginBottom: 24,
                }}
              >
                {features[activeFeature].description}
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  background: `${features[activeFeature].color}15`,
                  border: `1px solid ${features[activeFeature].color}30`,
                  borderRadius: 8,
                  padding: "8px 14px",
                }}
              >
                <TrendingUp size={14} color={features[activeFeature].color} />
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
            </TiltCard>
          </div>

          {/* Grid cards */}
          <div className="feat-grid">
            {features.map((f, i) => (
              <TiltCard
                key={i}
                className="card-reveal feat-card hover-lift"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 16,
                  padding: "28px 24px",
                  transitionDelay: `${i * 0.08}s`,
                  cursor: "pointer",
                }}
              >
                <div
                  className="feat-icon-wrap"
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 11,
                    background: `${f.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: f.color,
                    marginBottom: 16,
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
                    color: "var(--text-dim)",
                    lineHeight: 1.6,
                  }}
                >
                  {f.description}
                </p>
                <div
                  style={{
                    marginTop: 14,
                    fontSize: 12,
                    fontWeight: 600,
                    color: f.color,
                  }}
                >
                  {f.stat}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ──────────────────────────────────────── */}
      <section
        id="pricing"
        style={{
          padding: "100px 24px",
          background: "var(--surface2)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FloatingOrb
          size={450}
          x="-10%"
          y="20%"
          color="rgba(0,232,122,0.06)"
          blur={120}
        />
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: "var(--blue)",
                textTransform: "uppercase",
                marginBottom: 16,
                background: "rgba(0,128,255,0.08)",
                padding: "5px 14px",
                borderRadius: 100,
              }}
            >
              Pricing
            </div>
            <h2
              className="syne card-reveal"
              style={{
                fontSize: "clamp(28px,4vw,52px)",
                fontWeight: 800,
                letterSpacing: -1.5,
                marginBottom: 16,
              }}
            >
              Simple, transparent pricing
            </h2>
            <p
              className="card-reveal"
              style={{
                color: "var(--text-dim)",
                fontSize: 16,
                maxWidth: 420,
                margin: "0 auto",
              }}
            >
              Choose the perfect plan and scale as you grow
            </p>
          </div>

          <div className="pricing-grid">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`card-reveal ripple-container ${plan.highlight ? "pricing-popular" : ""}`}
                onMouseEnter={() => setHoveredPlan(i)}
                onMouseLeave={() => setHoveredPlan(null)}
                onClick={(e) => addRipple(e, e.currentTarget)}
                style={{
                  borderRadius: 16,
                  padding: "36px 30px",
                  border: plan.highlight ? "none" : "1px solid var(--border)",
                  background: plan.highlight
                    ? "linear-gradient(135deg, #0a1a0f, #0f2018)"
                    : "var(--surface)",
                  transform: `${plan.highlight ? "scale(1.04)" : "scale(1)"} ${hoveredPlan === i ? "translateY(-8px)" : "translateY(0)"}`,
                  transition:
                    "transform 0.4s cubic-bezier(0.34,1.3,0.64,1), box-shadow 0.4s ease",
                  boxShadow:
                    hoveredPlan === i
                      ? `0 30px 60px rgba(0,0,0,0.5), 0 0 40px ${plan.highlight ? "rgba(0,232,122,0.2)" : "rgba(0,0,0,0.1)"}`
                      : plan.highlight
                        ? "0 20px 40px rgba(0,0,0,0.4)"
                        : "none",
                  transitionDelay: `${i * 0.1}s`,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {plan.highlight && (
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background:
                        "linear-gradient(135deg, var(--green-dark), var(--green))",
                      color: "#000",
                      fontSize: 10,
                      fontWeight: 800,
                      padding: "4px 10px",
                      borderRadius: 100,
                      letterSpacing: 1,
                    }}
                  >
                    MOST POPULAR
                  </div>
                )}
                <div
                  style={{
                    marginBottom: 6,
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: plan.highlight ? "var(--green)" : "var(--text-dim)",
                    textTransform: "uppercase",
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
                    className="syne"
                    style={{ fontSize: 44, fontWeight: 800, letterSpacing: -2 }}
                  >
                    {plan.price}
                  </span>
                  <span style={{ fontSize: 14, color: "var(--text-dim)" }}>
                    {plan.period}
                  </span>
                </div>
                <p
                  style={{
                    fontSize: 13,
                    color: "var(--text-dim)",
                    marginBottom: 28,
                  }}
                >
                  {plan.description}
                </p>
                <MagBtn
                  style={{
                    width: "100%",
                    padding: "13px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    background: plan.highlight
                      ? "linear-gradient(135deg, var(--green-dark), var(--green))"
                      : "var(--surface3)",
                    color: plan.highlight ? "#000" : "var(--text)",
                    border: plan.highlight ? "none" : "1px solid var(--border)",
                    cursor: "pointer",
                    marginBottom: 28,
                    boxShadow: plan.highlight
                      ? "0 0 20px rgba(0,232,122,0.3)"
                      : "none",
                  }}
                >
                  {plan.cta}
                </MagBtn>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 12 }}
                >
                  {plan.features.map((f, j) => (
                    <div
                      key={j}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontSize: 13,
                        color: "var(--text-dim)",
                      }}
                    >
                      <Check
                        size={14}
                        color={plan.highlight ? "var(--green)" : "#4ade80"}
                        style={{ flexShrink: 0 }}
                      />{" "}
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
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 64 }}>
            <div
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: "var(--gold)",
                textTransform: "uppercase",
                marginBottom: 16,
                background: "rgba(255,209,102,0.08)",
                padding: "5px 14px",
                borderRadius: 100,
              }}
            >
              Testimonials
            </div>
            <h2
              className="syne card-reveal"
              style={{
                fontSize: "clamp(28px,4vw,52px)",
                fontWeight: 800,
                letterSpacing: -1.5,
                marginBottom: 16,
              }}
            >
              Loved by restaurant teams
            </h2>
          </div>

          <div className="testi-grid">
            {testimonials.map((t, i) => (
              <TiltCard
                key={i}
                className="card-reveal hover-lift"
                style={{
                  background: "var(--surface2)",
                  border: "1px solid var(--border)",
                  borderRadius: 20,
                  padding: 32,
                  transitionDelay: `${i * 0.1}s`,
                }}
              >
                {/* Stars */}
                <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={14} fill="#ffd166" color="#ffd166" />
                  ))}
                </div>

                {/* Highlight pill */}
                <div
                  style={{
                    display: "inline-block",
                    background: "rgba(0,232,122,0.08)",
                    border: "1px solid rgba(0,232,122,0.15)",
                    color: "var(--green)",
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "3px 10px",
                    borderRadius: 100,
                    marginBottom: 14,
                  }}
                >
                  {t.highlight}
                </div>

                <p
                  style={{
                    fontSize: 14,
                    color: "var(--text-dim)",
                    lineHeight: 1.75,
                    marginBottom: 24,
                    fontStyle: "italic",
                  }}
                >
                  &quot;{t.text}&quot;
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
                  <div style={{ fontSize: 28 }}>{t.flag}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>
                      {t.name}
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-dim)" }}>
                      {t.role}
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section
        style={{
          padding: "100px 24px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <FloatingOrb
          size={600}
          x="50%"
          y="50%"
          color="rgba(0,232,122,0.06)"
          blur={150}
        />
        <div
          style={{
            maxWidth: 680,
            margin: "0 auto",
            textAlign: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div
            style={{
              background: "var(--surface2)",
              border: "1px solid var(--border)",
              borderRadius: 24,
              padding: "60px 48px",
              boxShadow: "0 40px 80px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="animate-shimmer"
              style={{
                display: "inline-block",
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 3,
                color: "var(--green)",
                textTransform: "uppercase",
                marginBottom: 20,
                padding: "5px 16px",
                borderRadius: 100,
                border: "1px solid rgba(0,232,122,0.2)",
              }}
            >
              Get Started Today
            </div>
            <h2
              className="syne"
              style={{
                fontSize: "clamp(28px,4vw,48px)",
                fontWeight: 800,
                letterSpacing: -1.5,
                marginBottom: 16,
              }}
            >
              Ready to transform your restaurant?
            </h2>
            <p
              style={{
                color: "var(--text-dim)",
                fontSize: 16,
                marginBottom: 36,
                lineHeight: 1.7,
              }}
            >
              Join 12,000+ restaurants already growing with RestaurantOS. Start
              your free 14-day trial today.
            </p>

            {!submitted ? (
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  maxWidth: 420,
                  margin: "0 auto 20px",
                }}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  style={{
                    flex: 1,
                    padding: "13px 16px",
                    borderRadius: 10,
                    fontSize: 14,
                    background: "var(--surface)",
                    border: "1px solid var(--border)",
                    color: "var(--text)",
                    outline: "none",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(0,232,122,0.5)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
                />
                <MagBtn
                  onClick={handleSubmit}
                  style={{
                    padding: "13px 20px",
                    borderRadius: 10,
                    fontSize: 14,
                    fontWeight: 700,
                    background:
                      "linear-gradient(135deg, var(--green-dark), var(--green))",
                    color: "#000",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    whiteSpace: "nowrap",
                    boxShadow: "0 0 20px rgba(0,232,122,0.3)",
                  }}
                >
                  <Send size={14} /> Get Started
                </MagBtn>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                  padding: "16px 24px",
                  background: "rgba(0,232,122,0.08)",
                  border: "1px solid rgba(0,232,122,0.2)",
                  borderRadius: 12,
                  marginBottom: 20,
                  animation: "scaleIn 0.4s ease",
                }}
              >
                <Check size={18} color="var(--green)" />
                <span style={{ color: "var(--green)", fontWeight: 600 }}>
                  You&apos;re on the list! We&apos;ll be in touch shortly.
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
              {["No credit card", "Setup in minutes", "Cancel anytime"].map(
                (t) => (
                  <div
                    key={t}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 12,
                      color: "var(--text-dim)",
                    }}
                  >
                    <Check size={11} color="var(--green)" /> {t}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer
        style={{
          background: "var(--surface)",
          borderTop: "1px solid var(--border)",
          padding: "60px 24px 32px",
        }}
      >
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div className="footer-grid">
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
                    width: 34,
                    height: 34,
                    borderRadius: 8,
                    background:
                      "linear-gradient(135deg, var(--green-dark), var(--blue-mid))",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {platformSettings.platformLogo ? (
                    <img
                      src={platformSettings.platformLogo}
                      alt="Platform logo"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: 6,
                      }}
                    />
                  ) : (
                    <ChefHat size={18} color="#fff" />
                  )}
                </div>
                <span
                  className="syne"
                  style={{ fontSize: 16, fontWeight: 700 }}
                >
                  {platformSettings.platformName}
                </span>
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--text-dim)",
                  lineHeight: 1.7,
                  maxWidth: 240,
                }}
              >
                The all-in-one platform for modern restaurants to thrive in a
                competitive world.
              </p>
            </div>
            {[
              {
                label: "Product",
                links: ["Features", "Pricing", "Security", "Changelog"],
              },
              {
                label: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                label: "Legal",
                links: ["Privacy", "Terms", "Cookies", "Contact"],
              },
            ].map((col) => (
              <div key={col.label}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: "uppercase",
                    color: "var(--text-dim)",
                    marginBottom: 16,
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
                      color: "var(--text-dim)",
                      textDecoration: "none",
                      marginBottom: 10,
                      transition: "color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.target.style.color = "var(--green)")
                    }
                    onMouseLeave={(e) =>
                      (e.target.style.color = "var(--text-dim)")
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
              borderTop: "1px solid var(--border)",
              paddingTop: 24,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <p style={{ fontSize: 12, color: "var(--text-dim)" }}>
              © 2026 {platformSettings.platformName}. All rights reserved.
            </p>
            <div style={{ display: "flex", gap: 20 }}>
              {["Twitter", "LinkedIn", "GitHub"].map((s) => (
                <a
                  key={s}
                  href="#"
                  style={{
                    fontSize: 12,
                    color: "var(--text-dim)",
                    textDecoration: "none",
                    transition: "color 0.2s",
                  }}
                  onMouseEnter={(e) => (e.target.style.color = "var(--green)")}
                  onMouseLeave={(e) =>
                    (e.target.style.color = "var(--text-dim)")
                  }
                >
                  {s}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── RESPONSIVE ───────────────────────────────────── */}
      <style>{`
        /* ── Hero 2-column grid ── */
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: center;
          width: 100%;
        }

        /* ── Other section grids ── */
        .stats-grid   { display: grid; grid-template-columns: repeat(4,1fr); gap: 40px; }
        .feat-tabs    { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; align-items: start; }
        .feat-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 20px; }
        .pricing-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; align-items: start; }
        .testi-grid   { display: grid; grid-template-columns: repeat(3,1fr); gap: 24px; }
        .footer-grid  { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 48px; margin-bottom: 48px; }

        /* ── 1024px ── */
        @media (max-width: 1024px) {
          .feat-grid    { grid-template-columns: repeat(2,1fr); }
          .footer-grid  { grid-template-columns: 1fr 1fr; gap: 32px; }
        }

        /* ── 768px: single column ── */
        @media (max-width: 768px) {
          .hero-grid    { grid-template-columns: 1fr; gap: 32px; }
          .stats-grid   { grid-template-columns: repeat(2,1fr); gap: 24px; }
          .feat-tabs    { grid-template-columns: 1fr; }
          .feat-grid    { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .testi-grid   { grid-template-columns: 1fr; }
          .footer-grid  { grid-template-columns: 1fr 1fr; gap: 28px; }
          .hidden-mobile { display: none !important; }
          .mobile-only   { display: block !important; }
        }

        @media (max-width: 480px) {
          .stats-grid  { grid-template-columns: 1fr 1fr; }
          .footer-grid { grid-template-columns: 1fr; }
        }

        @media (min-width: 769px) {
          .mobile-only { display: none !important; }
        }
      `}</style>
    </div>
  );
}
