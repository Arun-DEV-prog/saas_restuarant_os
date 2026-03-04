"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import Link from "next/link";
import {
  BarChart3,
  Users,
  Building2,
  Settings,
  Zap,
  TrendingUp,
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your SaaS platform, restaurants, and users
            </p>
          </div>

          {/* Admin Menu Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Analytics */}
            <Link
              href="/dashboard/admin/analytics"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mb-4">
                <BarChart3
                  size={24}
                  className="text-blue-600 dark:text-blue-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Platform Analytics
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View system-wide analytics and metrics
              </p>
            </Link>

            {/* Restaurants */}
            <Link
              href="/dashboard/admin/restaurants"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center mb-4">
                <Building2
                  size={24}
                  className="text-emerald-600 dark:text-emerald-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Restaurants
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage all restaurants on the platform
              </p>
            </Link>

            {/* Users */}
            <Link
              href="/dashboard/admin/users"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mb-4">
                <Users
                  size={24}
                  className="text-purple-600 dark:text-purple-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Users & Roles
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage user accounts and permissions
              </p>
            </Link>

            {/* System Settings */}
            <Link
              href="/dashboard/admin/settings"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                <Settings
                  size={24}
                  className="text-orange-600 dark:text-orange-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                System Settings
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Configure platform settings
              </p>
            </Link>

            {/* Activity Log */}
            <Link
              href="/dashboard/admin/activity"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center mb-4">
                <Zap
                  size={24}
                  className="text-indigo-600 dark:text-indigo-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Activity Log
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View system activity and logs
              </p>
            </Link>

            {/* Revenue */}
            <Link
              href="/dashboard/admin/revenue"
              className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-lg transition cursor-pointer border border-gray-100 dark:border-slate-700"
            >
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp
                  size={24}
                  className="text-green-600 dark:text-green-400"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Revenue Report
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View revenue and billing insights
              </p>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-slate-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Restaurants
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  $0
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Active Orders
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
