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

    // Fetch orders from separate orders collection
    const ordersCollection = db.collection("orders");
    const restaurantIdString = id; // Orders use string restaurantId

    let orders = [];
    try {
      orders = await ordersCollection
        .find({ restaurantId: restaurantIdString })
        .toArray();
      console.log("📦 Found orders in orders collection:", orders.length);
    } catch (err) {
      console.warn(
        "⚠️ Could not fetch orders from orders collection:",
        err.message,
      );
      orders = [];
    }

    // Calculate financial stats from orders
    let totalRevenue = 0;
    try {
      totalRevenue = orders.reduce((sum, order) => {
        if (!order) return sum;
        // Handle different order total formats
        const orderTotal = order.total || order.amount || order.subtotal || 0;
        const amount = typeof orderTotal === "number" ? orderTotal : 0;
        console.log(`  Order ${order.orderNumber}: $${amount}`);
        return sum + amount;
      }, 0);
    } catch (err) {
      console.error("⚠️ Error calculating revenue:", err);
      totalRevenue = 0;
    }

    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;

    // Fetch menus from separate menus collection
    const menusCollection = db.collection("menus");
    let menus = [];
    try {
      menus = await menusCollection
        .find({ restaurantId: restaurantIdString })
        .toArray();
      console.log("📋 Found menus in menus collection:", menus.length);
    } catch (err) {
      console.warn(
        "⚠️ Could not fetch menus from menus collection:",
        err.message,
      );
      menus = [];
    }

    console.log(
      "💰 Financial stats - Total Revenue:",
      totalRevenue.toFixed(2),
      "| Avg Order Value:",
      avgOrderValue.toFixed(2),
      "| Orders:",
      orders.length,
    );
    console.log("📋 Menus count:", menus.length);

    return Response.json({
      success: true,
      restaurant: {
        ...restaurant,
        orders: orders, // Include orders in response for page display
        menus: menus, // Include menus in response for page display
        stats: {
          ordersCount: orders.length,
          totalRevenue: parseFloat(totalRevenue.toFixed(2)),
          avgOrderValue: parseFloat(avgOrderValue.toFixed(2)),
          tablesCount: restaurant.tables?.length || restaurant.tablesCount || 0,
          menusCount: menus.length,
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
