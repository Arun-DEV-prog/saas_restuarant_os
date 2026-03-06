import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import { ObjectId } from "mongodb";

// Get subscription for current restaurant
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;
    if (!restaurantId) {
      return NextResponse.json(
        { error: "No restaurant associated with user" },
        { status: 400 },
      );
    }

    await dbConnect();
    const subscription = await Subscription.findOne({
      restaurantId: new ObjectId(restaurantId),
      status: "active",
    })
      .populate("planId")
      .lean();

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 },
      );
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

// Create new subscription (purchase a plan)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;
    if (!restaurantId) {
      return NextResponse.json(
        { error: "No restaurant associated with user" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { planId, paymentMethod = "manual", transactionId } = body;

    await dbConnect();

    // Verify plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Cancel existing active subscription
    await Subscription.updateMany(
      {
        restaurantId: new ObjectId(restaurantId),
        status: "active",
      },
      {
        status: "canceled",
        canceledAt: new Date(),
      },
    );

    // Create new subscription
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

    const subscription = new Subscription({
      restaurantId: new ObjectId(restaurantId),
      planId: new ObjectId(planId),
      planName: plan.name,
      status: "active",
      startDate,
      endDate,
      renewalDate: endDate,
      paymentMethod,
      transactionId,
      autoRenewal: true,
    });

    await subscription.save();

    return NextResponse.json(subscription, { status: 201 });
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
