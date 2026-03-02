"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Settings,
  Users,
  MapPin,
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";

export default function TableManagementPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview', 'config', 'occupied'

  // Config form state
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [editingConfig, setEditingConfig] = useState(null);
  const [configForm, setConfigForm] = useState({
    area: "dine-in",
    capacity: 2,
    totalTables: 10,
    pricePerTable: 30,
  });

  useEffect(() => {
    loadRestaurant();
  }, []);

  useEffect(() => {
    if (restaurant?._id) {
      loadData();
    }
  }, [restaurant]);

  async function loadRestaurant() {
    try {
      const res = await fetch("/api/me/restaurant");
      if (res.ok) {
        const data = await res.json();
        setRestaurant(data);
      }
    } catch (error) {
      console.error("Error loading restaurant:", error);
    }
  }

  async function loadData() {
    try {
      setLoading(true);

      // Load configs
      const configRes = await fetch(
        `/api/admin/tables/config?restaurantId=${restaurant._id}`,
      );
      const configData = await configRes.json();
      if (configData.success) {
        setConfigs(configData.configs);
      }

      // Load tables
      const tablesRes = await fetch(
        `/api/admin/tables?restaurantId=${restaurant._id}`,
      );
      const tablesData = await tablesRes.json();
      if (tablesData.success) {
        setTables(tablesData.tables);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveConfig(e) {
    e.preventDefault();

    try {
      const response = await fetch("/api/admin/tables/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId: restaurant._id,
          areaType: configForm.area,
          capacity: configForm.capacity,
          totalTables: configForm.totalTables,
          price: configForm.pricePerTable,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert(`Configuration saved! ${data.tablesCreated} tables created.`);
        loadData();
        setShowConfigForm(false);
        setConfigForm({
          area: "dine-in",
          capacity: 2,
          totalTables: 10,
          pricePerTable: 30,
        });
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error saving configuration: " + error.message);
    }
  }

  async function releaseTable(tableId) {
    if (!confirm("Release this table?")) return;

    try {
      const response = await fetch("/api/tables/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tableId,
          restaurantId: restaurant._id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Table released successfully");
        loadData();
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      alert("Error releasing table: " + error.message);
    }
  }

  const stats = {
    total: tables.length,
    occupied: tables.filter((t) => t.isOccupied).length,
    available: tables.filter((t) => !t.isOccupied).length,
    dineIn: {
      total: tables.filter((t) => t.area === "dine-in").length,
      occupied: tables.filter((t) => t.area === "dine-in" && t.isOccupied)
        .length,
    },
    foodCourt: {
      total: tables.filter((t) => t.area === "food-court").length,
      occupied: tables.filter((t) => t.area === "food-court" && t.isOccupied)
        .length,
    },
  };

  const occupancyRate =
    stats.total > 0 ? Math.round((stats.occupied / stats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
        <DashboardHeader />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-slate-400">
              Loading tables...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <DashboardHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">
                Table Management
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {restaurant?.name}
              </p>
            </div>
            <button
              onClick={() => loadData()}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                  Total Tables
                </span>
                <Users size={20} className="text-blue-500" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-stone-100">
                {stats.total}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                  Occupied
                </span>
                <XCircle size={20} className="text-red-500" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-stone-100">
                {stats.occupied}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                  Available
                </span>
                <CheckCircle size={20} className="text-green-500" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-stone-100">
                {stats.available}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 dark:text-slate-400 text-sm font-medium">
                  Occupancy
                </span>
                <Clock size={20} className="text-orange-500" />
              </div>
              <p className="text-3xl font-black text-gray-900 dark:text-stone-100">
                {occupancyRate}%
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm mb-6">
          <div className="flex border-b border-gray-200 dark:border-slate-700">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === "overview"
                  ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("config")}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === "config"
                  ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              Configuration
            </button>
            <button
              onClick={() => setActiveTab("occupied")}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === "occupied"
                  ? "text-orange-600 dark:text-orange-400 border-b-2 border-orange-600"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}
            >
              Occupied Tables ({stats.occupied})
            </button>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Dine-In */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100 flex items-center gap-2">
                      <span>🍽️</span>
                      Dine-In Tables
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {stats.dineIn.occupied}/{stats.dineIn.total} occupied
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {tables
                      .filter((t) => t.area === "dine-in")
                      .sort((a, b) =>
                        a.tableNumber.localeCompare(b.tableNumber),
                      )
                      .map((table) => (
                        <TableCard
                          key={table._id}
                          table={table}
                          onRelease={releaseTable}
                        />
                      ))}
                  </div>
                </div>

                {/* Food Court */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100 flex items-center gap-2">
                      <span>🏪</span>
                      Food Court Tables
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-slate-400">
                      {stats.foodCourt.occupied}/{stats.foodCourt.total}{" "}
                      occupied
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    {tables
                      .filter((t) => t.area === "food-court")
                      .sort((a, b) =>
                        a.tableNumber.localeCompare(b.tableNumber),
                      )
                      .map((table) => (
                        <TableCard
                          key={table._id}
                          table={table}
                          onRelease={releaseTable}
                        />
                      ))}
                  </div>
                </div>
              </div>
            )}

            {/* Configuration Tab */}
            {activeTab === "config" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100">
                    Seating Configuration
                  </h3>
                  <button
                    onClick={() => setShowConfigForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                  >
                    <Plus size={18} />
                    Add Configuration
                  </button>
                </div>

                {/* Config Form Modal */}
                {showConfigForm && (
                  <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full">
                      <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-stone-100">
                        Add/Edit Configuration
                      </h3>

                      <form onSubmit={handleSaveConfig} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Area
                          </label>
                          <select
                            value={configForm.area}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                area: e.target.value,
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            <option value="dine-in">Dine-In</option>
                            <option value="food-court">Food Court</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Table Capacity (Persons)
                          </label>
                          <select
                            value={configForm.capacity}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                capacity: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-orange-500"
                          >
                            <option value={2}>2 Persons</option>
                            <option value={4}>4 Persons</option>
                            <option value={6}>6 Persons</option>
                            <option value={8}>8 Persons</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Total Tables
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={configForm.totalTables}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                totalTables: parseInt(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                            Price Per Table ($)
                          </label>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={configForm.pricePerTable}
                            onChange={(e) =>
                              setConfigForm({
                                ...configForm,
                                pricePerTable: parseFloat(e.target.value),
                              })
                            }
                            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-orange-500"
                          />
                        </div>

                        <div className="flex gap-3">
                          <button
                            type="button"
                            onClick={() => setShowConfigForm(false)}
                            className="flex-1 px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition text-gray-700 dark:text-slate-300"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition"
                          >
                            Save
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}

                {/* Existing Configs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {configs.map((config) => (
                    <div
                      key={config._id}
                      className="bg-gray-50 dark:bg-slate-700/40 rounded-lg p-6 border border-gray-100 dark:border-slate-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Users
                              size={18}
                              className="text-orange-600 dark:text-orange-400"
                            />
                            <h4 className="font-bold text-gray-900 dark:text-stone-100">
                              Table for {config.capacity}
                            </h4>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-slate-400 capitalize">
                            {config.area}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            config.isActive
                              ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400"
                          }`}
                        >
                          {config.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                            Total Tables
                          </p>
                          <p className="text-xl font-bold text-gray-900 dark:text-stone-100">
                            {config.totalTables}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                            Price
                          </p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">
                            ${config.pricePerTable.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Occupied Tables Tab */}
            {activeTab === "occupied" && (
              <div>
                <div className="space-y-3">
                  {tables
                    .filter((t) => t.isOccupied)
                    .map((table) => (
                      <div
                        key={table._id}
                        className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center">
                            <span className="font-bold text-red-700 dark:text-red-400">
                              {table.tableNumber}
                            </span>
                          </div>

                          <div>
                            <p className="font-bold text-gray-900 dark:text-stone-100">
                              Table {table.tableNumber}
                            </p>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-slate-400">
                              <span className="flex items-center gap-1">
                                <Users size={14} />
                                {table.capacity} persons
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin size={14} />
                                {table.area}
                              </span>
                              {table.occupiedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  {new Date(
                                    table.occupiedAt,
                                  ).toLocaleTimeString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => releaseTable(table._id)}
                          className="px-4 py-2 bg-white dark:bg-slate-800 border border-red-300 dark:border-red-900/40 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-slate-700 transition font-semibold text-sm"
                        >
                          Release Table
                        </button>
                      </div>
                    ))}

                  {tables.filter((t) => t.isOccupied).length === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle
                        size={48}
                        className="text-green-500 mx-auto mb-4"
                      />
                      <h3 className="text-lg font-bold text-gray-900 dark:text-stone-100 mb-2">
                        All Tables Available
                      </h3>
                      <p className="text-gray-600 dark:text-slate-400">
                        No tables are currently occupied
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Table Card Component
function TableCard({ table, onRelease }) {
  return (
    <div
      className={`relative p-4 rounded-lg border-2 transition ${
        table.isOccupied
          ? "bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-900/40"
          : "bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-900/40"
      }`}
    >
      <div className="text-center">
        <p className="text-lg font-black text-gray-900 dark:text-stone-100 mb-1">
          {table.tableNumber}
        </p>
        <div className="flex items-center justify-center gap-1 text-xs text-gray-600 dark:text-slate-400">
          <Users size={12} />
          <span>{table.capacity}</span>
        </div>
      </div>

      {table.isOccupied && (
        <button
          onClick={() => onRelease(table._id)}
          className="absolute top-2 right-2 w-6 h-6 bg-red-600 dark:bg-red-900/60 text-white rounded-full flex items-center justify-center hover:bg-red-700 dark:hover:bg-red-900 transition"
          title="Release table"
        >
          <XCircle size={14} />
        </button>
      )}
    </div>
  );
}
