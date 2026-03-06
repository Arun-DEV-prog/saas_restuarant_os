import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { createCheckoutSession } from "@/lib/stripe/helpers";
import { getDb } from "@/lib/db";

/**
 * POST /api/stripe/checkout
 * Creates a Stripe Checkout Session
 */
export async function POST(req) {
  try {
    const session = await getServerSession();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId, orderId, items, customerEmail, totalAmount } =
      await req.json();

    if (!restaurantId || !orderId || !items || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const restaurantsCollection = db.collection("restaurants");

    // Get restaurant with Stripe Connect ID
    const restaurant = await restaurantsCollection.findOne({
      _id: restaurantId,
    });

    if (!restaurant || !restaurant.stripeConnectId) {
      return NextResponse.json(
        { error: "Restaurant Stripe account not configured" },
        { status: 400 },
      );
    }

    if (!restaurant.stripeOnboardingComplete) {
      return NextResponse.json(
        { error: "Restaurant Stripe onboarding not complete" },
        { status: 400 },
      );
    }

    // Create checkout session
    const checkoutSession = await createCheckoutSession(
      restaurant.stripeConnectId,
      {
        orderId,
        items,
        customerEmail,
      },
    );

    return NextResponse.json({
      success: true,
      sessionId: checkoutSession.id,
      sessionUrl: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
