import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import { ObjectId } from "mongodb";

// Get current month usage for subscription
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
    });

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 },
      );
    }

    // Get current month
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    let usage = subscription.monthlyUsage.find(
      (u) => new Date(u.month).getTime() === currentMonth.getTime(),
    );

    if (!usage) {
      usage = {
        month: currentMonth,
        ordersCount: 0,
        tableRequestsCount: 0,
        menuItemsCount: 0,
        apiCallsCount: 0,
      };
    }

    return NextResponse.json(usage);
  } catch (error) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage" },
      { status: 500 },
    );
  }
}

// Track usage increment (called internally)
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
    const { type = "orders", increment = 1 } = body;

    // type: 'orders', 'tableRequests', 'menuItems', 'apiCalls'

    await dbConnect();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const updateField =
      {
        orders: "monthlyUsage.$[elem].ordersCount",
        tableRequests: "monthlyUsage.$[elem].tableRequestsCount",
        menuItems: "monthlyUsage.$[elem].menuItemsCount",
        apiCalls: "monthlyUsage.$[elem].apiCallsCount",
      }[type] || "monthlyUsage.$[elem].ordersCount";

    const subscription = await Subscription.findOneAndUpdate(
      {
        restaurantId: new ObjectId(restaurantId),
        status: "active",
      },
      {
        $inc: { [updateField]: increment },
      },
      {
        arrayFilters: [
          {
            "elem.month": {
              $gte: currentMonth,
              $lt: new Date(currentMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
        new: true,
      },
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "No active subscription" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, subscription });
  } catch (error) {
    console.error("Error updating usage:", error);
    return NextResponse.json(
      { error: "Failed to update usage" },
      { status: 500 },
    );
  }
}
