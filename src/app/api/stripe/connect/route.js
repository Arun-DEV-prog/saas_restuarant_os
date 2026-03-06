import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";
import {
  createStripeConnectAccount,
  getOnboardingUrl,
  isStripeAccountActive,
  getStripeAccountDetails,
} from "@/lib/stripe/helpers";
import { getDb } from "@/lib/db";

/**
 * POST /api/stripe/connect
 * Creates a Stripe Express account and returns the onboarding URL
 */
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await req.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 },
      );
    }

    // Validate that restaurantId is a valid ObjectId
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const restaurantsCollection = db.collection("restaurants");

    // FIX: Convert restaurantId string to ObjectId for MongoDB query
    // Also handle ownerId stored as either string or ObjectId
    const restaurant = await restaurantsCollection.findOne({
      _id: new ObjectId(restaurantId),
      $or: [
        { ownerId: session.user.id },
        { ownerId: new ObjectId(session.user.id) },
      ],
    });

    if (!restaurant) {
      if (process.env.NODE_ENV === "development") {
        const anyRestaurant = await restaurantsCollection.findOne({
          _id: new ObjectId(restaurantId),
        });
        if (!anyRestaurant) {
          console.error(
            `[Stripe Connect] Restaurant ${restaurantId} does not exist in DB`,
          );
        } else {
          console.error(
            `[Stripe Connect] ownerId mismatch.`,
            `DB ownerId: ${anyRestaurant.ownerId}`,
            `Session userId: ${session.user.id}`,
          );
        }
      }
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // If already has Stripe account, return a fresh onboarding URL instead of erroring
    if (restaurant.stripeConnectId) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL;
      const onboardingUrl = await getOnboardingUrl(
        restaurant.stripeConnectId,
        `${appUrl}/integrations`,
        `${appUrl}/onboarding/success`,
      );
      return NextResponse.json({
        success: true,
        stripeConnectId: restaurant.stripeConnectId,
        onboardingUrl,
        alreadyExists: true,
      });
    }

    // Create Stripe Connect account
    const stripeAccount = await createStripeConnectAccount(restaurant);

    // Save Stripe Connect ID to database
    await restaurantsCollection.updateOne(
      { _id: new ObjectId(restaurantId) },
      {
        $set: {
          stripeConnectId: stripeAccount.id,
          stripeOnboardingComplete: false,
          updatedAt: new Date(),
        },
      },
    );

    const appUrl = process.env.NEXT_PUBLIC_APP_URL;
    const onboardingUrl = await getOnboardingUrl(
      stripeAccount.id,
      `${appUrl}/integrations`,
      `${appUrl}/onboarding/success`,
    );

    return NextResponse.json({
      success: true,
      stripeConnectId: stripeAccount.id,
      onboardingUrl,
    });
  } catch (error) {
    console.error("Error creating Stripe Connect account:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe account" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/stripe/connect
 * Checks if the restaurant's Stripe account is active
 */
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "Restaurant ID is required" },
        { status: 400 },
      );
    }

    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const restaurantsCollection = db.collection("restaurants");

    // FIX: Convert restaurantId string to ObjectId for MongoDB query
    const restaurant = await restaurantsCollection.findOne({
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
      return NextResponse.json({
        connected: false,
        stripeConnectId: null,
        chargesEnabled: false,
        payoutsEnabled: false,
      });
    }

    const isActive = await isStripeAccountActive(restaurant.stripeConnectId);
    const details = await getStripeAccountDetails(restaurant.stripeConnectId);

    if (isActive && !restaurant.stripeOnboardingComplete) {
      await restaurantsCollection.updateOne(
        { _id: new ObjectId(restaurantId) },
        {
          $set: {
            stripeOnboardingComplete: true,
            updatedAt: new Date(),
          },
        },
      );
    }

    return NextResponse.json({
      connected: !!restaurant.stripeConnectId,
      stripeConnectId: restaurant.stripeConnectId,
      chargesEnabled: details.chargesEnabled,
      payoutsEnabled: details.payoutsEnabled,
      requirements: details.requirements,
      onboardingComplete: isActive,
    });
  } catch (error) {
    console.error("Error checking Stripe status:", error);
    return NextResponse.json(
      { error: error.message || "Failed to check Stripe status" },
      { status: 500 },
    );
  }
}
