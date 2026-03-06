import stripe from "./client";

/**
 * Creates a Stripe Express Connect account for a restaurant
 */
export async function createStripeConnectAccount(restaurant) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "";
    const isValidUrl =
      appUrl.startsWith("https://") && !appUrl.includes("localhost");

    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: restaurant.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
      settings: {
        branding: {
          // Only pass logo if it's a real hosted URL, not empty/undefined

          primary_color: "#000000",
        },
      },
      business_profile: {
        name: restaurant.name,
        mcc: "5812",
        product_description: `Orders at ${restaurant.name}`,
        support_address: {
          city: restaurant.city || "",
          country: "US",
          line1: restaurant.address || "",
          postal_code: restaurant.zipCode || "",
          state: restaurant.state || "",
        },
        // Only include url if it's a real https domain (Stripe rejects localhost)
        ...(isValidUrl && { url: appUrl }),
      },
      metadata: {
        restaurantId: restaurant._id.toString(),
      },
    });

    return account;
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    throw error;
  }
}

/**
 * Gets the onboarding URL for a Stripe Express account
 */
export async function getOnboardingUrl(stripeConnectId, refreshUrl, returnUrl) {
  try {
    const accountLink = await stripe.accountLinks.create({
      account: stripeConnectId,
      type: "account_onboarding",
      refresh_url: refreshUrl,
      return_url: returnUrl,
    });

    return accountLink.url;
  } catch (error) {
    console.error("Error getting onboarding URL:", error);
    throw error;
  }
}

/**
 * Checks if a Stripe Express account is active (charges_enabled, payouts_enabled)
 */
export async function isStripeAccountActive(stripeConnectId) {
  try {
    const account = await stripe.accounts.retrieve(stripeConnectId);
    return account.charges_enabled === true && account.payouts_enabled === true;
  } catch (error) {
    console.error("Error checking Stripe account status:", error);
    return false;
  }
}

/**
 * Gets Stripe account details
 */
export async function getStripeAccountDetails(stripeConnectId) {
  try {
    const account = await stripe.accounts.retrieve(stripeConnectId);
    return {
      id: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      requirements: account.requirements,
      created: account.created,
    };
  } catch (error) {
    console.error("Error getting Stripe account details:", error);
    throw error;
  }
}

/**
 * Gets the login link for the Stripe Express dashboard
 */
export async function getStripeLoginLink(stripeConnectId) {
  try {
    const loginLink = await stripe.accounts.createLoginLink(stripeConnectId);
    return loginLink.url;
  } catch (error) {
    console.error("Error creating Stripe login link:", error);
    throw error;
  }
}

/**
 * Creates a Checkout Session with platform fee
 */
export async function createCheckoutSession(
  stripeConnectId,
  orderData,
  hostFeePercent = parseFloat(process.env.STRIPE_PLATFORM_FEE_PERCENT || 2.5),
) {
  try {
    const items = orderData.items.map((item) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }));

    // Calculate total amount
    const totalAmount = orderData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    // Calculate platform fee
    const platformFee = Math.round(
      ((totalAmount * hostFeePercent) / 100) * 100,
    );

    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ["card"],
        line_items: items,
        mode: "payment",
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/integrations`,
        customer_email: orderData.customerEmail,
        client_reference_id: orderData.orderId,
        metadata: {
          orderId: orderData.orderId,
          restaurantId: stripeConnectId,
          hostFeePercent: hostFeePercent.toString(),
        },
      },
      {
        // Route payment to connected account with platform fee
        stripeAccount: stripeConnectId,
      },
    );

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
}

/**
 * Retrieves a checkout session
 */
export async function getCheckoutSession(sessionId, stripeConnectId = null) {
  try {
    const options = stripeConnectId ? { stripeAccount: stripeConnectId } : {};
    const session = await stripe.checkout.sessions.retrieve(sessionId, options);
    return session;
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw error;
  }
}

/**
 * Validates webhook signature
 */
export function verifyWebhookSignature(body, signature) {
  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
    return event;
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    return null;
  }
}
