import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import { getStripeLoginLink, getOnboardingUrl } from "@/lib/stripe/helpers";
import { getDb } from "@/lib/db";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-02-24.acacia",
});

export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await params;

    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(restaurantId),
      $or: [
        { ownerId: session.user.id },
        { ownerId: new ObjectId(session.user.id) },
      ],
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    if (!restaurant.stripeConnectId) {
      return NextResponse.json(
        { error: "Restaurant has no Stripe account" },
        { status: 400 },
      );
    }

    // Check onboarding status before generating login link
    const account = await stripe.accounts.retrieve(restaurant.stripeConnectId);

    if (!account.details_submitted || !account.charges_enabled) {
      // Return a fresh onboarding URL so user can complete setup
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
      const onboardingUrl = await getOnboardingUrl(
        restaurant.stripeConnectId,
        `${baseUrl}/integrations`,
        `${baseUrl}/onboarding/success`,
      );

      return NextResponse.json({
        success: false,
        onboardingIncomplete: true,
        onboardingUrl,
        message: "Stripe onboarding is not complete. Please finish setup.",
      });
    }

    // Fully onboarded — return dashboard login link
    const loginUrl = await getStripeLoginLink(restaurant.stripeConnectId);

    return NextResponse.json({
      success: true,
      loginUrl,
      stripeConnectId: restaurant.stripeConnectId,
    });
  } catch (error) {
    console.error("Error getting Stripe dashboard link:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get dashboard link" },
      { status: 500 },
    );
  }
}
