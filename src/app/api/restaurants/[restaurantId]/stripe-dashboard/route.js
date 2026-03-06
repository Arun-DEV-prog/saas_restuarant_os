import Stripe from "stripe";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    }

    // Get restaurant to retrieve Stripe account ID
    const restaurants = await getCollection("restaurants");
    const restaurant = await restaurants.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant || !restaurant.stripeAccountId) {
      return NextResponse.json(
        { error: "Restaurant Stripe account not found" },
        { status: 404 },
      );
    }

    // Create login link
    const loginLink = await stripe.accounts.createLoginLink(
      restaurant.stripeAccountId,
    );

    return NextResponse.json({ url: loginLink.url });
  } catch (error) {
    console.error("[Stripe Dashboard Link Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create dashboard link" },
      { status: 500 },
    );
  }
}
