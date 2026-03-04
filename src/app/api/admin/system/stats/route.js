// app/api/admin/system/stats/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

/**
 * GET /api/admin/system/stats
 * Protected route - requires admin role
 * Returns platform-wide statistics
 */
export async function GET() {
  try {
    // Check authentication and authorization
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || session?.user?.userRole;

    if (!session || !userRole || !["owner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 },
      );
    }

    const db = await getDb();

    // Get stats
    const [totalRestaurants, totalUsers, totalOrders, totalRevenue] =
      await Promise.all([
        db.collection("restaurants").countDocuments(),
        db.collection("users").countDocuments(),
        db.collection("orders").countDocuments(),
        db
          .collection("orders")
          .aggregate([
            {
              $group: {
                _id: null,
                total: { $sum: "$totalAmount" },
              },
            },
          ])
          .toArray(),
      ]);

    return Response.json({
      success: true,
      stats: {
        totalRestaurants,
        totalUsers,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return Response.json(
      { error: "Failed to fetch admin statistics" },
      { status: 500 },
    );
  }
}
