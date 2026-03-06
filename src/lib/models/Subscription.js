import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Plan",
    },
    planName: { type: String, required: true }, // Snapshot of plan name at purchase
    status: {
      type: String,
      enum: ["active", "canceled", "expired", "pending"],
      default: "active",
    },
    startDate: { type: Date, default: () => new Date() },
    endDate: { type: Date, required: true }, // Next billing date
    renewalDate: { type: Date }, // Auto-renewal date
    paymentMethod: { type: String }, // "card", "bank_transfer", "manual", etc.
    transactionId: { type: String },
    notes: { type: String },

    // Monthly usage tracking
    monthlyUsage: [
      {
        month: { type: Date, required: true }, // First day of the month
        ordersCount: { type: Number, default: 0 },
        tableRequestsCount: { type: Number, default: 0 },
        menuItemsCount: { type: Number, default: 0 },
        apiCallsCount: { type: Number, default: 0 },
      },
    ],

    // Auto-renewal settings
    autoRenewal: { type: Boolean, default: true },
    canceledAt: { type: Date },
  },
  { timestamps: true },
);

const Subscription =
  mongoose.models.Subscription ||
  mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
