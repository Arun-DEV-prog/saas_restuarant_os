"use client";

import { useState, useEffect } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Search,
  Printer,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "sonner";

export default function POSPage() {
  const [cart, setCart] = useState([]);
  const [menu, setMenu] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [restaurantId, setRestaurantId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

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
        fetchMenu(restaurant._id);
        fetchCategories(restaurant._id);
      }
    } catch (error) {
      toast.error("Failed to load restaurant");
    }
  };

  const fetchCategories = async (id) => {
    try {
      const res = await fetch(`/api/restaurants/${id}/categories`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch (error) {
      console.error("Failed to load categories", error);
    }
  };

  const fetchMenu = async (id) => {
    try {
      const res = await fetch(`/api/restaurants/${id}/foods`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setMenu(data.filter((f) => f.isAvailable));
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load menu items");
      setLoading(false);
    }
  };

  const addToCart = (item) => {
    const existingItem = cart.find((c) => c._id === item._id);
    if (existingItem) {
      updateQty(item._id, existingItem.qty + 1);
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
      toast.success(`${item.name} added to cart`);
    }
  };

  const updateQty = (itemId, qty) => {
    if (qty <= 0) {
      removeFromCart(itemId);
    } else {
      setCart(
        cart.map((item) => (item._id === itemId ? { ...item, qty } : item)),
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

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

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
    const printWindow = window.open("", "_blank");
    const invoiceHTML = `
      <html>
        <head>
          <title>POS Invoice</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice { max-width: 600px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { border-bottom: 1px solid #333; padding: 10px; text-align: left; }
            td { padding: 8px; border-bottom: 1px solid #eee; }
            .total-row { font-weight: bold; font-size: 18px; border-top: 2px solid #333; }
            .footer { text-align: center; margin-top: 30px; color: #666; }
          </style>
        </head>
        <body>
          <div class="invoice">
            <div class="header">
              <h1>POS Invoice</h1>
              <p>${new Date().toLocaleString()}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${cart
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td>$${(item.price * item.qty).toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
                <tr class="total-row">
                  <td colspan="3">TOTAL:</td>
                  <td>$${total.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p>Thank you for your purchase!</p>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              POS System
            </h1>

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
                    ${item.price?.toFixed(2)}
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
                <p className="text-gray-500 text-lg">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary Section */}
        <div className="lg:col-span-1">
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
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          ${item.price?.toFixed(2)} x {item.qty}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQty(item._id, item.qty - 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-6 text-center">{item.qty}</span>
                        <button
                          onClick={() => updateQty(item._id, item.qty + 1)}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-1 hover:bg-red-100 rounded text-red-600"
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
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Printer size={18} /> Print Invoice
                  </button>
                  <button
                    className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
                    onClick={() => {
                      toast.success("Order processed!");
                      clearCart();
                    }}
                  >
                    <DollarSign className="inline mr-2 w-5 h-5" />
                    Complete Order
                  </button>
                  <button
                    onClick={clearCart}
                    className="w-full bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Clear Cart
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
