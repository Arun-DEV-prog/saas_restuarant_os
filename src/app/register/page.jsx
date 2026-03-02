"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Store, User } from "lucide-react";

/* ─── MATCHING LANDING PAGE STYLES ─────────────────────────────────────────── */
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=DM+Mono:wght@300&display=swap');

  .rp-root {
    --bg:       #05050a;
    --surface:  #0c0c14;
    --card:     #111118;
    --border:   rgba(255,255,255,0.08);
    --gold:     #d4a853;
    --gold-dim: rgba(212,168,83,0.1);
    --gold-glow:rgba(212,168,83,0.3);
    --cream:    #f0e6d0;
    --muted:    rgba(240,230,208,0.42);
    --accent:   #c0392b;
    --green:    #27ae60;

    min-height: 100vh;
    background: var(--bg);
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  /* ── NOISE OVERLAY ── */
  .rp-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: .45;
  }

  /* ── RADIAL GLOW BEHIND FORM ── */
  .rp-glow {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 60% 50% at 50% -10%, rgba(212,168,83,0.14) 0%, transparent 70%),
      radial-gradient(ellipse 40% 30% at 10% 80%, rgba(192,57,43,0.07) 0%, transparent 60%);
  }

  /* ── DECORATIVE GRID LINES ── */
  .rp-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(212,168,83,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,168,83,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
  }

  /* ── NAV ── */
  .rp-nav {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 60px;
    border-bottom: 1px solid var(--border);
  }
  .rp-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; letter-spacing: 0.04em;
    color: var(--gold); text-decoration: none;
  }
  .rp-logo span { color: var(--cream); }
  .rp-nav-right {
    font-size: 13px; color: var(--muted);
  }
  .rp-nav-right a {
    color: var(--gold); text-decoration: none; font-weight: 500;
    transition: opacity .2s;
  }
  .rp-nav-right a:hover { opacity: .7; }

  /* ── MAIN LAYOUT ── */
  .rp-main {
    position: relative; z-index: 10;
    flex: 1;
    display: flex; align-items: flex-start; justify-content: center;
    padding: 60px 24px 80px;
  }

  /* ── FORM CARD ── */
  .rp-card {
    width: 100%; max-width: 780px;
    background: rgba(11,11,18,0.85);
    backdrop-filter: blur(32px) saturate(1.4);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(212,168,83,0.08),
      0 40px 80px rgba(0,0,0,0.6),
      0 0 60px rgba(212,168,83,0.06);
    animation: cardIn .7s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(32px); }
    to   { opacity:1; transform: translateY(0); }
  }

  /* ── CARD HEADER ── */
  .rp-header {
    padding: 52px 56px 36px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .rp-header-top {
    display: flex; align-items: center; gap: 20px; margin-bottom: 20px;
  }
  .rp-icon-wrap {
    width: 52px; height: 52px; border-radius: 2px; flex-shrink: 0;
    background: linear-gradient(135deg, rgba(212,168,83,0.2) 0%, rgba(212,168,83,0.05) 100%);
    border: 1px solid rgba(212,168,83,0.3);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold);
  }
  .rp-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 6px; display: block;
  }
  .rp-title {
    font-family: 'Playfair Display', serif;
    font-size: clamp(24px, 3vw, 36px); font-weight: 300;
    line-height: 1.1; letter-spacing: -0.01em;
    color: var(--cream);
  }
  .rp-title em { font-style: italic; color: var(--gold); }
  .rp-subtitle {
    color: var(--muted); font-size: 13px; line-height: 1.7;
    margin-top: 12px; max-width: 420px;
  }
  /* Corner ornament */
  .rp-header::after {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 120px; height: 120px;
    background: radial-gradient(circle at top right, rgba(212,168,83,0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  /* ── PROGRESS DOTS ── */
  .rp-progress {
    display: flex; gap: 6px; align-items: center; margin-top: 28px;
  }
  .rp-dot {
    width: 20px; height: 2px; border-radius: 1px;
    background: var(--gold); transition: all .3s;
  }
  .rp-dot.inactive {
    width: 8px; height: 2px; background: var(--border);
  }

  /* ── CARD CONTENT ── */
  .rp-content { padding: 0 56px 52px; }

  /* ── SECTION SEPARATOR ── */
  .rp-section {
    padding-top: 40px;
  }
  .rp-section-label {
    display: flex; align-items: center; gap: 12px;
    margin-bottom: 28px;
  }
  .rp-section-label-icon {
    width: 32px; height: 32px; border-radius: 2px; flex-shrink: 0;
    background: var(--gold-dim);
    border: 1px solid rgba(212,168,83,0.2);
    display: flex; align-items: center; justify-content: center;
    color: var(--gold);
  }
  .rp-section-label-text {
    font-family: 'Playfair Display', serif;
    font-size: 16px; font-weight: 400; color: var(--cream);
  }
  .rp-section-label-num {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.15em;
    color: rgba(212,168,83,0.4); margin-top: 2px; display: block;
  }

  /* ── DIVIDER ── */
  .rp-divider {
    height: 1px;
    background: linear-gradient(90deg, transparent 0%, var(--border) 20%, var(--border) 80%, transparent 100%);
    margin: 36px 0 0;
    position: relative;
  }
  .rp-divider::after {
    content: '◆';
    position: absolute; left: 50%; top: 50%;
    transform: translate(-50%, -50%);
    font-size: 8px; color: rgba(212,168,83,0.3);
    background: rgba(11,11,18,0.95); padding: 0 8px;
  }

  /* ── GRID ── */
  .rp-grid-2 {
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px;
  }
  .rp-full { grid-column: 1 / -1; }

  /* ── FIELD ── */
  .rp-field { display: flex; flex-direction: column; gap: 8px; }

  /* ── LABEL ── */
  .rp-label {
    font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase;
    color: var(--muted); font-family: 'DM Mono', monospace;
  }

  /* ── INPUT ── */
  .rp-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--cream);
    padding: 12px 16px;
    font-family: 'Outfit'; font-size: 14px; font-weight: 300;
    outline: none;
    transition: border-color .25s, background .25s, box-shadow .25s;
    -webkit-appearance: none;
  }
  .rp-input::placeholder { color: rgba(240,230,208,0.2); }
  .rp-input:focus {
    border-color: var(--gold);
    background: rgba(212,168,83,0.05);
    box-shadow: 0 0 0 3px rgba(212,168,83,0.08);
  }
  .rp-input:hover:not(:focus) { border-color: rgba(212,168,83,0.25); }

  /* ── TEXTAREA ── */
  .rp-textarea {
    width: 100%; min-height: 90px; resize: vertical;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--cream);
    padding: 12px 16px;
    font-family: 'Outfit'; font-size: 14px; font-weight: 300;
    outline: none;
    transition: border-color .25s, background .25s, box-shadow .25s;
  }
  .rp-textarea::placeholder { color: rgba(240,230,208,0.2); }
  .rp-textarea:focus {
    border-color: var(--gold);
    background: rgba(212,168,83,0.05);
    box-shadow: 0 0 0 3px rgba(212,168,83,0.08);
  }

  /* ── SELECT TRIGGER OVERRIDE ── */
  .rp-select-trigger {
    width: 100% !important;
    background: rgba(255,255,255,0.04) !important;
    border: 1px solid var(--border) !important;
    border-radius: 2px !important;
    color: var(--cream) !important;
    padding: 12px 16px !important;
    font-family: 'Outfit' !important; font-size: 14px !important; font-weight: 300 !important;
    height: auto !important;
    transition: border-color .25s, background .25s !important;
  }
  .rp-select-trigger:focus,
  .rp-select-trigger[data-state="open"] {
    border-color: var(--gold) !important;
    background: rgba(212,168,83,0.05) !important;
    box-shadow: 0 0 0 3px rgba(212,168,83,0.08) !important;
    outline: none !important;
  }

  /* ── SUBMIT BUTTON ── */
  .rp-submit {
    width: 100%;
    background: var(--gold);
    color: #05050a;
    border: none; border-radius: 2px;
    padding: 16px 32px;
    font-family: 'Outfit'; font-size: 13px; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase;
    cursor: pointer;
    transition: all .3s;
    position: relative; overflow: hidden;
    margin-top: 12px;
  }
  .rp-submit::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.18) 50%, transparent 100%);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  .rp-submit:hover::before { transform: translateX(100%); }
  .rp-submit:hover {
    background: var(--cream);
    box-shadow: 0 16px 40px var(--gold-glow);
    transform: translateY(-1px);
  }
  .rp-submit:disabled { opacity: .5; cursor: not-allowed; transform: none; box-shadow: none; }

  /* ── LOGIN LINK ── */
  .rp-login-hint {
    text-align: center; margin-top: 20px;
    font-size: 13px; color: var(--muted);
  }
  .rp-login-hint a {
    color: var(--gold); font-weight: 500; text-decoration: none;
    border-bottom: 1px solid rgba(212,168,83,0.3);
    padding-bottom: 1px; transition: border-color .2s;
  }
  .rp-login-hint a:hover { border-color: var(--gold); }

  /* ── FOOTER ── */
  .rp-footer {
    position: relative; z-index: 10;
    border-top: 1px solid var(--border);
    padding: 16px 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .rp-footer p {
    font-size: 11px; color: rgba(240,230,208,0.2);
    font-family: 'DM Mono', monospace; letter-spacing: 0.06em;
  }

  /* ── TRUST BADGES ── */
  .rp-trust {
    display: flex; align-items: center; gap: 24px;
    margin-top: 28px; padding-top: 24px;
    border-top: 1px solid var(--border);
  }
  .rp-trust-item {
    display: flex; align-items: center; gap: 8px;
    font-size: 11px; color: var(--muted);
  }
  .rp-trust-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--green); }

  /* ── ANIMATIONS ── */
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

  /* ── RESPONSIVE ── */
  @media(max-width:640px){
    .rp-nav { padding: 16px 24px; }
    .rp-header { padding: 36px 28px 28px; }
    .rp-content { padding: 0 28px 40px; }
    .rp-grid-2 { grid-template-columns: 1fr; }
    .rp-full { grid-column: 1; }
    .rp-footer { padding: 14px 24px; flex-direction: column; gap: 8px; }
    .rp-trust { flex-direction: column; align-items: flex-start; gap: 12px; }
  }
`;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const router = useRouter();

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

    toast.success("Restaurant registered!");
    router.push("/dashboard");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="rp-root">
        {/* Atmospheric layers */}
        <div className="rp-noise" />
        <div className="rp-glow" />
        <div className="rp-grid" />

        {/* Nav */}
        <nav className="rp-nav">
          <a className="rp-logo" href="/">
            Table<span>OS</span>
          </a>
          <span className="rp-nav-right">
            Already have an account? <a href="/login">Sign in →</a>
          </span>
        </nav>

        {/* Main */}
        <main className="rp-main">
          <div className="rp-card">
            {/* ── HEADER ── */}
            <div className="rp-header">
              <div className="rp-header-top">
                <div className="rp-icon-wrap">
                  <Store size={22} />
                </div>
                <div>
                  <span className="rp-eyebrow">New Account · Step 1 of 1</span>
                  <h1 className="rp-title">
                    Register Your
                    <br />
                    <em>Restaurant</em>
                  </h1>
                </div>
              </div>
              <p className="rp-subtitle">
                Set up your restaurant and start managing orders, tables, and
                revenue in minutes. No credit card required.
              </p>
              <div className="rp-progress">
                <div className="rp-dot" />
                <div className="rp-dot inactive" />
                <div className="rp-dot inactive" />
              </div>
            </div>

            {/* ── CONTENT ── */}
            <div className="rp-content">
              <form onSubmit={handleSubmit}>
                {/* ── RESTAURANT INFO ── */}
                <div className="rp-section">
                  <div className="rp-section-label">
                    <div className="rp-section-label-icon">
                      <Store size={15} />
                    </div>
                    <div>
                      <span className="rp-section-label-text">
                        Restaurant Information
                      </span>
                      <span className="rp-section-label-num">SECTION 01</span>
                    </div>
                  </div>

                  <div className="rp-grid-2">
                    {/* Restaurant Name */}
                    <div className="rp-field">
                      <Label className="rp-label">Restaurant Name</Label>
                      <Input
                        name="restaurantName"
                        placeholder="Burger Palace"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Category */}
                    <div className="rp-field">
                      <Label className="rp-label">Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rp-select-trigger">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent position="popper" className="z-50">
                          <SelectItem value="fast-food">Fast Food</SelectItem>
                          <SelectItem value="cafe">Cafe</SelectItem>
                          <SelectItem value="fine-dining">
                            Fine Dining
                          </SelectItem>
                          <SelectItem value="desserts">Desserts</SelectItem>
                        </SelectContent>
                      </Select>
                      <input
                        type="hidden"
                        name="category"
                        value={category}
                        required
                      />
                    </div>

                    {/* Mall / Location */}
                    <div className="rp-field">
                      <Label className="rp-label">Mall / Location</Label>
                      <Input
                        name="mallName"
                        placeholder="Jamuna Mall"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Total Tables */}
                    <div className="rp-field">
                      <Label className="rp-label">Total Tables</Label>
                      <Input
                        name="tablesCount"
                        type="number"
                        min="1"
                        placeholder="40"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Address */}
                    <div className="rp-field rp-full">
                      <Label className="rp-label">Address</Label>
                      <Textarea
                        name="address"
                        placeholder="Level 3, Food Court Zone B"
                        required
                        className="rp-textarea"
                      />
                    </div>

                    {/* Restaurant Phone */}
                    <div className="rp-field">
                      <Label className="rp-label">Restaurant Phone</Label>
                      <Input
                        name="restaurantPhone"
                        placeholder="+8801XXXXXXXXX"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Restaurant Email */}
                    <div className="rp-field">
                      <Label className="rp-label">Restaurant Email</Label>
                      <Input
                        name="restaurantEmail"
                        type="email"
                        placeholder="info@restaurant.com"
                        required
                        className="rp-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── DIVIDER ── */}
                <div className="rp-divider" />

                {/* ── ADMIN ACCOUNT ── */}
                <div className="rp-section">
                  <div className="rp-section-label">
                    <div className="rp-section-label-icon">
                      <User size={15} />
                    </div>
                    <div>
                      <span className="rp-section-label-text">
                        Admin Account
                      </span>
                      <span className="rp-section-label-num">SECTION 02</span>
                    </div>
                  </div>

                  <div className="rp-grid-2">
                    {/* Owner Name */}
                    <div className="rp-field">
                      <Label className="rp-label">Owner Name</Label>
                      <Input
                        name="ownerName"
                        placeholder="John Doe"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Admin Email */}
                    <div className="rp-field">
                      <Label className="rp-label">Admin Email</Label>
                      <Input
                        name="email"
                        type="email"
                        placeholder="admin@restaurant.com"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Password */}
                    <div className="rp-field">
                      <Label className="rp-label">Password</Label>
                      <Input
                        name="password"
                        type="password"
                        minLength={6}
                        placeholder="••••••••"
                        required
                        className="rp-input"
                      />
                    </div>

                    {/* Confirm Password */}
                    <div className="rp-field">
                      <Label className="rp-label">Confirm Password</Label>
                      <Input
                        name="confirmPassword"
                        type="password"
                        minLength={6}
                        placeholder="••••••••"
                        required
                        className="rp-input"
                      />
                    </div>
                  </div>
                </div>

                {/* ── SUBMIT ── */}
                <div style={{ paddingTop: "32px" }}>
                  <button
                    type="submit"
                    className="rp-submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Creating account…"
                      : "Create Restaurant Account"}
                  </button>

                  <p className="rp-login-hint">
                    Already have an account? <a href="/login">Login here</a>
                  </p>

                  {/* Trust signals */}
                  <div className="rp-trust">
                    <div className="rp-trust-item">
                      <span className="rp-trust-dot" />
                      No credit card required
                    </div>
                    <div className="rp-trust-item">
                      <span className="rp-trust-dot" />
                      14-day free trial
                    </div>
                    <div className="rp-trust-item">
                      <span className="rp-trust-dot" />
                      Cancel anytime
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="rp-footer">
          <p>© 2026 TableOS · All rights reserved</p>
          <p>Privacy Policy · Terms of Service</p>
        </footer>
      </div>
    </>
  );
}
