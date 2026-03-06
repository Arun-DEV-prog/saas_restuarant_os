"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Check } from "lucide-react";

export default function BillingPage() {
  // All hooks MUST be at top - before any conditional logic
  const { data: session, status } = useSession();
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(null);

  // First useEffect - handle authentication
  useEffect(() => {
    if (status === "unauthenticated") {
      toast.error("Please log in to access billing");
      router.push("/login");
    }
  }, [status, router]);

  // Second useEffect - load data
  useEffect(() => {
    if (status === "authenticated" && session?.user?.restaurantId) {
      loadPlans();
      checkSubscription();
    }
  }, [status, session?.user?.restaurantId]);

  async function loadPlans() {
    try {
      const res = await fetch("/api/plans");
      if (!res.ok) throw new Error("Failed to load plans");
      const data = await res.json();
      setPlans(data);
    } catch (error) {
      console.error("Error loading plans:", error);
      toast.error("Failed to load plans");
    }
  }

  async function checkSubscription() {
    try {
      const res = await fetch("/api/subscriptions/check", { method: "POST" });
      const data = await res.json();
      if (data.isValid) {
        setCurrentSubscription(data);
      } else {
        setCurrentSubscription(null);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setLoading(false);
    }
  }

  async function purchasePlan(planId) {
    try {
      setPurchasing(planId);
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId,
          paymentMethod: "manual",
        }),
      });

      if (!res.ok) throw new Error("Purchase failed");

      const subscription = await res.json();
      setCurrentSubscription({
        isValid: true,
        subscription,
        plan: plans.find((p) => p._id === planId),
      });
      toast.success("✅ Plan purchased successfully!");

      // Reload subscription details
      setTimeout(() => checkSubscription(), 500);
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Failed to purchase plan");
    } finally {
      setPurchasing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (status === "loading" || status === "unauthenticated") {
    return null;
  }

  if (status === "authenticated" && !session?.user?.restaurantId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h2 className="text-lg font-bold text-yellow-900 mb-2">
              Restaurant Required
            </h2>
            <p className="text-yellow-800">
              You need to create or be assigned to a restaurant before you can
              manage billing and plans.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentPlanId = currentSubscription?.plan?._id;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Plans & Billing
          </h1>
          <p className="text-lg text-slate-600">
            Choose the perfect plan for your restaurant
          </p>
        </div>

        {/* Current Plan Card */}
        {currentSubscription?.isValid && (
          <div className="mb-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-8 text-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-sm font-semibold opacity-90 mb-1">
                  Current Plan
                </h2>
                <p className="text-4xl font-bold mb-2">
                  {currentSubscription?.plan?.name}
                </p>
                <p className="text-blue-100">
                  ${currentSubscription?.plan?.price}/month
                </p>
              </div>

              <div>
                <h3 className="text-sm font-semibold opacity-90 mb-4">
                  Expires
                </h3>
                <p className="text-2xl font-bold mb-1">
                  {new Date(
                    currentSubscription?.subscription?.endDate,
                  ).toLocaleDateString()}
                </p>
                <p className="text-blue-100">
                  {Math.ceil(
                    (new Date(currentSubscription?.subscription?.endDate) -
                      new Date()) /
                      (1000 * 60 * 60 * 24),
                  )}{" "}
                  days remaining
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Usage Stats */}
        {currentSubscription?.isValid && currentSubscription?.limits && (
          <div className="mb-12 bg-white rounded-xl shadow-sm border border-slate-200 p-8">
            <h2 className="text-lg font-bold text-slate-900 mb-6">
              Usage This Month
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Orders */}
              {currentSubscription?.limits?.monthlyOrderLimit && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Orders
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-2">
                    {currentSubscription?.currentUsage?.ordersCount || 0}
                    <span className="text-sm text-slate-500">
                      {" "}
                      / {currentSubscription?.limits?.monthlyOrderLimit}
                    </span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-blue-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((currentSubscription?.currentUsage?.ordersCount ||
                            0) /
                            (currentSubscription?.limits?.monthlyOrderLimit ||
                              1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Table Requests */}
              {currentSubscription?.limits?.monthlyTableRequestLimit && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Table Requests
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-2">
                    {currentSubscription?.currentUsage?.tableRequestsCount || 0}
                    <span className="text-sm text-slate-500">
                      {" "}
                      / {currentSubscription?.limits?.monthlyTableRequestLimit}
                    </span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-green-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((currentSubscription?.currentUsage
                            ?.tableRequestsCount || 0) /
                            (currentSubscription?.limits
                              ?.monthlyTableRequestLimit || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Menu Items */}
              {currentSubscription?.limits?.monthlyMenuItemsLimit && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Menu Items
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-2">
                    {currentSubscription?.currentUsage?.menuItemsCount || 0}
                    <span className="text-sm text-slate-500">
                      {" "}
                      / {currentSubscription?.limits?.monthlyMenuItemsLimit}
                    </span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-purple-500 rounded-full transition-all"
                      style={{
                        width: `${Math.min(
                          ((currentSubscription?.currentUsage?.menuItemsCount ||
                            0) /
                            (currentSubscription?.limits
                              ?.monthlyMenuItemsLimit || 1)) *
                            100,
                          100,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Team Members */}
              {currentSubscription?.limits?.monthlyUsersLimit && (
                <div>
                  <p className="text-sm font-medium text-slate-600 mb-2">
                    Team Members
                  </p>
                  <p className="text-2xl font-bold text-slate-900 mb-2">
                    2
                    <span className="text-sm text-slate-500">
                      {" "}
                      / {currentSubscription?.limits?.monthlyUsersLimit}
                    </span>
                  </p>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-orange-500 rounded-full transition-all"
                      style={{
                        width: `${(2 / (currentSubscription?.limits?.monthlyUsersLimit || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Plans Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">
            {currentSubscription?.isValid
              ? "Upgrade or Change Plan"
              : "Choose a Plan"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const isCurrent = currentPlanId === plan._id;
              const isPopular = plan.name === "Professional";

              return (
                <div
                  key={plan._id}
                  className={`relative rounded-xl shadow-sm transition-all ${
                    isCurrent
                      ? "border-2 border-blue-500 bg-blue-50"
                      : isPopular
                        ? "border-2 border-amber-200 bg-white"
                        : "border border-slate-200 bg-white hover:shadow-md"
                  }`}
                >
                  {isPopular && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Header */}
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {plan.name}
                    </h3>
                    {plan.description && (
                      <p className="text-sm text-slate-600 mb-6">
                        {plan.description}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-6">
                      {plan.price === 0 ? (
                        <p className="text-3xl font-bold text-slate-900">
                          Free
                        </p>
                      ) : (
                        <>
                          <p className="text-3xl font-bold text-slate-900">
                            ${plan.price}
                          </p>
                          <p className="text-sm text-slate-600">/month</p>
                        </>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => purchasePlan(plan._id)}
                      disabled={isCurrent || purchasing === plan._id}
                      className={`w-full py-3 rounded-lg font-semibold transition-all mb-8 flex items-center justify-center gap-2 ${
                        isCurrent
                          ? "bg-slate-100 text-slate-600 cursor-default"
                          : isPopular
                            ? "bg-amber-500 text-white hover:bg-amber-600 active:bg-amber-700"
                            : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
                      } ${
                        purchasing === plan._id ? "opacity-75 cursor-wait" : ""
                      }`}
                    >
                      {isCurrent ? (
                        <>
                          <Check className="w-4 h-4" />
                          Current Plan
                        </>
                      ) : purchasing === plan._id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Select Plan"
                      )}
                    </button>

                    {/* Features */}
                    <div className="space-y-3">
                      {plan.features?.slice(0, 5).map((feature) => (
                        <div
                          key={feature.name}
                          className="flex items-start gap-3"
                        >
                          <div className="text-green-500 mt-0.5 flex-shrink-0">
                            ✓
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-medium text-slate-900">
                              {feature.name}
                            </p>
                            {feature.limit && (
                              <p className="text-xs text-slate-500">
                                Up to {feature.limit}/month
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* FAQ or Support */}
        <div className="bg-slate-50 rounded-xl p-8 border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">
            Questions about plans?
          </h3>
          <p className="text-slate-600 mb-4">
            Each plan includes all the features you need to run your restaurant
            efficiently. Limits reset automatically on the 1st of every month.
          </p>
          <p className="text-slate-600">
            Need help choosing? Start with Professional for full features, or
            Starter if you're just getting started.
          </p>
        </div>
      </div>
    </div>
  );
}
