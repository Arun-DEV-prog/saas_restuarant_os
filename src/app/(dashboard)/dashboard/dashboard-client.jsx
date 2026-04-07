"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import StatCard from "@/components/Dashboard/stat-card";
import { toast } from "sonner";
import {
  Copy,
  QrCode,
  ShoppingBag,
  Zap,
  TrendingUp,
  Calendar,
} from "lucide-react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useSocket } from "@/hooks/useSocket";
import { playOrderSound, playHotActionSound } from "@/hooks/useNotifications";
import ChatbotPanel from "@/components/ChatbotPanel";

export default function DashboardClient({ restaurant, user }) {
  const [showQR, setShowQR] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    customersCount: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [qrScans, setQrScans] = useState(0);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("week");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedDate, setSelectedDate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Socket connection for real-time order notifications
  const { socket, isConnected } = useSocket(restaurant?._id);

  const getDateRange = (range) => {
    const end = new Date();
    const start = new Date();

    switch (range) {
      case "day":
        start.setDate(end.getDate() - 1);
        break;
      case "week":
        start.setDate(end.getDate() - 7);
        break;
      case "month":
        start.setDate(end.getDate() - 30);
        break;
      default:
        start.setDate(end.getDate() - 7);
    }

    return {
      start: start.toISOString().split("T")[0],
      end: end.toISOString().split("T")[0],
    };
  };

  const fetchDashboardData = async (start, end) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.append("startDate", start);
      if (end) params.append("endDate", end);

      const queryString = params.toString();
      const [statsRes, chartRes, qrRes] = await Promise.all([
        fetch(
          `/api/me/restaurant/stats${queryString ? "?" + queryString : ""}`,
        ),
        fetch(
          `/api/me/restaurant/chart-data${queryString ? "?" + queryString : ""}`,
        ),
        fetch(
          `/api/me/restaurant/qr-scans${queryString ? "?" + queryString : ""}`,
        ),
      ]);

      if (!statsRes.ok || !chartRes.ok || !qrRes.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsRes.json();
      const chartDataArr = await chartRes.json();
      const qrData = await qrRes.json();

      setStats(statsData);
      setChartData(chartDataArr);
      setQrScans(qrData.qrScans);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (timeRange === "custom" && (!startDate || !endDate)) {
      return;
    }

    if (timeRange === "custom") {
      fetchDashboardData(startDate, endDate);
    } else {
      const { start, end } = getDateRange(timeRange);
      fetchDashboardData(start, end);
    }
  }, [timeRange, startDate, endDate]);

  // Listen for new orders via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewOrder = (orderData) => {
      console.log("📦 New order received:", orderData);

      // Play notification sound
      try {
        playOrderSound();
      } catch (error) {
        console.error("Error playing order sound:", error);
      }

      // Show floating toast notification
      const itemCount = orderData.items?.length || 0;
      const amount = orderData.totalAmount || orderData.total || 0;

      toast.success(
        (t) => (
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center flex-shrink-0">
              <ShoppingBag
                size={20}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-white">
                New Order!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {itemCount} item{itemCount !== 1 ? "s" : ""} · $
                {Number(amount).toFixed(2)}
              </p>
            </div>
          </div>
        ),
        {
          duration: 5000,
          position: "top-right",
        },
      );

      // Refresh dashboard data to update stats
      const { start, end } = getDateRange(timeRange);
      fetchDashboardData(start, end);
    };

    socket.on("new-order", handleNewOrder);

    return () => {
      socket.off("new-order", handleNewOrder);
    };
  }, [socket, isConnected, timeRange, startDate, endDate]);

  // Listen for hot actions (table requests) via socket
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleHotAction = (actionData) => {
      console.log("⚡ Hot action received:", actionData);

      // Play urgent notification sound
      try {
        playHotActionSound();
      } catch (error) {
        console.error("Error playing hot action sound:", error);
      }

      // Determine hot action type
      const actionType = actionData.subType || actionData.type || "Alert";
      let message = "Table Alert!";
      let emoji = "📣";

      if (actionType.includes("bill") || actionType === "bill_request") {
        message = "Bill Request";
        emoji = "🧾";
      } else if (
        actionType.includes("waiter") ||
        actionType === "waiter_request"
      ) {
        message = "Waiter Needed";
        emoji = "🙋";
      }

      const tableNumber =
        actionData.tableNumber || actionData.table || "Unknown";

      // Show floating toast notification with urgent styling
      toast(
        (t) => (
          <div className="flex items-center gap-3 w-full">
            <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center flex-shrink-0 animate-pulse">
              <Zap size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 dark:text-white">
                {emoji} {message}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Table {tableNumber}
              </p>
            </div>
          </div>
        ),
        {
          duration: 6000,
          position: "top-right",
        },
      );
    };

    socket.on("hot-action", handleHotAction);

    return () => {
      socket.off("hot-action", handleHotAction);
    };
  }, [socket, isConnected]);

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    if (range !== "custom") {
      setStartDate("");
      setEndDate("");
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setShowDetailModal(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(restaurant.publicUrl);
    toast.success("Link copied!");
  };

  if (!restaurant) {
    return (
      <div className="p-6 text-red-500">
        Restaurant not found. Please re-login.
      </div>
    );
  }

  const getDateRangeDisplay = () => {
    if (timeRange === "custom") {
      return `${startDate} to ${endDate}`;
    }
    const { start, end } = getDateRange(timeRange);
    return `${start} to ${end}`;
  };

  if (!restaurant) {
    return (
      <div className="p-6 text-red-500">
        Restaurant not found. Please re-login.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader restaurant={restaurant} user={user} />

      {/* Date Range Filter */}
      <div className="bg-gradient-to-r from-white to-gray-50 dark:from-[#0f1f35] dark:to-[#091f3c] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Analytics Period
            </h3>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full">
            {getDateRangeDisplay()}
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: "Last 24h", value: "day" },
            { label: "Last 7 days", value: "week" },
            { label: "Last 30 days", value: "month" },
            { label: "Custom", value: "custom" },
          ].map((btn) => (
            <button
              key={btn.value}
              onClick={() => handleTimeRangeChange(btn.value)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                timeRange === btn.value
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700"
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        {timeRange === "custom" && (
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                From
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                To
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={loading ? "..." : stats.totalOrders}
          icon="🛒"
          bg="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <StatCard
          title="Total Revenue"
          value={loading ? "..." : `$${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          bg="bg-gradient-to-br from-emerald-500 to-emerald-600"
        />
        <StatCard
          title="Total Customers"
          value={loading ? "..." : stats.customersCount}
          icon="👥"
          bg="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <StatCard
          title="QR Scans"
          value={loading ? "..." : qrScans}
          icon="📱"
          bg="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Chart */}
        <div className="bg-white dark:bg-[#0f1f35] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Revenue Trend
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Daily revenue over selected period
              </p>
            </div>
            <TrendingUp
              size={20}
              className="text-emerald-600 dark:text-emerald-400"
            />
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value) => `$${Number(value).toFixed(2)}`}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                  activeDot={{ r: 6 }}
                  fill="url(#colorRevenue)"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>

        {/* Orders by Date Chart */}
        <div className="bg-white dark:bg-[#0f1f35] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Orders Summary
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Order count by date
              </p>
            </div>
            <ShoppingBag
              size={20}
              className="text-blue-600 dark:text-blue-400"
            />
          </div>

          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="text-gray-500">Loading chart...</div>
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="_id" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                />
                <Bar
                  dataKey="orderCount"
                  fill="#3b82f6"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No data available
            </div>
          )}
        </div>
      </div>

      {/* Data Table and QR Scans */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Orders Table */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0f1f35] rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Orders by Date
          </h3>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading...</div>
          ) : chartData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Orders
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Revenue
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600 dark:text-gray-400">
                      Avg Order
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((data) => (
                    <tr
                      key={data._id}
                      onClick={() => handleDateClick(data)}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {data._id}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600 dark:text-blue-400">
                        {data.orderCount}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        ${data.revenue.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-gray-600 dark:text-gray-400">
                        ${(data.revenue / data.orderCount).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-8 text-center text-gray-500">
              No orders found in this date range
            </div>
          )}
        </div>

        {/* QR Scans Card */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/10 rounded-2xl p-6 border border-orange-200 dark:border-orange-800 shadow-sm hover:shadow-md transition-shadow">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Menu Reach
          </h3>
          <div className="flex flex-col items-center justify-center py-8">
            <div className="text-6xl font-black bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent mb-3">
              {loading ? "..." : qrScans}
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-semibold text-center">
              QR Code Scans
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
              Unique public menu views
            </p>
            <div className="w-full mt-6 pt-6 border-t border-orange-200 dark:border-orange-800">
              <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                <span className="block mb-2">
                  📱 Share your menu QR code to increase reach
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Date Detail Modal */}
      {showDetailModal && selectedDate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#091f3c] rounded-2xl p-6 w-full max-w-md shadow-xl space-y-4 relative">
            <button
              onClick={() => setShowDetailModal(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold">
              Details for {selectedDate._id}
            </h2>

            <div className="space-y-3 border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Orders:
                </span>
                <span className="font-semibold text-2xl text-emerald-500">
                  {selectedDate.orderCount}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Total Revenue:
                </span>
                <span className="font-semibold text-2xl">
                  ${selectedDate.revenue.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Average Order:
                </span>
                <span className="font-semibold">
                  ${(selectedDate.revenue / selectedDate.orderCount).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowDetailModal(false)}
              className="w-full bg-emerald-500 text-white py-2 rounded-lg hover:bg-emerald-600 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQR && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5 relative">
            <button
              onClick={() => setShowQR(false)}
              className="absolute top-3 right-3 text-gray-500"
            >
              ✕
            </button>

            <h2 className="text-xl dark:bg-[#0a1020]  font-semibold text-center">
              Restaurant QR Code
            </h2>

            <img
              src={restaurant.qrCodeBase64}
              alt="QR Code"
              className="w-48 h-48 mx-auto border rounded-xl"
            />

            <div className="text-center text-sm text-gray-600 break-all">
              {restaurant.publicUrl}
            </div>

            <div className="flex gap-3">
              <a
                href={restaurant.qrCodeBase64}
                download={`${restaurant.slug}-qr.png`}
                className="flex-1 border rounded-lg py-2 text-center dark:bg-[#0a1020]  flex items-center justify-center gap-2"
              >
                ⬇ Download
              </a>

              <button
                onClick={handleCopy}
                className="flex-1 border rounded-lg py-2 flex dark:bg-[#0a1020]  items-center justify-center gap-2"
              >
                📋 Copy Link
              </button>
            </div>

            <a
              href={restaurant.publicUrl}
              target="_blank"
              className="block text-center bg-emerald-500 text-white py-2 rounded-lg mt-2 hover:bg-emerald-600"
            >
              👁 Open Menu
            </a>
          </div>
        </div>
      )}

      {/* AI Chatbot */}
      <ChatbotPanel />
    </div>
  );
}
