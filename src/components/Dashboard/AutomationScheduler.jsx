"use client";

import { useState, useEffect } from "react";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";
import { toast } from "sonner";

export default function AutomationScheduler() {
  const [isEnabled, setIsEnabled] = useState(false);
  const [frequency, setFrequency] = useState("daily"); // daily, weekly, manual
  const [lastRun, setLastRun] = useState(null);
  const [nextRun, setNextRun] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  // Load settings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("automationSettings");
    if (saved) {
      const settings = JSON.parse(saved);
      setIsEnabled(settings.isEnabled);
      setFrequency(settings.frequency);
      if (settings.lastRun) setLastRun(new Date(settings.lastRun));
      if (settings.nextRun) setNextRun(new Date(settings.nextRun));
    }
  }, []);

  // Save settings to localStorage
  const saveSettings = (enabled, freq) => {
    const nextRunTime = calculateNextRun(freq);
    const settings = {
      isEnabled: enabled,
      frequency: freq,
      lastRun,
      nextRun: nextRunTime,
    };
    localStorage.setItem("automationSettings", JSON.stringify(settings));
    setNextRun(nextRunTime);
  };

  const calculateNextRun = (freq) => {
    const now = new Date();
    if (freq === "daily") {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(2, 0, 0, 0); // Run at 2 AM
      return tomorrow;
    } else if (freq === "weekly") {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(2, 0, 0, 0);
      return nextWeek;
    }
    return null;
  };

  const toggleAutomation = (enabled) => {
    setIsEnabled(enabled);
    saveSettings(enabled, frequency);
    toast.success(enabled ? "✅ Automation enabled" : "⏸️ Automation disabled");
  };

  const changeFrequency = (newFreq) => {
    setFrequency(newFreq);
    saveSettings(isEnabled, newFreq);
    toast.success(`📅 Schedule changed to ${newFreq}`);
  };

  const runNow = async () => {
    setIsRunning(true);
    try {
      // API to run all automations
      const automationTypes = [
        "revenueGrowth",
        "menuAnalysis",
        "staffScheduling",
        "customerRetention",
      ];

      for (const type of automationTypes) {
        try {
          const response = await fetch(`/api/ai/automation/${type}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
          });

          if (!response.ok) {
            console.error(`Failed to run ${type}`);
          }
        } catch (error) {
          console.error(`Error running ${type}:`, error);
        }

        // Add delay between requests
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      setLastRun(new Date());
      const settings = JSON.parse(
        localStorage.getItem("automationSettings") || "{}",
      );
      settings.lastRun = new Date().toISOString();
      localStorage.setItem("automationSettings", JSON.stringify(settings));

      toast.success("✅ All automations completed!");
    } catch (error) {
      console.error("Automation error:", error);
      toast.error("❌ Error running automations");
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-700 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Clock className="w-6 h-6 text-blue-600" />
          <h3 className="text-lg font-semibold">Automation Scheduler</h3>
        </div>
        <button
          onClick={() => toggleAutomation(!isEnabled)}
          className={`px-4 py-2 rounded-lg font-medium transition ${
            isEnabled
              ? "bg-green-100 text-green-700 hover:bg-green-200"
              : "bg-gray-200 text-gray-600 hover:bg-gray-300"
          }`}
        >
          {isEnabled ? "✅ Enabled" : "Disabled"}
        </button>
      </div>

      <div className="space-y-4">
        {/* Frequency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Run Frequency
          </label>
          <div className="flex gap-2">
            {[
              { value: "manual", label: "Manual" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => changeFrequency(option.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  frequency === option.value
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Run Now Button */}
        <button
          onClick={runNow}
          disabled={isRunning}
          className={`w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition ${
            isRunning
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
          }`}
        >
          <Play className="w-5 h-5" />
          {isRunning ? "Running All Automations..." : "Run All Automations Now"}
        </button>

        {/* Schedule Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 dark:bg-slate-800 rounded p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Last Run</p>
            <p className="font-medium">
              {lastRun ? lastRun.toLocaleString() : "Never"}
            </p>
          </div>
          <div className="bg-gray-50 dark:bg-slate-800 rounded p-3">
            <p className="text-gray-600 dark:text-gray-400 text-xs">Next Run</p>
            <p className="font-medium">
              {nextRun && isEnabled
                ? nextRun.toLocaleString()
                : "Not scheduled"}
            </p>
          </div>
        </div>

        {/* Automation Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            What Gets Automated
          </label>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
            <div>✅ Revenue Growth Analysis</div>
            <div>✅ Menu Optimization</div>
            <div>✅ Staff Scheduling</div>
            <div>✅ Customer Retention</div>
          </div>
        </div>
      </div>
    </div>
  );
}
