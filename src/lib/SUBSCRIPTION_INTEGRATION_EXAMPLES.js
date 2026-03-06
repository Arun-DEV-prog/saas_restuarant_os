// INTEGRATION EXAMPLES
// ============================================
// This file shows how to integrate the subscription system into existing routes
// You can copy/paste these patterns into your actual API routes

// ─────────────────────────────────────────────────────────────────
// Example 1: Check subscription before creating an order
// ─────────────────────────────────────────────────────────────────
/*
import { NextResponse } from "next/server";
import { checkSubscription, checkLimit } from "@/lib/subscriptionMiddleware";
import { trackUsage } from "@/lib/subscriptionHelpers";

export async function POST(req) {
  // Check subscription
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  const { restaurantId } = subCheck;

  // Check usage limit for orders
  const limitCheck = await checkLimit(restaurantId, "orders");
  if (!limitCheck.withinLimit) {
    return NextResponse.json(
      {
        error: "Monthly order limit reached",
        current: limitCheck.currentCount,
        limit: limitCheck.limit,
      },
      { status: 429 }
    );
  }

  // ... rest of your order creation logic ...

  // Track the usage (increment orders count)
  await trackUsage(restaurantId, "orders", 1);

  return NextResponse.json({ success: true });
}
*/

// ─────────────────────────────────────────────────────────────────
// Example 2: Check feature access for table requests
// ─────────────────────────────────────────────────────────────────
/*
import { checkFeatureAccess } from "@/lib/subscriptionMiddleware";

export async function POST(req) {
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // Check if plan includes table-requests feature
  const featureAccess = await checkFeatureAccess(subCheck.restaurantId, "table-requests");
  if (!featureAccess.hasAccess) {
    return NextResponse.json(
      {
        error: "Table requests not available in your plan",
        upgradeUrl: "/dashboard/billing",
      },
      { status: 403 }
    );
  }

  // ... rest of your logic ...
}
*/

// ─────────────────────────────────────────────────────────────────
// Example 3: Get subscription info in API response
// ─────────────────────────────────────────────────────────────────
/*
import { getSubscriptionStatus } from "@/lib/subscriptionHelpers";

export async function GET(req) {
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  const subscription = await getSubscriptionStatus(subCheck.restaurantId);

  return NextResponse.json({
    success: true,
    data: { ... },
    subscription: {
      plan: subscription?.planId?.name,
      expiresAt: subscription?.endDate,
      status: subscription?.status,
    },
  });
}
*/

// ─────────────────────────────────────────────────────────────────
// Example 4: Using in restaurant menu creation
// ─────────────────────────────────────────────────────────────────
/*
import { checkLimit, checkSubscription } from "@/lib/subscriptionMiddleware";

export async function POST(req) {
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // Check if they've hit menu item limit
  const limit = await checkLimit(subCheck.restaurantId, "menuItems");
  if (!limit.withinLimit) {
    return NextResponse.json(
      {
        error: "Menu items limit reached",
        remaining: limit.remaining,
        plan: "Professional",
        upgradeUrl: "/dashboard/billing",
      },
      { status: 429 }
    );
  }

  // ... create menu item ...

  // Track the usage
  await trackUsage(subCheck.restaurantId, "menuItems", 1);
}
*/

// ─────────────────────────────────────────────────────────────────
// Example 5: Frontend - Get plans and purchase
// ─────────────────────────────────────────────────────────────────
/*
// In a React component:

import { useState, useEffect } from "react";

export function PlanSelector() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    const res = await fetch("/api/plans");
    const data = await res.json();
    setPlans(data);
    setLoading(false);
  }

  async function purchasePlan(planId) {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        planId,
        paymentMethod: "stripe", // or "manual"
        transactionId: "txn_xxx",
      }),
    });

    const subscription = await res.json();
    toast.success("Plan purchased successfully!");
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {plans.map((plan) => (
        <div key={plan._id} className="border rounded p-4">
          <h3>{plan.name}</h3>
          <p className="text-2xl font-bold">${plan.price}</p>
          <ul className="my-4">
            {plan.features.map((f) => (
              <li key={f.name}>
                {f.name} {f.limit && `(${f.limit}/month)`}
              </li>
            ))}
          </ul>
          <button onClick={() => purchasePlan(plan._id)}>
            Purchase Plan
          </button>
        </div>
      ))}
    </div>
  );
}
*/

// ─────────────────────────────────────────────────────────────────
// Example 6: Frontend - Check current subscription
// ─────────────────────────────────────────────────────────────────
/*
// Hook to check subscription:

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  async function checkSubscription() {
    try {
      const res = await fetch("/api/subscriptions/check", { method: "POST" });
      const data = await res.json();

      if (data.isValid) {
        setSubscription(data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  return { subscription, loading };
}

// Usage in component:
export function BillingPage() {
  const { subscription, loading } = useSubscription();

  if (loading) return <Loading />;
  if (!subscription || !subscription.isValid) {
    return <div>No active subscription</div>;
  }

  return (
    <div>
      <h2>Current Plan: {subscription.plan.name}</h2>
      <p>$${subscription.plan.price}/month</p>
      <p>Expires: {new Date(subscription.subscription.endDate).toLocaleDateString()}</p>
      
      <div>
        <h3>Usage this month:</h3>
        <p>Orders: {subscription.currentUsage.ordersCount} / {subscription.limits.monthlyOrderLimit || '∞'}</p>
        <p>Table Requests: {subscription.currentUsage.tableRequestsCount} / {subscription.limits.monthlyTableRequestLimit || '∞'}</p>
      </div>
    </div>
  );
}
*/

export const INTEGRATION_EXAMPLES =
  "Check the comments in this file for integration examples";
