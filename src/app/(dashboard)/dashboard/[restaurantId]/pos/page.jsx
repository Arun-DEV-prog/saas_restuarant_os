"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Printer,
  DollarSign,
  Package,
  AlertCircle,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { use } from "react";

export default function RestaurantPOSPage({ params }) {
  const { restaurantId } = use(params);
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [cartOpen, setCartOpen] = useState(false);
  const [printing, setPrinting] = useState(false);

  const fetchRestaurantData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch restaurant info
      const restaurantRes = await fetch(`/api/restaurants/${restaurantId}`);
      if (restaurantRes.ok) {
        const restaurantData = await restaurantRes.json();
        setRestaurant(restaurantData);
      } else {
        console.warn("Failed to fetch restaurant:", restaurantRes.status);
      }

      // Fetch categories
      const categoriesRes = await fetch(
        `/api/restaurants/${restaurantId}/categories`,
      );
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }
      } else {
        console.warn("Failed to fetch categories:", categoriesRes.status);
      }

      // Fetch menu items
      const menuRes = await fetch(`/api/restaurants/${restaurantId}/foods`);
      if (menuRes.ok) {
        const menuData = await menuRes.json();
        console.log("Menu data received:", menuData);
        if (Array.isArray(menuData)) {
          const availableItems = menuData.filter(
            (f) => f.isAvailable !== false,
          );
          setMenu(availableItems);
          console.log("Filtered menu items:", availableItems.length);
          if (availableItems.length === 0) {
            toast.info("No menu items available");
          }
        } else {
          console.error("Menu data is not an array:", menuData);
          toast.error("Invalid menu data format");
        }
      } else {
        console.error(
          "Failed to fetch foods:",
          menuRes.status,
          await menuRes.text(),
        );
        toast.error("Failed to fetch menu items");
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching restaurant data:", error);
      toast.error("Failed to load POS data: " + error.message);
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRestaurantData();
  }, [fetchRestaurantData]);

  const addToCart = (item) => {
    const existingItem = cart.find((c) => c._id === item._id);
    const normalizedItem = {
      ...item,
      price: Number(item.price) || 0,
    };
    if (existingItem) {
      updateQty(item._id, existingItem.qty + 1);
    } else {
      setCart([...cart, { ...normalizedItem, qty: 1 }]);
      toast.success(`${item.name} added to cart`);
    }
  };

  const updateQty = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) =>
          item._id === itemId
            ? { ...item, qty, price: Number(item.price) || 0 }
            : item,
        ),
      );
    }
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item._id !== itemId));
  };

  const clearCart = () => {
    setCart([]);
    toast.info("Cart cleared");
  };

  const total = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    return sum + price * item.qty;
  }, 0);

  const filteredMenu = menu.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.categoryId === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePrintInvoice = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty");
      return;
    }

    setPrinting(true);
    toast.loading("Preparing invoice...");

    try {
      const printWindow = window.open("", "_blank");

      if (!printWindow) {
        toast.error(
          "Failed to open print window. Check popup blocker settings.",
        );
        setPrinting(false);
        return;
      }

      const invoiceNumber = Math.random()
        .toString(36)
        .substr(2, 9)
        .toUpperCase();
      const currentDate = new Date();
      const dateStr = currentDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      const timeStr = currentDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      const invoiceHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>POS Invoice - ${restaurant?.name || "Restaurant"}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              html, body {
                font-family: 'Courier New', 'Courier', monospace;
                background-color: #fff;
                color: #000;
              }
              .invoice {
                max-width: 80mm;
                margin: 0 auto;
                padding: 10mm;
                background: white;
              }
              .header {
                text-align: center;
                border-bottom: 2px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              .header h1 {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                letter-spacing: 2px;
              }
              .header p {
                font-size: 11px;
                margin: 3px 0;
              }
              .invoice-number {
                text-align: center;
                font-size: 10px;
                margin-bottom: 10px;
                padding: 5px 0;
              }
              .timestamp {
                text-align: center;
                font-size: 10px;
                border-bottom: 1px dashed #000;
                padding-bottom: 10px;
                margin-bottom: 15px;
              }
              table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 15px;
                font-size: 10px;
              }
              tbody tr {
                border-bottom: 1px dotted #ccc;
              }
              .item-row td {
                padding: 5px 0;
              }
              .item-name {
                font-weight: bold;
                text-align: left;
              }
              .item-qty {
                text-align: center;
                width: 12%;
              }
              .item-price {
                text-align: right;
                width: 18%;
              }
              .item-total {
                text-align: right;
                width: 20%;
                font-weight: bold;
              }
              .divider {
                border-bottom: 2px solid #000;
                margin: 10px 0;
              }
              .totals {
                font-size: 11px;
                margin-bottom: 15px;
              }
              .total-row {
                display: flex;
                justify-content: space-between;
                margin: 4px 0;
              }
              .subtotal-row {
                border-bottom: 1px solid #999;
                padding-bottom: 4px;
              }
              .grand-total {
                font-weight: bold;
                font-size: 13px;
                border-top: 2px solid #000;
                border-bottom: 2px solid #000;
                padding: 6px 0;
                margin: 8px 0;
              }
              .footer {
                text-align: center;
                font-size: 10px;
                margin-top: 15px;
                border-top: 1px dashed #000;
                padding-top: 10px;
              }
              .footer p {
                margin: 3px 0;
              }
              .thank-you {
                font-weight: bold;
                font-size: 12px;
                margin-bottom: 5px;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                  background: white;
                }
                .invoice {
                  max-width: 100%;
                  margin: 0;
                  padding: 0;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            </style>
          </head>
          <body>
            <div class="invoice">
              <!-- Header -->
              <div class="header">
                <h1>POS INVOICE</h1>
                <p>#${invoiceNumber}</p>
              </div>
              
              <!-- Restaurant Info -->
              <div class="invoice-number">
                <strong>${restaurant?.name || "Restaurant"}</strong>
              </div>
              
              <!-- Timestamp -->
              <div class="timestamp">
                ${dateStr} ${timeStr}
              </div>
              
              <!-- Items Table -->
              <table>
                <tbody>
                  ${cart
                    .map(
                      (item) => `
                      <tr class="item-row">
                        <td class="item-name">${item.name}</td>
                        <td class="item-qty">${item.qty}</td>
                        <td class="item-price">$${Number(item.price).toFixed(2)}</td>
                        <td class="item-total">$${(Number(item.price) * item.qty).toFixed(2)}</td>
                      </tr>
                    `,
                    )
                    .join("")}
                </tbody>
              </table>
              
              <div class="divider"></div>
              
              <!-- Totals -->
              <div class="totals">
                <div class="total-row subtotal-row">
                  <span>Subtotal:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
                <div class="total-row">
                  <span>Tax (0%):</span>
                  <span>$0.00</span>
                </div>
                <div class="total-row grand-total">
                  <span>TOTAL:</span>
                  <span>$${total.toFixed(2)}</span>
                </div>
              </div>
              
              <!-- Footer -->
              <div class="footer">
                <p class="thank-you">Thank You!</p>
                <p>Come Again Soon</p>
                <p style="margin-top: 10px; font-size: 9px;">POS System by Restaurant Management</p>
              </div>
            </div>

            <script>
              // Ensure DOM is ready and print settings are applied
              window.onload = function() {
                // Small delay to ensure CSS is loaded in print preview
                setTimeout(function() {
                  window.print();
                  // Don't close immediately - let user choose
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 500);
              };
            </script>
          </body>
        </html>
      `;

      printWindow.document.write(invoiceHTML);
      printWindow.document.close();

      toast.dismiss();
      toast.success("Invoice ready for printing");
    } catch (error) {
      console.error("Print error:", error);
      toast.error("Failed to print invoice");
    } finally {
      setPrinting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading POS System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        {/* Menu Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">POS System</h1>
                <p className="text-gray-600 text-sm mt-1">{restaurant?.name}</p>
              </div>
              {/* Cart Button - Mobile */}
              <button
                onClick={() => setCartOpen(!cartOpen)}
                className="lg:hidden relative bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition flex items-center gap-2 font-semibold"
              >
                <ShoppingCart size={20} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {cart.length}
                  </span>
                )}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="space-y-4 mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Categories */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                    selectedCategory === "all"
                      ? "bg-orange-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat._id)}
                    className={`px-4 py-2 rounded-lg whitespace-nowrap transition ${
                      selectedCategory === cat._id
                        ? "bg-orange-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMenu.map((item) => (
                <div
                  key={item._id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
                >
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-32 object-cover rounded mb-3"
                    />
                  )}
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    ${Number(item.price).toFixed(2)}
                  </p>
                  <button
                    onClick={() => addToCart(item)}
                    className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition flex items-center justify-center gap-2"
                  >
                    <Plus size={18} /> Add
                  </button>
                </div>
              ))}
            </div>

            {filteredMenu.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Sidebar - Desktop Sticky / Mobile Modal */}
        {cartOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setCartOpen(false)}
          />
        )}

        <div
          className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white shadow-2xl z-50 lg:z-10 lg:relative lg:inset-auto lg:w-auto lg:shadow-lg transition-transform duration-300 ${
            cartOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
          } overflow-hidden flex flex-col`}
        >
          <div className="bg-white rounded-lg shadow-lg p-6 flex-1 flex flex-col max-h-screen overflow-hidden">
            {/* Header with Close Button */}
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Order</h2>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="lg:hidden text-gray-500 hover:text-gray-700 p-1"
              >
                <X size={24} />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="text-center py-8 flex-1 flex items-center justify-center">
                <div>
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              </div>
            ) : (
              <>
                {/* Cart Items - Scrollable */}
                <div className="space-y-2 mb-4 flex-1 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item._id}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          ${Number(item.price).toFixed(2)} x {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                        <button
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          className="p-1 hover:bg-gray-200 rounded text-sm transition"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-semibold">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          className="p-1 hover:bg-gray-200 rounded text-sm transition"
                        >
                          <Plus size={14} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 text-sm ml-1 transition"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="border-t border-gray-200 pt-4 space-y-2 mb-4 flex-shrink-0">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax:</span>
                    <span className="font-semibold">$0.00</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 bg-orange-50 p-3 rounded-lg">
                    <span>Total:</span>
                    <span className="text-orange-600">${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2 flex-shrink-0">
                  <button
                    onClick={handlePrintInvoice}
                    disabled={printing}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center gap-2 text-sm font-semibold"
                  >
                    {printing ? (
                      <>
                        <div className="animate-spin">⟳</div>
                        Printing...
                      </>
                    ) : (
                      <>
                        <Printer size={18} /> Print Invoice
                      </>
                    )}
                  </button>
                  <button
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition text-sm font-semibold"
                    onClick={() => {
                      toast.success("Order completed!");
                      clearCart();
                      setCartOpen(false);
                    }}
                  >
                    <DollarSign className="inline mr-2 w-4 h-4" />
                    Complete Order
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition text-sm font-semibold"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sidebar always visible on desktop */}
        {!cartOpen && (
          <div className="hidden lg:block">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-2 mb-6">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Order Summary
                </h2>
              </div>

              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <ShoppingCart className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Cart is empty</p>
                </div>
              ) : (
                <>
                  {/* Cart Items */}
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {cart.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            ${Number(item.price).toFixed(2)} x {item.qty}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQty(item._id, item.qty - 1)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-6 text-center">{item.qty}</span>
                          <button
                            onClick={() => updateQty(item._id, item.qty + 1)}
                            className="p-1 hover:bg-gray-200 rounded transition"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-4 space-y-2 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Tax (0%):</span>
                      <span>$0.00</span>
                    </div>
                    <div className="flex justify-between text-2xl font-bold text-gray-900 bg-orange-50 p-3 rounded-lg">
                      <span>Total:</span>
                      <span className="text-orange-600">
                        ${total.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={handlePrintInvoice}
                      disabled={printing}
                      className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition flex items-center justify-center gap-2 font-semibold"
                    >
                      {printing ? (
                        <>
                          <div className="animate-spin">⟳</div>
                          Printing...
                        </>
                      ) : (
                        <>
                          <Printer size={18} /> Print Invoice
                        </>
                      )}
                    </button>
                    <button
                      className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
                      onClick={() => {
                        toast.success("Order completed!");
                        clearCart();
                      }}
                    >
                      <DollarSign className="inline mr-2 w-5 h-5" />
                      Complete Order
                    </button>
                    <button
                      onClick={clearCart}
                      className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition font-semibold"
                    >
                      Clear Cart
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
