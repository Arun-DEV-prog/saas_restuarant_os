# Stripe Connect Integration Guide

This is a complete Stripe Connect integration for your Next.js SaaS platform. It allows restaurants to receive payments directly from customers while your platform takes a configured fee.

## Quick Start

### 1. Install Stripe (Already Done)

```bash
npm install stripe
```

### 2. Set Up Environment Variables

Copy `.env.local.example` to `.env.local`:

```bash
cp .env.local.example .env.local
```

Then fill in your Stripe credentials:

```env
# Get these from https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Get these from https://dashboard.stripe.com/connect/accounts/overview
STRIPE_PLATFORM_ACCOUNT_ID=acct_YOUR_PLATFORM_ID_HERE
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE

# Platform fee percentage (0-100)
STRIPE_PLATFORM_FEE_PERCENT=2.5

# Get this from https://dashboard.stripe.com/webhooks
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_URL=http://localhost:3000/api/stripe/webhook
```

### 3. Configure Stripe Dashboard

1. Go to [https://dashboard.stripe.com/connect](https://dashboard.stripe.com/connect)
2. Enable "Express accounts" for Stripe Connect
3. Complete your own platform account verification
4. Get your `NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID` from the same page

### 4. Update Database (Important!)

Add Stripe fields to your MongoDB collections:

```javascript
// For restaurants collection, add:
db.restaurants.updateMany(
  { stripeConnectId: { $exists: false } },
  {
    $set: {
      stripeConnectId: null,
      stripeOnboardingComplete: false,
      stripeRequirements: {},
    },
  },
);

// For orders collection, add:
db.orders.updateMany(
  { paymentId: { $exists: false } },
  {
    $set: {
      paymentId: null,
      paymentStatus: "pending",
      paidAt: null,
    },
  },
);
```

### 5. Set Up Webhook (Local Testing)

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run webhook forwarding:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

3. Copy the webhook signing secret and add it to `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Project Structure

### Backend (API Routes)

```
src/app/api/stripe/
├── connect/route.js          # POST: Create account, GET: Check status
├── checkout/route.js         # POST: Create checkout session
└── webhook/route.js          # POST: Handle Stripe events

src/app/api/restaurants/[restaurantId]/
└── stripe-dashboard/route.js # GET: Get dashboard login link
```

### Frontend (Pages)

```
src/app/(dashboard)/
├── onboarding/
│   ├── page.jsx             # Redirect to Stripe onboarding
│   └── success/page.jsx      # Check onboarding completion
└── integrations/page.jsx      # Show Stripe status and test checkout
```

### Utilities

```
src/lib/stripe/
├── client.js                 # Stripe SDK client instance
├── helpers.js                # Helper functions for Stripe operations
└── schema.js                 # Database schema documentation
```

## API Reference

### POST /api/stripe/connect

Create a Stripe Express account and get onboarding URL.

**Request:**

```json
{
  "restaurantId": "rest_123abc"
}
```

**Response:**

```json
{
  "success": true,
  "stripeConnectId": "acct_123abc",
  "onboardingUrl": "https://connect.stripe.com/..."
}
```

### GET /api/stripe/connect?restaurantId=rest_123abc

Check if restaurant's Stripe account is active.

**Response:**

```json
{
  "connected": true,
  "stripeConnectId": "acct_123abc",
  "chargesEnabled": true,
  "payoutsEnabled": true,
  "onboardingComplete": true,
  "requirements": {
    "currently_due": [],
    "eventually_due": [],
    "pending_verification": []
  }
}
```

### POST /api/stripe/checkout

Create a Checkout Session for a customer order.

**Request:**

```json
{
  "restaurantId": "rest_123abc",
  "orderId": "order_456def",
  "items": [
    {
      "name": "Pizza",
      "price": 15.99,
      "quantity": 2,
      "image": null
    }
  ],
  "customerEmail": "customer@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "sessionId": "cs_test_...",
  "sessionUrl": "https://checkout.stripe.com/..."
}
```

### POST /api/stripe/webhook

Handles Stripe webhook events:

- `account.updated` - Updates restaurant onboarding status
- `checkout.session.completed` - Marks order as paid
- `account.application.deauthorized` - Removes Stripe connection

### GET /api/restaurants/[restaurantId]/stripe-dashboard

Get login link for Stripe Express dashboard.

**Response:**

```json
{
  "success": true,
  "loginUrl": "https://dashboard.stripe.com/a/login/...",
  "stripeConnectId": "acct_123abc"
}
```

## Frontend Components

### /onboarding

Initiates Stripe Connect account creation. After the user completes Stripe's hosted form, they're redirected to the success page.

### /onboarding/success

Checks onboarding completion status. Shows:

- ✓ Success state with charges/payouts enabled
- ⏳ Pending state with remaining requirements
- ✗ Error state

### /integrations

Dashboard for managing Stripe integration:

- Shows current Stripe status
- Button to connect account
- Button to open Stripe dashboard
- Test checkout button

## Webhook Events

The webhook at `/api/stripe/webhook` handles these events:

### account.updated

```javascript
// Updates restaurant record when onboarding completes
{
  stripeOnboardingComplete: account.charges_enabled && account.payouts_enabled,
  stripeRequirements: account.requirements
}
```

### checkout.session.completed

```javascript
// Updates order when payment succeeds
{
  status: "paid",
  paymentId: session.payment_intent,
  paidAt: new Date()
}
```

### account.application.deauthorized

```javascript
// Disconnects Stripe account when restaurant revokes
{
  stripeConnectId: null,
  stripeOnboardingComplete: false
}
```

## Revenue Model

Your platform takes a percentage fee from each transaction.

**Example:**

- Customer orders $100
- Platform fee: 2.5% = $2.50
- Restaurant receives: $97.50

The platform fee is automatically deducted by Stripe and deposited into your platform account.

## Testing

### Test Stripe Credentials

Use these when `STRIPE_SECRET_KEY` starts with `sk_test_`:

**Card Numbers:**

- Success: `4242 4242 4242 4242`
- Requires auth: `4000 0025 0000 3155`
- Decline: `4000 0000 0000 0002`

**Expiry:** Any future date  
**CVC:** Any 3 digits

### Local Testing

1. Start your dev server: `npm run dev`
2. Forward webhooks: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Visit `/integrations` to test the flow

## Common Issues

### "Restaurant has no Stripe account"

- User hasn't connected their Stripe account yet
- Direct them to `/integrations` to connect

### Webhook signature verification failed

- Make sure `STRIPE_WEBHOOK_SECRET` matches the one from `stripe listen`
- For production, get it from https://dashboard.stripe.com/webhooks

### "Stripe onboarding not complete"

- Restaurant needs to complete all required information
- Direct them to open their Stripe dashboard and finish verification

### "Failed to create Stripe account"

- Ensure they have completed your platform's verification
- Check Stripe dashboard for any account restrictions

## Next Steps

1. ✅ Install Stripe package
2. ✅ Create API routes and frontend pages
3. ✅ Set up environment variables
4. ✅ Update database schema
5. ✅ Configure Stripe webhooks for production
6. ✅ Test the complete flow
7. Submit your platform for Stripe verification

## Database Schema

See [schema.js](./schema.js) for the complete schema documentation and migration commands.

## Security Notes

- All API routes check authentication with `getServerSession()`
- Restaurants can only access their own Stripe account
- Webhook signature verification prevents unauthorized requests
- Never expose `STRIPE_SECRET_KEY` to the frontend

## Support

- Stripe API Docs: https://stripe.com/docs
- Stripe Connect Docs: https://stripe.com/docs/connect
- Test Mode: All transactions are test-only until you go live
