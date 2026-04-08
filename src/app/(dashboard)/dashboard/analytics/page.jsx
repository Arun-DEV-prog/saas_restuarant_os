"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Calendar,
  Package,
} from "lucide-react";
import { toast } from "sonner";

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [dateRange, setDateRange] = useState("30");

  useEffect(() => {
    fetchRestaurant();
  }, []);

  const fetchRestaurant = async () => {
    try {
      const res = await fetch("/api/restaurants");
      const data = await res.json();
      if (data.restaurants?.length > 0) {
        const restaurant = data.restaurants[0];
        setRestaurantId(restaurant._id);
        fetchAnalytics(restaurant._id);
      }
    } catch (error) {
      toast.error("Failed to load restaurant");
    }
  };

  const fetchAnalytics = async (id) => {
    try {
      const res = await fetch(`/api/restaurants/${id}/analytics`);
      const data = await res.json();

      if (data) {
        setAnalytics(data);
      } else {
        // Mock data if API doesn't exist
        const mockOrders = [
          {
            _id: "1",
            orderNumber: "ORD-001",
            total: 45.99,
            createdAt: new Date(),
            status: "completed",
          },
          {
            _id: "2",
            orderNumber: "ORD-002",
            total: 32.5,
            createdAt: new Date(Date.now() - 86400000),
            status: "completed",
          },
        ];

        setAnalytics({
          totalOrders: mockOrders.length,
          totalRevenue: mockOrders.reduce((sum, order) => sum + order.total, 0),
          totalCustomers: Math.floor(mockOrders.length * 0.8),
          averageOrderValue:
            mockOrders.reduce((sum, order) => sum + order.total, 0) /
            mockOrders.length,
          recentOrders: mockOrders,
        });
      }

      setLoading(false);
    } catch (error) {
      toast.error("Failed to load analytics");
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, label, value, theme = "primary" }) => {
    const themes = {
      primary: "bg-gradient-to-br from-blue-500 to-blue-600",
      success: "bg-gradient-to-br from-green-500 to-green-600",
      warning: "bg-gradient-to-br from-orange-500 to-orange-600",
      danger: "bg-gradient-to-br from-red-500 to-red-600",
    };

    return (
      <div className={`${themes[theme]} rounded-lg shadow-lg p-6 text-white`}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm opacity-90 mb-2">{label}</p>
            <p className="text-3xl font-bold">{value}</p>
          </div>
          <Icon className="w-10 h-10 opacity-50" />
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
            <p className="text-gray-600 mt-2">
              Monitor your restaurant performance
            </p>
          </div>
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
              <option value="365">Last Year</option>
            </select>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={ShoppingCart}
            label="Total Orders"
            value={analytics.totalOrders}
            theme="primary"
          />
          <StatCard
            icon={DollarSign}
            label="Total Revenue"
            value={`$${analytics.totalRevenue.toFixed(2)}`}
            theme="success"
          />
          <StatCard
            icon={Users}
            label="Total Customers"
            value={analytics.totalCustomers}
            theme="warning"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Order Value"
            value={`$${analytics.averageOrderValue.toFixed(2)}`}
            theme="danger"
          />
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-2 mb-6">
            <Calendar className="w-6 h-6 text-orange-600" />
            <h2 className="text-2xl font-bold text-gray-900">Recent Orders</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Order #
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-900">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right font-semibold text-gray-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {analytics.recentOrders?.length > 0 ? (
                  analytics.recentOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        ${Number(order.total).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button className="text-blue-600 hover:underline text-sm">
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-4 py-8 text-center text-gray-600"
                    >
                      No orders found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
