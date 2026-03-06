"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { usePlatformSettings } from "@/hooks/usePlatformSettings";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { settings } = usePlatformSettings();

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

    const sessionResponse = await fetch("/api/auth/session");
    const currentSession = await sessionResponse.json();

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
    <div className="min-h-screen bg-linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%) relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-48 -mt-48"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-48 -mb-48"></div>

      {/* Navigation */}
      <nav className="border-b border-white/40 bg-white/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition">
              {settings?.platformLogo ? (
                <img
                  src={settings.platformLogo}
                  alt="Logo"
                  className="w-full h-full rounded-xl object-cover"
                />
              ) : (
                <span className="text-white font-black text-sm">
                  {(settings?.platformName || "MI")
                    .substring(0, 2)
                    .toUpperCase()}
                </span>
              )}
            </div>
            <span className="font-bold text-gray-900 text-lg">
              {settings?.platformName || "Restaurant SaaS"}
            </span>
          </Link>
          <span className="text-sm text-gray-700">
            New here?{" "}
            <Link
              href="/register"
              className="text-blue-600 font-semibold hover:text-blue-700 transition"
            >
              Create account
            </Link>
          </span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/60 overflow-hidden hover:shadow-3xl transition-all duration-300">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 px-8 py-14 text-white">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-6 mx-auto backdrop-blur-sm border border-white/30">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-4xl font-bold text-center mb-3">
                Welcome Back
              </h1>
              <p className="text-blue-100 text-center text-sm leading-relaxed">
                Access your restaurant dashboard
              </p>
            </div>

            {/* Form Section */}
            <div className="p-8 space-y-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email Field */}
                <div className="space-y-3">
                  <Label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-800"
                  >
                    Email Address
                  </Label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="you@restaurant.com"
                      className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all bg-gray-50/50 focus:bg-white text-black"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-1">
                    Your registered email
                  </p>
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-800"
                    >
                      Password
                    </Label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium transition"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      required
                      placeholder="••••••••"
                      className="pl-12 h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all bg-gray-50/50 focus:bg-white text-black"
                    />
                  </div>
                  <p className="text-xs text-gray-500 ml-1">
                    Enter your password
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-xs text-gray-500 font-medium">
                    or
                  </span>
                </div>
              </div>

              {/* Create Account Link */}
              <p className="text-center text-sm text-gray-700">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="text-blue-600 font-semibold hover:text-blue-700 transition"
                >
                  Create restaurant account
                </Link>
              </p>
            </div>

            {/* Footer Trust Signals */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-5 border-t border-gray-200">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="text-xs">
                  <div className="text-blue-500 text-lg mb-1">🔒</div>
                  <p className="text-gray-700 font-semibold">SSL Secured</p>
                </div>
                <div className="text-xs">
                  <div className="text-blue-500 text-lg mb-1">✓</div>
                  <p className="text-gray-700 font-semibold">Privacy Safe</p>
                </div>
                <div className="text-xs">
                  <div className="text-blue-500 text-lg mb-1">⚡</div>
                  <p className="text-gray-700 font-semibold">Fast & Easy</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Text */}
          <p className="text-center text-xs text-gray-600 mt-6">
            © 2026 Restaurant SaaS · Safe & Secure · All rights reserved
          </p>
        </div>
      </main>
    </div>
  );
}
