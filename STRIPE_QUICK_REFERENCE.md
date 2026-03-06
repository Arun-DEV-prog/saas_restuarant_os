# Stripe Integration - Quick Reference

## 🌐 Frontend URLs

| Page                  | URL                   | Purpose                                   |
| --------------------- | --------------------- | ----------------------------------------- |
| Integration Dashboard | `/integrations`       | Connect Stripe, view status, test payment |
| Onboarding            | `/onboarding`         | Redirect to Stripe hosted form            |
| Onboarding Success    | `/onboarding/success` | Check completion status                   |

**Pass `restaurantId` in query params or localStorage**

---

## 🔌 API Endpoints

### Stripe Connect

```
POST /api/stripe/connect
  Create Stripe Express account

GET /api/stripe/connect?restaurantId=REST_ID
  Check account status (charges enabled, etc)
```

### Payments

```
POST /api/stripe/checkout
  Create checkout session for order payment
```

### Webhooks

```
POST /api/stripe/webhook
  Handle: account.updated, checkout.session.completed, etc
```

### Dashboard

```
GET /api/restaurants/REST_ID/stripe-dashboard
  Get Stripe dashboard login link
```

---

## 📋 Database Fields

### Restaurants Collection

```javascript
stripeConnectId: String; // Stripe account ID
stripeOnboardingComplete: Boolean;
stripeRequirements: Object; // Pending verification steps
```

### Orders Collection

```javascript
paymentId: String; // Stripe Payment Intent ID
paymentStatus: String; // "pending" | "paid" | "failed"
paidAt: Date; // Payment timestamp
```

---

## ⚙️ Environment Variables (.env.local)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLATFORM_FEE_PERCENT=2.5
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🧪 Quick Test Flow

1. **Start dev server**

   ```bash
   npm run dev
   ```

2. **Forward webhooks** (new terminal)

   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

3. **Navigate to integrations**

   ```
   http://localhost:3000/integrations?restaurantId=YOUR_RESTAURANT_ID
   ```

4. **Click "Connect Stripe Account"**
   - Complete test onboarding
   - Redirected to success page

5. **Test payment**
   - Click "Test Payment"
   - Use: `4242 4242 4242 4242`
   - Any expiry, any CVC

6. **Verify order in database**
   ```javascript
   db.orders.findOne({ _id: "order_id" });
   // Should show: paymentId, paymentStatus: "paid", paidAt
   ```

---

## 📊 File Structure

```
src/
├── lib/stripe/
│   ├── client.js           Stripe instance
│   ├── helpers.js          Core operations
│   ├── balance.js          Payouts & balance
│   ├── schema.js           DB schema docs
│   └── INTEGRATION_GUIDE.md Full guide
│
├── app/api/stripe/
│   ├── connect/route.js    Account creation
│   ├── checkout/route.js   Payments
│   └── webhook/route.js    Event handling
│
├── app/api/restaurants/[restaurantId]/
│   └── stripe-dashboard/   Dashboard link
│
└── app/(dashboard)/
    ├── integrations/       Main dashboard
    └── onboarding/
        ├── page.jsx        Redirect
        └── success/        Status check
```

---

## 🛠️ Utility Functions

### In `src/lib/stripe/helpers.js`

```javascript
// Account creation
createStripeConnectAccount(restaurant);
getOnboardingUrl(connectId, refreshUrl, returnUrl);
isStripeAccountActive(connectId);
getStripeAccountDetails(connectId);
getStripeLoginLink(connectId);

// Payments
createCheckoutSession(connectId, orderData);
getCheckoutSession(sessionId);

// Webhook
verifyWebhookSignature(body, signature);
```

### In `src/lib/stripe/balance.js`

```javascript
getAccountBalance(connectId); // Available + pending
createPayout(connectId, amount);
getPayoutHistory(connectId, limit);
getChargeHistory(connectId, limit);
calculatePlatformRevenue(startDate, endDate);
```

---

## 🔐 Key Security Points

✅ All routes require authentication (`getServerSession()`)
✅ Restaurants can only access their own account
✅ Webhook signature verified
✅ Secret keys never exposed to frontend
✅ Input validation on all endpoints

---

## 💡 Common Code Snippets

### Check if restaurant has Stripe

```javascript
const response = await fetch(
  `/api/stripe/connect?restaurantId=${restaurantId}`,
);
const status = await response.json();

if (status.chargesEnabled && status.payoutsEnabled) {
  // Ready to accept payments
}
```

### Create payment session

```javascript
const checkout = await fetch("/api/stripe/checkout", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    restaurantId: "rest_123",
    orderId: "order_456",
    items: [{ name: "Pizza", price: 12.99, quantity: 1 }],
    customerEmail: "user@example.com",
  }),
});

const { sessionUrl } = await checkout.json();
window.location.href = sessionUrl;
```

### Open Stripe dashboard

```javascript
const response = await fetch(
  `/api/restaurants/${restaurantId}/stripe-dashboard`,
);
const { loginUrl } = await response.json();
window.open(loginUrl);
```

---

## ❌ Error Handling

All API routes return JSON with `success` or `error`:

```javascript
// Success
{
  success: true,
  data: {...}
}

// Error
{
  error: "Human readable message"
}
```

Check HTTP status codes:

- `200`: OK
- `400`: Bad request (missing fields, etc)
- `401`: Unauthorized (not logged in)
- `404`: Not found
- `500`: Server error

---

## 📈 Platform Fee Model

Your platform revenue comes from application fees:

```
Order Amount:        $100.00
Platform Fee (2.5%):  $2.50
Restaurant Gets:     $97.50

Your Account:        +$2.50
Restaurant Account:  +$97.50
```

Configure percentage in `.env.local`:

```env
STRIPE_PLATFORM_FEE_PERCENT=2.5
```

---

## 🎓 Learning Resources

- **This Week**: Read [INTEGRATION_GUIDE.md](src/lib/stripe/INTEGRATION_GUIDE.md)
- **Testing**: https://stripe.com/docs/testing
- **API Docs**: https://stripe.com/docs/api
- **Connect**: https://stripe.com/docs/connect
- **CLI**: https://stripe.com/docs/stripe-cli

---

## ✅ Verification Checklist

- [ ] `.env.local` filled with Stripe keys
- [ ] `stripe listen` forwarding webhooks
- [ ] Database migrations complete
- [ ] `/integrations` page loads
- [ ] Can click "Connect Stripe Account"
- [ ] Test onboarding completes
- [ ] Can click "Test Payment"
- [ ] Order marked as `paid` in database
- [ ] All routes return proper responses

---

**Version**: 1.0  
**Last Updated**: March 5, 2026  
**Status**: ✅ Ready for Configuration
