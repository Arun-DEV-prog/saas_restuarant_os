"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Copy,
  Search,
} from "lucide-react";
import DashboardHeader from "@/components/Dashboard/DashboardHeader";
import FoodFormModal from "@/components/Dashboard/FoodFormModal";
import CategoryFormModal from "@/components/Dashboard/CategoryFormModal";

export default function MenuPage() {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [foods, setFoods] = useState({});
  const [expandedCategories, setExpandedCategories] = useState({});
  const [openFoodForm, setOpenFoodForm] = useState(false);
  const [openCategoryForm, setOpenCategoryForm] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [menuLoading, setMenuLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  /* =============================
     Load restaurant
  ============================= */
  useEffect(() => {
    let mounted = true;

    async function loadRestaurant() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("/api/me/restaurant", { cache: "no-store" });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "Failed to load restaurant");
        }
        const data = await res.json();
        if (!mounted) return;

        if (!data?._id) {
          throw new Error("No restaurant found for this user");
        }

        setRestaurant(data);
      } catch (err) {
        console.error("Error loading restaurant:", err);
        if (mounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadRestaurant();
    return () => {
      mounted = false;
    };
  }, []);

  /* =============================
     Load menu data (categories & foods)
  ============================= */
  const loadMenuData = useCallback(async () => {
    if (!restaurant?._id) return;
    let mounted = true;

    try {
      setMenuLoading(true);
      setError(null);

      // Fetch categories for this restaurant
      const categoriesRes = await fetch(
        `/api/restaurants/${restaurant._id}/categories`,
        { cache: "no-store" },
      );

      if (!categoriesRes.ok) {
        const errorData = await categoriesRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to load categories");
      }

      const categoriesData = await categoriesRes.json();
      const categoriesList = Array.isArray(categoriesData)
        ? categoriesData
        : [];

      if (!mounted) return;

      setCategories(categoriesList);

      // Auto-expand all categories
      const expanded = {};
      categoriesList.forEach((cat) => {
        expanded[cat._id] = true;
      });
      setExpandedCategories(expanded);

      // Load foods for each category
      const foodMap = {};
      await Promise.all(
        categoriesList.map(async (category) => {
          try {
            const foodsRes = await fetch(
              `/api/restaurants/${restaurant._id}/categories/${category._id}/foods`,
              { cache: "no-store" },
            );
            if (foodsRes.ok) {
              const foodsData = await foodsRes.json();
              foodMap[category._id] = Array.isArray(foodsData) ? foodsData : [];
            } else {
              console.warn(`Failed to load foods for category ${category._id}`);
              foodMap[category._id] = [];
            }
          } catch (err) {
            console.error(
              `Error loading foods for category ${category._id}:`,
              err,
            );
            foodMap[category._id] = [];
          }
        }),
      );

      if (!mounted) return;
      setFoods(foodMap);
    } catch (err) {
      console.error("Error loading menu data:", err);
      if (mounted) {
        setError(err.message);
      }
    } finally {
      if (mounted) {
        setMenuLoading(false);
        setLoading(false);
      }
    }
  }, [restaurant]);

  useEffect(() => {
    if (restaurant?._id) {
      loadMenuData();
    }
  }, [restaurant, loadMenuData]);

  /* =============================
     Actions
  ============================= */
  function toggleCategory(categoryId) {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  }

  function openEditCategory(category) {
    setEditingCategory(category);
    setOpenCategoryForm(true);
  }

  async function deleteCategory(categoryId) {
    const foodCount = (foods[categoryId] || []).length;
    if (
      !confirm(
        foodCount > 0
          ? `Delete category with ${foodCount} items?`
          : "Delete category?",
      )
    )
      return;
    try {
      const res = await fetch(
        `/api/restaurants/${restaurant._id}/categories/${categoryId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete category");
      }
      setCategories((prev) => prev.filter((c) => c._id !== categoryId));
      setFoods((prev) => {
        const newFoods = { ...prev };
        delete newFoods[categoryId];
        return newFoods;
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function duplicateCategory(category) {
    try {
      const newCategoryRes = await fetch(
        `/api/restaurants/${restaurant._id}/categories`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${category.name} (Copy)`,
            description: category.description,
          }),
        },
      );
      if (!newCategoryRes.ok) {
        const errorData = await newCategoryRes.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to duplicate category");
      }
      const newCategory = await newCategoryRes.json();
      const categoryFoods = foods[category._id] || [];
      const newFoods = [];
      for (const food of categoryFoods) {
        const foodRes = await fetch(
          `/api/restaurants/${restaurant._id}/categories/${newCategory._id}/foods`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: food.name,
              description: food.description,
              price: food.price,
              image: food.image,
              isAvailable: food.isAvailable,
            }),
          },
        );
        if (foodRes.ok) newFoods.push(await foodRes.json());
      }
      setCategories((prev) => [...prev, newCategory]);
      setFoods((prev) => ({ ...prev, [newCategory._id]: newFoods }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  function openCreateFood(categoryId) {
    console.log("openCreateFood called with categoryId:", categoryId);
    // FIX: Validate categoryId before proceeding
    if (!categoryId) {
      console.error("Cannot create food: categoryId is undefined");
      alert("Error: Category ID is missing. Please try again.");
      return;
    }
    setActiveCategoryId(categoryId);
    setEditingFood(null);
    setOpenFoodForm(true);
  }

  function openEditFood(food, categoryId) {
    // FIX: Validate categoryId before proceeding
    if (!categoryId) {
      console.error("Cannot edit food: categoryId is undefined");
      alert("Error: Category ID is missing. Please try again.");
      return;
    }
    setEditingFood({ ...food, categoryId });
    setActiveCategoryId(categoryId);
    setOpenFoodForm(true);
  }

  async function toggleFoodAvailability(food, categoryId) {
    try {
      const res = await fetch(
        `/api/restaurants/${restaurant._id}/foods/${food._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isAvailable: !food.isAvailable }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update availability");
      }
      setFoods((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).map((f) =>
          f._id === food._id ? { ...f, isAvailable: !f.isAvailable } : f,
        ),
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function deleteFood(foodId, categoryId) {
    if (!confirm("Delete this item?")) return;
    try {
      const res = await fetch(
        `/api/restaurants/${restaurant._id}/foods/${foodId}`,
        { method: "DELETE" },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete food");
      }
      setFoods((prev) => ({
        ...prev,
        [categoryId]: (prev[categoryId] || []).filter((f) => f._id !== foodId),
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  async function duplicateFood(food, categoryId) {
    try {
      const res = await fetch(
        `/api/restaurants/${restaurant._id}/categories/${categoryId}/foods`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: `${food.name} (Copy)`,
            description: food.description,
            price: food.price,
            image: food.image,
            isAvailable: food.isAvailable,
          }),
        },
      );
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to duplicate food");
      }
      const newFood = await res.json();
      setFoods((prev) => ({
        ...prev,
        [categoryId]: [newFood, ...(prev[categoryId] || [])],
      }));
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  }

  function onFoodSaved(savedFood, mode) {
    // FIX: Always use activeCategoryId for the category
    const cid = activeCategoryId;

    if (!cid) {
      console.error("Cannot save food: categoryId is undefined");
      alert("Error: Category ID is missing. Please try again.");
      return;
    }

    setFoods((prev) => {
      const list = prev[cid] || [];
      return {
        ...prev,
        [cid]:
          mode === "create"
            ? [savedFood, ...list]
            : list.map((f) => (f._id === savedFood._id ? savedFood : f)),
      };
    });
    setOpenFoodForm(false);
    setEditingFood(null);
    setActiveCategoryId(null);
  }

  function onCategoryCreated(newCategory) {
    if (editingCategory) {
      setCategories((prev) =>
        prev.map((c) => (c._id === newCategory._id ? newCategory : c)),
      );
    } else {
      setCategories((prev) => [...prev, newCategory]);
      setFoods((prev) => ({ ...prev, [newCategory._id]: [] }));
    }
    setOpenCategoryForm(false);
    setEditingCategory(null);
  }

  /* =============================
     Stats & Filter
  ============================= */
  const filteredCategories = categories.filter((cat) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (cat.name.toLowerCase().includes(query)) return true;
    const categoryFoods = foods[cat._id] || [];
    return categoryFoods.some((food) =>
      food.name.toLowerCase().includes(query),
    );
  });

  const totalItems = Object.values(foods).reduce(
    (sum, items) => sum + items.length,
    0,
  );
  const availableItems = Object.values(foods).reduce(
    (sum, items) => sum + items.filter((f) => f.isAvailable).length,
    0,
  );

  /* =============================
     Render
  ============================= */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500 dark:text-slate-400">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error && !restaurant) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center max-w-md">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/40 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-400 mb-2">
              Error Loading Restaurant
            </h3>
            <p className="text-red-600 dark:text-red-300 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      <DashboardHeader />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-stone-100">
                Menus
              </h1>
              <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
                {restaurant?.name}
              </p>
            </div>
            <button
              onClick={() => {
                setEditingCategory(null);
                setOpenCategoryForm(true);
              }}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition font-medium shadow-sm"
            >
              <Plus size={20} />
              New Category
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                Categories
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-stone-100">
                {categories.length}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                Total Items
              </div>
              <div className="text-2xl font-bold text-gray-900 dark:text-stone-100">
                {totalItems}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                Available
              </div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {availableItems}
              </div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 p-4">
              <div className="text-sm text-gray-500 dark:text-slate-400 mb-1">
                Hidden
              </div>
              <div className="text-2xl font-bold text-gray-400 dark:text-slate-500">
                {totalItems - availableItems}
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-slate-500"
              size={20}
            />
            <input
              type="text"
              placeholder="Search categories or items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-800 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/40 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 dark:text-yellow-300">{error}</p>
          </div>
        )}

        {/* Menu List */}
        {menuLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-500 dark:text-slate-400 text-sm">
                Loading categories...
              </p>
            </div>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-slate-700 p-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100 mb-2">
              {searchQuery ? "No results found" : "No categories yet"}
            </h3>
            <p className="text-gray-500 dark:text-slate-400 mb-6">
              {searchQuery
                ? "Try a different search"
                : "Create your first category to start building your menu"}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setOpenCategoryForm(true)}
                className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition"
              >
                Create Category
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((category) => {
              const categoryFoods = foods[category._id] || [];
              const isExpanded = expandedCategories[category._id];
              return (
                <div
                  key={category._id}
                  className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 shadow-sm"
                >
                  {/* Category Header */}
                  <div className="bg-gradient-to-r from-gray-50 dark:from-slate-700 to-white dark:to-slate-800 border-b border-gray-200 dark:border-slate-700">
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3 flex-1">
                        <button
                          onClick={() => toggleCategory(category._id)}
                          className="text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-400 transition"
                        >
                          {isExpanded ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </button>
                        <GripVertical
                          size={20}
                          className="text-gray-300 dark:text-slate-500 cursor-move"
                        />
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-stone-100">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium">
                          {categoryFoods.length}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <button
                          onClick={() => openCreateFood(category._id)}
                          className="flex items-center gap-1.5 text-sm bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition"
                        >
                          <Plus size={16} /> Add Item
                        </button>
                        <button
                          onClick={() => openEditCategory(category)}
                          className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => duplicateCategory(category)}
                          className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                          title="Duplicate"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => deleteCategory(category._id)}
                          className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Items */}
                  {isExpanded && (
                    <div className="divide-y divide-gray-100 dark:divide-slate-700">
                      {categoryFoods.length === 0 ? (
                        <div className="p-8 text-center">
                          <p className="text-gray-400 dark:text-slate-500 mb-3">
                            No items yet
                          </p>
                          <button
                            onClick={() => openCreateFood(category._id)}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                          >
                            + Add first item
                          </button>
                        </div>
                      ) : (
                        categoryFoods.map((food) => (
                          <div
                            key={food._id}
                            className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-slate-700/40 transition group"
                          >
                            <GripVertical
                              size={18}
                              className="text-gray-300 dark:text-slate-500 cursor-move opacity-0 group-hover:opacity-100 transition"
                            />
                            <div className="w-14 h-14 bg-gray-100 dark:bg-slate-700 rounded-lg overflow-hidden flex-shrink-0">
                              {food.image ? (
                                <img
                                  src={food.image}
                                  alt={food.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImageIcon
                                    size={20}
                                    className="text-gray-400 dark:text-slate-500"
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-900 dark:text-stone-100 truncate">
                                {food.name}
                              </h4>
                              <p className="text-sm text-gray-500 dark:text-slate-400 truncate">
                                {food.description || "No description"}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 w-20">
                              <div className="font-semibold text-gray-900 dark:text-stone-100">
                                {food.price != null
                                  ? `$${Number(food.price).toFixed(2)}`
                                  : "—"}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition">
                              <button
                                onClick={() =>
                                  toggleFoodAvailability(food, category._id)
                                }
                                className={`p-2 rounded transition ${food.isAvailable ? "text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" : "text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-700"}`}
                                title={food.isAvailable ? "Hide" : "Show"}
                              >
                                {food.isAvailable ? (
                                  <Eye size={18} />
                                ) : (
                                  <EyeOff size={18} />
                                )}
                              </button>
                              <button
                                onClick={() => openEditFood(food, category._id)}
                                className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                                title="Edit"
                              >
                                <Edit2 size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  duplicateFood(food, category._id)
                                }
                                className="p-2 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition"
                                title="Duplicate"
                              >
                                <Copy size={18} />
                              </button>
                              <button
                                onClick={() =>
                                  deleteFood(food._id, category._id)
                                }
                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition"
                                title="Delete"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modals */}
      {openFoodForm && (
        <FoodFormModal
          restaurantId={restaurant._id}
          categoryId={activeCategoryId}
          initialData={editingFood}
          onClose={() => {
            setOpenFoodForm(false);
            setEditingFood(null);
            setActiveCategoryId(null);
          }}
          onSaved={onFoodSaved}
        />
      )}
      {openCategoryForm && (
        <CategoryFormModal
          restaurantId={restaurant._id}
          initialData={editingCategory}
          onClose={() => {
            setOpenCategoryForm(false);
            setEditingCategory(null);
          }}
          onCreated={onCategoryCreated}
        />
      )}
    </div>
  );
}
