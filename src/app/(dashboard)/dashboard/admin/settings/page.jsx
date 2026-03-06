"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  Upload,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({});
  const [newPricing, setNewPricing] = useState({
    name: "",
    price: "",
    features: "",
  });

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

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (!res.ok) throw new Error("Upload failed");

      const { url } = await res.json();
      setFormData((prev) => ({
        ...prev,
        platformLogo: url,
      }));

      toast.success("Logo uploaded successfully");
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setUploading(false);
    }
  };

  const handleAddPricing = () => {
    if (!newPricing.name || !newPricing.price) {
      toast.error("Please fill in plan name and price");
      return;
    }

    const pricingPlans = formData.pricingPlans || [];
    const updatedPlans = [
      ...pricingPlans,
      {
        id: Date.now(),
        name: newPricing.name,
        price: parseFloat(newPricing.price),
        features: newPricing.features.split(",").map((f) => f.trim()),
      },
    ];

    setFormData((prev) => ({
      ...prev,
      pricingPlans: updatedPlans,
    }));

    setNewPricing({ name: "", price: "", features: "" });
    toast.success("Pricing plan added");
  };

  const handleRemovePricing = (id) => {
    setFormData((prev) => ({
      ...prev,
      pricingPlans: prev.pricingPlans?.filter((p) => p.id !== id) || [],
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

                {/* Platform Logo */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Platform Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition">
                        <div className="flex items-center gap-2">
                          <Upload
                            size={18}
                            className="text-gray-600 dark:text-gray-400"
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {uploading
                              ? "Uploading..."
                              : "Click to upload logo"}
                          </span>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.platformLogo && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 dark:border-slate-600">
                        <img
                          src={formData.platformLogo}
                          alt="Platform logo"
                          className="w-full h-full object-cover"
                        />
                        <button
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              platformLogo: "",
                            }))
                          }
                          className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded hover:bg-red-600"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Custom Pricing Plans */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                Custom Pricing Plans
              </h2>

              <div className="space-y-4">
                {/* Add New Plan */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-4">
                    Add a new pricing plan for restaurants to purchase
                  </p>
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Plan name (e.g., Pro, Enterprise)"
                        value={newPricing.name}
                        onChange={(e) =>
                          setNewPricing((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Monthly price ($)"
                        value={newPricing.price}
                        onChange={(e) =>
                          setNewPricing((prev) => ({
                            ...prev,
                            price: e.target.value,
                          }))
                        }
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Features (comma-separated)"
                        value={newPricing.features}
                        onChange={(e) =>
                          setNewPricing((prev) => ({
                            ...prev,
                            features: e.target.value,
                          }))
                        }
                        rows={2}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleAddPricing}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      <Plus size={18} />
                      Add Plan
                    </button>
                  </div>
                </div>

                {/* Existing Plans */}
                {formData.pricingPlans && formData.pricingPlans.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Active Plans ({formData.pricingPlans.length})
                    </p>
                    {formData.pricingPlans.map((plan) => (
                      <div
                        key={plan.id}
                        className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 flex items-start justify-between"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                              {plan.name}
                            </h3>
                            <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                              ${plan.price}/mo
                            </span>
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400">
                            Features:{" "}
                            {plan.features?.join(", ") || "No features"}
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemovePricing(plan.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-center text-gray-600 dark:text-gray-400">
                    No pricing plans added yet
                  </div>
                )}
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
