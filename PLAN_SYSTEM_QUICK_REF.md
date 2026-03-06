# Plan System - Quick Reference

## Initialize (Do this first!)

```bash
node scripts/setup-plans.js
```

## API Endpoints - Quick Summary

### Get Plans

```
GET /api/plans
```

### Purchase a Plan

```
POST /api/subscriptions
{
  "planId": "...",
  "paymentMethod": "card"
}
```

### Check Current Subscription

```
POST /api/subscriptions/check
Response: {
  isValid: true/false,
  plan: { name, price, features, limits },
  currentUsage: { ordersCount, ... },
  accessFeatures: [...]
}
```

### Get Current Usage

```
GET /api/subscriptions/usage
```

---

## Code Integration - Copy/Paste Templates

### Template 1: Check Subscription + Limit

```javascript
import { checkSubscription, checkLimit } from "@/lib/subscriptionMiddleware";
import { trackUsage } from "@/lib/subscriptionHelpers";
import { NextResponse } from "next/server";

export async function POST(req) {
  // 1. Check subscription exists
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // 2. Check limit
  const limit = await checkLimit(subCheck.restaurantId, "orders");
  if (!limit.withinLimit) {
    return NextResponse.json(
      {
        error: "Monthly limit reached",
        used: limit.currentCount,
        limit: limit.limit,
      },
      { status: 429 },
    );
  }

  // 3. Do your logic
  // ... create order ...

  // 4. Track usage
  await trackUsage(subCheck.restaurantId, "orders", 1);

  return NextResponse.json({ success: true });
}
```

### Template 2: Check Feature Access

```javascript
import {
  checkSubscription,
  checkFeatureAccess,
} from "@/lib/subscriptionMiddleware";
import { NextResponse } from "next/server";

export async function POST(req) {
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  const access = await checkFeatureAccess(
    subCheck.restaurantId,
    "table-requests",
  );
  if (!access.hasAccess) {
    return NextResponse.json(
      {
        error: "Not included in your plan",
      },
      { status: 403 },
    );
  }

  // ... do logic ...
}
```

### Template 3: React Hook for Plans

```javascript
import { useState, useEffect } from "react";

export function usePlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((data) => {
        setPlans(data);
        setLoading(false);
      });
  }, []);

  const purchase = async (planId) => {
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId }),
    });
    return res.json();
  };

  return { plans, loading, purchase };
}
```

### Template 4: React Hook for Subscription Status

```javascript
import { useState, useEffect } from "react";

export function useSubscription() {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/subscriptions/check", { method: "POST" })
      .then((r) => r.json())
      .then((data) => {
        setSub(data);
        setLoading(false);
      });
  }, []);

  return { sub, loading };
}

// Usage:
// const { sub } = useSubscription();
// if (sub?.isValid) console.log(sub.plan.name);
```

---

## Helper Functions

```javascript
// Check if subscription is valid + has feature
import { checkSubscriptionAccess } from "@/lib/subscriptionHelpers";
const result = await checkSubscriptionAccess(restaurantId, "table-requests");
// { hasAccess: true, plan: {...} }

// Check if limit reached
import { checkUsageLimit } from "@/lib/subscriptionHelpers";
const result = await checkUsageLimit(restaurantId, "orders");
// { withinLimit: true, currentCount: 45, limit: 500, remaining: 455 }

// Increment usage
import { trackUsage } from "@/lib/subscriptionHelpers";
await trackUsage(restaurantId, "orders", 1);

// Get subscription info
import { getSubscriptionStatus } from "@/lib/subscriptionHelpers";
const sub = await getSubscriptionStatus(restaurantId);
```

---

## Default Plans (after setup)

| Plan         | Price | Orders | Table Req | Menu Items | Users | Features            |
| ------------ | ----- | ------ | --------- | ---------- | ----- | ------------------- |
| Starter      | FREE  | 50     | 100       | 50         | 2     | QR Orders           |
| Professional | $29   | 500    | 1000      | 200        | 10    | All + Analytics     |
| Enterprise   | $99   | ∞      | ∞         | ∞          | ∞     | All + API + Support |

---

## Limit Types (for checkLimit / trackUsage)

- `'orders'`
- `'tableRequests'`
- `'menuItems'`
- `'apiCalls'`

---

## Common Integration Points

### Orders API

Add limit check when creating orders

### Table Requests

Gate behind feature access (table-requests)

### Menu Items

Check `menuItems` limit

### Restaurant Settings

Show current plan + limits + usage

### Dashboard

Add billing/subscription card

---

## Testing

### Check if plans exist

```bash
curl http://localhost:3000/api/plans
```

### Create subscription

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"planId": "<ID_FROM_PLANS_LIST>"}'
```

### Check subscription validity

```bash
curl -X POST http://localhost:3000/api/subscriptions/check
```

---

## Customizing Plans

Edit `scripts/setup-plans.js`:

```javascript
{
  name: "My Plan",
  price: 49,
  monthlyOrderLimit: 1000,
  monthlyTableRequestLimit: 5000,
  monthlyMenuItemsLimit: 500,
  monthlyUsersLimit: 20,
  accessFeatures: ["qr-orders", "table-requests", "analytics", "api-access"],
  features: [
    { name: "Feature 1", limit: 1000 },
    { name: "Feature 2", limit: null } // null = unlimited
  ]
}
```

Then re-run:

```bash
node scripts/setup-plans.js
```

---

## Key Files

| File                                   | Purpose             |
| -------------------------------------- | ------------------- |
| `src/lib/models/Plan.js`               | Plan schema         |
| `src/lib/models/Subscription.js`       | Subscription schema |
| `src/lib/subscriptionHelpers.js`       | Utility functions   |
| `src/lib/subscriptionMiddleware.js`    | Route middleware    |
| `src/app/api/plans/route.js`           | Plans API           |
| `src/app/api/subscriptions/route.js`   | Subscriptions API   |
| `PLAN_SYSTEM_DOCUMENTATION.md`         | Full documentation  |
| `SUBSCRIPTION_INTEGRATION_EXAMPLES.js` | Code examples       |
