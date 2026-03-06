# PLAN SYSTEM - SETUP COMPLETE! ✅

Your purchase/plan system is fully integrated. Here's what to do next:

---

## 🚀 IMMEDIATE ACTIONS (Do These Now)

### 1. Initialize Plans (1 minute)

```bash
node scripts/setup-plans.js
```

Creates 3 plans: Starter (Free), Professional ($29), Enterprise ($99)

### 2. Test Installation (1 minute)

```bash
node scripts/test-plan-system.js
```

Validates everything is working correctly.

### 3. Verify in Database

Connect to your MongoDB and check for `plans` collection with 3 documents.

---

## 📖 UNDERSTAND THE SYSTEM (5 minutes)

Read these files in order:

1. **PLAN_SYSTEM_QUICK_REF.md** ← Start here (concise)
2. **README_PLAN_SYSTEM.md** ← Then this (overview)
3. **PLAN_SYSTEM_DOCUMENTATION.md** ← Full details if needed

---

## 🔧 INTEGRATE INTO YOUR CODE (15-30 minutes)

### A. Choose Your First Integration Point

Pick ONE API route to integrate first (e.g., Orders API)

### B. Add Subscription Check

Copy this block to your API route:

```javascript
import { checkSubscription, checkLimit } from "@/lib/subscriptionMiddleware";
import { trackUsage } from "@/lib/subscriptionHelpers";

export async function POST(req) {
  // Check subscription exists
  const subCheck = await checkSubscription(req);
  if (!subCheck.isValid) return subCheck.response;

  // Check limit not reached
  const limit = await checkLimit(subCheck.restaurantId, "orders");
  if (!limit.withinLimit) {
    return NextResponse.json(
      {
        error: "Monthly limit reached",
        current: limit.currentCount,
        limit: limit.limit,
      },
      { status: 429 },
    );
  }

  // YOUR EXISTING LOGIC HERE
  // const result = await doSomething(...);

  // Track the usage
  await trackUsage(subCheck.restaurantId, "orders", 1);

  return NextResponse.json({ success: true });
}
```

### C. Test One Integration

Test with curl or Postman to make sure it works.

### D. Repeat for Other API Routes

- Orders API - check `orders` limit
- Table Requests - gate behind feature access
- Menu Items - check `menuItems` limit
- Analytics - feature gate

---

## 🎨 CREATE A BILLING PAGE (Optional but Recommended)

Add a page like `/dashboard/billing` that:

1. Shows current plan
2. Displays available plans
3. Shows usage/limits
4. Allows upgrading

Use the React templates in `PLAN_SYSTEM_QUICK_REF.md`

---

## 💳 CONNECT PAYMENT PROCESSOR (Optional)

When you're ready to accept real payments:

1. Sign up for Stripe, PayPal, or similar
2. Update `/api/subscriptions` to create payment intent
3. Store `transactionId` when payment succeeds
4. Send confirmation email to restaurant owner

(System is set up to handle this - just add integration)

---

## 📋 COMPLETE INTEGRATION CHECKLIST

After integrating into all routes, verify:

- [ ] Plans initialized (`node scripts/setup-plans.js`)
- [ ] Tests passing (`node scripts/test-plan-system.js`)
- [ ] Orders API checks subscription & limit
- [ ] Table Requests checks feature access
- [ ] Menu Items checks limit
- [ ] Usage tracked after each action
- [ ] Billing page shows current subscription
- [ ] Can purchase plan from dashboard
- [ ] Plan limits actually enforce restrictions
- [ ] Monthly usage resets on 1st of month

---

## 🗂️ WHAT WAS CREATED FOR YOU

### Models (Database Schemas)

- `Plan.js` - Subscription tiers
- `Subscription.js` - Restaurant subscriptions + monthly usage
- `PlanUsage.js` - Fast lookup for current usage

### API Endpoints (11 total)

- `/api/plans` - List/manage plans
- `/api/subscriptions` - Buy/check subscription
- `/api/subscriptions/check` - Validate subscription + get info
- `/api/subscriptions/usage` - Track/get usage
- `/api/admin/subscriptions/*` - Admin management

### Helper Functions & Middleware

- `subscriptionHelpers.js` - Core functions (check access, limits, track usage)
- `subscriptionMiddleware.js` - Easy-to-use middleware
- `SUBSCRIPTION_INTEGRATION_EXAMPLES.js` - Copy/paste code examples

### Setup & Testing

- `scripts/setup-plans.js` - Initialize default plans
- `scripts/test-plan-system.js` - Validate installation

### Documentation

- `README_PLAN_SYSTEM.md` - Overview/quick start
- `PLAN_SYSTEM_DOCUMENTATION.md` - Complete reference
- `PLAN_SYSTEM_QUICK_REF.md` - Cheatsheet

---

## ❌ NOTHING WAS BROKEN

- ✅ All existing code unchanged
- ✅ Pure additive integration
- ✅ Existing APIs still work without check
- ✅ Can integrate gradually by route
- ✅ No database migrations needed

---

## 🆘 QUICK HELP

**"Where do I start?"**  
→ Run `node scripts/setup-plans.js` first

**"How do I add subscription check to my API?"**  
→ See code template above, or check `PLAN_SYSTEM_QUICK_REF.md`

**"How do I show plans in my app?"**  
→ Fetch `/api/plans`, see React template in `PLAN_SYSTEM_QUICK_REF.md`

**"How do I check if a feature is allowed?"**  
→ Use `checkFeatureAccess(restaurantId, 'feature-name')`

**"How do I add a new plan?"**  
→ Edit `scripts/setup-plans.js`, then run it again

**"How do I set it to a specific restaurant?"**  
→ Admin endpoint: `POST /api/admin/subscriptions` (requires super_admin)

**"Something not working?"**  
→ Run `node scripts/test-plan-system.js` to diagnose

---

## 📞 FILE LOCATIONS

```
Documentation:
  - README_PLAN_SYSTEM.md                 ← How to use (overview)
  - PLAN_SYSTEM_DOCUMENTATION.md          ← Complete reference
  - PLAN_SYSTEM_QUICK_REF.md              ← Quick cheatsheet
  - SUBSCRIPTION_INTEGRATION_EXAMPLES.js  ← Copy/paste examples

Models:
  - src/lib/models/Plan.js
  - src/lib/models/Subscription.js
  - src/lib/models/PlanUsage.js

Code:
  - src/lib/subscriptionHelpers.js        ← Core functions
  - src/lib/subscriptionMiddleware.js     ← Easy middleware

APIs:
  - src/app/api/plans/
  - src/app/api/subscriptions/
  - src/app/api/admin/subscriptions/

Setup:
  - scripts/setup-plans.js                ← Run first!
  - scripts/test-plan-system.js           ← Verify installation
```

---

## ✅ YOU'RE DONE WITH SETUP!

The system is ready to integrate into your app.

**Next: Pick one API route and add subscription check. That's it!**

Questions? All documentation is in these 3 files:

1. PLAN_SYSTEM_QUICK_REF.md (fast)
2. README_PLAN_SYSTEM.md (medium)
3. PLAN_SYSTEM_DOCUMENTATION.md (complete)

---

Happy coding! 🚀
