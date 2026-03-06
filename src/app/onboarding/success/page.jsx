"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function OnboardingSuccess() {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const router = useRouter();
  const [stripeStatus, setStripeStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const restaurantId = session?.user?.restaurantId;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (!restaurantId) {
      setLoading(false);
      return;
    }

    // Check Stripe connection status
    fetch(`/api/stripe/connect?restaurantId=${restaurantId}`)
      .then((res) => res.json())
      .then((data) => {
        setStripeStatus(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error checking Stripe status:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [restaurantId, status, router]);

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
        <div className="text-center">
          <Loader2 className="animate-spin w-12 h-12 text-green-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">
            Checking connection status...
          </p>
        </div>
      </div>
    );
  }

  const isConnected = stripeStatus?.active || stripeStatus?.status === "active";
  const isPending =
    !isConnected &&
    (stripeStatus?.status === "pending" || !stripeStatus?.active);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {isConnected ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Success!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your Stripe account has been connected successfully.
            </p>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                ✓ Account Status: Active
              </p>
              <p className="text-sm text-green-700 dark:text-green-400 mt-2">
                You can now accept payments from customers.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : isPending ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-yellow-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Review in Progress
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your Stripe account is being reviewed. This typically takes a few
              minutes.
            </p>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Account Status: Pending Review
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-2">
                We'll notify you when your account is ready.
              </p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : error ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-red-500" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Connection Error
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              There was an error checking your Stripe connection status.
            </p>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 text-center">
            <div className="flex justify-center mb-6">
              <AlertCircle className="w-16 h-16 text-gray-400" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              No Connection Found
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              No Stripe account is currently connected.
            </p>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
