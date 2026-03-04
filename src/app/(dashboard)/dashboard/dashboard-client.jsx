"use client";

import { useState, useEffect } from "react";

import StatCard from "@/components/Dashboard/stat-card";
import { toast } from "sonner";
import { Copy, QrCode, ShoppingBag, Zap } from "lucide-react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useSocket } from "@/hooks/useSocket";
import { playOrderSound, playHotActionSound } from "@/hooks/useNotifications";

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
      <div className="bg-white dark:bg-[#091f3c] rounded-xl p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold">Date Range</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => handleTimeRangeChange("day")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "day"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-[#0a1020] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Last 24 Hours
            </button>
            <button
              onClick={() => handleTimeRangeChange("week")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "week"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-[#0a1020] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Last 7 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange("month")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "month"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-[#0a1020] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Last 30 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange("custom")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeRange === "custom"
                  ? "bg-emerald-500 text-white"
                  : "bg-gray-100 dark:bg-[#0a1020] text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              Custom Date Range
            </button>
          </div>

          {timeRange === "custom" && (
            <div className="flex gap-4 mt-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-[#0a1020] dark:border-gray-600"
                placeholder="Start Date"
              />
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-[#0a1020] dark:border-gray-600"
                placeholder="End Date"
              />
            </div>
          )}

          <p className="text-sm text-gray-500">
            Viewing data from:{" "}
            <span className="font-semibold">{getDateRangeDisplay()}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Orders"
          value={loading ? "..." : stats.totalOrders}
          icon="🛒"
          bg="bg-[#0b1f3b]"
        />
        <StatCard
          title="Revenue"
          value={loading ? "..." : `$${stats.totalRevenue.toFixed(2)}`}
          icon="💰"
          bg="bg-emerald-500"
        />
        <StatCard
          title="Customers"
          value={loading ? "..." : stats.customersCount}
          icon="👥"
          bg="bg-[#0b1f3b]"
        />
        <StatCard
          title="QR Scans"
          value={loading ? "..." : qrScans}
          icon="📱"
          bg="bg-[#f7f3df] text-black"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#091f3c] rounded-xl p-6 shadow-sm h-[300px] flex flex-col">
          <h3 className="text-lg font-semibold mb-4">Orders by Date</h3>
          <p className="text-sm text-gray-500 mb-3">
            Click on a date to view details
          </p>
          {loading ? (
            <div className="flex items-center justify-center flex-1">
              Loading...
            </div>
          ) : chartData.length > 0 ? (
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Date</th>
                    <th className="text-right">Orders</th>
                    <th className="text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {chartData.map((data) => (
                    <tr
                      key={data._id}
                      onClick={() => handleDateClick(data)}
                      className="border-b hover:bg-emerald-50 dark:hover:bg-[#0a3020] cursor-pointer transition"
                    >
                      <td>{data._id}</td>
                      <td className="text-right">{data.orderCount}</td>
                      <td className="text-right">${data.revenue.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex items-center justify-center flex-1">
              No orders found in this date range
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-[#091f3c] rounded-xl p-6 shadow-sm h-[300px] flex flex-col items-center justify-center">
          <div className="text-center">
            <div className="text-5xl font-bold text-emerald-500 mb-2">
              {loading ? "..." : qrScans}
            </div>
            <p className="text-gray-500">Total QR Scans</p>
            <p className="text-sm text-gray-400 mt-2">
              Unique menu views via QR code
            </p>
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
    </div>
  );
}
