import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect, { getDb } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import { ObjectId } from "mongodb";

// List all subscriptions (admin only)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    // Check if owner or admin
    if (
      !session ||
      (session.user.role !== "owner" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const subscriptions = await Subscription.find().populate("planId").lean();

    // Fetch restaurant names for each subscription
    const db = await getDb();
    const enrichedSubscriptions = await Promise.all(
      subscriptions.map(async (sub) => {
        const restaurant = await db
          .collection("restaurants")
          .findOne({ _id: new ObjectId(sub.restaurantId) });
        return {
          ...sub,
          restaurantName: restaurant?.name || "Unknown Restaurant",
        };
      }),
    );

    return NextResponse.json(enrichedSubscriptions);
  } catch (error) {
    console.error("Error listing subscriptions:", error);
    return NextResponse.json(
      { error: "Failed to list subscriptions" },
      { status: 500 },
    );
  }
}

// Create subscription for a specific restaurant (admin only)
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "owner" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { restaurantId, planId, durationMonths = 1, notes } = body;

    if (!restaurantId || !planId) {
      return NextResponse.json(
        { error: "Missing required fields: restaurantId, planId" },
        { status: 400 },
      );
    }

    await dbConnect();

    // Verify plan exists
    const plan = await Plan.findById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    // Cancel existing subscriptions
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
    endDate.setMonth(endDate.getMonth() + durationMonths);

    const subscription = new Subscription({
      restaurantId: new ObjectId(restaurantId),
      planId: new ObjectId(planId),
      planName: plan.name,
      status: "active",
      startDate,
      endDate,
      renewalDate: endDate,
      paymentMethod: "manual",
      notes,
      autoRenewal: false,
      monthlyUsage: [
        {
          month: new Date(startDate.getFullYear(), startDate.getMonth(), 1),
          ordersCount: 0,
          tableRequestsCount: 0,
          menuItemsCount: 0,
          apiCallsCount: 0,
        },
      ],
    });

    await subscription.save();

    // Fetch restaurant name
    const db = await getDb();
    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(restaurantId) });

    return NextResponse.json(
      {
        ...subscription.toObject(),
        restaurantName: restaurant?.name || "Unknown Restaurant",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating subscription:", error);
    return NextResponse.json(
      { error: "Failed to create subscription" },
      { status: 500 },
    );
  }
}
