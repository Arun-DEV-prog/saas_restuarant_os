"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Download,
  Eye,
  Printer,
  Calendar,
  User,
  DollarSign,
  Package,
} from "lucide-react";
import { toast } from "sonner";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [restaurantId, setRestaurantId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

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
        fetchInvoices(restaurant._id);
      }
    } catch (error) {
      toast.error("Failed to load restaurant");
    }
  };

  const fetchInvoices = async (id) => {
    try {
      const res = await fetch(`/api/restaurants/${id}/orders`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setInvoices(data);
      }
      setLoading(false);
    } catch (error) {
      toast.error("Failed to load invoices");
      setLoading(false);
    }
  };

  const handlePrintInvoice = (invoice) => {
    const printWindow = window.open("", "_blank");
    const invoiceHTML = `
      <html>
        <head>
          <title>Invoice #${invoice.orderNumber || invoice._id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Arial', sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 800px; margin: 0 auto; background-color: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { border-bottom: 3px solid #ff6b35; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 28px; font-weight: bold; color: #333; margin-bottom: 10px; }
            .invoice-title { font-size: 24px; color: #333; margin-bottom: 5px; }
            .invoice-number { color: #666; font-size: 14px; }
            .invoice-date { color: #666; font-size: 14px; margin-top: 5px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 30px; }
            .detail-section h3 { font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 1px; }
            .detail-section p { font-size: 14px; color: #333; line-height: 1.8; }
            table { width: 100%; border-collapse: collapse; margin: 30px 0; }
            thead { background-color: #f9f9f9; border-top: 2px solid #ddd; border-bottom: 2px solid #ddd; }
            th { padding: 12px; text-align: left; font-weight: 600; color: #333; font-size: 13px; text-transform: uppercase; }
            td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
            tbody tr:hover { background-color: #f9f9f9; }
            .item-name { font-weight: 600; color: #333; }
            .qty { text-align: center; }
            .price { text-align: right; }
            .total-row { background-color: #f9f9f9; font-weight: 600; border-top: 2px solid #ddd; }
            .total-amount { color: #ff6b35; font-size: 16px; }
            .summary { margin: 30px 0; padding: 20px; background-color: #f9f9f9; border-radius: 4px; }
            .summary-row { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .summary-row.total { font-size: 18px; font-weight: 600; color: #333; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
            .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
            @media print { body { padding: 0; } .container { box-shadow: none; } }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">Invoice #${invoice.orderNumber || invoice._id}</div>
              <div class="invoice-date">Date: ${new Date(invoice.createdAt).toLocaleDateString()}</div>
            </div>

            <div class="details">
              <div class="detail-section">
                <h3>Bill To</h3>
                <p>
                  <strong>Customer</strong><br>
                  Email: ${invoice.customerEmail || "N/A"}<br>
                  Phone: ${invoice.customerPhone || "N/A"}
                </p>
              </div>
              <div class="detail-section">
                <h3>Invoice Information</h3>
                <p>
                  <strong>${new Date(invoice.createdAt).toLocaleDateString()}</strong><br>
                  Status: ${invoice.status || "Pending"}<br>
                  Order ID: ${invoice._id}
                </p>
              </div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="qty">Quantity</th>
                  <th class="price">Unit Price</th>
                  <th class="price">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items
                  ?.map(
                    (item) => `
                  <tr>
                    <td class="item-name">${item.name}</td>
                    <td class="qty">${item.qty || item.quantity || 1}</td>
                    <td class="price">$${Number(item.price).toFixed(2)}</td>
                    <td class="price">$${(item.price * (item.qty || item.quantity || 1)).toFixed(2)}</td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>

            <div class="summary">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>$${invoice.items?.reduce((sum, item) => sum + item.price * (item.qty || item.quantity || 1), 0).toFixed(2) || "0.00"}</span>
              </div>
              <div class="summary-row">
                <span>Tax:</span>
                <span>${invoice.tax !== undefined ? "$" + Number(invoice.tax).toFixed(2) : "Calculated at checkout"}</span>
              </div>
              <div class="summary-row">
                <span>Shipping:</span>
                <span>${invoice.shipping !== undefined ? "$" + Number(invoice.shipping).toFixed(2) : "$0.00"}</span>
              </div>
              <div class="summary-row total">
                <span>Total Amount:</span>
                <span class="total-amount">$${Number(invoice.total).toFixed(2)}</span>
              </div>
            </div>

            <div class="footer">
              <p>Thank you for your business!<br>For any inquiries, please contact us.</p>
              <p style="margin-top: 10px;">Powered by Restaurant Management System</p>
            </div>
          </div>
          <script>window.print(); window.close();</script>
        </body>
      </html>
    `;
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  };

  const handleDownloadPDF = (invoice) => {
    toast.info("PDF download feature coming soon");
  };

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.orderNumber?.toString().includes(searchQuery) ||
      invoice._id?.toString().includes(searchQuery) ||
      invoice.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || invoice.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-blue-100 text-blue-800",
    preparing: "bg-orange-100 text-orange-800",
    ready: "bg-green-100 text-green-800",
    completed: "bg-gray-100 text-gray-800",
    cancelled: "bg-red-100 text-red-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Package className="w-12 h-12 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading invoices...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600 mt-2">
            View and manage all order invoices
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 space-y-4 bg-white p-6 rounded-lg shadow">
          <div className="flex gap-4 flex-col md:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by invoice number, order ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Invoices Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <Calendar className="inline mr-2 w-4 h-4" /> Date
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <User className="inline mr-2 w-4 h-4" /> Customer
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  <DollarSign className="inline mr-2 w-4 h-4" /> Amount
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    {invoice.orderNumber || invoice._id?.slice(-6)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(invoice.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {invoice.customerEmail || invoice.customerName || "N/A"}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        statusColors[invoice.status] ||
                        "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {invoice.status || "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-gray-900">
                    ${Number(invoice.total).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setSelectedInvoice(invoice);
                          setShowDetailModal(true);
                        }}
                        className="p-2 hover:bg-blue-100 rounded text-blue-600 transition"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handlePrintInvoice(invoice)}
                        className="p-2 hover:bg-green-100 rounded text-green-600 transition"
                        title="Print Invoice"
                      >
                        <Printer size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice)}
                        className="p-2 hover:bg-purple-100 rounded text-purple-600 transition"
                        title="Download PDF"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredInvoices.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No invoices found</p>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center border-b p-6">
              <h2 className="text-xl font-bold">
                Invoice #
                {selectedInvoice.orderNumber || selectedInvoice._id?.slice(-6)}
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Invoice Date</p>
                  <p className="font-semibold">
                    {new Date(selectedInvoice.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium inline-block ${
                      statusColors[selectedInvoice.status] ||
                      "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {selectedInvoice.status || "Pending"}
                  </span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-4">Items</h3>
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left">Item</th>
                      <th className="px-3 py-2 text-right">Qty</th>
                      <th className="px-3 py-2 text-right">Price</th>
                      <th className="px-3 py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {selectedInvoice.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">{item.name}</td>
                        <td className="px-3 py-2 text-right">
                          {item.qty || item.quantity || 1}
                        </td>
                        <td className="px-3 py-2 text-right">
                          ${Number(item.price).toFixed(2)}
                        </td>
                        <td className="px-3 py-2 text-right font-semibold">
                          $
                          {(
                            item.price * (item.qty || item.quantity || 1)
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between mb-2 text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-orange-600">
                    ${Number(selectedInvoice.total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  onClick={() => handlePrintInvoice(selectedInvoice)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  <Printer size={18} /> Print Invoice
                </button>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 bg-gray-300 text-gray-800 py-2 rounded-lg hover:bg-gray-400 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
