import { NextRequest, NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/stripe/helpers";
import { getDb } from "@/lib/db";
import stripe from "@/lib/stripe/client";

/**
 * POST /api/stripe/webhook
 * Handles Stripe webhook events
 */
export async function POST(req) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json(
      { error: "No signature provided" },
      { status: 400 },
    );
  }

  // Verify webhook signature
  const event = verifyWebhookSignature(body, signature);

  if (!event) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const db = await getDb();
    const restaurantsCollection = db.collection("restaurants");
    const ordersCollection = db.collection("orders");

    switch (event.type) {
      // Handle Stripe Connect account updates
      case "account.updated": {
        const account = event.data.object;

        // Find restaurant with this Stripe Connect ID
        const restaurant = await restaurantsCollection.findOne({
          stripeConnectId: account.id,
        });

        if (restaurant) {
          // Update onboarding status
          await restaurantsCollection.updateOne(
            { stripeConnectId: account.id },
            {
              $set: {
                stripeOnboardingComplete:
                  account.charges_enabled && account.payouts_enabled,
                stripeRequirements: account.requirements || {},
                updatedAt: new Date(),
              },
            },
          );
        }

        break;
      }

      // Handle successful checkout
      case "checkout.session.completed": {
        const session = event.data.object;

        // Update order status
        if (session.metadata?.orderId) {
          await ordersCollection.updateOne(
            { _id: session.metadata.orderId },
            {
              $set: {
                status: "paid",
                paymentId: session.payment_intent,
                paidAt: new Date(),
              },
            },
          );

          // Emit event to notify restaurant (if using WebSocket)
          // You can integrate this with your socket server
        }

        break;
      }

      // Handle account disconnection
      case "account.application.deauthorized": {
        const account = event.data.object;

        // Remove Stripe Connect ID from restaurant
        await restaurantsCollection.updateOne(
          { stripeConnectId: account.id },
          {
            $set: {
              stripeConnectId: null,
              stripeOnboardingComplete: false,
              updatedAt: new Date(),
            },
          },
        );

        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 400 },
    );
  }
}
