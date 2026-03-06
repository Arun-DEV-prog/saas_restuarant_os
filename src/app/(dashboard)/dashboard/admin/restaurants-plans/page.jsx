"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  ChevronDown,
  Download,
  Loader2,
  Eye,
  Edit2,
  MoreVertical,
} from "lucide-react";

const PLANS = [
  { id: "all", name: "All Plans", color: "gray" },
  { id: "starter", name: "Starter Plan", color: "blue" },
  { id: "professional", name: "Professional Plan", color: "green" },
  { id: "enterprise", name: "Enterprise Plan", color: "purple" },
];

const STATUSES = [
  { id: "active", label: "Active", color: "green" },
  { id: "pending", label: "Pending", color: "yellow" },
  { id: "inactive", label: "Inactive", color: "red" },
];

export default function RestaurantPlansPage() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlan, setSelectedPlan] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        plan: selectedPlan,
        sortBy,
        page,
        limit: 20,
      });

      const res = await fetch(`/api/admin/restaurants-plans?${query}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setRestaurants(data.data);
      setPagination(data.pagination);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedPlan, sortBy, page]);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getPlanColor = (planId) => {
    const plan = PLANS.find((p) => p.id === planId);
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
      green:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      purple:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200",
    };
    return colorMap[plan?.color] || colorMap.blue;
  };

  const getStatusColor = (status) => {
    const statusObj = STATUSES.find((s) => s.id === status);
    const colorMap = {
      green:
        "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200",
      yellow:
        "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
      red: "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200",
    };
    return colorMap[statusObj?.color] || colorMap.gray;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Restaurant Plans
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage all restaurants and their subscription plans
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            {
              label: "Total Restaurants",
              value: pagination?.total || 0,
              color: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Starter Plans",
              value: restaurants.filter((r) => r.planId === "starter").length,
              color: "bg-green-50 dark:bg-green-900/20",
            },
            {
              label: "Professional Plans",
              value: restaurants.filter((r) => r.planId === "professional")
                .length,
              color: "bg-purple-50 dark:bg-purple-900/20",
            },
            {
              label: "Enterprise Plans",
              value: restaurants.filter((r) => r.planId === "enterprise")
                .length,
              color: "bg-orange-50 dark:bg-orange-900/20",
            },
          ].map((stat, i) => (
            <div
              key={i}
              className={`${stat.color} rounded-lg p-6 border border-gray-200 dark:border-gray-700`}
            >
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                {stat.value}
              </p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by restaurant name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Plan Filter */}
            <div className="flex gap-4">
              <select
                value={selectedPlan}
                onChange={(e) => {
                  setSelectedPlan(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {PLANS.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name}
                  </option>
                ))}
              </select>

              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setPage(1);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Sort by Name</option>
                <option value="planPrice">Sort by Price</option>
                <option value="createdAt">Sort by Date</option>
              </select>

              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition">
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Restaurant
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Price
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Renewal Date
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredRestaurants.map((restaurant) => (
                    <tr
                      key={restaurant.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {restaurant.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {restaurant.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getPlanColor(
                            restaurant.planId,
                          )}`}
                        >
                          {restaurant.planName}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          ${restaurant.planPrice}/mo
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                            restaurant.planStatus,
                          )}`}
                        >
                          {restaurant.planStatus === "active"
                            ? "Active"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {restaurant.planRenewalDate
                          ? new Date(
                              restaurant.planRenewalDate,
                            ).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/admin/restaurants-plans/${restaurant.id}`}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
                          >
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </Link>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                            <Edit2 className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition">
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Page {page} of {pagination.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                  disabled={page === pagination.pages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                           hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
