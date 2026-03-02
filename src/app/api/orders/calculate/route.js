// app/api/orders/[id]/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

const VALID = [
  "pending",
  "confirmed",
  "preparing",
  "ready",
  "served",
  "cancelled",
];

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const { status } = await request.json();

    if (!VALID.includes(status))
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });

    const coll = await getCollection("orders");
    const result = await coll.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!result)
      return NextResponse.json({ error: "Order not found" }, { status: 404 });

    // Emit socket update
    try {
      const io = global.io;
      if (io)
        io.to(`restaurant-${result.restaurantId}`).emit(
          "order_status_updated",
          { orderId: id, status },
        );
    } catch {}

    return NextResponse.json({
      success: true,
      order: { ...result, _id: result._id.toString() },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const coll = await getCollection("orders");
    const order = await coll.findOne({ _id: new ObjectId(params.id) });
    if (!order)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ...order, _id: order._id.toString() });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
