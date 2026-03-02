"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

/* ─── STYLES ─────────────────────────────────────────────────────────────────*/
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;0,700;1,300;1,400&family=Outfit:wght@200;300;400;500;600&family=DM+Mono:wght@300;400&display=swap');

  .lp-root {
    --bg:        #05050a;
    --surface:   #0c0c14;
    --border:    rgba(255,255,255,0.08);
    --gold:      #d4a853;
    --gold-dim:  rgba(212,168,83,0.1);
    --gold-glow: rgba(212,168,83,0.28);
    --cream:     #f0e6d0;
    --muted:     rgba(240,230,208,0.4);
    --green:     #27ae60;
    --red:       #c0392b;

    min-height: 100vh;
    background: var(--bg);
    color: var(--cream);
    font-family: 'Outfit', sans-serif;
    font-weight: 300;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }

  /* ── ATMOSPHERIC LAYERS ── */
  .lp-noise {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
    opacity: .5;
  }
  .lp-glow {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 55% 45% at 50% -5%,  rgba(212,168,83,0.16) 0%, transparent 70%),
      radial-gradient(ellipse 35% 30% at 85% 90%, rgba(192,57,43,0.08)   0%, transparent 60%),
      radial-gradient(ellipse 25% 20% at 5%  70%, rgba(212,168,83,0.06)  0%, transparent 50%);
  }
  .lp-grid {
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(212,168,83,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(212,168,83,0.035) 1px, transparent 1px);
    background-size: 56px 56px;
  }

  /* ── NAV ── */
  .lp-nav {
    position: relative; z-index: 10;
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 60px;
    border-bottom: 1px solid var(--border);
  }
  .lp-logo {
    font-family: 'Playfair Display', serif;
    font-size: 22px; font-weight: 700; letter-spacing: 0.04em;
    color: var(--gold); text-decoration: none;
  }
  .lp-logo span { color: var(--cream); }
  .lp-nav-right { font-size: 13px; color: var(--muted); }
  .lp-nav-right a {
    color: var(--gold); text-decoration: none; font-weight: 500;
    border-bottom: 1px solid rgba(212,168,83,0.3);
    padding-bottom: 1px; transition: border-color .2s;
  }
  .lp-nav-right a:hover { border-color: var(--gold); }

  /* ── MAIN ── */
  .lp-main {
    flex: 1; position: relative; z-index: 10;
    display: grid;
    grid-template-columns: 1fr 480px 1fr;
    align-items: center;
    padding: 60px 24px;
    gap: 0;
  }

  /* ── LEFT BRAND PANEL ── */
  .lp-brand {
    padding: 0 48px 0 60px;
    animation: fadeLeft .8s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes fadeLeft {
    from { opacity:0; transform: translateX(-24px); }
    to   { opacity:1; transform: translateX(0); }
  }
  .lp-brand-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: var(--gold); margin-bottom: 20px; display: block;
  }
  .lp-brand h2 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(32px, 3.5vw, 52px);
    font-weight: 300; line-height: 1.08; letter-spacing: -0.02em;
    color: var(--cream);
  }
  .lp-brand h2 em { font-style: italic; color: var(--gold); }
  .lp-brand p {
    color: var(--muted); font-size: 14px; line-height: 1.8;
    margin-top: 18px; max-width: 300px;
  }
  .lp-stats {
    display: flex; flex-direction: column; gap: 20px;
    margin-top: 40px; padding-top: 32px;
    border-top: 1px solid var(--border);
  }
  .lp-stat { display: flex; align-items: center; gap: 16px; }
  .lp-stat-num {
    font-family: 'Playfair Display', serif;
    font-size: 28px; font-weight: 300; color: var(--gold);
    min-width: 64px;
  }
  .lp-stat-label { font-size: 12px; color: var(--muted); line-height: 1.5; }

  /* ── CARD ── */
  .lp-card {
    background: rgba(11,11,18,0.88);
    backdrop-filter: blur(36px) saturate(1.5);
    border: 1px solid var(--border);
    border-radius: 4px;
    overflow: hidden;
    box-shadow:
      0 0 0 1px rgba(212,168,83,0.07),
      0 40px 80px rgba(0,0,0,0.65),
      0 0 80px rgba(212,168,83,0.05);
    animation: cardIn .7s .1s cubic-bezier(.22,1,.36,1) both;
  }
  @keyframes cardIn {
    from { opacity:0; transform: translateY(28px) scale(.98); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }

  /* ── CARD TOP STRIPE ── */
  .lp-card-stripe {
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, var(--gold) 40%, rgba(212,168,83,0.4) 100%);
  }

  /* ── CARD HEADER ── */
  .lp-card-header {
    padding: 44px 48px 32px;
    border-bottom: 1px solid var(--border);
    position: relative;
  }
  .lp-card-header::after {
    content: '';
    position: absolute; top: 0; right: 0;
    width: 100px; height: 100px;
    background: radial-gradient(circle at top right, rgba(212,168,83,0.08) 0%, transparent 70%);
  }
  .lp-card-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase;
    color: rgba(212,168,83,0.55); margin-bottom: 10px; display: block;
  }
  .lp-card-title {
    font-family: 'Playfair Display', serif;
    font-size: 30px; font-weight: 300; letter-spacing: -0.01em;
    color: var(--cream);
  }
  .lp-card-title em { font-style: italic; color: var(--gold); }
  .lp-card-sub {
    font-size: 13px; color: var(--muted); margin-top: 8px;
  }

  /* ── CARD BODY ── */
  .lp-card-body { padding: 36px 48px 44px; }

  /* ── FIELD ── */
  .lp-field { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
  .lp-field:last-of-type { margin-bottom: 0; }

  /* ── LABEL ── */
  .lp-label {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--muted);
  }

  /* ── INPUT WRAPPER ── */
  .lp-input-wrap {
    position: relative;
  }
  .lp-input-icon {
    position: absolute; left: 14px; top: 50%; transform: translateY(-50%);
    color: rgba(212,168,83,0.35); pointer-events: none;
    font-size: 14px;
    transition: color .25s;
  }
  .lp-input-wrap:focus-within .lp-input-icon { color: var(--gold); }

  /* ── INPUT ── */
  .lp-input {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--border);
    border-radius: 2px;
    color: var(--cream);
    padding: 13px 16px 13px 42px;
    font-family: 'Outfit'; font-size: 14px; font-weight: 300;
    outline: none;
    transition: border-color .25s, background .25s, box-shadow .25s;
    -webkit-appearance: none;
  }
  .lp-input::placeholder { color: rgba(240,230,208,0.18); }
  .lp-input:focus {
    border-color: var(--gold);
    background: rgba(212,168,83,0.05);
    box-shadow: 0 0 0 3px rgba(212,168,83,0.08);
  }
  .lp-input:hover:not(:focus) { border-color: rgba(212,168,83,0.22); }

  /* ── FORGOT ── */
  .lp-field-top {
    display: flex; align-items: center; justify-content: space-between;
  }
  .lp-forgot {
    font-size: 11px; color: rgba(212,168,83,0.5);
    text-decoration: none; letter-spacing: 0.04em;
    transition: color .2s;
  }
  .lp-forgot:hover { color: var(--gold); }

  /* ── SUBMIT ── */
  .lp-submit {
    width: 100%; margin-top: 28px;
    background: var(--gold);
    color: #05050a;
    border: none; border-radius: 2px;
    padding: 15px 32px;
    font-family: 'Outfit'; font-size: 12px; font-weight: 600;
    letter-spacing: 0.14em; text-transform: uppercase;
    cursor: pointer;
    transition: all .3s;
    position: relative; overflow: hidden;
    display: flex; align-items: center; justify-content: center; gap: 8px;
  }
  .lp-submit::before {
    content: '';
    position: absolute; inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transform: translateX(-100%);
    transition: transform .5s;
  }
  .lp-submit:hover::before { transform: translateX(100%); }
  .lp-submit:hover {
    background: var(--cream);
    box-shadow: 0 12px 40px var(--gold-glow);
    transform: translateY(-1px);
  }
  .lp-submit:disabled { opacity: .45; cursor: not-allowed; transform: none; box-shadow: none; }
  .lp-submit-arrow {
    transition: transform .3s;
  }
  .lp-submit:hover .lp-submit-arrow { transform: translateX(4px); }

  /* ── DIVIDER ── */
  .lp-or {
    display: flex; align-items: center; gap: 14px;
    margin: 24px 0;
  }
  .lp-or-line { flex: 1; height: 1px; background: var(--border); }
  .lp-or-text {
    font-family: 'DM Mono', monospace; font-size: 10px;
    letter-spacing: 0.12em; text-transform: uppercase;
    color: rgba(240,230,208,0.2);
  }

  /* ── REGISTER LINK ── */
  .lp-register {
    text-align: center; font-size: 13px; color: var(--muted);
  }
  .lp-register a {
    color: var(--gold); text-decoration: none; font-weight: 500;
    border-bottom: 1px solid rgba(212,168,83,0.3);
    padding-bottom: 1px; transition: border-color .2s;
  }
  .lp-register a:hover { border-color: var(--gold); }

  /* ── TRUST ROW ── */
  .lp-trust {
    display: flex; align-items: center; justify-content: center; gap: 20px;
    margin-top: 20px; padding-top: 20px;
    border-top: 1px solid var(--border);
  }
  .lp-trust-item {
    display: flex; align-items: center; gap: 6px;
    font-size: 10px; color: rgba(240,230,208,0.28);
    letter-spacing: 0.06em;
  }
  .lp-trust-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--green); flex-shrink:0; }

  /* ── FOOTER ── */
  .lp-footer {
    position: relative; z-index: 10;
    border-top: 1px solid var(--border);
    padding: 16px 60px;
    display: flex; align-items: center; justify-content: space-between;
  }
  .lp-footer p {
    font-family: 'DM Mono', monospace;
    font-size: 10px; letter-spacing: 0.06em;
    color: rgba(240,230,208,0.18);
  }

  /* ── SPINNER ── */
  .lp-spinner {
    width: 14px; height: 14px;
    border: 2px solid rgba(5,5,10,0.3);
    border-top-color: #05050a;
    border-radius: 50%;
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* ── RESPONSIVE ── */
  @media(max-width: 900px) {
    .lp-main { grid-template-columns: 1fr; justify-items: center; padding: 40px 24px; }
    .lp-brand { display: none; }
    .lp-nav { padding: 16px 24px; }
    .lp-footer { padding: 14px 24px; flex-direction: column; gap: 6px; }
    .lp-card { width: 100%; max-width: 440px; }
  }
`;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    const res = await signIn("credentials", {
      email: data.email,
      password: data.password,
      redirect: false,
    });

    if (res?.error) {
      toast.error("Invalid credentials");
      setLoading(false);
      return;
    }

    toast.success("Welcome back!");
    router.push("/dashboard");
  }

  return (
    <>
      <style>{styles}</style>

      <div className="lp-root">
        {/* Atmospheric layers */}
        <div className="lp-noise" />
        <div className="lp-glow" />
        <div className="lp-grid" />

        {/* Nav */}
        <nav className="lp-nav">
          <a className="lp-logo" href="/">
            Mall<span>Insight</span>
          </a>
          <span className="lp-nav-right">
            Don't have an account? <a href="/register">Register free →</a>
          </span>
        </nav>

        {/* Main — 3-column grid */}
        <main className="lp-main">
          {/* ── LEFT BRAND PANEL ── */}
          <div className="lp-brand">
            <span className="lp-brand-eyebrow">
              Restaurant Management Platform
            </span>
            <h2>
              Welcome
              <br />
              back to
              <br />
              <em>MallInsight</em>
            </h2>
            <p>
              Your smart dining platform is ready. Manage tables, orders, and
              revenue — all from one place.
            </p>

            <div className="lp-stats">
              <div className="lp-stat">
                <span className="lp-stat-num">850+</span>
                <span className="lp-stat-label">
                  Restaurants
                  <br />
                  actively managed
                </span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">12M+</span>
                <span className="lp-stat-label">
                  Orders
                  <br />
                  processed
                </span>
              </div>
              <div className="lp-stat">
                <span className="lp-stat-num">+28%</span>
                <span className="lp-stat-label">
                  Average revenue
                  <br />
                  increase
                </span>
              </div>
            </div>
          </div>

          {/* ── EMPTY CENTER SPACER (col 2 hosts the card) ── */}
          <div className="lp-card">
            {/* Gold top stripe */}
            <div className="lp-card-stripe" />

            {/* Header */}
            <div className="lp-card-header">
              <span className="lp-card-eyebrow">
                Secure Sign In · MallInsight
              </span>
              <h1 className="lp-card-title">
                Sign into your
                <br />
                <em>Account</em>
              </h1>
              <p className="lp-card-sub">
                Enter your credentials to access the dashboard.
              </p>
            </div>

            {/* Body */}
            <div className="lp-card-body">
              <form onSubmit={handleSubmit}>
                {/* Email */}
                <div className="lp-field">
                  <Label className="lp-label">Email Address</Label>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">✉</span>
                    <Input
                      name="email"
                      type="email"
                      required
                      placeholder="you@restaurant.com"
                      className="lp-input"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="lp-field">
                  <div className="lp-field-top">
                    <Label className="lp-label">Password</Label>
                    <a href="/forgot-password" className="lp-forgot">
                      Forgot password?
                    </a>
                  </div>
                  <div className="lp-input-wrap">
                    <span className="lp-input-icon">🔒</span>
                    <Input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="lp-input"
                    />
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="lp-submit" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="lp-spinner" />
                      Signing in…
                    </>
                  ) : (
                    <>
                      Sign In
                      <span className="lp-submit-arrow">→</span>
                    </>
                  )}
                </button>

                {/* OR */}
                <div className="lp-or">
                  <div className="lp-or-line" />
                  <span className="lp-or-text">or</span>
                  <div className="lp-or-line" />
                </div>

                {/* Register */}
                <p className="lp-register">
                  New to MallInsight?{" "}
                  <a href="/register">Create your restaurant account</a>
                </p>

                {/* Trust */}
                <div className="lp-trust">
                  <div className="lp-trust-item">
                    <span className="lp-trust-dot" />
                    256-bit SSL
                  </div>
                  <div className="lp-trust-item">
                    <span className="lp-trust-dot" />
                    GDPR compliant
                  </div>
                  <div className="lp-trust-item">
                    <span className="lp-trust-dot" />
                    99.9% uptime
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Spacer col 3 */}
          <div />
        </main>

        {/* Footer */}
        <footer className="lp-footer">
          <p>© 2026 MallInsight · All rights reserved</p>
          <p>Privacy Policy · Terms of Service</p>
        </footer>
      </div>
    </>
  );
}
