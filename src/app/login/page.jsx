"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ChefHat, ArrowRight, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

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

  .login-root {
    min-height: 100vh;
    background: linear-gradient(135deg, #ffffff 0%, #f0fdf4 50%, #f0f9ff 100%);
    display: flex;
    flex-direction: column;
  }

  .login-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    border-bottom: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
  }

  .login-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    font-weight: 600;
    font-size: 18px;
    color: #111827;
  }

  .login-logo svg {
    width: 24px;
    height: 24px;
    color: #059669;
  }

  .login-nav-right {
    font-size: 13px;
    color: #6b7280;
  }

  .login-nav-right a {
    color: #059669;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .login-nav-right a:hover {
    color: #047857;
  }

  .login-main {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
  }

  .login-container {
    width: 100%;
    max-width: 420px;
  }

  .login-header {
    text-align: center;
    margin-bottom: 32px;
  }

  .login-header h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin-bottom: 12px;
  }

  .login-header p {
    color: #6b7280;
    font-size: 14px;
    line-height: 1.6;
  }

  .login-card {
    background: white;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05), 0 10px 40px rgba(0, 0, 0, 0.08);
    padding: 40px;
    margin-bottom: 24px;
  }

  .login-form-group {
    margin-bottom: 20px;
  }

  .login-form-group:last-of-type {
    margin-bottom: 0;
  }

  .login-label {
    display: block;
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 8px;
  }

  .login-field-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .login-field-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    pointer-events: none;
    display: flex;
  }

  .login-input {
    width: 100%;
    padding: 11px 16px 11px 40px;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    font-size: 14px;
    font-family: inherit;
    outline: none;
    transition: all 0.2s;
    background: #f9fafb;
  }

  .login-input:focus {
    background: white;
    border-color: #059669;
    box-shadow: 0 0 0 3px rgba(5, 150, 105, 0.1);
  }

  .login-input::placeholder {
    color: #d1d5db;
  }

  .login-forgot {
    text-align: right;
    margin-top: 6px;
  }

  .login-forgot a {
    font-size: 12px;
    color: #059669;
    text-decoration: none;
    transition: color 0.2s;
  }

  .login-forgot a:hover {
    color: #047857;
  }

  .login-submit {
    width: 100%;
    padding: 12px 24px;
    margin-top: 24px;
    background: #059669;
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
  }

  .login-submit:hover:not(:disabled) {
    background: #047857;
    box-shadow: 0 10px 25px rgba(5, 150, 105, 0.2);
    transform: translateY(-2px);
  }

  .login-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .login-spinner {
    width: 14px;
    height: 14px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .login-divider {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 24px 0;
  }

  .login-divider-line {
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }

  .login-divider-text {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .login-register {
    text-align: center;
    font-size: 13px;
    color: #6b7280;
  }

  .login-register a {
    color: #059669;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
  }

  .login-register a:hover {
    color: #047857;
  }

  .login-trust {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }

  .login-trust-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .login-trust-dot {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #059669;
  }

  .login-footer {
    text-align: center;
    padding: 20px;
    border-top: 1px solid #e5e7eb;
    background: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(10px);
  }

  .login-footer p {
    font-size: 11px;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  @media (max-width: 640px) {
    .login-nav {
      padding: 16px 20px;
    }

    .login-main {
      padding: 20px 16px;
    }

    .login-card {
      padding: 24px;
    }

    .login-header h1 {
      font-size: 24px;
    }

    .login-nav-right {
      font-size: 12px;
    }
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

    // Get the session to check user role
    const sessionResponse = await fetch("/api/auth/session");
    const currentSession = await sessionResponse.json();

    // Redirect based on role
    if (
      currentSession?.user?.role === "owner" ||
      currentSession?.user?.role === "admin"
    ) {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <>
      <style>{styles}</style>

      <div className="login-root">
        {/* Navigation */}
        <nav className="login-nav">
          <a href="/" className="login-logo">
            <ChefHat size={24} />
            RestaurantOS
          </a>
          <span className="login-nav-right">
            New to RestaurantOS? <a href="/register">Create account →</a>
          </span>
        </nav>

        {/* Main */}
        <main className="login-main">
          <div className="login-container">
            {/* Header */}
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>
                Sign in to your RestaurantOS account to manage your restaurant
              </p>
            </div>

            {/* Login Card */}
            <div className="login-card">
              <form onSubmit={handleSubmit}>
                {/* Email Field */}
                <div className="login-form-group">
                  <label className="login-label">Email Address</label>
                  <div className="login-field-wrapper">
                    <span className="login-field-icon">
                      <Mail size={16} />
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@restaurant.com"
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="login-form-group">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <label className="login-label">Password</label>
                    <a href="/forgot-password" className="login-forgot">
                      Forgot?
                    </a>
                  </div>
                  <div className="login-field-wrapper">
                    <span className="login-field-icon">
                      <Lock size={16} />
                    </span>
                    <input
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="login-input"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="login-submit"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="login-spinner" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="login-divider">
                  <div className="login-divider-line" />
                  <span className="login-divider-text">Or</span>
                  <div className="login-divider-line" />
                </div>

                {/* Register Link */}
                <p className="login-register">
                  Don't have an account? <a href="/register">Create one free</a>
                </p>

                {/* Trust Badges */}
                <div className="login-trust">
                  <div className="login-trust-item">
                    <span className="login-trust-dot" />
                    256-bit SSL
                  </div>
                  <div className="login-trust-item">
                    <span className="login-trust-dot" />
                    GDPR compliant
                  </div>
                  <div className="login-trust-item">
                    <span className="login-trust-dot" />
                    99.9% uptime
                  </div>
                </div>
              </form>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="login-footer">
          <p>© 2026 RestaurantOS · All rights reserved</p>
        </footer>
      </div>
    </>
  );
}
