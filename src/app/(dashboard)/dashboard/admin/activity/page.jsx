"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import {
  Activity,
  Search,
  RefreshCw,
  Filter,
  Clock,
  User,
  Shield,
  Settings,
  Database,
} from "lucide-react";
import { toast } from "sonner";

const ACTIVITY_TYPES = {
  role_change: {
    label: "Role Changed",
    icon: Shield,
    color: "text-purple-600",
  },
  user_action: { label: "User Action", icon: User, color: "text-blue-600" },
  settings_update: {
    label: "Settings Updated",
    icon: Settings,
    color: "text-orange-600",
  },
  data_change: { label: "Data Changed", icon: Database, color: "text-red-600" },
  login: { label: "Login", icon: User, color: "text-green-600" },
};

export default function AdminActivityPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    loadLogs();
  }, []);

  async function loadLogs() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append("limit", "100");
      if (typeFilter !== "all") params.append("type", typeFilter);

      const res = await fetch(`/api/admin/activity/logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load logs");

      const data = await res.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error("Error loading logs:", error);
      toast.error("Failed to load activity logs");
    } finally {
      setLoading(false);
    }
  }

  const filteredLogs = logs.filter((log) => {
    if (searchTerm.toLowerCase()) {
      return (
        log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  const getActivityColor = (type) => {
    switch (type) {
      case "role_change":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-900/50";
      case "settings_update":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-900/50";
      case "data_change":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50";
      case "login":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-900/50";
    }
  };

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
                  Activity Log
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Track admin actions and system events
                </p>
              </div>
              <button
                onClick={loadLogs}
                className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
              >
                <RefreshCw size={18} />
                Refresh
              </button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by action, type, or user ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="role_change">Role Changed</option>
                <option value="settings_update">Settings Updated</option>
                <option value="user_action">User Action</option>
                <option value="data_change">Data Changed</option>
              </select>
            </div>
          </div>

          {/* Activity Timeline */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading logs...
                </p>
              </div>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
              <Activity
                size={48}
                className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No activities found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const activityType =
                  ACTIVITY_TYPES[log.type] || ACTIVITY_TYPES.user_action;
                const IconComponent = activityType.icon;

                return (
                  <div
                    key={log._id}
                    className={`border rounded-lg p-4 transition ${getActivityColor(log.type)}`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        <div
                          className={`p-2 rounded-lg bg-white dark:bg-slate-800/50`}
                        >
                          <IconComponent
                            size={20}
                            className={activityType.color}
                          />
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {activityType.label}
                          </h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                            {log.createdAt
                              ? new Date(log.createdAt).toLocaleString()
                              : "N/A"}
                          </span>
                        </div>

                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {log.action}
                        </p>

                        {/* Details */}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          {log.userId && (
                            <span>
                              <strong>User:</strong>{" "}
                              {log.userId.substring(0, 8)}...
                            </span>
                          )}
                          {log.targetType && (
                            <span>
                              <strong>Target:</strong> {log.targetType}
                            </span>
                          )}
                          {log.ipAddress && log.ipAddress !== "unknown" && (
                            <span>
                              <strong>IP:</strong> {log.ipAddress}
                            </span>
                          )}
                        </div>

                        {/* Additional Details */}
                        {log.details && (
                          <div className="mt-2 p-2 bg-white dark:bg-slate-800/50 rounded text-xs text-gray-600 dark:text-gray-400 font-mono">
                            {typeof log.details === "object"
                              ? JSON.stringify(log.details)
                              : log.details}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Stats */}
          {!loading && logs.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Activity Summary
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(ACTIVITY_TYPES).map(([key, config]) => {
                  const count = logs.filter((l) => l.type === key).length;
                  const IconComponent = config.icon;
                  return (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <IconComponent size={16} className={config.color} />
                        <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                          {config.label}
                        </p>
                      </div>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {count}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedAdminRoute>
  );
}
