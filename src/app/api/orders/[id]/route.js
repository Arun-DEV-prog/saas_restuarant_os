// app/api/orders/[orderId]/route.js
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function PATCH(request, { params }) {
  try {
    // Handle params that might be a promise
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { success: false, error: "status is required" },
        { status: 400 },
      );
    }

    console.log(`\n${"=".repeat(60)}`);
    console.log(`[PATCH /api/orders] Status Update Request`);
    console.log(`${"=".repeat(60)}`);
    console.log(`Received orderId: "${orderId}"`);
    console.log(`Received status: "${status}"`);
    console.log(`OrderId type: ${typeof orderId}`);
    console.log(`OrderId length: ${orderId.length}`);

    // Update order in database
    const db = await getDb();
    const ordersCollection = db.collection("orders");

    // Validate ObjectId
    if (!ObjectId.isValid(orderId)) {
      console.log(`❌ Invalid ObjectId format!`);
      console.log(`  Raw string: "${orderId}"`);
      console.log(`  Hex validation: ${ObjectId.isValid(orderId)}`);
      return NextResponse.json(
        {
          success: false,
          error: `Invalid order ID format: "${orderId}" is not a valid ObjectId`,
        },
        { status: 400 },
      );
    }

    const objectId = new ObjectId(orderId);
    console.log(`✅ Valid ObjectId conversion`);
    console.log(`  String input: "${orderId}"`);
    console.log(`  ObjectId output: ${objectId.toString()}`);
    console.log(`  ObjectIds equal: ${objectId.toString() === orderId}`);

    // First, try to find the order to see if it exists
    const checkOrder = await ordersCollection.findOne({ _id: objectId });

    if (!checkOrder) {
      console.log(`❌ Order NOT FOUND in database`);
      console.log(`  Searched for _id: ${objectId.toString()}`);

      // List all orders to help debug
      console.log(`\n📋 DEBUG: Listing first 5 orders in DB:`);
      const allOrders = await ordersCollection.find({}).limit(5).toArray();
      allOrders.forEach((o, i) => {
        console.log(`  Order ${i + 1}:`);
        console.log(`    _id (ObjectId): ${o._id.toString()}`);
        console.log(`    _id type: ${o._id.constructor.name}`);
        console.log(`    orderNumber: ${o.orderNumber}`);
        console.log(`    restaurantId: ${o.restaurantId}`);
        console.log(`    status: ${o.status}`);
      });

      return NextResponse.json(
        {
          success: false,
          error: `Order not found with ID: ${objectId.toString()}`,
        },
        { status: 404 },
      );
    }

    console.log(`✅ Order FOUND in database`);
    console.log(`  Order Number: ${checkOrder.orderNumber}`);
    console.log(`  Current Status: ${checkOrder.status}`);
    console.log(`  New Status: ${status}`);

    // Update the order
    const updateResult = await ordersCollection.updateOne(
      { _id: objectId },
      {
        $set: {
          status,
          updatedAt: new Date(),
        },
      },
    );

    console.log(`Update result:`, {
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount,
      acknowledged: updateResult.acknowledged,
    });

    if (updateResult.modifiedCount === 0) {
      console.log(`❌ Update failed - no documents were modified`);
      return NextResponse.json(
        { success: false, error: "Failed to update order" },
        { status: 500 },
      );
    }

    // Fetch the updated order to return it
    const order = await ordersCollection.findOne({ _id: objectId });

    if (!order) {
      console.log(`❌ Could not fetch updated order`);
      return NextResponse.json(
        { success: false, error: "Order not found after update" },
        { status: 404 },
      );
    }

    console.log(`✅ Order updated successfully`);
    console.log(`  New Status: ${order.status}`);
    console.log(`  Updated At: ${order.updatedAt}`);

    // Emit socket event to external socket server
    try {
      const SOCKET_SERVER_URL =
        process.env.SOCKET_SERVER_URL || "http://localhost:3001";
      const updatePayload = {
        event: "order-update",
        data: {
          orderId: order._id.toString(),
          _id: order._id.toString(),
          restaurantId: order.restaurantId,
          status: order.status,
          updatedAt: order.updatedAt,
        },
      };

      // Send to external socket server via HTTP
      const response = await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatePayload),
      });

      if (response.ok) {
        console.log(`📡 Socket event sent to external server`);
      } else {
        console.warn(`⚠️ Socket server responded with ${response.status}`);
      }
    } catch (e) {
      console.warn("[socket] Error notifying socket server:", e.message);
    }

    console.log(`${"=".repeat(60)}\n`);

    return NextResponse.json({
      success: true,
      status: order.status,
      order: {
        _id: order._id.toString(),
        orderNumber: order.orderNumber,
        status: order.status,
        updatedAt: order.updatedAt,
      },
    });
  } catch (error) {
    console.error("[PATCH /api/orders] ERROR:", error);
    console.error(`Error message: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}

export async function GET(request, { params }) {
  try {
    // Handle params that might be a promise
    const resolvedParams = await Promise.resolve(params);
    const orderId = resolvedParams.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    // Fetch order from database
    const db = await getDb();
    const ordersCollection = db.collection("orders");

    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { success: false, error: "Invalid order ID format" },
        { status: 400 },
      );
    }

    const order = await ordersCollection.findOne({
      _id: new ObjectId(orderId),
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      _id: order._id.toString(),
      ...order,
    });
  } catch (error) {
    console.error("[GET /api/orders] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    );
  }
}
