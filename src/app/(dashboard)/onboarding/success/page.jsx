"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

// ✅ Inner component holds all the logic (useSearchParams is safe here)
function OnboardingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState("checking");
  const [stripeStatus, setStripeStatus] = useState(null);
  const [restaurantId, setRestaurantId] = useState(null);

  useEffect(() => {
    const id =
      searchParams.get("restaurantId") ||
      localStorage.getItem("currentRestaurantId");

    if (!id) {
      setStatus("error");
      toast.error("Restaurant ID not found");
      return;
    }

    setRestaurantId(id);
    checkStripeStatus(id);
  }, []);

  const checkStripeStatus = async (id) => {
    try {
      const response = await fetch(`/api/stripe/connect?restaurantId=${id}`);
      if (!response.ok) throw new Error("Failed to check status");
      const data = await response.json();

      if (
        data.chargesEnabled &&
        data.payoutsEnabled &&
        data.onboardingComplete
      ) {
        setStatus("success");
        setStripeStatus(data);
        toast.success("Stripe onboarding complete!");
      } else if (data.connected) {
        setStatus("pending");
        setStripeStatus(data);
        toast.info("Onboarding in progress, please complete all steps");
      } else {
        setStatus("not-started");
        setStripeStatus(data);
      }
    } catch (error) {
      console.error("Error checking status:", error);
      setStatus("error");
      toast.error("Failed to check onboarding status");
    }
  };

  const handleRetry = () => {
    if (restaurantId) checkStripeStatus(restaurantId);
  };
  const handleBackToDashboard = () => {
    router.push(`/dashboard/${restaurantId}`);
  };

  return (
    <div className="container max-w-md mx-auto py-12 px-4">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Stripe Onboarding Status</CardTitle>
          <CardDescription>
            Checking your Stripe Connect account status
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {status === "checking" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-center text-muted-foreground">
                Verifying your Stripe account...
              </p>
            </div>
          )}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">Onboarding Complete!</h3>
                <p className="text-sm text-muted-foreground">
                  Your Stripe account is ready to accept payments.
                </p>
              </div>
              {stripeStatus && (
                <div className="w-full bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Charges Enabled:
                    </span>
                    <span className="font-medium">
                      {stripeStatus.chargesEnabled ? "✓" : "✗"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payouts Enabled:
                    </span>
                    <span className="font-medium">
                      {stripeStatus.payoutsEnabled ? "✓" : "✗"}
                    </span>
                  </div>
                </div>
              )}
              <Button onClick={handleBackToDashboard} className="w-full">
                Back to Dashboard
              </Button>
            </div>
          )}
          {status === "pending" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-yellow-500" />
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">
                  Onboarding In Progress
                </h3>
                <p className="text-sm text-muted-foreground">
                  Please complete all required steps in the Stripe onboarding
                  flow.
                </p>
              </div>
              {stripeStatus?.requirements?.currently_due?.length > 0 && (
                <div className="w-full bg-muted p-4 rounded-lg space-y-2 text-sm">
                  <p className="font-medium text-muted-foreground">
                    Remaining steps:
                  </p>
                  <ul className="list-disc list-inside space-y-1">
                    {stripeStatus.requirements.currently_due.map((item) => (
                      <li key={item} className="text-xs">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <Button
                onClick={handleRetry}
                variant="outline"
                className="w-full"
              >
                Check Status Again
              </Button>
            </div>
          )}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">Error Checking Status</h3>
                <p className="text-sm text-muted-foreground">
                  Something went wrong while checking your Stripe status.
                </p>
              </div>
              <div className="flex gap-2 w-full">
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1"
                >
                  Try Again
                </Button>
                <Button onClick={handleBackToDashboard} className="flex-1">
                  Back to Dashboard
                </Button>
              </div>
            </div>
          )}
          {status === "not-started" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <AlertCircle className="w-12 h-12 text-blue-500" />
              <div className="space-y-2 text-center">
                <h3 className="font-semibold text-lg">Not Connected</h3>
                <p className="text-sm text-muted-foreground">
                  Stripe account has not been set up yet.
                </p>
              </div>
              <Button onClick={handleBackToDashboard} className="w-full">
                Go to Integrations
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ✅ Default export wraps in Suspense — fixes Vercel prerender build error
export default function OnboardingSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container max-w-md mx-auto py-12 px-4 flex justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <OnboardingSuccessContent />
    </Suspense>
  );
}
