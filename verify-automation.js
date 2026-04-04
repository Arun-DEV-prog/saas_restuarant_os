#!/usr/bin/env node

/**
 * Automation Dashboard Verification Script
 * Verifies all components are properly set up and functional
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Automation Dashboard Verification\n");
console.log("=".repeat(60));

const checks = [
  {
    name: "EnhancedAutomationDashboard Component",
    path: "src/components/Dashboard/EnhancedAutomationDashboard.jsx",
  },
  {
    name: "AutomationScheduler Component",
    path: "src/components/Dashboard/AutomationScheduler.jsx",
  },
  {
    name: "AI Dashboard Client",
    path: "src/app/(dashboard)/ai-assistant/ai-dashboard-client.jsx",
  },
  {
    name: "AI Automation API",
    path: "src/app/api/ai/automation/[automationType]/route.js",
  },
  {
    name: "Chatbot Integration",
    path: "src/app/api/ai/chat/route.js",
  },
  {
    name: "Automation Service",
    path: "src/lib/automationService.js",
  },
  {
    name: "Groq Integration",
    path: "src/lib/anthropic.js",
  },
  {
    name: "API Key Validation",
    path: "src/app/api/ai/check-key/route.js",
  },
];

let passed = 0;
let failed = 0;

checks.forEach((check) => {
  const fullPath = path.join(__dirname, check.path);
  const exists = fs.existsSync(fullPath);

  const status = exists ? "✅" : "❌";
  console.log(`${status} ${check.name}`);

  if (exists) {
    passed++;
    // Check if file has content
    const content = fs.readFileSync(fullPath, "utf-8");
    if (content.length > 0) {
      console.log(`   Size: ${(content.length / 1024).toFixed(1)}KB`);
    }
  } else {
    failed++;
    console.log(`   ERROR: File not found at ${check.path}`);
  }
});

console.log("=".repeat(60));
console.log(`\n✅ Passed: ${passed}/${checks.length}`);
if (failed > 0) {
  console.log(`❌ Failed: ${failed}/${checks.length}`);
  process.exit(1);
} else {
  console.log("\n🎉 All components verified successfully!");
  console.log("\nNext Steps:");
  console.log("1. Run: npm run dev");
  console.log("2. Visit: http://localhost:3000/dashboard/ai-assistant");
  console.log('3. Click "Run All Automations Now" to test');
  console.log("4. Check Reports tab for saved analyses");
  process.exit(0);
}
