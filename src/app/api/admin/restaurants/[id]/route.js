// app/api/admin/restaurants/[id]/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * GET /api/admin/restaurants/[id]
 * Protected route - requires admin role
 * Returns detailed restaurant info with analytics
 */
export async function GET(request, { params }) {
  try {
    console.log("🔍 [GET /api/admin/restaurants/[id]] Starting...");

    // Await params in Next.js 13+ App Router
    const { id } = await params;

    // Check authorization - middleware already validated JWT role
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || session?.user?.userRole;

    if (!session || !userRole || !["owner", "admin"].includes(userRole)) {
      console.log("❌ Auth failed: missing session or invalid role", userRole);
      return Response.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 },
      );
    }

    console.log("✅ Authorized as:", userRole);

    const db = await getDb();

    console.log("🆔 Restaurant ID:", id);

    // Validate ID
    if (!ObjectId.isValid(id)) {
      console.log("❌ Invalid ObjectId format:", id);
      return Response.json({ error: "Invalid restaurant ID" }, { status: 400 });
    }

    // Get restaurant - work with existing structure
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(id),
    });

    console.log("🏢 Restaurant found:", restaurant ? "YES" : "NO");

    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    console.log("✅ Restaurant detail fetch successful");

    return Response.json({
      success: true,
      restaurant: {
        ...restaurant,
        stats: {
          ordersCount: restaurant.orders?.length || 0,
          totalRevenue: 0,
          avgOrderValue: 0,
          tablesCount: restaurant.tables?.length || restaurant.tablesCount || 0,
          menusCount: restaurant.menus?.length || 0,
        },
      },
    });
  } catch (error) {
    console.error("🚨 Error fetching restaurant:", error);
    return Response.json(
      { error: error.message || "Failed to fetch restaurant" },
      { status: 500 },
    );
  }
}
