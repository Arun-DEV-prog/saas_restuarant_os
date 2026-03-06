import Stripe from "stripe";
import { getDb, getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { restaurantId } = await req.json();

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    }

    // Get restaurant details
    const restaurants = await getCollection("restaurants");
    const restaurant = await restaurants.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // Create Stripe Express account
    const account = await stripe.accounts.create({
      type: "express",
      country: "US",
      email: restaurant.email || "restaurant@example.com",
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Create account link for onboarding
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success`,
      type: "account_onboarding",
    });

    // Save Stripe account ID to restaurant
    await restaurants.updateOne(
      { _id: new ObjectId(restaurantId) },
      {
        $set: {
          stripeAccountId: account.id,
          stripeAccountStatus: "pending",
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({ url: accountLink.url });
  } catch (error) {
    console.error("[Stripe Connect POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe account" },
      { status: 500 },
    );
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    }

    const restaurants = await getCollection("restaurants");
    const restaurant = await restaurants.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant || !restaurant.stripeAccountId) {
      return NextResponse.json(
        { active: false, status: "not_connected" },
        { status: 200 },
      );
    }

    // Check account status
    const account = await stripe.accounts.retrieve(restaurant.stripeAccountId);

    return NextResponse.json({
      active: account.details_submitted,
      status: account.charges_enabled ? "active" : "pending",
      accountId: restaurant.stripeAccountId,
    });
  } catch (error) {
    console.error("[Stripe Connect GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to check Stripe account status" },
      { status: 500 },
    );
  }
}
