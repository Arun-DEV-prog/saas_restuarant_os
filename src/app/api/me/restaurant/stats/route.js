import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    const db = await getDb();
    const restaurantId = session.user.restaurantId;

    if (!restaurantId) {
      return Response.json(
        { error: "No restaurant found for this user" },
        { status: 404 },
      );
    }

    // Parse date range from query params
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const matchStage = { restaurantId }; // Query by restaurantId as string

    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) {
        matchStage.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        matchStage.createdAt.$lte = end;
      }
    }

    const ordersCollection = db.collection("orders");

    console.group("📊 [Stats API] Query Debug");
    console.log("Restaurant ID:", restaurantId);
    console.log("Match stage:", matchStage);
    console.groupEnd();

    // Get total orders
    const totalOrders = await ordersCollection.countDocuments(matchStage);
    console.log("✅ Total orders found:", totalOrders);
    
    // Debug: Show all orders for this restaurant
    const allOrders = await ordersCollection.find(matchStage).limit(3).toArray();
    console.log("📋 Sample orders:", allOrders.map(o => ({
      _id: o._id,
      restaurantId: o.restaurantId,
      total: o.total,
      createdAt: o.createdAt
    })));

    // Get revenue (sum of all order totals)
    const revenueData = await ordersCollection
      .aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
          },
        },
      ])
      .toArray();

    const totalRevenue = revenueData[0]?.totalRevenue || 0;
    console.log("💰 Total revenue:", totalRevenue);

    // Get unique customers count
    const uniqueCustomers = await ordersCollection
      .aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: "$customerEmail",
          },
        },
        {
          $count: "customers",
        },
      ])
      .toArray();

    const customersCount = uniqueCustomers[0]?.customers || 0;

    return Response.json({
      totalOrders,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      customersCount,
    });
  } catch (error) {
    console.error("GET /api/me/restaurant/stats error:", error);
    return Response.json(
      { error: "Failed to load statistics" },
      { status: 500 },
    );
  }
}
