// app/api/admin/restaurants/list/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

/**
 * GET /api/admin/restaurants/list
 * Protected route - requires admin role
 * Returns all restaurants in the system
 */
export async function GET(request) {
  try {
    console.log("📋 [GET /api/admin/restaurants/list] Starting...");

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

    // Get search/filter parameters
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Build query - work with existing restaurant structure
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { mallName: { $regex: search, $options: "i" } },
      ];
    }

    const restaurants = await db
      .collection("restaurants")
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`✅ Found ${restaurants.length} restaurants in database`);
    console.log(
      "🏢 Restaurant names:",
      restaurants.map((r) => r.name || r.slug),
    );

    // Map to response format
    const restaurantsWithStats = restaurants.map((restaurant) => ({
      ...restaurant,
      ordersCount: restaurant.orders?.length || 0,
      totalRevenue: 0, // Calculate if needed
      tablesCount: restaurant.tables?.length || restaurant.tablesCount || 0,
      menusCount: restaurant.menus?.length || 0,
    }));

    return Response.json({
      success: true,
      total: restaurantsWithStats.length,
      restaurants: restaurantsWithStats,
    });
  } catch (error) {
    console.error("🚨 Error fetching restaurants:", error);
    return Response.json(
      { error: error.message || "Failed to fetch restaurants" },
      { status: 500 },
    );
  }
}
