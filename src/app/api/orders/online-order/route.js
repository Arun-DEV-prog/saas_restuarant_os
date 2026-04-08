// api/orders/online-order/route.js
// Creates an online order without table reservation
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

function genOrderNumber() {
  const d = new Date();
  const s = `${String(d.getFullYear()).slice(-2)}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `ORD-${s}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request) {
  try {
    const {
      restaurantId,
      cartItems,
      customerInfo,
      paymentMethod,
      customerNote,
    } = await request.json();

    if (!restaurantId || !cartItems?.length || !customerInfo)
      return NextResponse.json(
        { error: "restaurantId, cartItems and customerInfo required" },
        { status: 400 },
      );

    const { name, phone, email, location } = customerInfo;
    if (!name || !phone || !email || !location)
      return NextResponse.json(
        { error: "All customer fields are required" },
        { status: 400 },
      );

    const [foodsColl, restColl, ordersColl] = await Promise.all([
      getCollection("foods"),
      getCollection("restaurants"),
      getCollection("orders"),
    ]);

    // 1. Verify restaurant
    const restaurant = await restColl.findOne({
      _id: new ObjectId(restaurantId),
    });
    if (!restaurant)
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );

    // 2. Get food prices from DB — never from client
    const enrichedItems = await Promise.all(
      cartItems.map(async ({ foodId, quantity }) => {
        const food = await foodsColl.findOne({ _id: new ObjectId(foodId) });
        if (!food) throw new Error(`Food not found: ${foodId}`);
        const unitPrice = parseFloat(food.price);
        const qty = parseInt(quantity);
        return {
          foodId: food._id.toString(),
          name: food.name,
          image: food.image || null,
          quantity: qty,
          unitPrice,
          totalPrice: parseFloat((unitPrice * qty).toFixed(2)),
        };
      }),
    );

    // 3. Calculate pricing (no seating price for online orders)
    const foodTotal = parseFloat(
      enrichedItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2),
    );
    const subtotal = foodTotal;

    // Get tax rate from restaurant settings (stored as percentage, e.g., 3 means 3%)
    const taxRatePercent = restaurant.orders?.taxRate ?? 10; // Default 10% if not set
    const taxRate = taxRatePercent / 100; // Convert to decimal (3 -> 0.03)
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));

    // 4. Create order document with online delivery details
    const orderDoc = {
      orderNumber: genOrderNumber(),
      restaurantId,
      restaurantName: restaurant.name,
      items: enrichedItems,
      areaType: "online-ordering",
      orderType: "delivery",
      paymentMethod: paymentMethod || "cod", // "cod": Cash on Delivery, "online": Online Payment
      customerInfo: {
        name,
        phone,
        email,
        location,
      },
      foodTotal,
      seatingPrice: 0,
      subtotal,
      taxRate: taxRatePercent,
      taxAmount,
      total,
      status: paymentMethod === "online" ? "pending_payment" : "pending",
      customerNote: customerNote || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await ordersColl.insertOne(orderDoc);

    console.log(
      `[POST /api/orders/online-order] ✅ Online order created successfully:`,
    );
    console.log(`  - Order Number: ${orderDoc.orderNumber}`);
    console.log(`  - Order ID: ${inserted.insertedId.toString()}`);
    console.log(`  - Restaurant ID: ${restaurantId}`);
    console.log(`  - Customer: ${name}`);
    console.log(`  - Delivery Location: ${location}`);
    console.log(`  - Payment Method: ${paymentMethod || "cod"}`);
    console.log(`  - Status: ${orderDoc.status}`);
    console.log(`  - Total: $${orderDoc.total}`);

    // 5. Socket.io — notify restaurant dashboard instantly via external server
    try {
      const SOCKET_SERVER_URL =
        process.env.SOCKET_SERVER_URL || "http://localhost:3001";
      const payload = { ...orderDoc, _id: inserted.insertedId.toString() };

      // Send order created notification
      await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order-created",
          restaurantId,
          order: payload,
        }),
      });

      // Join restaurant room
      await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "order-updated",
          restaurantId,
          data: {
            orderId: inserted.insertedId.toString(),
            status: orderDoc.status,
          },
        }),
      });
    } catch (socketErr) {
      console.error(
        "[POST /api/orders/online-order] Socket notification failed:",
        socketErr.message,
      );
      // Non-critical failure — order still created
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          ...orderDoc,
          _id: inserted.insertedId.toString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/orders/online-order] Error:", error.message);
    return NextResponse.json(
      { error: error.message || "Failed to create online order" },
      { status: 500 },
    );
  }
}
