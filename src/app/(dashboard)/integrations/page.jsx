"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, AlertCircle, ExternalLink, Loader2 } from "lucide-react";

// ✅ Inner component — useSearchParams is safe inside Suspense
function IntegrationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status: sessionStatus } = useSession();

  const [restaurantId, setRestaurantId] = useState(null);
  const [stripeStatus, setStripeStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (sessionStatus === "loading") return;

    if (sessionStatus === "unauthenticated") {
      toast.error("Please sign in first");
      router.push("/login");
      return;
    }

    const id =
      searchParams.get("restaurantId") ||
      localStorage.getItem("currentRestaurantId");

    if (!id) {
      toast.error("Restaurant not found");
      router.push("/dashboard");
      return;
    }

    setRestaurantId(id);
    localStorage.setItem("currentRestaurantId", id);
    fetchStripeStatus(id);
  }, [sessionStatus]);

  const fetchStripeStatus = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/stripe/connect?restaurantId=${id}`);
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to fetch status");
      }
      const data = await response.json();
      setStripeStatus(data);
    } catch (error) {
      console.error("Error fetching Stripe status:", error);
      toast.error(error.message || "Failed to fetch Stripe status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectStripe = async () => {
    if (!restaurantId) return;
    setIsConnecting(true);
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Failed to connect Stripe");
      if (!data.onboardingUrl)
        throw new Error("No onboarding URL returned from server");
      window.location.href = data.onboardingUrl;
    } catch (error) {
      console.error("Error connecting Stripe:", error);
      toast.error(error.message || "Failed to start Stripe onboarding");
      setIsConnecting(false);
    }
  };

  const handleOpenDashboard = async () => {
    if (!restaurantId) return;
    try {
      const response = await fetch(
        `/api/restaurants/${restaurantId}/stripe-dashboard`,
      );
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to get dashboard link");
      }
      const data = await response.json();
      window.open(data.loginUrl, "_blank");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to open Stripe dashboard");
    }
  };

  const handleTestCheckout = async () => {
    if (!restaurantId) return;
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          restaurantId,
          orderId: `test_${Date.now()}`,
          customerEmail: "test@example.com",
          items: [
            { name: "Test Pizza", price: 12.99, quantity: 1, image: null },
          ],
        }),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to create checkout session");
      }
      const data = await response.json();
      window.location.href = data.sessionUrl;
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Failed to create test checkout");
    }
  };

  if (sessionStatus === "loading") {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4 flex justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground mt-2">
            Manage your payment integrations and sell online
          </p>
        </div>

        {/* Stripe Connect Card */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>Stripe Connect</CardTitle>
                <CardDescription>
                  Accept payments from customers online
                </CardDescription>
              </div>
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              ) : stripeStatus?.chargesEnabled ? (
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-500" />
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading status...</p>
            ) : (
              <>
                <div className="bg-muted p-4 rounded-lg space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Connected:</span>
                      <span className="font-medium">
                        {stripeStatus?.connected ? "✓ Yes" : "✗ No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Charges Enabled:
                      </span>
                      <span className="font-medium">
                        {stripeStatus?.chargesEnabled ? "✓ Yes" : "✗ No"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">
                        Payouts Enabled:
                      </span>
                      <span className="font-medium">
                        {stripeStatus?.payoutsEnabled ? "✓ Yes" : "✗ No"}
                      </span>
                    </div>
                  </div>
                </div>

                {stripeStatus?.requirements?.currently_due?.length > 0 && (
                  <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                    <p className="font-medium text-sm text-yellow-900 dark:text-yellow-100 mb-2">
                      Action Required:
                    </p>
                    <ul className="space-y-1">
                      {stripeStatus.requirements.currently_due.map((item) => (
                        <li
                          key={item}
                          className="text-sm text-yellow-800 dark:text-yellow-200"
                        >
                          • {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-3 flex-col sm:flex-row">
                  {!stripeStatus?.connected ? (
                    <Button
                      onClick={handleConnectStripe}
                      disabled={isConnecting}
                      className="flex-1"
                    >
                      {isConnecting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Redirecting to Stripe...
                        </>
                      ) : (
                        "Connect Stripe Account"
                      )}
                    </Button>
                  ) : (
                    <>
                      <Button
                        onClick={handleOpenDashboard}
                        variant="outline"
                        className="flex-1"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Stripe Dashboard
                      </Button>
                      {stripeStatus?.chargesEnabled && (
                        <Button onClick={handleTestCheckout} className="flex-1">
                          Test Payment
                        </Button>
                      )}
                    </>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {stripeStatus?.connected
                    ? "Your Stripe account is connected. You can now accept payments from customers."
                    : "Connect your Stripe account to start accepting payments online."}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Coming Soon Card */}
        <Card className="opacity-50">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <CardTitle>More Payment Methods</CardTitle>
                <CardDescription>
                  Coming soon: PayPal, Apple Pay, and more
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}

// ✅ Default export wraps in Suspense — fixes Vercel prerender build error
export default function IntegrationsPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-2xl mx-auto py-12 px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <IntegrationsContent />
    </Suspense>
  );
}
