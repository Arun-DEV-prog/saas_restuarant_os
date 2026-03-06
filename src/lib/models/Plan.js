import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true }, // e.g., "Starter", "Professional", "Enterprise"
    description: { type: String },
    price: { type: Number, required: true }, // Monthly price in your currency
    currency: { type: String, default: "USD" },
    features: [
      {
        name: { type: String, required: true },
        limit: { type: Number, default: null }, // null = unlimited
      },
    ],
    // Standard limits
    monthlyOrderLimit: { type: Number, default: null }, // null = unlimited
    monthlyTableRequestLimit: { type: Number, default: null },
    monthlyMenuItemsLimit: { type: Number, default: 100 },
    monthlyUsersLimit: { type: Number, default: 5 },
    accessFeatures: [String], // e.g., ["table-requests", "qr-orders", "analytics", "api-access"]
    isActive: { type: Boolean, default: true },
    sort: { type: Number, default: 0 },
  },
  { timestamps: true },
);

const Plan = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);

export default Plan;
