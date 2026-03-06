#!/usr/bin/env node

// scripts/setup-plans.js
// Usage: node scripts/setup-plans.js

import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../src/lib/models/Plan.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

const PLANS = [
  {
    name: "Starter",
    description: "Perfect for small restaurants",
    price: 0, // Free tier
    currency: "USD",
    monthlyOrderLimit: 50,
    monthlyTableRequestLimit: 100,
    monthlyMenuItemsLimit: 50,
    monthlyUsersLimit: 2,
    accessFeatures: ["qr-orders"],
    sort: 1,
    isActive: true,
    features: [
      { name: "QR Code Menus", limit: 1 },
      { name: "Orders per month", limit: 50 },
      { name: "Menu Items", limit: 50 },
      { name: "Team Members", limit: 2 },
    ],
  },
  {
    name: "Professional",
    description: "For growing restaurants",
    price: 29,
    currency: "USD",
    monthlyOrderLimit: 500,
    monthlyTableRequestLimit: 1000,
    monthlyMenuItemsLimit: 200,
    monthlyUsersLimit: 10,
    accessFeatures: ["qr-orders", "table-requests", "basic-analytics"],
    sort: 2,
    isActive: true,
    features: [
      { name: "QR Code Menus", limit: null },
      { name: "Table Requests", limit: 1000 },
      { name: "Orders per month", limit: 500 },
      { name: "Menu Items", limit: 200 },
      { name: "Team Members", limit: 10 },
      { name: "Basic Analytics", limit: null },
    ],
  },
  {
    name: "Enterprise",
    description: "For large restaurant chains",
    price: 99,
    currency: "USD",
    monthlyOrderLimit: null, // Unlimited
    monthlyTableRequestLimit: null,
    monthlyMenuItemsLimit: null,
    monthlyUsersLimit: null,
    accessFeatures: [
      "qr-orders",
      "table-requests",
      "advanced-analytics",
      "api-access",
      "custom-branding",
      "priority-support",
    ],
    sort: 3,
    isActive: true,
    features: [
      { name: "QR Code Menus", limit: null },
      { name: "Table Requests", limit: null },
      { name: "Orders per month", limit: null },
      { name: "Advanced Analytics", limit: null },
      { name: "API Access", limit: null },
      { name: "Custom Branding", limit: null },
      { name: "Priority Support", limit: null },
    ],
  },
];

async function setupPlans() {
  try {
    const uri = process.env.NEXT_PUBLIC_DATABASE_URI;

    if (!uri) {
      throw new Error("Please add NEXT_PUBLIC_DATABASE_URI to .env.local");
    }

    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");

    // Delete existing plans
    await Plan.deleteMany({});
    console.log("🗑️  Cleared existing plans");

    // Insert new plans
    const result = await Plan.insertMany(PLANS);
    console.log(`✅ Created ${result.length} plans:`);

    result.forEach((plan) => {
      console.log(`   • ${plan.name} - $${plan.price}/month`);
    });

    await mongoose.disconnect();
    console.log("\n✅ Setup complete!");
  } catch (error) {
    console.error("❌ Setup failed:", error.message);
    process.exit(1);
  }
}

setupPlans();
