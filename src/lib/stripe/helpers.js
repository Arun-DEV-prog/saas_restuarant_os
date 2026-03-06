import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export function createExpressAccount(email) {
  return stripe.accounts.create({
    type: "express",
    country: "US",
    email,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
  });
}

export function createAccountLink(accountId, refreshUrl, returnUrl) {
  return stripe.accountLinks.create({
    account: accountId,
    refresh_url: refreshUrl,
    return_url: returnUrl,
    type: "account_onboarding",
  });
}

export function createCheckoutSession(accountId, amount, orderId) {
  return stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: "Order" },
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    payment_intent_data: {
      application_fee_amount: Math.floor(
        amount *
          (parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT || 2.5) / 100),
      ),
      transfer_data: { destination: accountId },
    },
    metadata: { orderId },
  });
}
