"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Store,
  User,
  ArrowRight,
  Loader2,
  ChefHat,
  MapPin,
  Phone,
  Mail,
  Hash,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Shield,
  Gift,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

/* ── Styles ──────────────────────────────────────────────── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

  .rp-root *, .rp-root *::before, .rp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .rp-root {
    min-height: 100vh;
    background: #f7f5f0;
    font-family: 'DM Sans', sans-serif;
    color: #1a1a1a;
    position: relative;
    overflow-x: hidden;
  }

  /* Warm background texture */
  .rp-root::before {
    content: '';
    position: fixed;
    inset: 0;
    background:
      radial-gradient(ellipse 80% 60% at 10% 0%, rgba(255,159,67,0.12) 0%, transparent 60%),
      radial-gradient(ellipse 60% 50% at 90% 100%, rgba(52,168,83,0.10) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 100%);
    pointer-events: none;
    z-index: 0;
  }

  /* Subtle dot grid */
  .rp-root::after {
    content: '';
    position: fixed;
    inset: 0;
    background-image: radial-gradient(circle, rgba(0,0,0,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    pointer-events: none;
    z-index: 0;
    opacity: 0.5;
  }

  /* ── NAV ── */
  .rp-nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(247,245,240,0.85);
    backdrop-filter: blur(16px);
    border-bottom: 1px solid rgba(0,0,0,0.08);
    padding: 14px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .rp-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: inherit;
  }

  .rp-logo-icon {
    width: 38px;
    height: 38px;
    background: linear-gradient(135deg, #ff6b35, #f7c59f);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(255,107,53,0.3);
  }

  .rp-logo-text {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800;
    font-size: 18px;
    letter-spacing: -0.5px;
    color: #1a1a1a;
  }

  .rp-logo-text span { color: #ff6b35; }

  .rp-nav-hint {
    font-size: 13px;
    color: #666;
  }

  .rp-nav-hint a {
    color: #ff6b35;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s;
  }

  .rp-nav-hint a:hover { color: #e55a20; }

  /* ── MAIN LAYOUT ── */
  .rp-main {
    position: relative;
    z-index: 1;
    display: grid;
    grid-template-columns: 1fr 580px 1fr;
    gap: 0;
    min-height: calc(100vh - 68px);
    padding: 48px 24px 64px;
  }

  .rp-col-left {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    padding-right: 48px;
    padding-top: 40px;
    gap: 28px;
  }

  .rp-col-center { /* The form card */ }

  .rp-col-right {
    display: flex;
    flex-direction: column;
    padding-left: 48px;
    padding-top: 40px;
    gap: 20px;
  }

  /* ── SIDE CARDS ── */
  .rp-side-card {
    background: white;
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 12px rgba(0,0,0,0.05);
    max-width: 220px;
    animation: fadeSlideIn 0.6s ease both;
  }

  .rp-side-card:nth-child(2) { animation-delay: 0.1s; }
  .rp-side-card:nth-child(3) { animation-delay: 0.2s; }

  @keyframes fadeSlideIn {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .rp-side-stat {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 32px;
    font-weight: 800;
    line-height: 1;
    margin-bottom: 4px;
  }

  .rp-side-label {
    font-size: 12px;
    color: #888;
    font-weight: 500;
  }

  .rp-side-icon {
    width: 36px;
    height: 36px;
    border-radius: 9px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 12px;
  }

  .rp-step-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: white;
    border-radius: 12px;
    border: 1px solid rgba(0,0,0,0.06);
    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
    max-width: 220px;
    animation: fadeSlideIn 0.6s ease both;
    cursor: default;
    transition: transform 0.2s, box-shadow 0.2s;
  }

  .rp-step-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
  }

  .rp-step-num {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #fff3ed;
    color: #ff6b35;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-weight: 800;
    font-size: 13px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rp-step-title {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 2px;
  }

  .rp-step-desc {
    font-size: 11px;
    color: #888;
    line-height: 1.5;
  }

  /* ── FORM CARD ── */
  .rp-card {
    background: white;
    border-radius: 24px;
    border: 1px solid rgba(0,0,0,0.07);
    box-shadow:
      0 4px 6px rgba(0,0,0,0.04),
      0 20px 60px rgba(0,0,0,0.08),
      0 0 0 1px rgba(255,255,255,0.8) inset;
    overflow: hidden;
    animation: cardIn 0.7s cubic-bezier(0.34,1.2,0.64,1) both;
  }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(32px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  /* ── CARD HEADER ── */
  .rp-header {
    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
    padding: 36px 36px 32px;
    position: relative;
    overflow: hidden;
  }

  .rp-header::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    background: radial-gradient(circle, rgba(255,107,53,0.25) 0%, transparent 70%);
    border-radius: 50%;
  }

  .rp-header::after {
    content: '';
    position: absolute;
    bottom: -40px; left: -40px;
    width: 160px; height: 160px;
    background: radial-gradient(circle, rgba(52,168,83,0.15) 0%, transparent 70%);
    border-radius: 50%;
  }

  .rp-header-inner { position: relative; z-index: 1; }

  .rp-header-top {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 16px;
  }

  .rp-header-icon {
    width: 52px;
    height: 52px;
    background: rgba(255,107,53,0.15);
    border: 1px solid rgba(255,107,53,0.3);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #ff6b35;
    flex-shrink: 0;
  }

  .rp-eyebrow {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: rgba(255,107,53,0.8);
    display: block;
    margin-bottom: 6px;
  }

  .rp-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 28px;
    font-weight: 800;
    color: white;
    line-height: 1.15;
    letter-spacing: -0.5px;
  }

  .rp-title em {
    font-style: normal;
    background: linear-gradient(135deg, #ff6b35, #ffa500);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .rp-subtitle {
    font-size: 13.5px;
    color: rgba(255,255,255,0.55);
    line-height: 1.7;
    max-width: 400px;
  }

  /* Progress dots */
  .rp-progress {
    display: flex;
    gap: 6px;
    margin-top: 20px;
  }

  .rp-progress-dot {
    height: 3px;
    border-radius: 2px;
    transition: all 0.3s ease;
  }

  .rp-progress-dot.active {
    width: 28px;
    background: #ff6b35;
  }

  .rp-progress-dot.inactive {
    width: 12px;
    background: rgba(255,255,255,0.2);
  }

  /* ── FORM BODY ── */
  .rp-body {
    padding: 36px;
  }

  /* ── SECTION ── */
  .rp-section {
    margin-bottom: 32px;
  }

  .rp-section-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 20px;
    padding-bottom: 12px;
    border-bottom: 1.5px dashed rgba(0,0,0,0.08);
  }

  .rp-section-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .rp-section-text { flex: 1; }

  .rp-section-title {
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
    display: block;
  }

  .rp-section-num {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 2px;
    color: #bbb;
    text-transform: uppercase;
    display: block;
  }

  /* ── GRID ── */
  .rp-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }

  .rp-field { display: flex; flex-direction: column; gap: 5px; }
  .rp-field.full { grid-column: 1 / -1; }

  /* ── LABEL ── */
  .rp-label {
    font-size: 12.5px;
    font-weight: 600;
    color: #444;
    letter-spacing: 0.2px;
  }

  /* ── INPUTS ── */
  .rp-input-wrap {
    position: relative;
    display: flex;
    align-items: center;
  }

  .rp-input-icon {
    position: absolute;
    left: 12px;
    color: #bbb;
    pointer-events: none;
    z-index: 1;
    transition: color 0.2s;
  }

  .rp-input {
    width: 100%;
    height: 42px;
    padding: 0 12px 0 36px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    background: #fafaf9;
    color: #1a1a1a;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
  }

  .rp-input:focus {
    border-color: #ff6b35;
    background: white;
    box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
  }

  .rp-input:focus ~ .rp-input-icon,
  .rp-input-wrap:focus-within .rp-input-icon { color: #ff6b35; }

  .rp-input::placeholder { color: #c0c0c0; }

  .rp-textarea {
    width: 100%;
    min-height: 90px;
    padding: 12px 14px 12px 36px;
    border: 1.5px solid #e8e8e8;
    border-radius: 10px;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    background: #fafaf9;
    color: #1a1a1a;
    resize: vertical;
    transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
    outline: none;
    line-height: 1.6;
  }

  .rp-textarea:focus {
    border-color: #ff6b35;
    background: white;
    box-shadow: 0 0 0 3px rgba(255,107,53,0.1);
  }

  .rp-textarea::placeholder { color: #c0c0c0; }

  /* Select override */
  .rp-select [data-radix-select-trigger] {
    height: 42px;
    border: 1.5px solid #e8e8e8 !important;
    border-radius: 10px !important;
    background: #fafaf9 !important;
    font-size: 13.5px;
    font-family: 'DM Sans', sans-serif;
    padding-left: 36px !important;
  }

  .rp-hint {
    font-size: 11px;
    color: #aaa;
    margin-top: 2px;
  }

  /* ── DIVIDER ── */
  .rp-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .rp-divider-line {
    flex: 1;
    height: 1.5px;
    background: linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent);
  }

  .rp-divider-text {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 2px;
    text-transform: uppercase;
    color: #ccc;
    white-space: nowrap;
  }

  /* ── SUBMIT ── */
  .rp-submit {
    width: 100%;
    height: 50px;
    background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'Bricolage Grotesque', sans-serif;
    font-size: 16px;
    font-weight: 700;
    letter-spacing: -0.2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 4px 20px rgba(255,107,53,0.35);
    margin-bottom: 20px;
  }

  .rp-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 28px rgba(255,107,53,0.45);
  }

  .rp-submit:active:not(:disabled) {
    transform: translateY(0);
  }

  .rp-submit:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  /* ── TRUST BAR ── */
  .rp-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    padding: 14px 20px;
    background: #fafaf9;
    border-radius: 10px;
    border: 1px solid #f0f0ee;
    margin-top: 16px;
  }

  .rp-trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #666;
    font-weight: 500;
  }

  .rp-trust-icon { color: #ff6b35; }

  .rp-login-hint {
    text-align: center;
    font-size: 13px;
    color: #888;
  }

  .rp-login-hint a {
    color: #ff6b35;
    font-weight: 600;
    text-decoration: none;
  }

  .rp-login-hint a:hover { text-decoration: underline; }

  /* ── FOOTER ── */
  .rp-footer {
    position: relative;
    z-index: 1;
    text-align: center;
    padding: 24px;
    font-size: 12px;
    color: #bbb;
    display: flex;
    justify-content: center;
    gap: 24px;
  }

  /* ── FLOATING BADGE ── */
  .rp-float-badge {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: white;
    border-radius: 14px;
    padding: 14px 18px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.12);
    border: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    gap: 10px;
    z-index: 50;
    animation: badgeIn 0.8s 1s cubic-bezier(0.34,1.3,0.64,1) both;
  }

  @keyframes badgeIn {
    from { opacity: 0; transform: translateY(20px) scale(0.9); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .rp-float-avatar {
    display: flex;
    flex-direction: row-reverse;
  }

  .rp-float-avatar span {
    width: 28px; height: 28px;
    border-radius: 50%;
    border: 2px solid white;
    display: flex; align-items: center; justify-content: center;
    font-size: 13px;
    margin-left: -8px;
  }

  .rp-float-avatar span:last-child { margin-left: 0; }

  .rp-float-text { font-size: 12px; line-height: 1.4; }
  .rp-float-text strong { font-weight: 700; font-size: 13px; display: block; color: #1a1a1a; }
  .rp-float-text span { color: #888; }

  /* ── RESPONSIVE ── */
  @media (max-width: 1200px) {
    .rp-main { grid-template-columns: 1fr 540px 1fr; }
    .rp-col-left, .rp-col-right { padding-left: 24px; padding-right: 24px; }
  }

  @media (max-width: 960px) {
    .rp-main { grid-template-columns: 1fr; padding: 32px 16px 48px; }
    .rp-col-left, .rp-col-right { display: none; }
  }

  @media (max-width: 520px) {
    .rp-header { padding: 28px 24px 24px; }
    .rp-body { padding: 24px; }
    .rp-grid { grid-template-columns: 1fr; }
    .rp-field.full { grid-column: 1; }
    .rp-title { font-size: 22px; }
    .rp-float-badge { display: none; }
  }

  /* Input field animation on load */
  .rp-field {
    animation: fieldIn 0.5s ease both;
  }
  .rp-field:nth-child(1)  { animation-delay: 0.05s; }
  .rp-field:nth-child(2)  { animation-delay: 0.10s; }
  .rp-field:nth-child(3)  { animation-delay: 0.15s; }
  .rp-field:nth-child(4)  { animation-delay: 0.20s; }
  .rp-field:nth-child(5)  { animation-delay: 0.25s; }
  .rp-field:nth-child(6)  { animation-delay: 0.30s; }
  .rp-field:nth-child(7)  { animation-delay: 0.35s; }
  .rp-field:nth-child(8)  { animation-delay: 0.40s; }
  .rp-field:nth-child(9)  { animation-delay: 0.45s; }
  .rp-field:nth-child(10) { animation-delay: 0.50s; }

  @keyframes fieldIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

/* ── Field component ─────────────────────────────────────── */
function Field({ label, hint, icon: Icon, children, full }) {
  return (
    <div className={`rp-field${full ? " full" : ""}`}>
      <label className="rp-label">{label}</label>
      <div className="rp-input-wrap">
        {Icon && <Icon size={14} className="rp-input-icon" />}
        {children}
      </div>
      {hint && <p className="rp-hint">{hint}</p>}
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────── */
export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const router = useRouter();
  const { settings } = usePlatformSettings();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      toast.error(result.message || "Registration failed");
      setLoading(false);
      return;
    }

    await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    toast.success("Welcome! Your restaurant account is ready 🎉");
    router.push("/dashboard");
  }

  return (
    <>
      <style>{css}</style>
      <div className="rp-root">
        {/* ── NAV ── */}
        <nav className="rp-nav">
          <Link href="/" className="rp-logo">
            <div className="rp-logo-icon">
              {settings?.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Logo"
                  className="w-full h-full rounded-lg object-cover"
                />
              ) : (
                <ChefHat size={18} color="white" />
              )}
            </div>
            <span className="rp-logo-text">
              {settings?.platformName || "RestaurantOS"}
            </span>
          </Link>
          <span className="rp-nav-hint">
            Already have an account? <Link href="/login">Sign in →</Link>
          </span>
        </nav>

        {/* ── MAIN ── */}
        <main className="rp-main">
          {/* Left sidebar — social proof */}
          <div className="rp-col-left">
            <div className="rp-side-card" style={{ animationDelay: "0.3s" }}>
              <div className="rp-side-icon" style={{ background: "#fff3ed" }}>
                <Store size={16} color="#ff6b35" />
              </div>
              <div className="rp-side-stat" style={{ color: "#ff6b35" }}>
                12k+
              </div>
              <div className="rp-side-label">Restaurants on platform</div>
            </div>
            <div className="rp-side-card" style={{ animationDelay: "0.45s" }}>
              <div className="rp-side-icon" style={{ background: "#f0fdf4" }}>
                <CheckCircle2 size={16} color="#34a853" />
              </div>
              <div className="rp-side-stat" style={{ color: "#34a853" }}>
                5M+
              </div>
              <div className="rp-side-label">Orders processed monthly</div>
            </div>
            <div className="rp-side-card" style={{ animationDelay: "0.6s" }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
                {[...Array(5)].map((_, i) => (
                  <span key={i} style={{ color: "#ffa500", fontSize: 15 }}>
                    ★
                  </span>
                ))}
              </div>
              <div
                className="rp-side-stat"
                style={{ color: "#1a1a1a", fontSize: 24 }}
              >
                &quot;Changed how we operate&quot;
              </div>
              <div className="rp-side-label" style={{ marginTop: 6 }}>
                — Marco R., Bella Italia
              </div>
            </div>
          </div>

          {/* ── CENTER: FORM CARD ── */}
          <div className="rp-col-center">
            <div className="rp-card">
              {/* Header */}
              <div className="rp-header">
                <div className="rp-header-inner">
                  <div className="rp-header-top">
                    <div className="rp-header-icon">
                      <Store size={24} />
                    </div>
                    <div>
                      <span className="rp-eyebrow">
                        New Account · Free Trial
                      </span>
                      <h1 className="rp-title">
                        Register Your
                        <br />
                        <em>Restaurant</em>
                      </h1>
                    </div>
                  </div>
                  <p className="rp-subtitle">
                    Set up your restaurant and start managing orders, tables,
                    and revenue — all in one place. Ready in under 5 minutes.
                  </p>
                  <div className="rp-progress">
                    <div className="rp-progress-dot active" />
                    <div className="rp-progress-dot inactive" />
                    <div className="rp-progress-dot inactive" />
                  </div>
                </div>
              </div>

              {/* Form body */}
              <div className="rp-body">
                <form onSubmit={handleSubmit}>
                  {/* ── SECTION 1: Restaurant Info ── */}
                  <div className="rp-section">
                    <div className="rp-section-header">
                      <div
                        className="rp-section-icon"
                        style={{ background: "#fff3ed" }}
                      >
                        <Store size={15} color="#ff6b35" />
                      </div>
                      <div className="rp-section-text">
                        <span className="rp-section-title">
                          Restaurant Information
                        </span>
                        <span className="rp-section-num">Section 01 of 02</span>
                      </div>
                    </div>

                    <div className="rp-grid">
                      <Field
                        label="Restaurant Name"
                        icon={Store}
                        hint="The name your customers will see"
                      >
                        <Input
                          name="restaurantName"
                          placeholder="Burger Palace"
                          required
                          autoFocus
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Cuisine Type"
                        hint="Helps us customize your dashboard"
                      >
                        <div className="rp-select" style={{ width: "100%" }}>
                          <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger
                              className="rp-input"
                              style={{
                                paddingLeft: 14,
                                height: 42,
                                border: "1.5px solid #e8e8e8",
                                borderRadius: 10,
                                background: "#fafaf9",
                                fontSize: 13.5,
                              }}
                            >
                              <SelectValue placeholder="Select cuisine…" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="fast-food">
                                🍔 Fast Food
                              </SelectItem>
                              <SelectItem value="cafe">☕ Café</SelectItem>
                              <SelectItem value="fine-dining">
                                🍷 Fine Dining
                              </SelectItem>
                              <SelectItem value="desserts">
                                🍰 Desserts
                              </SelectItem>
                              <SelectItem value="pizza">🍕 Pizza</SelectItem>
                              <SelectItem value="asian">🍜 Asian</SelectItem>
                              <SelectItem value="other">🍽️ Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <input
                            type="hidden"
                            name="category"
                            value={category}
                          />
                        </div>
                      </Field>

                      <Field
                        label="Mall / Location"
                        icon={MapPin}
                        hint="Where your restaurant is located"
                      >
                        <Input
                          name="mallName"
                          placeholder="Jamuna Future Park"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Number of Tables"
                        icon={Hash}
                        hint="You can update this later"
                      >
                        <Input
                          name="tablesCount"
                          type="number"
                          min="1"
                          max="999"
                          placeholder="40"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Restaurant Phone"
                        icon={Phone}
                        hint="For customer bookings & inquiries"
                        full
                      >
                        <Input
                          name="restaurantPhone"
                          placeholder="+880 1XXX-XXXXXX"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Restaurant Email"
                        icon={Mail}
                        hint="Public contact email for reservations"
                      >
                        <Input
                          name="restaurantEmail"
                          type="email"
                          placeholder="info@yourrestaurant.com"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Full Address"
                        icon={MapPin}
                        hint="Complete address for delivery and listings"
                        full
                      >
                        <Textarea
                          name="address"
                          placeholder="Level 3, Food Court Zone B, Jamuna Future Park, Dhaka"
                          required
                          className="rp-textarea"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>
                    </div>
                  </div>

                  {/* ── DIVIDER ── */}
                  <div className="rp-divider">
                    <div className="rp-divider-line" />
                    <span className="rp-divider-text">Admin Account</span>
                    <div className="rp-divider-line" />
                  </div>

                  {/* ── SECTION 2: Admin Account ── */}
                  <div className="rp-section">
                    <div className="rp-section-header">
                      <div
                        className="rp-section-icon"
                        style={{ background: "#f0fdf4" }}
                      >
                        <User size={15} color="#34a853" />
                      </div>
                      <div className="rp-section-text">
                        <span className="rp-section-title">
                          Your Admin Account
                        </span>
                        <span className="rp-section-num">Section 02 of 02</span>
                      </div>
                    </div>

                    <div className="rp-grid">
                      <Field
                        label="Your Name"
                        icon={User}
                        hint="For account verification"
                      >
                        <Input
                          name="ownerName"
                          placeholder="John Doe"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Login Email"
                        icon={Mail}
                        hint="You'll use this to sign in"
                      >
                        <Input
                          name="email"
                          type="email"
                          placeholder="admin@yourrestaurant.com"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36 }}
                        />
                      </Field>

                      <Field
                        label="Password"
                        icon={Lock}
                        hint="Minimum 6 characters"
                      >
                        <Input
                          name="password"
                          type={showPass ? "text" : "password"}
                          minLength={6}
                          placeholder="Create a strong password"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          style={{
                            position: "absolute",
                            right: 12,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#bbb",
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </Field>

                      <Field
                        label="Confirm Password"
                        icon={Lock}
                        hint="Must match your password"
                      >
                        <Input
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          minLength={6}
                          placeholder="Re-enter your password"
                          required
                          className="rp-input"
                          style={{ paddingLeft: 36, paddingRight: 40 }}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm((v) => !v)}
                          style={{
                            position: "absolute",
                            right: 12,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#bbb",
                            padding: 0,
                            display: "flex",
                          }}
                        >
                          {showConfirm ? (
                            <EyeOff size={14} />
                          ) : (
                            <Eye size={14} />
                          )}
                        </button>
                      </Field>
                    </div>
                  </div>

                  {/* ── SUBMIT ── */}
                  <button
                    type="submit"
                    className="rp-submit"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2
                          size={16}
                          style={{ animation: "spin 1s linear infinite" }}
                        />
                        Creating your account…
                      </>
                    ) : (
                      <>
                        Create Restaurant Account
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>

                  <p className="rp-login-hint">
                    Already have an account?{" "}
                    <Link href="/login">Sign in here</Link>
                  </p>

                  {/* Trust signals */}
                  <div className="rp-trust">
                    <div className="rp-trust-item">
                      <Shield size={13} className="rp-trust-icon" />
                      No credit card
                    </div>
                    <div className="rp-trust-item">
                      <Gift size={13} className="rp-trust-icon" />
                      14-day free trial
                    </div>
                    <div className="rp-trust-item">
                      <Clock size={13} className="rp-trust-icon" />
                      Cancel anytime
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Right sidebar — how it works */}
          <div className="rp-col-right">
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: "uppercase",
                color: "#bbb",
                marginBottom: 4,
              }}
            >
              How it works
            </p>
            {[
              {
                n: "01",
                title: "Register your restaurant",
                desc: "Fill in your restaurant details and create your admin account.",
              },
              {
                n: "02",
                title: "Set up your menu & tables",
                desc: "Add your menu items, configure tables, and customize your QR codes.",
              },
              {
                n: "03",
                title: "Start accepting orders",
                desc: "Go live instantly. Customers scan, order, and pay from their phones.",
              },
              {
                n: "04",
                title: "Track & grow",
                desc: "Use live analytics to optimize pricing, staffing, and peak hours.",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="rp-step-item"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                <div className="rp-step-num">{s.n}</div>
                <div>
                  <div className="rp-step-title">{s.title}</div>
                  <div className="rp-step-desc">{s.desc}</div>
                </div>
              </div>
            ))}

            {/* Security badge */}
            <div
              className="rp-step-item"
              style={{
                animationDelay: "0.75s",
                background: "#fafaf9",
                borderColor: "#f0f0ee",
              }}
            >
              <div
                className="rp-step-num"
                style={{ background: "#f0fdf4", color: "#34a853" }}
              >
                <Shield size={13} />
              </div>
              <div>
                <div className="rp-step-title">Bank-level security</div>
                <div className="rp-step-desc">
                  SOC 2 compliant · 256-bit encryption · Daily backups
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="rp-footer">
          <span>© 2026 Restaurant SaaS · All rights reserved</span>
          <span>Privacy Policy · Terms of Service</span>
        </footer>

        {/* Floating social-proof badge */}
        <div className="rp-float-badge">
          <div className="rp-float-avatar">
            {["🧑‍🍳", "👨‍🍳", "👩‍🍳"].map((e, i) => (
              <span
                key={i}
                style={{ background: `hsl(${i * 40 + 20},60%,88%)` }}
              >
                {e}
              </span>
            ))}
          </div>
          <div className="rp-float-text">
            <strong>47 restaurants</strong>
            <span>joined this week</span>
          </div>
        </div>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
}
