#!/usr/bin/env node

/**
 * AI Restaurant Assistant - Verification Script
 * Run this to verify your AI setup is correct
 */

const fs = require("fs");
const path = require("path");

console.log("\n🔍 AI Restaurant Assistant - Verification Tool\n");

let errors = [];
let warnings = [];
let success = 0;

// Check 1: .env.local exists
console.log("1. Checking .env.local file...");
const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");

  if (envContent.includes("GEMINI_API_KEY")) {
    if (
      envContent.includes("GEMINI_API_KEY=YOUR_API_KEY_HERE") ||
      envContent.includes("GEMINI_API_KEY=$")
    ) {
      warnings.push(
        "⚠️  GEMINI_API_KEY is set but appears to be a placeholder",
      );
    } else {
      console.log("   ✅ GEMINI_API_KEY found in .env.local");
      success++;
    }
  } else {
    errors.push("❌ GEMINI_API_KEY not found in .env.local");
  }
} else {
  warnings.push("⚠️  .env.local not found - will use defaults");
}

// Check 2: Required packages installed
console.log("\n2. Checking required packages...");
const packagePath = path.join(process.cwd(), "package.json");
if (fs.existsSync(packagePath)) {
  const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf-8"));

  if (packageJson.dependencies["@google/generative-ai"]) {
    console.log("   ✅ @google/generative-ai installed");
    success++;
  } else {
    errors.push(
      "❌ @google/generative-ai not found - run: npm install @google/generative-ai",
    );
  }

  if (packageJson.dependencies["next"]) {
    console.log("   ✅ Next.js installed");
    success++;
  }
} else {
  errors.push("❌ package.json not found");
}

// Check 3: AI Files exist
console.log("\n3. Checking AI component files...");
const aiFiles = [
  "src/lib/gemini.js",
  "src/app/api/ai/chat/route.js",
  "src/components/ChatbotPanel.jsx",
  "src/components/Dashboard/AutomationDashboard.jsx",
  "src/lib/automationService.js",
];

aiFiles.forEach((file) => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`   ✅ ${file}`);
    success++;
  } else {
    errors.push(`❌ ${file} not found`);
  }
});

// Check 4: Documentation files
console.log("\n4. Checking documentation...");
const docFiles = [
  "START_HERE_AI_GUIDE.md",
  "QUICK_AI_START.md",
  "AI_SETUP_GUIDE.md",
  "IMPLEMENTATION_DETAILS.md",
];

docFiles.forEach((file) => {
  if (fs.existsSync(path.join(process.cwd(), file))) {
    console.log(`   ✅ ${file}`);
    success++;
  } else {
    warnings.push(`ℹ️  ${file} not found (optional but helpful)`);
  }
});

// Check 5: Dashboard integration
console.log("\n5. Checking dashboard integration...");
const dashboardPath = path.join(
  process.cwd(),
  "src/app/(dashboard)/dashboard/dashboard-client.jsx",
);
if (fs.existsSync(dashboardPath)) {
  const dashboardContent = fs.readFileSync(dashboardPath, "utf-8");
  if (dashboardContent.includes("ChatbotPanel")) {
    console.log("   ✅ ChatbotPanel integrated in dashboard");
    success++;
  } else {
    warnings.push("⚠️  ChatbotPanel may not be integrated in dashboard");
  }
} else {
  warnings.push("ℹ️  Dashboard file not in expected location");
}

// Results
console.log("\n" + "=".repeat(50));
console.log("\n📊 VERIFICATION RESULTS\n");

if (errors.length > 0) {
  console.log("❌ ERRORS (Must Fix):");
  errors.forEach((err) => console.log("   " + err));
  console.log("");
}

if (warnings.length > 0) {
  console.log("⚠️  WARNINGS (Review):");
  warnings.forEach((warn) => console.log("   " + warn));
  console.log("");
}

console.log(`✅ Checks Passed: ${success}`);
console.log(`❌ Errors Found: ${errors.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);

// Recommendation
console.log("\n" + "=".repeat(50));
if (errors.length === 0) {
  console.log("\n🎉 All checks passed! Your AI setup looks good.\n");
  console.log("📝 Next Steps:");
  console.log("   1. Start dev server: npm run dev");
  console.log("   2. Go to dashboard");
  console.log("   3. Click ✨ button at bottom right");
  console.log("   4. Start chatting with AI!\n");
  process.exit(0);
} else {
  console.log("\n⚠️  Please fix the errors above before using AI features.\n");
  console.log("📝 Quick Fix Guide:");
  console.log("   1. API Key Issue?");
  console.log("      → Get key: https://aistudio.google.com/app/apikey");
  console.log("      → Add to .env.local: GEMINI_API_KEY=YOUR_KEY");
  console.log("");
  console.log("   2. Package Missing?");
  console.log("      → Run: npm install @google/generative-ai");
  console.log("");
  console.log("   3. Files Missing?");
  console.log("      → Check files were created properly");
  console.log("      → See IMPLEMENTATION_DETAILS.md for file list\n");
  process.exit(1);
}
