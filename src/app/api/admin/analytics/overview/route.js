// app/api/admin/analytics/overview/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

/**
 * GET /api/admin/analytics/overview
 * Protected route - requires admin role
 * Returns platform-wide analytics
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || session?.user?.userRole;

    if (!session || !userRole || !["owner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 },
      );
    }

    const db = await getDb();

    // Get all stats in parallel
    const [
      totalRestaurants,
      totalUsers,
      totalOrders,
      totalRevenue,
      activeUsers,
      ordersLast30Days,
      revenueLast30Days,
    ] = await Promise.all([
      db.collection("restaurants").countDocuments(),
      db.collection("users").countDocuments(),
      db.collection("orders").countDocuments(),
      db
        .collection("orders")
        .aggregate([{ $group: { _id: null, total: { $sum: "$totalAmount" } } }])
        .toArray(),
      db
        .collection("orders")
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $group: { _id: "$restaurantId", count: { $sum: 1 } } },
          { $group: { _id: null, count: { $sum: 1 } } },
        ])
        .toArray(),
      db.collection("orders").countDocuments({
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      }),
      db
        .collection("orders")
        .aggregate([
          {
            $match: {
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
          },
          { $group: { _id: null, total: { $sum: "$totalAmount" } } },
        ])
        .toArray(),
    ]);

    // Get order distribution by date (last 7 days)
    const last7DaysOrders = await db
      .collection("orders")
      .aggregate([
        {
          $match: {
            createdAt: {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            },
          },
        },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            count: { $sum: 1 },
            revenue: { $sum: "$totalAmount" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    // Get top restaurants by revenue
    const topRestaurants = await db
      .collection("restaurants")
      .aggregate([
        {
          $lookup: {
            from: "orders",
            localField: "_id",
            foreignField: "restaurantId",
            as: "orders",
          },
        },
        {
          $project: {
            name: 1,
            revenue: {
              $sum: "$orders.totalAmount",
            },
            ordersCount: { $size: "$orders" },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 5 },
      ])
      .toArray();

    return Response.json({
      success: true,
      analytics: {
        stats: {
          totalRestaurants,
          totalUsers,
          totalOrders,
          totalRevenue: totalRevenue[0]?.total || 0,
          activeUsersLast30Days: activeUsers[0]?.count || 0,
          ordersLast30Days,
          revenueLast30Days: revenueLast30Days[0]?.total || 0,
        },
        chartData: last7DaysOrders,
        topRestaurants: topRestaurants.map((r) => ({
          ...r,
          _id: r._id.toString(),
        })),
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return Response.json(
      { error: "Failed to fetch analytics" },
      { status: 500 },
    );
  }
}
