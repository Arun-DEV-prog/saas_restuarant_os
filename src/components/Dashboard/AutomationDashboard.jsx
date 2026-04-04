"use client";

import { useState, useEffect } from "react";
import {
  Loader,
  Sparkles,
  TrendingUp,
  Users,
  Utensils,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function AutomationDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const automationTypes = [
    {
      id: "revenueGrowth",
      name: "Revenue Growth",
      icon: TrendingUp,
      description: "Strategies to increase revenue",
      color: "from-green-500 to-emerald-600",
    },
    {
      id: "menuAnalysis",
      name: "Menu Analysis",
      icon: Utensils,
      description: "Optimize menu items and pricing",
      color: "from-orange-500 to-red-600",
    },
    {
      id: "staffScheduling",
      name: "Staff Scheduling",
      icon: Calendar,
      description: "Optimal staff planning",
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "customerRetention",
      name: "Customer Retention",
      icon: Users,
      description: "Keep customers coming back",
      color: "from-purple-500 to-pink-600",
    },
  ];

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch("/api/ai/automation/all");
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const runAutomation = async (type) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ai/automation/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customData: {} }),
      });

      if (!res.ok) throw new Error("Failed to run automation");

      const data = await res.json();
      setSelectedReport(data);
      toast.success(`${type} analysis completed!`);
      fetchReports();
    } catch (error) {
      console.error("Error running automation:", error);
      toast.error("Failed to run automation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6" />
          <h2 className="text-2xl font-bold">AI Automation Hub</h2>
        </div>
        <p className="text-blue-100">
          Run automated analyses to optimize your restaurant operations
        </p>
      </div>

      {/* Automation Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {automationTypes.map((type) => {
          const Icon = type.icon;
          return (
            <button
              key={type.id}
              onClick={() => runAutomation(type.id)}
              disabled={loading}
              className={`bg-gradient-to-br ${type.color} text-white p-6 rounded-lg hover:shadow-lg transition-all disabled:opacity-50 ${
                loading ? "cursor-not-allowed" : "hover:scale-105"
              }`}
            >
              <Icon className="w-8 h-8 mb-2" />
              <h3 className="font-semibold text-sm">{type.name}</h3>
              <p className="text-xs opacity-90 mt-1">{type.description}</p>
              {loading && <Loader className="w-4 h-4 animate-spin mt-2" />}
            </button>
          );
        })}
      </div>

      {/* Selected Report */}
      {selectedReport && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            Analysis Results
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 whitespace-pre-wrap max-h-96 overflow-y-auto">
            {selectedReport.analysis || "Analysis in progress..."}
          </div>
          {selectedReport.data && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-sm text-blue-900 mb-2">
                Key Metrics
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-blue-800">
                {Object.entries(selectedReport.data.stats || {}).map(
                  ([key, value]) => (
                    <div key={key} className="p-2 bg-white rounded">
                      <div className="font-semibold">{value}</div>
                      <div className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, " $1")}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent Reports */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Analyses</h3>
        {reports.length === 0 ? (
          <div className="flex items-center gap-2 text-gray-500 py-8 justify-center">
            <AlertCircle className="w-5 h-5" />
            <p>No analyses yet. Run an automation to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.slice(0, 5).map((report) => (
              <button
                key={report._id}
                onClick={() => setSelectedReport(report)}
                className="w-full text-left p-4 hover:bg-gray-50 border border-gray-200 rounded-lg transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900 capitalize">
                      {report.type.replace(/([A-Z])/g, " $1")}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(report.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    View
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="bg-amber-50 border border-amber-200 p-6 rounded-lg">
        <h4 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Tips for Best Results
        </h4>
        <ul className="text-sm text-amber-800 space-y-1 list-disc list-inside">
          <li>Run analyses regularly (weekly is recommended)</li>
          <li>Implement the recommendations systematically</li>
          <li>Track metrics to measure impact</li>
          <li>Adjust strategies based on results</li>
          <li>Use chatbot for specific questions about recommendations</li>
        </ul>
      </div>
    </div>
  );
}
