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

/* ─── MODERN LIGHT THEME REGISTER PAGE ─────────────────────────────────────── */
const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .rp-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #f0f9ff 100%);
    display: flex;
    flex-direction: column;
  }

  /* ── NAVIGATION ── */
  .rp-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }

  .rp-logo {
    font-size: 18px;
    font-weight: 600;
    color: #111827;
    text-decoration: none;
  }

  .rp-logo span {
    color: #059669;
  }

  .rp-nav-right {
    font-size: 13px;
    color: #6b7280;
  }

  .rp-nav-right a {
    color: #059669;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .rp-nav-right a:hover {
    color: #047857;
  }

  /* ── MAIN LAYOUT ── */
  .rp-main {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px 60px;
  }

  /* ── FORM CARD ── */
  .rp-card {
    width: 100%;
    max-width: 700px;
    background: white;
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  /* ── CARD HEADER ── */
  .rp-header {
    padding: 40px;
    border-bottom: 1px solid #e5e7eb;
    background: linear-gradient(135deg, #f9fafb 0%, #f0fdf4 100%);
  }

  .rp-header-top {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
  }

  .rp-icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: 8px;
    flex-shrink: 0;
    background: linear-gradient(135deg, #dbeafe 0%, #dcfce7 100%);
    border: 1px solid #86efac;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
  }

  .rp-eyebrow {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #059669;
    margin-bottom: 8px;
    display: block;
  }

  .rp-title {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.2;
    color: #111827;
  }

  .rp-title em {
    font-style: italic;
    color: #059669;
  }

  .rp-subtitle {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
    margin-top: 12px;
  }

  /* ── PROGRESS DOTS ── */
  .rp-progress {
    display: flex;
    gap: 6px;
    align-items: center;
    margin-top: 20px;
  }

  .rp-dot {
    width: 20px;
    height: 3px;
    border-radius: 2px;
    background: #059669;
    transition: all 0.3s;
  }

  .rp-dot.inactive {
    width: 8px;
    background: #d1d5db;
  }

  /* ── CARD CONTENT ── */
  .rp-content {
    padding: 40px;
  }

  /* ── SECTION ── */
  .rp-section {
    margin-bottom: 32px;
  }

  .rp-section:last-of-type {
    margin-bottom: 0;
  }

  .rp-section-label {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
  }

  .rp-section-label-icon {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    flex-shrink: 0;
    background: #f0fdf4;
    border: 1px solid #dcfce7;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #059669;
  }

  .rp-section-label-text {
    font-size: 16px;
    font-weight: 600;
    color: #111827;
  }

  .rp-section-label-num {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.08em;
    color: #9ca3af;
    text-transform: uppercase;
    display: block;
    margin-top: 2px;
  }

  /* ── DIVIDER ── */
  .rp-divider {
    height: 1px;
    background: #e5e7eb;
    margin: 32px 0;
  }

  /* ── GRID ── */
  .rp-grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .rp-full {
    grid-column: 1 / -1;
  }

  /* ── FIELD ── */
  .rp-field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* ── LABEL ── */
  .rp-label {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
  }

  /* ── INPUT ── */
  .rp-input {
    width: 100%;
    padding: 11px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: #f9fafb;
    color: #111827;
    outline: none;
    transition: all 0.2s;
  }

  .rp-input::placeholder {
    color: #d1d5db;
  }

  .rp-input:focus {
    background: white;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  .rp-input:hover:not(:focus) {
    border-color: #bfdbfe;
  }

  /* ── TEXTAREA ── */
  .rp-textarea {
    width: 100%;
    min-height: 90px;
    padding: 11px 14px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    background: #f9fafb;
    color: #111827;
    outline: none;
    transition: all 0.2s;
    resize: vertical;
  }

  .rp-textarea::placeholder {
    color: #d1d5db;
  }

  .rp-textarea:focus {
    background: white;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  /* ── SELECT TRIGGER ── */
  .rp-select-trigger {
    width: 100% !important;
    padding: 11px 14px !important;
    border: 1px solid #d1d5db !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    background: #f9fafb !important;
    color: #111827 !important;
    height: auto !important;
    transition: all 0.2s !important;
  }

  .rp-select-trigger:focus,
  .rp-select-trigger[data-state="open"] {
    background: white !important;
    border-color: #059669 !important;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1) !important;
  }

  /* ── SUBMIT BUTTON ── */
  .rp-submit {
    width: 100%;
    padding: 12px 24px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s;
    margin-top: 20px;
  }

  .rp-submit:hover:not(:disabled) {
    background: #047857;
    box-shadow: 0 10px 25px rgba(5, 150, 105, 0.2);
    transform: translateY(-2px);
  }

  .rp-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  /* ── LOGIN HINT ── */
  .rp-login-hint {
    text-align: center;
    margin-top: 16px;
    font-size: 13px;
    color: #6b7280;
  }

  .rp-login-hint a {
    color: #059669;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .rp-login-hint a:hover {
    color: #047857;
  }

  /* ── TRUST BADGES ── */
  .rp-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 24px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .rp-trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .rp-trust-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #059669;
  }

  /* ── FOOTER ── */
  .rp-footer {
    border-top: 1px solid #e5e7eb;
    padding: 20px 40px;
    text-align: center;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
  }

  .rp-footer p {
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .rp-nav {
      padding: 16px 20px;
    }

    .rp-main {
      padding: 20px 16px 40px;
    }

    .rp-header {
      padding: 24px;
    }

    .rp-content {
      padding: 24px;
    }

    .rp-grid-2 {
      grid-template-columns: 1fr;
    }

    .rp-full {
      grid-column: 1;
    }

    .rp-title {
      font-size: 22px;
    }

    .rp-trust {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }
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
        {/* Navigation */}
        <nav className="rp-nav">
          <a href="/" className="rp-logo">
            RestaurantOS<span>.</span>
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
                  <Store size={20} />
                </div>
                <div>
                  <span className="rp-eyebrow">
                    Create Account · Step 1 of 1
                  </span>
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
                      <Store size={16} />
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
                      <User size={16} />
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
                <div style={{ paddingTop: "24px" }}>
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
                    Already have an account? <a href="/login">Sign in here</a>
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
          <p>© 2026 RestaurantOS · All rights reserved</p>
        </footer>
      </div>
    </>
  );
}
