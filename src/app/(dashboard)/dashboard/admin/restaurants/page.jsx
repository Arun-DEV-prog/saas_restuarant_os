"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import {
  Search,
  Filter,
  ChevronRight,
  Eye,
  Toggle2,
  Trash2,
  MoreVertical,
  RefreshCw,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function AdminRestaurantsPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    loadRestaurants();
  }, []);

  async function loadRestaurants() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (statusFilter !== "all") params.append("status", statusFilter);

      console.log("📝 Loading restaurants with params:", params.toString());

      const res = await fetch(
        `/api/admin/restaurants/list?${params.toString()}`,
      );

      console.log("📊 API Response status:", res.status);

      if (!res.ok) {
        throw new Error("Failed to load restaurants");
      }

      const data = await res.json();
      console.log(
        `✅ Loaded ${data.restaurants?.length} restaurants:`,
        data.restaurants?.map((r) => r.name),
      );

      // Sort restaurants
      let sorted = [...(data.restaurants || [])];
      if (sortBy === "newest") {
        sorted.sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
        );
      } else if (sortBy === "oldest") {
        sorted.sort(
          (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
        );
      } else if (sortBy === "revenue") {
        sorted.sort((a, b) => (b.totalRevenue || 0) - (a.totalRevenue || 0));
      }

      setRestaurants(sorted);
    } catch (error) {
      console.error("Error loading restaurants:", error);
      toast.error("Failed to load restaurants");
    } finally {
      setLoading(false);
    }
  }

  const handleSeedRestaurants = async () => {
    try {
      const res = await fetch("/api/admin/restaurants/seed", {
        method: "POST",
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Created ${data.restaurants.length} sample restaurants`);
        loadRestaurants();
      } else {
        toast.error(data.error || "Failed to seed restaurants");
      }
    } catch (error) {
      console.error("Error seeding restaurants:", error);
      toast.error("Failed to seed restaurants");
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (e) => {
    setStatusFilter(e.target.value);
  };

  const handleRefresh = () => {
    loadRestaurants();
    toast.success("Restaurants refreshed");
  };

  // Filtered data based on search
  const filteredRestaurants = restaurants.filter((restaurant) => {
    if (searchTerm.toLowerCase()) {
      return (
        restaurant.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Manage Restaurants
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredRestaurants.length} restaurant
                  {filteredRestaurants.length !== 1 ? "s" : ""} on the platform
                </p>
              </div>
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={handleFilterChange}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="revenue">By Revenue</option>
              </select>
            </div>
          </div>

          {/* Restaurants Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading restaurants...
                </p>
              </div>
            </div>
          ) : filteredRestaurants.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
              <Building2
                size={48}
                className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No restaurants found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "Create your first restaurant or load sample data"}
              </p>
              {restaurants.length === 0 &&
                !searchTerm &&
                statusFilter === "all" && (
                  <button
                    onClick={handleSeedRestaurants}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    📊 Load Sample Restaurants
                  </button>
                )}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Restaurant
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Owner
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Orders
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Revenue
                      </th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Joined
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                    {filteredRestaurants.map((restaurant) => (
                      <tr
                        key={restaurant._id}
                        className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                      >
                        {/* Restaurant Name */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {restaurant.logo ? (
                              <img
                                src={restaurant.logo}
                                alt={restaurant.name}
                                className="w-10 h-10 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <Building2
                                  size={20}
                                  className="text-blue-600"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {restaurant.name}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {restaurant.slug}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Owner Email */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-300">
                            {restaurant.ownerEmail || "N/A"}
                          </p>
                        </td>

                        {/* Orders Count */}
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {restaurant.ordersCount || 0}
                          </p>
                        </td>

                        {/* Revenue */}
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                            ${(restaurant.totalRevenue || 0).toFixed(2)}
                          </p>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              restaurant.isActive
                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400"
                            }`}
                          >
                            {restaurant.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Joined Date */}
                        <td className="px-6 py-4">
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {restaurant.createdAt
                              ? new Date(
                                  restaurant.createdAt,
                                ).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/dashboard/admin/restaurants/${restaurant._id}`}
                              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="View Details"
                            >
                              <Eye
                                size={18}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            </Link>
                            <button
                              className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition"
                              title="View More"
                            >
                              <MoreVertical
                                size={18}
                                className="text-gray-600 dark:text-gray-400"
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          {!loading && filteredRestaurants.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Restaurants
                  </p>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    {filteredRestaurants.length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Active
                  </p>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {filteredRestaurants.filter((r) => r.isActive).length}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Orders
                  </p>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {filteredRestaurants.reduce(
                      (sum, r) => sum + (r.ordersCount || 0),
                      0,
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Total Revenue
                  </p>
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                    $
                    {filteredRestaurants
                      .reduce((sum, r) => sum + (r.totalRevenue || 0), 0)
                      .toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
