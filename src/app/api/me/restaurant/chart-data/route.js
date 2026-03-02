import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

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

    const matchStage = { restaurantId: restaurantId };

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

    const chartData = await ordersCollection
      .aggregate([
        {
          $match: matchStage,
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            orderCount: { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
        {
          $sort: { _id: 1 },
        },
      ])
      .toArray();

    return Response.json(chartData);
  } catch (error) {
    console.error("GET /api/me/restaurant/chart-data error:", error);
    return Response.json(
      { error: "Failed to load chart data" },
      { status: 500 },
    );
  }
}
