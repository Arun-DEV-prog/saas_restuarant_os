import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import { ObjectId } from "mongodb";

// Check if subscription is valid and get plan details
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const restaurantId = session.user.restaurantId;
    if (!restaurantId) {
      return NextResponse.json(
        { isValid: false, reason: "no_restaurant" },
        { status: 200 },
      );
    }

    await dbConnect();

    // Find active subscription
    const subscription = await Subscription.findOne({
      restaurantId: new ObjectId(restaurantId),
      status: "active",
      endDate: { $gt: new Date() }, // Not expired
    }).populate("planId");

    if (!subscription) {
      return NextResponse.json(
        { isValid: false, reason: "no_subscription" },
        { status: 200 },
      );
    }

    const plan = subscription.planId;

    // Get current month usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const usage = subscription.monthlyUsage.find(
      (u) => new Date(u.month).getTime() === currentMonth.getTime(),
    );

    const response = {
      isValid: true,
      subscription: subscription.toObject(),
      plan: plan.toObject(),
      currentUsage: usage || {
        month: currentMonth,
        ordersCount: 0,
        tableRequestsCount: 0,
        menuItemsCount: 0,
        apiCallsCount: 0,
      },
      limits: {
        monthlyOrderLimit: plan.monthlyOrderLimit,
        monthlyTableRequestLimit: plan.monthlyTableRequestLimit,
        monthlyMenuItemsLimit: plan.monthlyMenuItemsLimit,
        monthlyUsersLimit: plan.monthlyUsersLimit,
      },
      accessFeatures: plan.accessFeatures,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error checking subscription:", error);
    return NextResponse.json(
      { error: "Failed to check subscription" },
      { status: 500 },
    );
  }
}
