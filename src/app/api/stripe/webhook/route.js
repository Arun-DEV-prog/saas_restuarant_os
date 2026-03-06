import Stripe from "stripe";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  try {
    const sig = req.headers.get("stripe-signature");
    const buf = await req.arrayBuffer();

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        buf,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch (err) {
      console.error("[Webhook Error]", err.message);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const restaurants = await getCollection("restaurants");
    const orders = await getCollection("orders");

    switch (event.type) {
      case "account.updated":
        // Mark onboarding as complete
        await restaurants.updateOne(
          { stripeAccountId: event.data.object.id },
          {
            $set: {
              stripeAccountStatus: event.data.object.charges_enabled
                ? "active"
                : "pending",
              stripeDetailsSubmitted: event.data.object.details_submitted,
              updatedAt: new Date(),
            },
          },
        );
        break;

      case "checkout.session.completed":
        // Fulfill order - Mark as paid and move to confirmed status
        const orderId = event.data.object.metadata?.orderId;
        if (orderId) {
          await orders.updateOne(
            { _id: new ObjectId(orderId) },
            {
              $set: {
                stripeSessionId: event.data.object.id,
                paymentStatus: "completed",
                paidAt: new Date(),
                status: "confirmed", // Move order to confirmed status after payment
                updatedAt: new Date(),
              },
            },
          );
          console.log(
            `[Webhook] Order ${orderId} payment completed and confirmed`,
          );
        }
        break;

      case "account.application.deauthorized":
        // Disconnect restaurant
        await restaurants.updateOne(
          { stripeAccountId: event.data.object.id },
          {
            $set: {
              stripeAccountStatus: "disconnected",
              updatedAt: new Date(),
            },
          },
        );
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[Webhook Processing Error]", error);
    return NextResponse.json(
      { error: error.message || "Webhook processing failed" },
      { status: 500 },
    );
  }
}
