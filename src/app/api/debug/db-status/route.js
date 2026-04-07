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

    // Count all orders
    const ordersCollection = db.collection("orders");
    const totalOrdersInDB = await ordersCollection.countDocuments({});
    const ordersForRestaurant = await ordersCollection.countDocuments({
      restaurantId,
    });

    // Show sample orders
    const sampleOrders = await ordersCollection.find({}).limit(5).toArray();

    // Show all restaurants
    const restColl = db.collection("restaurants");
    const totalRestaurants = await restColl.countDocuments({});
    const userRestaurant = await restColl
      .findOne({ _id: require("mongodb").ObjectId(restaurantId) })
      .catch(() => null);

    return Response.json({
      status: "ok",
      session: {
        email: session.user.email,
        restaurantId,
      },
      database: {
        totalOrdersInDB,
        ordersForRestaurant,
        totalRestaurants,
        userRestaurant: userRestaurant
          ? {
              _id: userRestaurant._id,
              name: userRestaurant.name,
              slug: userRestaurant.slug,
            }
          : null,
        sampleOrders: sampleOrders.map((o) => ({
          _id: o._id,
          restaurantId: o.restaurantId,
          orderNumber: o.orderNumber,
          total: o.total,
          createdAt: o.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Debug error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}
