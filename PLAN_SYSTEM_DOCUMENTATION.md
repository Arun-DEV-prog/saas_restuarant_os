# Purchase Plan System - Integration Guide

## Overview

A complete subscription/plan system has been integrated into your SaaS platform. Restaurant owners can:

- View and purchase subscription plans
- Have monthly access limits enforced
- Track their usage
- Manage and renew subscriptions

**No existing code was modified** - this is a complete new feature layer.

---

## System Architecture

### Models

#### 1. **Plan** (`src/lib/models/Plan.js`)

Predefined subscription tiers like Starter, Professional, Enterprise

```javascript
{
  name: "Professional",
  price: 29,
  monthlyOrderLimit: 500,
  monthlyTableRequestLimit: 1000,
  accessFeatures: ["qr-orders", "table-requests", "basic-analytics"]
}
```

#### 2. **Subscription** (`src/lib/models/Subscription.js`)

Tracks which restaurant has which plan and monthly usage

```javascript
{
  restaurantId: ObjectId,
  planId: ObjectId,
  status: "active|canceled|expired|pending",
  endDate: Date,
  monthlyUsage: [
    {
      month: Date,
      ordersCount: 0,
      tableRequestsCount: 0,
      menuItemsCount: 0,
      apiCallsCount: 0
    }
  ]
}
```

#### 3. **PlanUsage** (`src/lib/models/PlanUsage.js`)

Quick reference for current month usage

---

## API Endpoints

### Plans Management

```
GET  /api/plans                      - List all active plans
GET  /api/plans/[planId]              - Get specific plan
POST /api/plans/[planId]              - Update plan (admin)
```

### Subscriptions

```
GET  /api/subscriptions               - Get current subscription for restaurant
POST /api/subscriptions               - Purchase/create subscription
POST /api/subscriptions/check          - Check subscription validity & get status
GET  /api/subscriptions/usage         - Get current month usage
POST /api/subscriptions/usage         - Track usage (increment counters)
```

### Admin Management

```
GET  /api/admin/subscriptions         - List all subscriptions (admin only)
POST /api/admin/subscriptions         - Create subscription for restaurant (admin)
GET  /api/admin/subscriptions/[id]    - Get subscription details (admin)
PUT  /api/admin/subscriptions/[id]    - Update subscription (admin)
DELETE /api/admin/subscriptions/[id]  - Cancel subscription (admin)
```

---

## Helper Functions

### Subscription Helpers (`src/lib/subscriptionHelpers.js`)

```javascript
// Check if restaurant has valid subscription + access to feature
import { checkSubscriptionAccess } from "@/lib/subscriptionHelpers";
const access = await checkSubscriptionAccess(restaurantId, "table-requests");
// Returns: { hasAccess: bool, reason: string, plan: Plan }

// Check if restaurant has reached usage limit
import { checkUsageLimit } from "@/lib/subscriptionHelpers";
const limit = await checkUsageLimit(restaurantId, "orders");
// Returns: { withinLimit: bool, currentCount: number, limit: number, remaining: number }

// Track a usage increment
import { trackUsage } from "@/lib/subscriptionHelpers";
await trackUsage(restaurantId, "orders", 1); // increment orders by 1

// Get subscription status
import { getSubscriptionStatus } from "@/lib/subscriptionHelpers";
const sub = await getSubscriptionStatus(restaurantId);
```

### Subscription Middleware (`src/lib/subscriptionMiddleware.js`)

```javascript
import {
  checkSubscription,
  checkFeatureAccess,
  checkLimit,
} from "@/lib/subscriptionMiddleware";

// In your API route:
const subCheck = await checkSubscription(req);
if (!subCheck.isValid) return subCheck.response;

const { restaurantId } = subCheck;

// Check feature access
const featureCheck = await checkFeatureAccess(restaurantId, "table-requests");
if (!featureCheck.hasAccess) {
  /* deny access */
}

// Check usage limit
const limitCheck = await checkLimit(restaurantId, "orders");
if (!limitCheck.withinLimit) {
  /* deny access */
}
```

---

## Quick Start

### 1. Initialize Default Plans

```bash
node scripts/setup-plans.js
```

This creates 3 default plans:

- **Starter** (Free) - 50 orders, 100 table requests, 50 menu items, 2 users
- **Professional** ($29) - 500 orders, 1000 table requests, 200 menu items, 10 users
- **Enterprise** ($99) - Unlimited everything

### 2. Integrate into Existing Routes

#### Example: Orders API

Current: `src/app/api/restaurants/[restaurantId]/orders/route.js`

Add subscription check:

```javascript
import { checkSubscription, checkLimit } from "@/lib/subscriptionMiddleware";
import { trackUsage } from "@/lib/subscriptionHelpers";

export async function POST(req) {
  // Check subscription
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // Check usage limit
  const limitCheck = await checkLimit(subCheck.restaurantId, "orders");
  if (!limitCheck.withinLimit) {
    return NextResponse.json(
      {
        error: "Monthly order limit reached",
        current: limitCheck.currentCount,
        limit: limitCheck.limit,
      },
      { status: 429 },
    );
  }

  // ... existing order creation logic ...

  // Track the usage
  await trackUsage(subCheck.restaurantId, "orders", 1);

  return NextResponse.json({ success: true });
}
```

#### Example: Table Requests (Feature Gate)

```javascript
import { checkFeatureAccess } from "@/lib/subscriptionMiddleware";

export async function POST(req) {
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // Check if plan includes table requests
  const access = await checkFeatureAccess(
    subCheck.restaurantId,
    "table-requests",
  );
  if (!access.hasAccess) {
    return NextResponse.json(
      {
        error: "Feature not available in your plan",
      },
      { status: 403 },
    );
  }

  // ... existing logic ...
}
```

---

## Usage Tracking

### Monthly Reset

The system automatically tracks usage per month. Each month starts on the 1st.

### Update Counters

When a tracked action occurs (order, table request, menu item, etc.):

```javascript
await trackUsage(restaurantId, "orders", 1); // +1 order
await trackUsage(restaurantId, "tableRequests", 1); // +1 table request
await trackUsage(restaurantId, "menuItems", 1); // +1 menu item
await trackUsage(restaurantId, "apiCalls", 1); // +1 API call
```

### Check Usage

```javascript
const limitCheck = await checkLimit(restaurantId, "orders");
// {
//   withinLimit: true,
//   currentCount: 45,
//   limit: 500,
//   remaining: 455
// }
```

---

## Frontend Integration

### Display Available Plans

```javascript
async function loadPlans() {
  const res = await fetch("/api/plans");
  const plans = await res.json();
  // Display plans with pricing, features, purchase buttons
}
```

### Purchase Plan

```javascript
async function purchasePlan(planId) {
  const res = await fetch("/api/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      planId,
      paymentMethod: "card", // or 'bank_transfer', 'manual'
      transactionId: "txn_...", // if using external payment processor
    }),
  });

  if (res.ok) {
    toast.success("Plan purchased!");
  }
}
```

### Check Current Subscription

```javascript
async function checkSubscription() {
  const res = await fetch("/api/subscriptions/check", {
    method: "POST",
  });

  const data = await res.json();
  // {
  //   isValid: true,
  //   subscription: { ... },
  //   plan: { name: "Professional", price: 29, ... },
  //   currentUsage: { month, ordersCount, ... },
  //   limits: { monthlyOrderLimit: 500, ... },
  //   accessFeatures: ["qr-orders", "table-requests", ...]
  // }
}
```

---

## Admin Operations

### Grant Free Trial

```bash
curl -X POST /api/admin/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "restaurantId": "...",
    "planId": "...",
    "durationMonths": 1,
    "notes": "Free trial"
  }'
```

### Update Subscription

```bash
curl -X PUT /api/admin/subscriptions/[subscriptionId] \
  -H "Content-Type: application/json" \
  -d '{
    "endDate": "2025-04-05",
    "autoRenewal": true
  }'
```

### Cancel Subscription

```bash
curl -X DELETE /api/admin/subscriptions/[subscriptionId]
```

---

## Configuration

### Edit Plans

Modify `scripts/setup-plans.js` to customize plan names, prices, and limits:

```javascript
{
  name: "Custom Plan",
  price: 49,
  monthlyOrderLimit: 1000,
  monthlyTableRequestLimit: 5000,
  accessFeatures: ["qr-orders", "table-requests", "custom-branding"]
}
```

### Add New Features

1. Add to `Plan.accessFeatures` array
2. Add limit field to `Plan` schema if needed
3. Check in your API routes:
   ```javascript
   const access = await checkFeatureAccess(restaurantId, "your-new-feature");
   if (!access.hasAccess) return error;
   ```

---

## Best Practices

✅ **Always check subscription before restricted operations**

```javascript
const subCheck = await checkSubscription(req);
if (!subCheck.isValid) return subCheck.response;
```

✅ **Check feature access for premium features**

```javascript
const access = await checkFeatureAccess(restaurantId, "feature-name");
if (!access.hasAccess) return error;
```

✅ **Check and track usage for limited features**

```javascript
const limit = await checkLimit(restaurantId, "orders");
if (!limit.withinLimit) return error;
await trackUsage(restaurantId, "orders", 1);
```

✅ **Handle expiration gracefully**

```javascript
if (new Date() > subscription.endDate) {
  return { expired: true, renewUrl: "/billing" };
}
```

❌ **Don't modify subscriptions from client code** - only API calls from authenticated routes
❌ **Don't forget to call trackUsage** when feature is used
❌ **Don't hardcode limits** - always fetch from Plan model

---

## Troubleshooting

### Plans not showing up

```bash
# Reinitialize plans
node scripts/setup-plans.js
```

### Subscription check returning "no_subscription"

- Restaurant owner hasn't purchased a plan yet
- Previous subscription was canceled
- Use admin API to grant trial: `/api/admin/subscriptions`

### Usage not tracking

- Make sure to call `trackUsage()` after the action
- Check that subscription has `status: "active"`
  and `endDate > new Date()`

### Feature access denied

- Check that plan includes the feature in `accessFeatures` array
- Make sure subscription is still active and not expired

---

## Files Created

```
src/lib/models/
  ├── Plan.js                          # Plan schema
  ├── Subscription.js                  # Subscription schema
  └── PlanUsage.js                     # Current month usage tracker

src/lib/
  ├── subscriptionHelpers.js           # Utility functions
  ├── subscriptionMiddleware.js        # Middleware for routes
  └── SUBSCRIPTION_INTEGRATION_EXAMPLES.js  # Code examples

src/app/api/
  ├── plans/
  │   └── [planId]/route.js
  ├── subscriptions/
  │   ├── route.js                     # GET/POST subscriptions
  │   ├── check/route.js               # Check validity
  │   └── usage/route.js               # Track & get usage
  └── admin/subscriptions/
      ├── route.js
      └── [subscriptionId]/route.js

scripts/
  └── setup-plans.js                   # Initialize default plans
```

---

## Next Steps

1. ✅ Run `node scripts/setup-plans.js` to create default plans
2. ✅ Integrate subscription checks into your existing API routes
3. ✅ Create a billing/plans page in the dashboard
4. ✅ Add plan selection in registration
5. ✅ Connect to payment processor (Stripe, PayPal, etc.)
6. ✅ Set up billing reminders and auto-renewal

---

**Questions? Check SUBSCRIPTION_INTEGRATION_EXAMPLES.js for more code samples!**
