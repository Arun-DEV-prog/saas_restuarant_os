"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Check,
  X,
  Loader2,
  AlertCircle,
  Zap,
  TrendingUp,
  Users,
  Cloud,
  Code,
  Globe,
  BarChart3,
} from "lucide-react";
import { PRICING_PLANS } from "@/lib/plans";

const FEATURE_ICONS = {
  menus: <Zap className="w-5 h-5" />,
  items: <TrendingUp className="w-5 h-5" />,
  tables: <Users className="w-5 h-5" />,
  storageGb: <Cloud className="w-5 h-5" />,
  apiCalls: <Code className="w-5 h-5" />,
  customDomain: <Globe className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
};

export default function PricingPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId;
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradingPlan, setUpgradingPlan] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!restaurantId) return;

    // Fetch current plan
    fetch(`/api/restaurants/${restaurantId}/plan`)
      .then((res) => res.json())
      .then((data) => {
        setCurrentPlan(data.planId || "starter");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching plan:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId]);

  const handleUpgradePlan = async (planId) => {
    if (planId === currentPlan) return;

    setUpgradingPlan(planId);
    try {
      const res = await fetch(`/api/restaurants/${restaurantId}/plan`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setCurrentPlan(planId);
      // Show success message
      alert(`Successfully upgraded to ${data.plan.name}!`);
    } catch (err) {
      console.error("Error upgrading plan:", err);
      setError(err.message);
    } finally {
      setUpgradingPlan(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Pricing Plans
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Choose the perfect plan for your restaurant
          </p>
        </div>

        {error && (
          <div className="mb-8 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex gap-3">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="font-medium text-red-800 dark:text-red-300">
                Error
              </p>
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {PRICING_PLANS.map((plan) => {
            const isCurrentPlan = currentPlan === plan.id;
            const isDowngrade =
              ["professional", "enterprise"].includes(currentPlan) &&
              ["starter"].includes(plan.id);

            return (
              <div
                key={plan.id}
                className={`rounded-2xl shadow-lg transition-all ${
                  isCurrentPlan
                    ? "ring-2 ring-blue-500 bg-white dark:bg-gray-800 scale-105"
                    : "bg-white dark:bg-gray-800 hover:shadow-xl"
                }`}
              >
                {isCurrentPlan && (
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-t-2xl text-center font-semibold text-sm">
                    Current Plan
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Name */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">
                    {plan.description}
                  </p>

                  {/* Pricing */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        ${plan.price}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        /{plan.billing}
                      </span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => handleUpgradePlan(plan.id)}
                    disabled={
                      isCurrentPlan || isDowngrade || upgradingPlan === plan.id
                    }
                    className={`w-full py-3 rounded-lg font-semibold transition mb-8 ${
                      isCurrentPlan
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-default"
                        : isDowngrade
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
                          : upgradingPlan === plan.id
                            ? "bg-blue-400 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {upgradingPlan === plan.id ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Upgrading...
                      </span>
                    ) : isCurrentPlan ? (
                      "Current Plan"
                    ) : isDowngrade ? (
                      "Cannot Downgrade"
                    ) : (
                      "Upgrade Now"
                    )}
                  </button>

                  {/* Features */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                      Features:
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(plan.features).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center gap-3 text-sm"
                        >
                          <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <div className="flex-1">
                            <span className="text-gray-700 dark:text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, " $1")}:
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white ml-2">
                              {typeof value === "number"
                                ? value.toLocaleString()
                                : value}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                    Features
                  </th>
                  {PRICING_PLANS.map((plan) => (
                    <th
                      key={plan.id}
                      className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {[
                  "Menus",
                  "Food Items",
                  "Tables",
                  "API Calls/Day",
                  "Storage (GB)",
                  "Team Users",
                  "Stripe Connect",
                  "Custom Domain",
                  "Analytics",
                ].map((feature) => {
                  const featureKey = feature
                    .toLowerCase()
                    .replace(/\s+/g, "")
                    .replace(/\//g, "per");
                  return (
                    <tr
                      key={feature}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {feature}
                      </td>
                      {PRICING_PLANS.map((plan) => {
                        const value =
                          plan.features[
                            feature === "Menus"
                              ? "menus"
                              : feature === "Food Items"
                                ? "items"
                                : feature === "Tables"
                                  ? "tables"
                                  : feature === "API Calls/Day"
                                    ? "apiCalls"
                                    : feature === "Storage (GB)"
                                      ? "storageGb"
                                      : feature === "Team Users"
                                        ? "users"
                                        : feature === "Stripe Connect"
                                          ? "stripeConnect"
                                          : feature === "Custom Domain"
                                            ? "customDomain"
                                            : feature === "Analytics"
                                              ? "analytics"
                                              : null
                          ];
                        return (
                          <td
                            key={plan.id}
                            className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400"
                          >
                            {typeof value === "boolean" ? (
                              value ? (
                                <Check className="w-5 h-5 text-green-500" />
                              ) : (
                                <X className="w-5 h-5 text-gray-300" />
                              )
                            ) : (
                              <span className="text-gray-900 dark:text-white font-medium">
                                {value}
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Can I upgrade or downgrade my plan anytime?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! You can upgrade your plan anytime. Downgrades are available
                after your current billing period ends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                What happens if I exceed my plan limits?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                We'll notify you when you're approaching your limits. You can
                upgrade your plan anytime to get more resources.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Is there a free trial?
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Yes! All new restaurants start with the Starter Plan free for 14
                days.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
