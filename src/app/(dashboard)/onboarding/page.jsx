"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const restaurantId =
      searchParams.get("restaurantId") ||
      localStorage.getItem("currentRestaurantId");

    if (restaurantId) {
      localStorage.setItem("currentRestaurantId", restaurantId);
      initiateStripeConnection(restaurantId);
    } else {
      toast.error("Restaurant ID not found");
      router.push("/integrations");
    }
  }, []);

  const initiateStripeConnection = async (restaurantId) => {
    try {
      const response = await fetch("/api/stripe/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create Stripe connection");
      }

      window.location.href = data.onboardingUrl;
    } catch (error) {
      console.error("Error initiating Stripe connection:", error);
      toast.error(error.message || "Failed to start Stripe onboarding");
      router.push("/integrations");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-semibold">Redirecting to Stripe...</h1>
        <p className="text-muted-foreground">
          Please wait while we set up your Stripe account
        </p>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
        </div>
      }
    >
      <OnboardingContent />
    </Suspense>
  );
}
