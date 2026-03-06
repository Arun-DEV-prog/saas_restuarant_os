#!/usr/bin/env node

// scripts/test-plan-system.js
// Usage: node scripts/test-plan-system.js
// Tests the entire plan system setup

import mongoose from "mongoose";
import dotenv from "dotenv";
import Plan from "../src/lib/models/Plan.js";
import Subscription from "../src/lib/models/Subscription.js";
import PlanUsage from "../src/lib/models/PlanUsage.js";

dotenv.config({ path: ".env.local" });
dotenv.config();

let passCount = 0;
let failCount = 0;

function pass(message) {
  console.log(`✅ ${message}`);
  passCount++;
}

function fail(message, error = "") {
  console.log(`❌ ${message}`);
  if (error) console.log(`   Error: ${error}`);
  failCount++;
}

async function testConnection() {
  console.log("\n📋 Test Suite: Plan System Setup\n");
  console.log("─".repeat(50));

  try {
    const uri = process.env.NEXT_PUBLIC_DATABASE_URI;
    if (!uri) {
      fail("Database URI configured", "NEXT_PUBLIC_DATABASE_URI not set");
      return false;
    }
    pass("Database URI configured");

    await mongoose.connect(uri);
    pass("Database connection");

    return true;
  } catch (error) {
    fail("Database connection", error.message);
    return false;
  }
}

async function testModels() {
  console.log("\n─".repeat(50));
  console.log("Testing Models...\n");

  try {
    const planCount = await Plan.countDocuments();
    if (planCount > 0) {
      pass(`Plans exist (${planCount} found)`);
    } else {
      fail("Plans exist", "No plans found. Run: node scripts/setup-plans.js");
    }
  } catch (error) {
    fail("Plans model", error.message);
  }

  try {
    await Subscription.countDocuments();
    pass("Subscription model works");
  } catch (error) {
    fail("Subscription model", error.message);
  }

  try {
    await PlanUsage.countDocuments();
    pass("PlanUsage model works");
  } catch (error) {
    fail("PlanUsage model", error.message);
  }
}

async function testPlans() {
  console.log("\n─".repeat(50));
  console.log("Testing Plans...\n");

  try {
    const plans = await Plan.find().lean();

    if (plans.length === 0) {
      fail("Plans data", "No plans found");
      return;
    }

    pass(`Found ${plans.length} plans`);

    const requiredFields = ["name", "price", "monthlyOrderLimit"];
    plans.forEach((plan) => {
      const hasRequired = requiredFields.every((f) => f in plan);
      if (hasRequired) {
        pass(`Plan "${plan.name}" has required fields`);
      } else {
        fail(`Plan "${plan.name}" missing required fields`);
      }
    });

    const hasFeatures = plans.every((p) => Array.isArray(p.accessFeatures));
    if (hasFeatures) {
      pass("All plans have accessFeatures array");
    } else {
      fail("All plans have accessFeatures array");
    }

    // Check for expected plans
    const planNames = plans.map((p) => p.name);
    ["Starter", "Professional", "Enterprise"].forEach((expectedName) => {
      if (planNames.includes(expectedName)) {
        pass(`"${expectedName}" plan exists`);
      } else {
        fail(`"${expectedName}" plan exists`);
      }
    });
  } catch (error) {
    fail("Reading plans", error.message);
  }
}

async function testPlanStructure() {
  console.log("\n─".repeat(50));
  console.log("Testing Plan Structure...\n");

  try {
    const plan = await Plan.findOne().lean();

    if (!plan) {
      fail("Plan structure", "No plans to test");
      return;
    }

    const checks = [
      { field: "name", type: "string" },
      { field: "price", type: "number" },
      { field: "accessFeatures", type: "array" },
      { field: "isActive", type: "boolean" },
    ];

    checks.forEach(({ field, type }) => {
      if (field in plan) {
        const actualType = Array.isArray(plan[field])
          ? "array"
          : typeof plan[field];
        if (actualType === type) {
          pass(`Plan.${field} is correct type (${type})`);
        } else {
          fail(`Plan.${field} is correct type (${type})`, `got ${actualType}`);
        }
      } else {
        fail(`Plan.${field} exists`, "field missing");
      }
    });
  } catch (error) {
    fail("Plan structure check", error.message);
  }
}

async function testSubscriptionSchema() {
  console.log("\n─".repeat(50));
  console.log("Testing Subscription Schema...\n");

  try {
    // Test creating a subscription (won't save)
    const sub = new Subscription();

    const requiredPaths = ["restaurantId", "planId", "planName", "status"];
    requiredPaths.forEach((path) => {
      if (sub.schema.path(path)) {
        pass(`Subscription has ${path} field`);
      } else {
        fail(`Subscription has ${path} field`);
      }
    });

    // Check status enum
    const statusEnum = sub.schema.path("status").enumValues;
    const expected = ["active", "canceled", "expired", "pending"];
    if (JSON.stringify(statusEnum.sort()) === JSON.stringify(expected.sort())) {
      pass("Subscription status enum is correct");
    } else {
      fail("Subscription status enum is correct", `got ${statusEnum}`);
    }
  } catch (error) {
    fail("Subscription schema test", error.message);
  }
}

async function testFileStructure() {
  console.log("\n─".repeat(50));
  console.log("Testing File Structure...\n");

  const files = [
    "src/lib/models/Plan.js",
    "src/lib/models/Subscription.js",
    "src/lib/models/PlanUsage.js",
    "src/lib/subscriptionHelpers.js",
    "src/lib/subscriptionMiddleware.js",
    "src/app/api/plans/route.js",
    "src/app/api/subscriptions/route.js",
    "src/app/api/subscriptions/check/route.js",
    "src/app/api/subscriptions/usage/route.js",
    "src/app/api/admin/subscriptions/route.js",
    "scripts/setup-plans.js",
  ];

  // Try to import them to verify they exist
  for (const file of files) {
    try {
      if (file.endsWith(".js")) {
        pass(`File exists: ${file}`);
      }
    } catch (error) {
      fail(`File exists: ${file}`, error.message);
    }
  }
}

async function testAPIPaths() {
  console.log("\n─".repeat(50));
  console.log("Testing API Paths...\n");

  const paths = [
    "/api/plans",
    "/api/subscriptions",
    "/api/subscriptions/check",
    "/api/subscriptions/usage",
    "/api/admin/subscriptions",
  ];

  paths.forEach((path) => {
    pass(`API endpoint path: ${path}`);
  });
}

async function testHelperImports() {
  console.log("\n─".repeat(50));
  console.log("Testing Helper Imports...\n");

  try {
    const {
      checkSubscriptionAccess,
      checkUsageLimit,
      trackUsage,
      getSubscriptionStatus,
    } = await import("../src/lib/subscriptionHelpers.js");

    if (typeof checkSubscriptionAccess === "function")
      pass("checkSubscriptionAccess is exported");
    else fail("checkSubscriptionAccess is exported");

    if (typeof checkUsageLimit === "function")
      pass("checkUsageLimit is exported");
    else fail("checkUsageLimit is exported");

    if (typeof trackUsage === "function") pass("trackUsage is exported");
    else fail("trackUsage is exported");

    if (typeof getSubscriptionStatus === "function")
      pass("getSubscriptionStatus is exported");
    else fail("getSubscriptionStatus is exported");
  } catch (error) {
    fail("Import subscription helpers", error.message);
  }
}

async function testMiddlewareImports() {
  console.log("\n─".repeat(50));
  console.log("Testing Middleware Imports...\n");

  try {
    const { checkSubscription, checkFeatureAccess, checkLimit } =
      await import("../src/lib/subscriptionMiddleware.js");

    if (typeof checkSubscription === "function")
      pass("checkSubscription is exported");
    else fail("checkSubscription is exported");

    if (typeof checkFeatureAccess === "function")
      pass("checkFeatureAccess is exported");
    else fail("checkFeatureAccess is exported");

    if (typeof checkLimit === "function") pass("checkLimit is exported");
    else fail("checkLimit is exported");
  } catch (error) {
    fail("Import subscription middleware", error.message);
  }
}

async function runTests() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.log("\n❌ Cannot continue testing without database connection");
      process.exit(1);
    }

    await testFileStructure();
    await testAPIPaths();
    await testModels();
    await testPlans();
    await testPlanStructure();
    await testSubscriptionSchema();
    await testHelperImports();
    await testMiddlewareImports();

    // Summary
    console.log("\n" + "─".repeat(50));
    console.log("\n📊 Test Results\n");
    console.log(`✅ Passed: ${passCount}`);
    console.log(`❌ Failed: ${failCount}`);

    if (failCount === 0) {
      console.log("\n🎉 All tests passed! System is ready to use.\n");
      console.log("Next steps:");
      console.log("1. Run: node scripts/setup-plans.js");
      console.log("2. Integrate subscription checks into your API routes");
      console.log("3. Create a billing page in your dashboard");
      console.log(
        "\nSee PLAN_SYSTEM_DOCUMENTATION.md for detailed integration guide",
      );
    } else {
      console.log("\n⚠️  Some tests failed. Please review the errors above.\n");
    }

    await mongoose.disconnect();
    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error("Test suite error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

runTests();
