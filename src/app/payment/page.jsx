"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, AlertCircle, ArrowLeft } from "lucide-react";

export const dynamic = "force-dynamic";

function PaymentLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-r-orange-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-300">
          Processing payment...
        </p>
      </div>
    </div>
  );
}

function PaymentContent() {
  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const canceled = searchParams.get("canceled") === "true";
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setLoading(false);
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();
      if (res.ok && data) {
        setOrder(data.order || data);
      }
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <PaymentLoading />;
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Your order has been confirmed and sent to the restaurant kitchen.
          </p>

          {order && (
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                <strong>Order details:</strong>
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Order #
                  </span>
                  <span className="font-semibold">{order.orderNumber}</span>
                </div>
                {order.tableNumber && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      Table
                    </span>
                    <span className="font-semibold">{order.tableNumber}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total
                  </span>
                  <span className="font-semibold">
                    ${Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Restaurant
          </Link>
        </div>
      </div>
    );
  }

  if (canceled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
          <div className="flex justify-center mb-6">
            <AlertCircle className="w-16 h-16 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Canceled
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You canceled the payment. Your order was not confirmed.
          </p>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 rounded-lg transition"
          >
            <ArrowLeft size={18} className="mr-2" />
            Start a New Order
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <p className="text-gray-600">Payment status page</p>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentContent />
    </Suspense>
  );
}
