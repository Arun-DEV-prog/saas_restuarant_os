"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  ShoppingBag,
  DollarSign,
  Users,
  MapPin,
  Mail,
  Phone,
  RefreshCw,
  Copy,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminRestaurantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restaurantId = params.id;

  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRestaurant();
  }, [restaurantId]);

  async function loadRestaurant() {
    try {
      setLoading(true);
      console.log("📝 Loading restaurant:", restaurantId);

      const res = await fetch(`/api/admin/restaurants/${restaurantId}`);

      console.log("📊 Response status:", res.status);

      if (!res.ok) {
        const errorData = await res.json();
        console.error("❌ API Error:", errorData);
        throw new Error(errorData.error || "Failed to load restaurant");
      }

      const data = await res.json();
      console.log("✅ Restaurant loaded:", data.restaurant?.name);
      setRestaurant(data.restaurant);
    } catch (error) {
      console.error("🚨 Error loading restaurant:", error.message);
      toast.error(`Failed to load restaurant: ${error.message}`);
      router.push("/dashboard/admin/restaurants");
    } finally {
      setLoading(false);
    }
  }

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
                Loading restaurant...
              </p>
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    );
  }

  if (!restaurant) {
    return (
      <ProtectedAdminRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
          <DashboardHeader />
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-8 text-center border border-red-200 dark:border-red-900">
              <div className="text-5xl mb-4">❌</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Restaurant Not Found
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                Unable to load restaurant with ID:
              </p>
              <code className="block bg-gray-100 dark:bg-slate-900 p-3 rounded mb-6 text-sm text-gray-800 dark:text-gray-200 break-all">
                {restaurantId}
              </code>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                This restaurant doesn&apos;t exist in the database. This ID may be
                invalid or the restaurant may have been deleted.
              </p>
              <Link
                href="/dashboard/admin/restaurants"
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
              >
                <ArrowLeft size={20} />
                Back to Restaurants
              </Link>
            </div>
          </div>
        </div>
      </ProtectedAdminRoute>
    );
  }

  const stats = restaurant.stats || {};

  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard/admin/restaurants"
              className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6"
            >
              <ArrowLeft size={18} />
              Back to Restaurants
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {restaurant.logo ? (
                  <img
                    src={restaurant.logo}
                    alt={restaurant.name}
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Building2 size={32} className="text-blue-600" />
                  </div>
                )}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {restaurant.name}
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    {restaurant.slug}
                  </p>
                </div>
              </div>

              <button
                onClick={loadRestaurant}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${
                restaurant.isActive
                  ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
              }`}
            >
              {restaurant.isActive ? "✓ Active" : "○ Inactive"}
            </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <ShoppingBag size={24} className="text-emerald-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Total Orders
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.ordersCount || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <DollarSign size={24} className="text-green-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Revenue
              </p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                ${(stats.totalRevenue || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <DollarSign size={24} className="text-blue-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Avg Order Value
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                ${(stats.avgOrderValue || 0).toFixed(2)}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <Users size={24} className="text-purple-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Tables</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.tablesCount || 0}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <Building2 size={24} className="text-orange-600 mb-2" />
              <p className="text-sm text-gray-600 dark:text-gray-400">Menus</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                {stats.menusCount || 0}
              </p>
            </div>
          </div>

          {/* Restaurant Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Contact Info */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                Contact Information
              </h3>

              <div className="space-y-4">
                {/* Email */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Mail
                      size={18}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Email
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-gray-900 dark:text-white break-all">
                      {restaurant.email || "N/A"}
                    </p>
                    {restaurant.email && (
                      <button
                        onClick={() => handleCopy(restaurant.email)}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                      >
                        <Copy size={16} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Phone */}
                {restaurant.phone && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Phone
                        size={18}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Phone
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white ml-6">
                      {restaurant.phone}
                    </p>
                  </div>
                )}

                {/* Address */}
                {restaurant.address && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin
                        size={18}
                        className="text-gray-600 dark:text-gray-400"
                      />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Address
                      </span>
                    </div>
                    <p className="text-gray-900 dark:text-white ml-6">
                      {restaurant.address}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* URLs */}
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
                URLs
              </h3>

              <div className="space-y-4">
                {/* Public URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Public Menu URL
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={restaurant.publicUrl || ""}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
                    />
                    {restaurant.publicUrl && (
                      <button
                        onClick={() => handleCopy(restaurant.publicUrl)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                      >
                        <Copy size={18} className="text-gray-600" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Restaurant Slug
                  </label>
                  <input
                    type="text"
                    value={restaurant.slug || ""}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-200 dark:border-slate-700">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
              Additional Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Owner ID */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Owner ID
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={restaurant.ownerId?.toString() || ""}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm font-mono"
                  />
                  {restaurant.ownerId && (
                    <button
                      onClick={() => handleCopy(restaurant.ownerId.toString())}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                    >
                      <Copy size={16} className="text-gray-600" />
                    </button>
                  )}
                </div>
              </div>

              {/* Created Date */}
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                  Created
                </label>
                <input
                  type="text"
                  value={
                    restaurant.createdAt
                      ? new Date(restaurant.createdAt).toLocaleString()
                      : "N/A"
                  }
                  readOnly
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm"
                />
              </div>

              {/* Description */}
              {restaurant.description && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    Description
                  </label>
                  <textarea
                    value={restaurant.description}
                    readOnly
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white text-sm h-24"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
