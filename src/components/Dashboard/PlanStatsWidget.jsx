"use client";

import { useState, useEffect } from "react";
import { Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";

export default function PlanStatsWidget() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`/api/admin/restaurants-plans?limit=1000`);
        const data = await res.json();

        if (data.data) {
          const starterCount = data.data.filter(
            (r) => r.planId === "starter",
          ).length;
          const professionalCount = data.data.filter(
            (r) => r.planId === "professional",
          ).length;
          const enterpriseCount = data.data.filter(
            (r) => r.planId === "enterprise",
          ).length;

          const monthlyRevenue =
            starterCount * 29 + professionalCount * 79 + enterpriseCount * 199;

          setStats({
            total: data.pagination.total,
            starter: starterCount,
            professional: professionalCount,
            enterprise: enterpriseCount,
            monthlyRevenue,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 animate-pulse"
          >
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Restaurants
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.total}
            </p>
          </div>
          <Users className="w-8 h-8 text-blue-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Professional Plans
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.professional}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-green-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Enterprise Plans
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              {stats.enterprise}
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-purple-500 opacity-20" />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Monthly Revenue
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
              ${stats.monthlyRevenue.toLocaleString()}
            </p>
          </div>
          <DollarSign className="w-8 h-8 text-yellow-500 opacity-20" />
        </div>
      </div>
    </div>
  );
}
