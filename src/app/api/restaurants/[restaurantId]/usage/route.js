import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPlanById } from "@/lib/plans";

export async function GET(req, { params: paramsPromise }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await paramsPromise;

    const restaurants = await getCollection("restaurants");
    const restaurant = await restaurants.findOne({
      _id: new ObjectId(restaurantId),
      ownerId: new ObjectId(session.user.id),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    const plan = getPlanById(restaurant?.planId || "starter");
    const menusCollection = await getCollection("menus");
    const itemsCollection = await getCollection("foodItems");
    const tablesCollection = await getCollection("tables");
    const usersCollection = await getCollection("users");

    // Get current usage
    const [menuCount, itemCount, tableCount, userCount, orderCount] =
      await Promise.all([
        menusCollection.countDocuments({
          restaurantId: new ObjectId(restaurantId),
        }),
        itemsCollection.countDocuments({
          restaurantId: new ObjectId(restaurantId),
        }),
        tablesCollection.countDocuments({
          restaurantId: new ObjectId(restaurantId),
        }),
        usersCollection.countDocuments({
          restaurantId: new ObjectId(restaurantId),
        }),
        // Assuming there's an orders collection
        Promise.resolve(0).then(async () => {
          try {
            const ordersCollection = await getCollection("orders");
            return ordersCollection.countDocuments({
              restaurantId: new ObjectId(restaurantId),
              createdAt: {
                $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            });
          } catch {
            return 0;
          }
        }),
      ]);

    return NextResponse.json({
      planId: restaurant.planId || "starter",
      plan: plan?.name,
      limits: plan?.limits,
      usage: {
        menus: menuCount,
        items: itemCount,
        tables: tableCount,
        users: userCount,
        orders: orderCount,
      },
      percentages: {
        menus: Math.round((menuCount / plan?.limits.maxMenus) * 100),
        items: Math.round((itemCount / plan?.limits.maxFoodItems) * 100),
        tables: Math.round((tableCount / plan?.limits.maxTables) * 100),
        users: Math.round((userCount / plan?.limits.maxUsers) * 100),
      },
    });
  } catch (error) {
    console.error("[Get Usage Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to get usage data" },
      { status: 500 },
    );
  }
}
