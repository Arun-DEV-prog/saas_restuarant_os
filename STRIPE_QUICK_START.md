# Quick Stripe Setup - 5 Minutes

## Step 1: Get Your Stripe API Keys

1. Go to: https://dashboard.stripe.com/apikeys
2. You should see two keys:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)
3. Copy both keys

## Step 2: Create/Update `.env.local`

If you don't have `.env.local`, copy the example:

```bash
cp .env.local.example .env.local
```

Then open `.env.local` and update these lines:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
```

**Example:**

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51NkPSrIxxx123
STRIPE_SECRET_KEY=sk_test_51NkPSrIxxx456
```

## Step 3: Get Your Stripe Connect Client ID

1. Go to: https://dashboard.stripe.com/connect/overview
2. Look for "Client ID" section
3. Copy the Client ID (starts with `ca_`)
4. Update in `.env.local`:

```env
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_YOUR_CLIENT_ID_HERE
```

## Step 4: Set Webhook Secret (For Later)

When you run the Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

It will give you a webhook signing secret. Copy it and add to `.env.local`:

```env
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

## Step 5: Start Your Dev Server

```bash
npm run dev
```

Then visit:

```
http://localhost:3000/dashboard/69a9b36d2771d66204c4f622/integrations
```

## ✅ What You'll See

- **Status**: Connected status (initially "✗ No")
- **Connect Button**: Click to start Stripe onboarding
- **Test Card**: `4242 4242 4242 4242` (any expiry, any CVC)

## 🔧 Full `.env.local` Template

```env
# Database
NEXT_PUBLIC_DATABASE_URI=your_mongodb_uri

# Stripe API Keys (from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Stripe Connect (from https://dashboard.stripe.com/connect/overview)
NEXT_PUBLIC_STRIPE_CONNECT_CLIENT_ID=ca_...

# Stripe Webhook (from stripe listen command)
STRIPE_WEBHOOK_SECRET=whsec_...

# Platform Fee Percentage
STRIPE_PLATFORM_FEE_PERCENT=2.5

# URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
STRIPE_WEBHOOK_URL=http://localhost:3000/api/stripe/webhook
```

## 🆘 Troubleshooting

**Page shows blank?**

- Check browser console for errors
- Verify restaurantId `69a9b36d2771d66204c4f622` exists in your database

**"Failed to fetch Stripe status"?**

- Check that `.env.local` has the correct API key
- Restart dev server after adding env variables

**Can't click "Connect Stripe Account"?**

- Make sure all Stripe environment variables are set
- Check server logs for errors

## 📞 Need Help?

- Check the [INTEGRATION_GUIDE.md](src/lib/stripe/INTEGRATION_GUIDE.md)
- View [STRIPE_QUICK_REFERENCE.md](STRIPE_QUICK_REFERENCE.md)
- See full checklist: [STRIPE_SETUP_CHECKLIST.md](STRIPE_SETUP_CHECKLIST.md)
