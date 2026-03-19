"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import {
  CreditCard,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

const INTEGRATIONS = [
  {
    id: "stripe",
    name: "Stripe",
    description: "Accept payments and manage payouts securely",
    icon: "💳",
    connected: false,
    category: "Payments",
    setupUrl: "/api/stripe/connect",
  },
  {
    id: "email",
    name: "Email Notifications",
    description: "Receive order and customer notifications via email",
    icon: "📧",
    connected: true,
    category: "Communications",
  },
  {
    id: "sms",
    name: "SMS Alerts",
    description: "Get instant SMS notifications for orders",
    icon: "📱",
    connected: false,
    category: "Communications",
  },
  {
    id: "google",
    name: "Google Analytics",
    description: "Track customer behavior and analyze sales data",
    icon: "📊",
    connected: false,
    category: "Analytics",
  },
  {
    id: "facebook",
    name: "Facebook Integration",
    description: "Sync menu and take orders directly from Facebook",
    icon: "👍",
    connected: false,
    category: "Social Media",
  },
];

export default function IntegrationsPage() {
  const params = useParams();
  const restaurantId = params?.restaurantId;
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = ["All", ...new Set(INTEGRATIONS.map((i) => i.category))];
  const filteredIntegrations =
    activeCategory === "All"
      ? integrations
      : integrations.filter((i) => i.category === activeCategory);

  const handleStripeConnect = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch (err) {
      console.error("Stripe connection error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = (integrationId) => {
    if (integrationId === "stripe") {
      handleStripeConnect();
    } else {
      alert(`${integrationId} integration coming soon!`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Integrations
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Connect third-party services to enhance your restaurant operations
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex flex-wrap gap-3">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeCategory === category
                  ? "bg-emerald-500 text-white shadow-lg"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Integrations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIntegrations.map((integration) => (
            <div
              key={integration.id}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-lg transition p-6 flex flex-col"
            >
              {/* Icon and Name */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-4xl mb-3">{integration.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {integration.name}
                  </h3>
                </div>
                {integration.connected && (
                  <div className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full p-1">
                    <Check size={20} />
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 flex-1">
                {integration.description}
              </p>

              {/* Category Badge */}
              <div className="mb-4">
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                  {integration.category}
                </span>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleConnect(integration.id)}
                disabled={loading && integration.id === "stripe"}
                className={`w-full py-2.5 rounded-lg font-medium transition flex items-center justify-center gap-2 ${
                  integration.connected
                    ? "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 cursor-default"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white"
                }`}
              >
                {loading && integration.id === "stripe" ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Connecting...
                  </>
                ) : integration.connected ? (
                  <>
                    <Check size={16} />
                    Connected
                  </>
                ) : (
                  <>
                    <ExternalLink size={16} />
                    Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Info Banner */}
        <div className="mt-12 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 flex gap-4">
          <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Need More Integrations?
            </h3>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              We&apos;re constantly adding new integrations. Contact support to
              request a specific integration for your restaurant.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
