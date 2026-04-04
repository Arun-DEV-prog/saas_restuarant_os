"use client";

import { useState, useEffect } from "react";
import {
  Loader,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
  Calendar,
  Zap,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import AutomationScheduler from "./AutomationScheduler";

export default function EnhancedAutomationDashboard() {
  const [activeTab, setActiveTab] = useState("scheduler");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);

  const automationTypes = [
    {
      id: "revenueGrowth",
      name: "💰 Revenue Growth",
      icon: TrendingUp,
      description: "5 strategies to increase revenue in 30 days",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "menuAnalysis",
      name: "🍽️ Menu Optimization",
      icon: Utensils,
      description: "Analyze pricing, profitability & popularity",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "staffScheduling",
      name: "📅 Staff Scheduling",
      icon: Calendar,
      description: "Optimal staffing for peak & off-peak hours",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "customerRetention",
      name: "👥 Customer Retention",
      icon: Users,
      description: "Loyalty program & engagement strategies",
      color: "from-purple-500 to-pink-600",
    },
  ];

  // Load saved reports
  useEffect(() => {
    const saved = localStorage.getItem("automationReports");
    if (saved) {
      setReports(JSON.parse(saved));
    }
  }, []);

  const runAutomation = async (automationType) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ai/automation/${automationType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error(`Failed to run ${automationType}`);
      }

      const data = await response.json();

      // Save report
      const updatedReports = {
        ...reports,
        [automationType]: {
          analysis: data.analysis,
          timestamp: new Date().toISOString(),
        },
      };

      setReports(updatedReports);
      localStorage.setItem("automationReports", JSON.stringify(updatedReports));

      toast.success(`✅ ${automationType} analysis completed!`);
    } catch (error) {
      console.error("Automation error:", error);
      toast.error(`❌ Error running ${automationType}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          🤖 AI Automation Hub
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Automate restaurant analytics and get AI-powered insights
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 dark:border-slate-700">
        {[
          { id: "scheduler", label: "⏰ Scheduler" },
          { id: "analyses", label: "📊 Analyses" },
          { id: "reports", label: "📈 Reports" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-medium transition border-b-2 ${
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900 dark:text-gray-400"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Scheduler Tab */}
      {activeTab === "scheduler" && (
        <div className="space-y-6">
          <AutomationScheduler />

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex gap-3">
              <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900 dark:text-blue-100">
                <p className="font-semibold">💡 Pro Tip:</p>
                <p>
                  Enable daily automation to get fresh insights every morning at
                  2 AM. No action needed!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Analyses Tab */}
      {activeTab === "analyses" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {automationTypes.map((automation) => {
            const Icon = automation.icon;
            const report = reports[automation.id];

            return (
              <div
                key={automation.id}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-lg transition"
              >
                <div
                  className={`bg-gradient-to-r ${automation.color} p-6 text-white`}
                >
                  <Icon className="w-8 h-8 mb-2" />
                  <h3 className="font-bold text-lg">{automation.name}</h3>
                  <p className="text-sm opacity-90">{automation.description}</p>
                </div>

                <div className="p-4">
                  {report ? (
                    <div className="space-y-3">
                      <div className="text-xs text-gray-500">
                        Last updated:{" "}
                        {new Date(report.timestamp).toLocaleString()}
                      </div>
                      <div className="bg-gray-50 dark:bg-slate-800 rounded p-2 text-sm text-gray-700 dark:text-gray-300 max-h-32 overflow-y-auto">
                        {report.analysis.substring(0, 200)}...
                      </div>
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View Full Report →
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-sm mb-3">
                      No analysis yet
                    </p>
                  )}

                  <button
                    onClick={() => runAutomation(automation.id)}
                    disabled={loading}
                    className="w-full mt-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium transition flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Run Analysis
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reports Tab */}
      {activeTab === "reports" && (
        <div className="space-y-4">
          {Object.entries(reports).length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-lg">
              <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400">
                No reports yet. Run an analysis to get started!
              </p>
            </div>
          ) : (
            Object.entries(reports).map(([type, data]) => (
              <div
                key={type}
                className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6"
              >
                <h3 className="font-bold text-lg mb-2">
                  {automationTypes.find((a) => a.id === type)?.name}
                </h3>
                <p className="text-xs text-gray-500 mb-3">
                  {new Date(data.timestamp).toLocaleString()}
                </p>
                <div className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                  {data.analysis}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="sticky top-0 bg-gray-50 dark:bg-slate-800 p-4 border-b dark:border-slate-700 flex justify-between items-center">
              <h2 className="font-bold text-lg">Full Report</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <div className="p-6 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {selectedReport.analysis}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
