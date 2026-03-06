# Stripe Integration Setup Checklist

## ✅ Files Created

### Backend API Routes

- [x] `src/app/api/stripe/connect/route.js` - Stripe account creation & status check
- [x] `src/app/api/stripe/checkout/route.js` - Checkout session creation
- [x] `src/app/api/stripe/webhook/route.js` - Webhook event handling
- [x] `src/app/api/restaurants/[restaurantId]/stripe-dashboard/route.js` - Dashboard link

### Frontend Pages

- [x] `src/app/(dashboard)/onboarding/page.jsx` - Onboarding redirect
- [x] `src/app/(dashboard)/onboarding/success/page.jsx` - Completion status check
- [x] `src/app/(dashboard)/integrations/page.jsx` - Integration dashboard

### Stripe Utilities

- [x] `src/lib/stripe/client.js` - Stripe SDK client instance
- [x] `src/lib/stripe/helpers.js` - Core Stripe operations
- [x] `src/lib/stripe/balance.js` - Balance and payout tracking
- [x] `src/lib/stripe/schema.js` - Database schema documentation
- [x] `src/lib/stripe/INTEGRATION_GUIDE.md` - Complete integration guide

### Configuration

- [x] `.env.local.example` - Environment variables template

---

## 📋 Setup Steps

### Step 1: Environment Setup

- [ ] Copy `.env.local.example` to `.env.local`
- [ ] Get API keys from https://dashboard.stripe.com/apikeys
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk*test*...)
  - [ ] `STRIPE_SECRET_KEY` (sk*test*...)
- [ ] Enable Express accounts at https://dashboard.stripe.com/connect
- [ ] Get `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID` (ca\_...)
- [ ] Set `STRIPE_PLATFORM_FEE_PERCENT` (recommended: 2.5)

### Step 2: Webhook Configuration

- [ ] Install Stripe CLI: https://stripe.com/docs/stripe-cli
- [ ] Run: `stripe login`
- [ ] Run: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
- [ ] Copy webhook secret to `.env.local` as `STRIPE_WEBHOOK_SECRET`

### Step 3: Database Updates

- [ ] Run MongoDB migration commands from `src/lib/stripe/schema.js`
- [ ] Verify restaurants collection has Stripe fields:
  - [ ] `stripeConnectId`
  - [ ] `stripeOnboardingComplete`
  - [ ] `stripeRequirements`
- [ ] Verify orders collection has payment fields:
  - [ ] `paymentId`
  - [ ] `paymentStatus`
  - [ ] `paidAt`

### Step 4: Test the Integration

- [ ] Start dev server: `npm run dev`
- [ ] Navigate to `/integrations`
- [ ] Click "Connect Stripe Account"
- [ ] Complete test onboarding with provided credentials
- [ ] Verify success page shows "Onboarding Complete"
- [ ] Click "Test Payment" to process test transaction
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Verify order is marked as "paid" in database

### Step 5: Production Preparation

- [ ] Complete your Stripe platform verification
- [ ] Switch to live keys (sk*live*, pk*live*)
- [ ] Test with real transactions
- [ ] Set up production webhook endpoint
- [ ] Configure error monitoring
- [ ] Set up logging for transactions
- [ ] Test refund flow
- [ ] Configure payout schedule

---

## 🔄 Frontend Flow

### Restaurant Owner Journey

1. Owner logs in to dashboard
2. Navigates to `/integrations`
3. Clicks "Connect Stripe Account"
4. Redirected to `/onboarding`
5. Stripe creates account and redirects to their hosted form
6. Owner completes information
7. Redirected to `/onboarding/success`
8. Status is verified, shows success or pending requirements

### Customer Payment Journey

1. Customer places order in restaurant menu
2. Clicks "Pay Now"
3. Redirected to Stripe Checkout Session
4. Enters payment details (test card in dev)
5. Completes payment
6. Webhook confirms payment
7. Order status updated to "paid"
8. Redirect to success page

---

## 📊 Database Structure

### Restaurant Document

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,

  // Stripe fields
  stripeConnectId: String,          // e.g., "acct_123abc..."
  stripeOnboardingComplete: Boolean, // true when ready
  stripeRequirements: Object,        // Remaining action items

  createdAt: Date,
  updatedAt: Date
}
```

### Order Document

```javascript
{
  _id: String,
  restaurantId: String,
  items: Array,
  totalAmount: Number,

  // Payment fields
  paymentId: String,     // Stripe Payment Intent ID
  paymentStatus: String, // "pending", "paid", "failed"
  paidAt: Date,

  status: String,        // "pending", "preparing", "ready", "completed"

  createdAt: Date,
  updatedAt: Date
}
```

---

## 🧪 Test Scenarios

### Scenario 1: Connect Stripe Account

```
POST /api/stripe/connect
{
  "restaurantId": "rest_123"
}
→ Returns onboarding URL
→ Stripe creates account
→ Webhook updates database
```

### Scenario 2: Create Payment

```
POST /api/stripe/checkout
{
  "restaurantId": "rest_123",
  "orderId": "order_456",
  "items": [...],
  "customerEmail": "test@example.com"
}
→ Returns checkout session URL
→ Customer pays
→ Webhook marks order as paid
```

### Scenario 3: View Dashboard

```
GET /api/restaurants/rest_123/stripe-dashboard
→ Returns Stripe dashboard login link
→ Owner can view transactions and payouts
```

---

## 🔐 Security Checklist

- [ ] All routes check `getServerSession()` for auth
- [ ] Webhook verifies Stripe signature
- [ ] Never expose `STRIPE_SECRET_KEY` to frontend
- [ ] `.env.local` is in `.gitignore`
- [ ] Rate limiting implemented for API routes
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data
- [ ] CORS configured if needed
- [ ] Database permissions set correctly

---

## 📞 Support & Troubleshooting

### Common Issues

**"Invalid API Key"**

- Verify you're using the correct key (test or live)
- Check environment variables are loaded

**"Webhook signature verification failed"**

- Ensure `STRIPE_WEBHOOK_SECRET` matches `stripe listen`
- For production, get from Stripe dashboard webhooks

**"Restaurant Stripe account not configured"**

- User hasn't connected yet, send to `/integrations`

**"Charges/Payouts not enabled"**

- Restaurant needs to complete onboarding requirements
- Check `stripeRequirements` in database

### Debugging

1. Check server logs: `npm run dev` output
2. Check webhook deliveries: https://dashboard.stripe.com/webhooks
3. View test transactions: https://dashboard.stripe.com/test/payments
4. Monitor connected accounts: https://dashboard.stripe.com/connect/accounts
5. Check MongoDB documents for missing fields

---

## 📚 Resources

- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **Stripe API Reference**: https://stripe.com/docs/api
- **Stripe Testing**: https://stripe.com/docs/testing
- **Stripe CLI**: https://stripe.com/docs/stripe-cli
- **Express Accounts**: https://stripe.com/docs/connect/express-accounts
- **Application Fees**: https://stripe.com/docs/connect/application-fees

---

## 🎯 Next Phase Features (Optional)

- [ ] Refund handling endpoint
- [ ] Payout analytics dashboard
- [ ] Custom fee tiers per restaurant
- [ ] Subscription billing integration
- [ ] Multi-currency support
- [ ] Fraud detection integration
- [ ] Dispute handling workflow
- [ ] Tax calculation
- [ ] Invoice generation

---

**Last Updated**: March 5, 2026  
**Version**: 1.0  
**Status**: ✅ Complete
