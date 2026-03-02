// api/orders/checkout/route.js
// Creates the actual order
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
      tableId,
      persons,
      areaType,
      customerNote,
    } = await request.json();

    if (!restaurantId || !cartItems?.length || !tableId)
      return NextResponse.json(
        { error: "restaurantId, cartItems and tableId required" },
        { status: 400 },
      );

    const [foodsColl, tblColl, cfgColl, restColl, ordersColl] =
      await Promise.all([
        getCollection("foods"),
        getCollection("tables"),
        getCollection("seatingConfigs"),
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

    // 2. Verify table still reserved (race-condition guard)
    const table = await tblColl.findOne({
      _id: new ObjectId(tableId),
      restaurantId,
      status: "reserved",
    });
    if (!table)
      return NextResponse.json(
        {
          error: "Table reservation expired. Please select a table again.",
          tableExpired: true,
        },
        { status: 409 },
      );

    // 3. Seating price from DB — never from client
    const cfg = await cfgColl.findOne({ _id: new ObjectId(table.configId) });
    const seatingPrice = cfg ? parseFloat(cfg.price) : 0;

    // 4. Food prices from DB — never from client
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

    // 5. Calculate everything server-side
    const p = parseInt(persons) || 1;
    const foodTotal = parseFloat(
      enrichedItems.reduce((s, i) => s + i.totalPrice, 0).toFixed(2),
    );
    const subtotal = parseFloat((foodTotal + seatingPrice).toFixed(2));

    // Get tax rate from restaurant settings (stored as percentage, e.g., 3 means 3%)
    const taxRatePercent = restaurant.orders?.taxRate ?? 10; // Default 10% if not set
    const taxRate = taxRatePercent / 100; // Convert to decimal (3 -> 0.03)
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));
    const perPerson = parseFloat((total / p).toFixed(2));

    // 6. Insert order
    const orderDoc = {
      orderNumber: genOrderNumber(),
      restaurantId,
      restaurantName: restaurant.name,
      items: enrichedItems,
      tableId,
      tableNumber: table.tableNumber,
      areaType: areaType || cfg?.areaType || "dine-in",
      persons: p,
      foodTotal,
      seatingPrice,
      subtotal,
      taxRate: taxRatePercent,
      taxAmount,
      total,
      perPerson,
      status: "pending",
      customerNote: customerNote || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const inserted = await ordersColl.insertOne(orderDoc);

    console.log(`[POST /api/orders/checkout] ✅ Order created successfully:`);
    console.log(`  - Order Number: ${orderDoc.orderNumber}`);
    console.log(`  - Order ID: ${inserted.insertedId.toString()}`);
    console.log(`  - Restaurant ID: ${restaurantId}`);
    console.log(`  - Table: ${table.tableNumber}`);
    console.log(`  - Status: pending`);
    console.log(`  - Total: $${orderDoc.total}`);

    // 7. Mark table occupied
    await tblColl.updateOne(
      { _id: new ObjectId(tableId) },
      {
        $set: { status: "occupied", orderId: inserted.insertedId.toString() },
        $unset: { reservationExpiry: "" },
      },
    );

    // 8. Socket.io — notify restaurant dashboard instantly via external server
    try {
      const SOCKET_SERVER_URL =
        process.env.SOCKET_SERVER_URL || "http://localhost:3001";
      const payload = { ...orderDoc, _id: inserted.insertedId.toString() };

      // Send order created notification
      await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "order-create",
          data: payload,
        }),
      });

      // Send table updated notification
      await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "table-update",
          data: {
            restaurantId,
            tableId,
            status: "occupied",
            tableNumber: table.tableNumber,
          },
        }),
      });

      console.log(
        `[POST /api/orders/checkout] 📡 Notifications sent to socket server`,
      );
    } catch (e) {
      console.warn("[socket] Error notifying socket server:", e.message);
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          _id: inserted.insertedId.toString(),
          orderNumber: orderDoc.orderNumber,
          tableNumber: table.tableNumber,
          areaType: orderDoc.areaType,
          persons: p,
          foodTotal,
          seatingPrice,
          subtotal,
          taxRate: taxRatePercent,
          taxAmount,
          total,
          perPerson,
          status: "pending",
          items: enrichedItems,
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[checkout]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
