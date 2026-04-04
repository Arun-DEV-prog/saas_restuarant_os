"use client";

import { useState } from "react";
import { Sparkles, MessageCircle, Zap } from "lucide-react";
import ChatbotPanel from "@/components/ChatbotPanel";
import EnhancedAutomationDashboard from "@/components/Dashboard/EnhancedAutomationDashboard";

export default function AIDashboard() {
  const [activeTab, setActiveTab] = useState("automation");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              AI Assistant Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Automate & optimize your restaurant with AI
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setActiveTab("automation")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "automation"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
          }`}
        >
          <Zap className="w-4 h-4" />
          Automation Hub
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 ${
            activeTab === "chat"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chatbot
        </button>
      </div>

      {/* Content */}
      <div>
        {activeTab === "automation" ? (
          <EnhancedAutomationDashboard />
        ) : (
          <div className="bg-white dark:bg-[#091f3c] rounded-lg p-8 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              The chatbot is always available as a floating button on your
              dashboard. Click the sparkle icon at the bottom right to open it
              anytime!
            </p>
            <div className="inline-block p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
                ✨ Pro Tip: Use the chatbot for quick questions about
                recommendations
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Info Card */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
          <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">
            🤖 AI Capabilities
          </h3>
          <p className="text-sm text-blue-800 dark:text-blue-200">
            Smart analysis of your operations, menu, staff, and customers. Get
            instant insights and recommendations.
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-purple-900 dark:text-purple-300 mb-2">
            ⚡ Automation
          </h3>
          <p className="text-sm text-purple-800 dark:text-purple-200">
            Automated daily insights, weekly analysis, and monthly strategy
            reports. Save time and stay ahead.
          </p>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-6 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <h3 className="font-semibold text-emerald-900 dark:text-emerald-300 mb-2">
            💡 Growth
          </h3>
          <p className="text-sm text-emerald-800 dark:text-emerald-200">
            Data-driven recommendations to increase revenue, efficiency, and
            customer satisfaction.
          </p>
        </div>
      </div>

      {/* Getting Started */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-8">
        <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>→ Run a Revenue Growth analysis</li>
              <li>→ Analyze your menu performance</li>
              <li>→ Get staff scheduling tips</li>
              <li>→ Plan customer retention</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Tips for Success</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>✓ Run analyses regularly (weekly recommended)</li>
              <li>✓ Implement recommendations systematically</li>
              <li>✓ Track metrics to measure impact</li>
              <li>✓ Use chatbot for follow-up questions</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
