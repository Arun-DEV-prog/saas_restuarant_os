// api/debug/orders/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const orderId = searchParams.get("orderId");

    const ordersColl = await getCollection("orders");

    if (orderId) {
      console.log(`[DEBUG] Looking for order: ${orderId}`);

      // Check if valid ObjectId
      if (!ObjectId.isValid(orderId)) {
        console.log(`[DEBUG] ❌ Not a valid ObjectId: ${orderId}`);
        return NextResponse.json({
          error: `Invalid ObjectId: ${orderId}`,
          isValid: false,
        });
      }

      const order = await ordersColl.findOne({ _id: new ObjectId(orderId) });
      if (order) {
        console.log(`[DEBUG] ✅ Found order:`, order);
        return NextResponse.json({
          found: true,
          order: {
            _id: order._id.toString(),
            orderNumber: order.orderNumber,
            restaurantId: order.restaurantId,
            status: order.status,
            total: order.total,
            createdAt: order.createdAt,
          },
        });
      } else {
        console.log(`[DEBUG] ❌ Order not found: ${orderId}`);
        return NextResponse.json({
          found: false,
          orderId,
          message: `Order ${orderId} not found in database`,
        });
      }
    }

    if (restaurantId) {
      console.log(
        `[DEBUG] Fetching all orders for restaurant: ${restaurantId}`,
      );

      const orders = await ordersColl
        .find({ restaurantId })
        .sort({ createdAt: -1 })
        .limit(20)
        .toArray();

      console.log(
        `[DEBUG] ✅ Found ${orders.length} orders for restaurant ${restaurantId}`,
      );

      return NextResponse.json({
        restaurantId,
        count: orders.length,
        orders: orders.map((o) => ({
          _id: o._id.toString(),
          orderNumber: o.orderNumber,
          status: o.status,
          total: o.total,
          createdAt: o.createdAt,
          tableNumber: o.tableNumber || "N/A",
        })),
      });
    }

    // Show all restaurants in database
    const restaurantsColl = await getCollection("restaurants");
    const restaurants = await restaurantsColl.find({}).limit(5).toArray();

    return NextResponse.json({
      message: "DEBUG endpoint",
      instructions:
        "Use ?restaurantId=XXX to see orders for a restaurant or ?orderId=XXX to check a specific order",
      sampleRestaurants: restaurants.map((r) => ({
        _id: r._id.toString(),
        name: r.name,
      })),
    });
  } catch (error) {
    console.error("[DEBUG] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
