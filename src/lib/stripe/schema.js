/**
 * Stripe Integration Database Schema Updates
 *
 * This file documents the required Stripe fields that should be added
 * to your Restaurant collection in MongoDB.
 */

/**
 * RESTAURANT COLLECTION - Add these fields to your restaurant documents:
 *
 * {
 *   _id: ObjectId,
 *   // ... existing fields ...
 *
 *   // NEW STRIPE FIELDS:
 *   stripeConnectId: String,              // Stripe Connect Account ID (e.g., "acct_123abc...")
 *   stripeOnboardingComplete: Boolean,    // Whether onboarding is complete
 *   stripeRequirements: Object,           // Current requirements from Stripe (can be empty object)
 *     // Example structure:
 *     // {
 *     //   currently_due: ["..."],
 *     //   eventually_due: ["..."],
 *     //   pending_verification: ["..."]
 *     // }
 *
 *   // Timestamps
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

/**
 * ORDERS COLLECTION - Add/Ensure these fields for Stripe payment tracking:
 *
 * {
 *   _id: String,
 *   // ... existing fields ...
 *
 *   // STRIPE PAYMENT FIELDS:
 *   paymentId: String,          // Stripe Payment Intent ID
 *   paymentStatus: String,      // 'pending', 'paid', 'failed'
 *   paidAt: Date,               // When payment was completed
 *
 *   // Timestamps
 *   createdAt: Date,
 *   updatedAt: Date
 * }
 */

// Migration Instructions:
// ========================
// Run these commands in MongoDB to update your collections:

// 1. Update restaurants collection:
// db.restaurants.updateMany(
//   { stripeConnectId: { $exists: false } },
//   {
//     $set: {
//       stripeConnectId: null,
//       stripeOnboardingComplete: false,
//       stripeRequirements: {}
//     }
//   }
// )

// 2. Update orders collection:
// db.orders.updateMany(
//   { paymentId: { $exists: false } },
//   {
//     $set: {
//       paymentId: null,
//       paymentStatus: "pending",
//       paidAt: null
//     }
//   }
// )

export const restaurantStripeFields = {
  stripeConnectId: null, // Will be filled on connection
  stripeOnboardingComplete: false,
  stripeRequirements: {},
};

export const orderStripeFields = {
  paymentId: null,
  paymentStatus: "pending",
  paidAt: null,
};
