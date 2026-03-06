"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CreditCard,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

// ══════════════════════════════════════════════════════════════════════════════
// BILLING SUBSCRIPTIONS TAB
// ══════════════════════════════════════════════════════════════════════════════
function BillingSubscriptionsTab() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/admin/subscriptions");
      if (!res.ok) throw new Error("Failed to fetch subscriptions");

      const data = await res.json();
      setSubscriptions(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      console.error("Error fetching subscriptions:", error);
      setError(error.message);
      toast.error("Failed to load subscriptions");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "emerald";
      case "pending":
        return "amber";
      case "canceled":
      case "expired":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusBadgeClass = (status) => {
    const colors = {
      active:
        "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300",
      pending:
        "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300",
      canceled: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300",
      expired: "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300",
      default:
        "bg-gray-50 dark:bg-gray-950/30 text-gray-700 dark:text-gray-300",
    };
    return colors[status] || colors.default;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Loading subscriptions...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg">
        <p className="text-red-800 dark:text-red-200">{error}</p>
        <button
          onClick={fetchSubscriptions}
          className="mt-2 text-sm text-red-600 dark:text-red-400 underline hover:no-underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {subscriptions.length === 0 ? (
        <div className="p-6 text-center bg-gray-50 dark:bg-white/5 rounded-lg border border-gray-200 dark:border-white/10">
          <CreditCard size={32} className="mx-auto mb-2 text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">
            No subscriptions found
          </p>
        </div>
      ) : (
        subscriptions.map((subscription) => (
          <div
            key={subscription._id}
            className="p-4 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:shadow-md transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subscription.restaurantName}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Restaurant ID: {subscription.restaurantId}
                </p>
              </div>
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full capitalize ${getStatusBadgeClass(subscription.status)}`}
              >
                {subscription.status}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                  Plan
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {subscription.planName}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                  Price
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  ${subscription.planId?.price || subscription.price || "0"}/mo
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                  Start Date
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(subscription.startDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-medium">
                  Renewal
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {new Date(subscription.renewalDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.endDate && subscription.status === "canceled" && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/50">
                <p className="text-xs text-red-700 dark:text-red-300">
                  Ended on{" "}
                  <span className="font-semibold">
                    {new Date(subscription.endDate).toLocaleDateString()}
                  </span>
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/settings");
      if (!res.ok) throw new Error("Failed to load settings");

      const data = await res.json();
      setSettings(data.settings);
      setFormData(data.settings);
    } catch (error) {
      console.error("Error loading settings:", error);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      setSaving(true);
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save settings");

      toast.success("Settings saved successfully");
      loadSettings();
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFeatureChange = (feature) => {
    setFormData((prev) => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: !prev.features?.[feature],
      },
    }));
  };

  if (loading) {
    return (
      <ProtectedAdminRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <DashboardHeader />
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">
                Loading settings...
              </p>
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    );
  }

  return (
    <ProtectedAdminRoute requiredRole="owner">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Settings size={32} className="text-blue-600" />
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
                System Settings
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Configure platform-wide settings
            </p>
          </div>

          {/* Warning */}
          <div className="mb-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-900/50 rounded-lg flex gap-3">
            <AlertCircle
              size={20}
              className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-medium text-amber-800 dark:text-amber-200">
                Changes to these settings affect all restaurants on the platform
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                Only project owners can modify these settings
              </p>
            </div>
          </div>

          {/* Settings Form */}
          <div className="space-y-6">
            {/* Platform Information */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Platform Information
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Name
                  </label>
                  <input
                    type="text"
                    name="platformName"
                    value={formData.platformName || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Support Email
                  </label>
                  <input
                    type="email"
                    name="platformEmail"
                    value={formData.platformEmail || ""}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Platform Features */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Features
              </h2>

              <div className="space-y-4">
                {[
                  {
                    id: "orders",
                    label: "Orders System",
                    description: "Allow restaurants to receive orders",
                  },
                  {
                    id: "tables",
                    label: "Table Management",
                    description: "Allow table management and QR codes",
                  },
                  {
                    id: "qrCode",
                    label: "QR Code Generation",
                    description: "Generate and scan QR codes",
                  },
                  {
                    id: "notifications",
                    label: "Notifications",
                    description: "Real-time notifications and alerts",
                  },
                ].map((feature) => (
                  <div
                    key={feature.id}
                    className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                  >
                    <input
                      type="checkbox"
                      id={feature.id}
                      checked={formData.features?.[feature.id] !== false}
                      onChange={() => handleFeatureChange(feature.id)}
                      className="mt-1 w-5 h-5 text-blue-600 rounded"
                    />
                    <div className="flex-1">
                      <label
                        htmlFor={feature.id}
                        className="block text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                      >
                        {feature.label}
                      </label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Platform Status */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Platform Status
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Registration
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Allow new restaurants to register
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="enableRegistration"
                    checked={formData.enableRegistration !== false}
                    onChange={handleChange}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <div>
                    <p className="font-medium text-red-900 dark:text-red-200">
                      Maintenance Mode
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-300">
                      Show maintenance message to all users
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={formData.maintenanceMode === true}
                    onChange={handleChange}
                    className="w-5 h-5 text-red-600 rounded"
                  />
                </div>
              </div>
            </div>

            {/* Billing & Subscriptions */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <CreditCard size={24} className="text-blue-600" />
                Billing & Subscriptions
              </h2>
              <BillingSubscriptionsTab />
            </div>

            {/* Save Button */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={loadSettings}
                className="flex items-center gap-2 px-6 py-2 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-gray-700 dark:text-gray-300"
              >
                <RefreshCw size={18} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                <Save size={18} />
                {saving ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
