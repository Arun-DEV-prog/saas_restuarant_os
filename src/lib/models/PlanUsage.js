import mongoose from "mongoose";

const PlanUsageSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      unique: true,
    },
    subscriptionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subscription",
    },
    currentMonth: {
      type: Date,
      default: () => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
      },
    },

    // Current month usage
    ordersCount: { type: Number, default: 0 },
    tableRequestsCount: { type: Number, default: 0 },
    menuItemsCount: { type: Number, default: 0 },
    apiCallsCount: { type: Number, default: 0 },
    usersCount: { type: Number, default: 0 },

    // Last reset date
    lastResetDate: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

// Index for quick lookups
PlanUsageSchema.index({ restaurantId: 1, currentMonth: 1 });

const PlanUsage =
  mongoose.models.PlanUsage || mongoose.model("PlanUsage", PlanUsageSchema);

export default PlanUsage;
