"use client";

import ProtectedAdminRoute from "@/components/ProtectedAdminRoute";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search,
  RefreshCw,
  Users,
  Shield,
  Clock,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

const ROLE_CONFIG = {
  owner: {
    label: "Owner",
    color:
      "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
    icon: Crown,
  },
  admin: {
    label: "Admin",
    color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
    icon: Shield,
  },
  restaurant_owner: {
    label: "Restaurant Owner",
    color:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
  },
  user: {
    label: "User",
    color: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400",
  },
};

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [updateLoading, setUpdateLoading] = useState(null);
  const [editingRole, setEditingRole] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append("search", searchTerm);
      if (roleFilter !== "all") params.append("role", roleFilter);

      const res = await fetch(`/api/admin/users/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Error loading users:", error);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }

  async function updateUserRole(userId, newRole) {
    try {
      setUpdateLoading(userId);
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update role");
      }

      toast.success("User role updated");
      setEditingRole(null);
      loadUsers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error(error.message || "Failed to update user role");
    } finally {
      setUpdateLoading(null);
    }
  }

  const filteredUsers = users.filter((user) => {
    if (searchTerm.toLowerCase()) {
      return (
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return true;
  });

  return (
    <ProtectedAdminRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader user={session?.user} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                  Users Management
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {filteredUsers.length} user
                  {filteredUsers.length !== 1 ? "s" : ""} on the platform
                </p>
              </div>
              <button
                onClick={loadUsers}
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
                  placeholder="Search by email or name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="restaurant_owner">Restaurant Owner</option>
                <option value="user">User</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">
                  Loading users...
                </p>
              </div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-xl">
              <Users
                size={48}
                className="text-gray-300 dark:text-gray-600 mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No users found
              </h3>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-gray-200 dark:border-slate-700">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        User
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Role
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                        Restaurant
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
                    {filteredUsers.map((user) => {
                      const roleConfig =
                        ROLE_CONFIG[user.role] || ROLE_CONFIG.user;
                      return (
                        <tr
                          key={user._id}
                          className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition"
                        >
                          {/* User Info */}
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">
                                {user.name || "N/A"}
                              </p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {user.email}
                              </p>
                            </div>
                          </td>

                          {/* Role */}
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${roleConfig.color}`}
                            >
                              {roleConfig.label}
                            </span>
                          </td>

                          {/* Restaurant */}
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {user.restaurant?.name || "-"}
                            </p>
                          </td>

                          {/* Joined Date */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Clock size={14} />
                              {user.createdAt
                                ? new Date(user.createdAt).toLocaleDateString()
                                : "N/A"}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4 text-right">
                            {editingRole === user._id ? (
                              <div className="flex items-center gap-2 justify-end">
                                <select
                                  defaultValue={user.role}
                                  onChange={(e) =>
                                    updateUserRole(user._id, e.target.value)
                                  }
                                  className="px-3 py-1 border border-gray-300 dark:border-slate-600 rounded text-sm bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                                >
                                  <option value="owner">Owner</option>
                                  <option value="admin">Admin</option>
                                  <option value="restaurant_owner">
                                    Restaurant Owner
                                  </option>
                                  <option value="user">User</option>
                                </select>
                                <button
                                  onClick={() => setEditingRole(null)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  ✕
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingRole(user._id)}
                                disabled={updateLoading === user._id}
                                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium disabled:opacity-50"
                              >
                                {updateLoading === user._id
                                  ? "Updating..."
                                  : "Change Role"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Stats */}
          {!loading && filteredUsers.length > 0 && (
            <div className="mt-8 bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 border border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                User Statistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {Object.entries(ROLE_CONFIG).map(([key, config]) => {
                  const count = users.filter((u) => u.role === key).length;
                  return (
                    <div
                      key={key}
                      className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg"
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {config.label}
                      </p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
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
