"use client";

import { useEffect, useState } from "react";
import { AlertCircle, TrendingUp, Zap } from "lucide-react";

export default function PlanUsagePanel({ restaurantId, planId }) {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!restaurantId) return;

    // Fetch plan usage stats
    fetch(`/api/restaurants/${restaurantId}/usage`)
      .then((res) => res.json())
      .then((data) => {
        setUsage(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching usage:", err);
        setLoading(false);
      });
  }, [restaurantId]);

  if (loading || !usage) return null;

  const limits = {
    menus: {
      label: "Menus",
      current: usage.menus || 0,
      limit: usage.limits?.maxMenus || 1,
    },
    items: {
      label: "Food Items",
      current: usage.items || 0,
      limit: usage.limits?.maxFoodItems || 50,
    },
    tables: {
      label: "Tables",
      current: usage.tables || 0,
      limit: usage.limits?.maxTables || 5,
    },
    users: {
      label: "Team Users",
      current: usage.users || 0,
      limit: usage.limits?.maxUsers || 1,
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Plan Usage
        </h3>
        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium">
          {planId?.charAt(0).toUpperCase() + planId?.slice(1)} Plan
        </span>
      </div>

      <div className="space-y-4">
        {Object.entries(limits).map(([key, data]) => {
          const percentage = Math.round((data.current / data.limit) * 100);
          const isWarning = percentage >= 80;
          const isCritical = percentage >= 100;

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {data.label}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {data.current}/{data.limit}
                </span>
              </div>
              <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    isCritical
                      ? "bg-red-500"
                      : isWarning
                        ? "bg-yellow-500"
                        : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              {isCritical && (
                <div className="mt-1 flex items-center gap-1 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="w-3 h-3" />
                  Limit reached
                </div>
              )}
              {isWarning && !isCritical && (
                <div className="mt-1 flex items-center gap-1 text-xs text-yellow-600 dark:text-yellow-400">
                  <TrendingUp className="w-3 h-3" />
                  {100 - percentage}% remaining
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex gap-3">
          <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
              Approaching a limit?
            </p>
            <p className="text-sm text-blue-800 dark:text-blue-400 mt-1">
              Upgrade your plan to get more resources and features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
