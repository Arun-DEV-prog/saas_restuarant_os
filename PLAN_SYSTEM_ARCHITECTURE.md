# Plan System Architecture

## System Flow Diagram

```
RESTAURANT OWNER
       |
       v
┌─────────────────────────┐
│  Dashboard             │
│  - View Plans          │
│  - Current Subscription│
│  - Usage Stats         │
└──────────┬──────────────┘
           |
           v
┌─────────────────────────────────────────────────────┐
│              API ENDPOINTS                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  GET  /api/plans                                   │
│       └─> Returns all active plans                 │
│                                                    │
│  POST /api/subscriptions                           │
│       └─> Purchase a plan (creates subscription)   │
│                                                    │
│  POST /api/subscriptions/check                     │
│       └─> Check if subscription valid + get plan   │
│                                                    │
│  GET  /api/subscriptions/usage                     │
│       └─> Get current month usage stats            │
│                                                    │
└─────────────────────────────────────────────────────┘
           |
           v
┌───────────────────────────────────────────────────────────┐
│         SUBSCRIPTION MIDDLEWARE & HELPERS                │
├───────────────────────────────────────────────────────────┤
│                                                           │
│  checkSubscription(req)                                   │
│  ├─> Verify user is authenticated                        │
│  ├─> Verify restaurant exists                            │
│  └─> Return restaurantId or error                        │
│                                                           │
│  checkFeatureAccess(restaurantId, 'feature')             │
│  ├─> Get active subscription                             │
│  ├─> Check if plan includes feature                      │
│  └─> Return { hasAccess, plan }                          │
│                                                           │
│  checkUsageLimit(restaurantId, 'orders')                 │
│  ├─> Get active subscription                             │
│  ├─> Get current month usage                             │
│  ├─> Compare against limit                               │
│  └─> Return { withinLimit, current, limit, remaining }   │
│                                                           │
│  trackUsage(restaurantId, 'orders', 1)                   │
│  ├─> Increment usage counter                             │
│  └─> Reset on month boundary                             │
│                                                           │
└──────┬───────────────────────────────────────────────────┘
       |
       v
┌──────────────────────────────────────────────────────┐
│         MONGODB COLLECTIONS                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  plans                                              │
│  ├─ _id                                             │
│  ├─ name: "Professional"                            │
│  ├─ price: 29                                       │
│  ├─ monthlyOrderLimit: 500                          │
│  ├─ monthlyTableRequestLimit: 1000                  │
│  ├─ accessFeatures: [...features...]                │
│  └─ features: [...]                                 │
│                                                      │
│  subscriptions                                      │
│  ├─ _id                                             │
│  ├─ restaurantId                                    │
│  ├─ planId                                          │
│  ├─ status: "active|canceled|expired"               │
│  ├─ startDate                                       │
│  ├─ endDate                                         │
│  ├─ monthlyUsage: [                                 │
│  │   { month, ordersCount: 45, ... }                │
│  │   { month, ordersCount: 32, ... }                │
│  │ ]                                                │
│  └─ autoRenewal: true                               │
│                                                      │
│  planUsage (fast lookup)                            │
│  ├─ restaurantId                                    │
│  ├─ subscriptionId                                  │
│  ├─ currentMonth                                    │
│  └─ counts: ordersCount, tableRequestsCount, ...    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

## Typical Workflow

```
1. RESTAURANT OWNER SIGNS UP
   └─> No subscription initially (free tier implied)

2. OWNER VIEWS PLANS
   └─> GET /api/plans
       └─> Returns: Starter, Professional, Enterprise

3. OWNER PURCHASES PROFESSIONAL PLAN
   └─> POST /api/subscriptions { planId, paymentMethod }
       └─> Creates subscription
           └─> Starts on today, expires next month

4. OWNER CREATES AN ORDER
   └─> POST /api/orders
       └─> Call: checkSubscription(req)
           └─> ✅ Valid subscription exists
       └─> Call: checkUsageLimit(restaurantId, 'orders')
           └─> Current: 45, Limit: 500
           └─> ✅ Within limit
       └─> Create order
       └─> Call: trackUsage(restaurantId, 'orders', 1)
           └─> Increment to 46

5. OWNER REACHES LIMIT (450/500)
   └─> Creates order
       └─> checkUsageLimit returns withLimit: false
           └─> ❌ 451 >= 500 (over limit!)
       └─> API returns: { error: 'Monthly limit reached' }
       └─> OrderFlow: "Upgrade your plan to continue"

6. OWNER UPGRADES TO ENTERPRISE
   └─> POST /api/subscriptions { planId }
       └─> Cancels old subscription
       └─> Creates new Enterprise subscription
       └─> monthlyOrderLimit: null (unlimited!)

7. MONTH BOUNDARY (1st of next month)
   └─> System creates new usage record
   └─> Reset counters for new month
   └─> Previous month data stored in history
```

## Integration Points

```
EXISTING ENDPOINTS THAT NEED SUBSCRIPTION CHECKS:

Orders API                      Menu Items API
├─ Check 'orders' limit        ├─ Check 'menuItems' limit
└─ trackUsage('orders', 1)     └─ trackUsage('menuItems', 1)

Table Requests API              Categories API
├─ Gate feature access         └─ Included in Professional+
├─ Check limit                    (check feature access)
└─ trackUsage(...)

Analytics API                   API Key Management
└─ Gate feature access         └─ Gate feature access
```

## Feature Access Model

```
STARTER PLAN:
├─ QR Code Menus       ✅
├─ Table Requests      ❌
├─ Advanced Analytics  ❌
└─ API Access          ❌

PROFESSIONAL PLAN:
├─ QR Code Menus       ✅
├─ Table Requests      ✅
├─ Advanced Analytics  ✅
└─ API Access          ❌

ENTERPRISE PLAN:
├─ QR Code Menus       ✅
├─ Table Requests      ✅
├─ Advanced Analytics  ✅
├─ API Access          ✅
└─ Priority Support    ✅
```

## Monthly Usage Reset

```
MONTH 1 (March 2024)
├─ 1st: Create usage record, reset counters
├─ 15th: 150 orders, 200 table requests
├─ 31st: 300 orders, 500 table requests (FINAL)

MONTH 2 (April 2024)
├─ 1st: Create NEW usage record, reset counters to 0
├─ Usage[Month2]: { ordersCount: 0 }
└─ Usage[Month1]: { ordersCount: 300 } (archived)

Usage automatically archives when month changes
```

## Error Handling Flow

```
API Request Received
└─> Check Subscription
    ├─ No auth? → 401 Unauthorized
    ├─ No restaurant? → 400 Bad Request
    └─ ✅ Has subscription
       └─> Check Feature Access (if needed)
           ├─ Feature not in plan? → 403 Forbidden
           └─ ✅ Has feature
              └─> Check Limit (if needed)
                  ├─ Limit reached? → 429 Too Many Requests
                  └─ ✅ Within limit
                     └─> Process request
                         └─> Track usage
                             └─> Success → 200 OK
```

## Data Flow: Purchasing a Plan

```
Frontend:
  POST /api/subscriptions { planId }
    ↓
Authentication:
  Get user session
  Extract restaurantId
    ↓
Validation:
  Plan exists?
  User authenticated?
    ↓
Cancellation:
  Find existing subscriptions
  Mark them as "canceled"
    ↓
Creation:
  Calculate endDate (startDate + 1 month)
  Create new Subscription document
    ↓
Database:
  Insert subscription
  Update monthlyUsage array
    ↓
Response:
  Return subscription object
  Frontend redirects to billing page
```

## Scaling Considerations

**Current Setup:**

- ✅ Handles 1000s of restaurants
- ✅ Monthly usage indexed by restaurantId
- ✅ Usage increments are atomic (MongoDB $inc)
- ✅ Feature checks are cached in plan

**If you need higher performance:**

- Add Redis cache for plan data
- Cache user subscription for 5 minutes
- Queue usage tracking for batch processing
- Archive old usage monthly

## Security Model

```
Public Endpoints:
├─ GET /api/plans (no auth needed - plans are public)
└─ POST /api/auth/register (no auth needed)

Protected Endpoints:
├─ POST /api/subscriptions (requires auth)
├─ POST /api/subscriptions/check (requires auth)
├─ GET /api/subscriptions/usage (requires auth)
└─ Automatically filters by restaurantId

Admin Endpoints:
├─ GET /api/admin/subscriptions (requires super_admin)
├─ POST /api/admin/subscriptions (requires super_admin)
├─ PUT /api/admin/subscriptions/* (requires super_admin)
└─ DELETE /api/admin/subscriptions/* (requires super_admin)

Auto-Protection:
- restaurantId extracted from session
- Can never access other restaurants' data
- Can never modify other subscriptions
```

## File Dependencies

```
Frontend Components
├─ Fetch /api/plans
├─ Fetch /api/subscriptions
└─ Display using fetched data

App API Routes
├─ Import checkSubscription
├─ Import checkFeatureAccess
├─ Import checkUsageLimit
├─ Import trackUsage
└─> All from subscriptionHelpers/Middleware

Database Layer
├─ Import Plan model
├─ Import Subscription model
├─ Import PlanUsage model
└─> Mongoose handles access

Auth System
└─ Session contains restaurantId
   └─> Used by all endpoints
```

---

This is the complete architecture of your plan system!
