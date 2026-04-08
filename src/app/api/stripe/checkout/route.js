import Stripe from "stripe";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const { restaurantId, amount, orderId, publicUrl } = await req.json();

    if (!restaurantId || !amount) {
      return NextResponse.json(
        { error: "restaurantId and amount are required" },
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
        { error: "Restaurant Stripe account not connected" },
        { status: 400 },
      );
    }

    // Create checkout session
    const encodedPublicUrl = publicUrl
      ? `&publicUrl=${encodeURIComponent(publicUrl)}`
      : "";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: amount,
            product_data: { name: "Restaurant Order" },
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?success=true&orderId=${orderId}${encodedPublicUrl}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment?canceled=true&orderId=${orderId}${encodedPublicUrl}`,
      // Note: Funds go directly to platform account
      // application_fee_amount is not used because transfer_data is not specified
      // Restaurant transfers can be handled separately after payment via webhook
      metadata: { orderId, restaurantId },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("[Stripe Checkout POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
