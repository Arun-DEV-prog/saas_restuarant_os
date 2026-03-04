"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building2,
  DollarSign,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/analytics/overview");
      if (!res.ok) throw new Error("Failed to load analytics");

      const result = await res.json();
      setData(result.analytics);
    } catch (error) {
      console.error("Error loading analytics:", error);
      toast.error("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <ProtectedAdminRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <DashboardHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading analytics...
              </p>
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    );
  }

  const stats = data?.stats || {};
  const chartData = data?.chartData || [];
  const topRestaurants = data?.topRestaurants || [];

  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Platform Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  System-wide statistics and insights
                </p>
              </div>
              <button
                onClick={loadAnalytics}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Main Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Restaurants
                </span>
                <Building2 size={20} className="text-blue-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalRestaurants || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Active restaurants on platform
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </span>
                <Users size={20} className="text-purple-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Registered users
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Orders
                </span>
                <ShoppingBag size={20} className="text-emerald-500" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.totalOrders || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                All-time orders
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </span>
                <DollarSign size={20} className="text-green-500" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                ${(stats.totalRevenue || 0).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                All-time revenue
              </p>
            </div>
          </div>

          {/* Last 30 Days Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 rounded-xl p-6 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-center gap-3 mb-2">
                <ShoppingBag size={20} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Last 30 Days
                </span>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.ordersLast30Days || 0}
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                Orders placed
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 rounded-xl p-6 border border-green-200 dark:border-green-900/50">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp size={20} className="text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Last 30 Days
                </span>
              </div>
              <p className="text-3xl font-bold text-green-900 dark:text-green-100">
                ${(stats.revenueLast30Days || 0).toFixed(2)}
              </p>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                Revenue generated
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/40 rounded-xl p-6 border border-purple-200 dark:border-purple-900/50">
              <div className="flex items-center gap-3 mb-2">
                <Users size={20} className="text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
                  Last 30 Days
                </span>
              </div>
              <p className="text-3xl font-bold text-purple-900 dark:text-purple-100">
                {stats.activeUsersLast30Days || 0}
              </p>
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                Active restaurants
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Orders Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Orders - Last 7 Days
              </h3>
              <div className="space-y-4">
                {chartData.length > 0 ? (
                  chartData.map((day) => (
                    <div key={day._id} className="flex items-center gap-4">
                      <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {day._id}
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-blue-500 h-full flex items-center justify-end pr-3"
                          style={{
                            width: `${(day.count / Math.max(...chartData.map((d) => d.count), 1)) * 100}%`,
                          }}
                        >
                          <span className="text-xs text-white font-semibold">
                            {day.count}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No data available
                  </p>
                )}
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Revenue - Last 7 Days
              </h3>
              <div className="space-y-4">
                {chartData.length > 0 ? (
                  chartData.map((day) => (
                    <div key={day._id} className="flex items-center gap-4">
                      <span className="w-12 text-sm text-gray-600 dark:text-gray-400">
                        {day._id}
                      </span>
                      <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-8 overflow-hidden">
                        <div
                          className="bg-green-500 h-full flex items-center justify-end pr-3"
                          style={{
                            width: `${(day.revenue / Math.max(...chartData.map((d) => d.revenue), 1)) * 100}%`,
                          }}
                        >
                          <span className="text-xs text-white font-semibold">
                            ${day.revenue.toFixed(0)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">
                    No data available
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Top Restaurants */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Top 5 Restaurants by Revenue
            </h3>

            {topRestaurants.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-slate-700">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Restaurant
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Orders
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Revenue
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
                    {topRestaurants.map((restaurant, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50"
                      >
                        <td className="px-4 py-4 text-sm font-medium text-gray-900 dark:text-white">
                          {index + 1}. {restaurant.name}
                        </td>
                        <td className="px-4 py-4 text-right text-sm text-gray-600 dark:text-gray-400">
                          {restaurant.ordersCount || 0}
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-semibold text-green-600 dark:text-green-400">
                          ${(restaurant.revenue || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">
                No restaurant data available
              </p>
            )}
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
