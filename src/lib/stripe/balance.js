/**
 * Stripe Balance and Payout Tracking
 *
 * Helper functions for tracking restaurant balances and payouts
 */

import stripe from "./client";

/**
 * Get the current balance for a connected account
 */
export async function getAccountBalance(stripeConnectId) {
  try {
    const balance = await stripe.balance.retrieve({
      stripeAccount: stripeConnectId,
    });

    return {
      available: balance.available, // Money ready to be paid out
      pending: balance.pending, // Money not yet available
      // Example: [{ currency: 'usd', amount: 10000 }]
    };
  } catch (error) {
    console.error("Error getting account balance:", error);
    throw error;
  }
}

/**
 * Create a payout for a connected account
 */
export async function createPayout(stripeConnectId, amount, currency = "usd") {
  try {
    const payout = await stripe.payouts.create(
      {
        amount: Math.round(amount * 100), // Convert to cents
        currency,
      },
      {
        stripeAccount: stripeConnectId,
      },
    );

    return {
      id: payout.id,
      amount: payout.amount / 100,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000),
    };
  } catch (error) {
    console.error("Error creating payout:", error);
    throw error;
  }
}

/**
 * Get payout history for a connected account
 */
export async function getPayoutHistory(stripeConnectId, limit = 10) {
  try {
    const payouts = await stripe.payouts.list(
      { limit },
      {
        stripeAccount: stripeConnectId,
      },
    );

    return payouts.data.map((payout) => ({
      id: payout.id,
      amount: payout.amount / 100,
      status: payout.status,
      arrival_date: new Date(payout.arrival_date * 1000),
      created: new Date(payout.created * 1000),
    }));
  } catch (error) {
    console.error("Error getting payout history:", error);
    throw error;
  }
}

/**
 * Calculate platform revenue for a time period
 */
export async function calculatePlatformRevenue(startDate, endDate) {
  try {
    // Get all charges on platform account (not custom accounts)
    const charges = await stripe.charges.list({
      created: {
        gte: Math.floor(startDate.getTime() / 1000),
        lte: Math.floor(endDate.getTime() / 1000),
      },
    });

    let platformFee = 0;

    for (const charge of charges.data) {
      if (charge.application_fee_amount) {
        platformFee += charge.application_fee_amount;
      }
    }

    return {
      platformFeeCents: platformFee,
      platformFee: platformFee / 100,
      transactionCount: charges.data.length,
    };
  } catch (error) {
    console.error("Error calculating platform revenue:", error);
    throw error;
  }
}

/**
 * Get charge history for a connected account
 */
export async function getChargeHistory(stripeConnectId, limit = 20) {
  try {
    const charges = await stripe.charges.list(
      { limit },
      {
        stripeAccount: stripeConnectId,
      },
    );

    return charges.data.map((charge) => ({
      id: charge.id,
      amount: charge.amount / 100,
      currency: charge.currency,
      status: charge.status,
      description: charge.description,
      customer: charge.customer,
      created: new Date(charge.created * 1000),
      receipt_url: charge.receipt_url,
    }));
  } catch (error) {
    console.error("Error getting charge history:", error);
    throw error;
  }
}

/**
 * Get customer payment methods for a Stripe account
 */
export async function getStripeAccount(stripeConnectId) {
  try {
    const account = await stripe.accounts.retrieve(stripeConnectId);

    return {
      id: account.id,
      email: account.email,
      country: account.country,
      businessProfile: account.business_profile,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      requirements: account.requirements,
    };
  } catch (error) {
    console.error("Error getting Stripe account:", error);
    throw error;
  }
}
