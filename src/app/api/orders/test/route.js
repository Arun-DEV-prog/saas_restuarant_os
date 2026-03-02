import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request) {
  try {
    const db = await getDb();
    const ordersCollection = db.collection("orders");

    // Get total count
    const totalCount = await ordersCollection.countDocuments();

    // Get last 10 orders
    const recentOrders = await ordersCollection
      .find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({
      success: true,
      totalOrders: totalCount,
      recentOrders: recentOrders.map((o) => ({
        _id: o._id.toString(),
        orderNumber: o.orderNumber,
        status: o.status,
        restaurantId: o.restaurantId,
        total: o.total,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("[GET /api/orders/test] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 },
    );
  }
}
