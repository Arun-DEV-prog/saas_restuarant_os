// app/api/orders/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

function genOrderNumber() {
  const d = new Date();
  const s =
    String(d.getFullYear()).slice(-2) +
    String(d.getMonth() + 1).padStart(2, "0") +
    String(d.getDate()).padStart(2, "0");
  return `ORD-${s}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(request) {
  try {
    const {
      restaurantId,
      items,
      persons = 1,
      tableNumber,
      customerNote,
    } = await request.json();
    if (!restaurantId || !items?.length)
      return NextResponse.json(
        { error: "restaurantId and items required" },
        { status: 400 },
      );

    const [foodsColl, restColl, ordersColl] = await Promise.all([
      getCollection("foods"),
      getCollection("restaurants"),
      getCollection("orders"),
    ]);

    const restaurant = await restColl.findOne({
      _id: new ObjectId(restaurantId),
    });
    if (!restaurant)
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );

    // Re-price from DB — never trust frontend
    const enriched = await Promise.all(
      items.map(async ({ foodId, quantity }) => {
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

    const p = parseInt(persons);
    const subtotal = parseFloat(
      enriched.reduce((s, i) => s + i.totalPrice, 0).toFixed(2),
    );

    // Get tax rate from restaurant settings (stored as percentage, e.g., 3 means 3%)
    const taxRatePercent = restaurant.orders?.taxRate ?? 10; // Default 10% if not set
    const taxRate = taxRatePercent / 100; // Convert to decimal (3 -> 0.03)
    const taxAmount = parseFloat((subtotal * taxRate).toFixed(2));
    const total = parseFloat((subtotal + taxAmount).toFixed(2));
    const perPerson = parseFloat((total / p).toFixed(2));

    const doc = {
      orderNumber: genOrderNumber(),
      restaurantId,
      restaurantName: restaurant.name,
      items: enriched,
      persons: p,
      subtotal,
      taxRate: taxRatePercent,
      taxAmount,
      total,
      perPerson,
      status: "pending",
      tableNumber: tableNumber || null,
      customerNote: customerNote || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await ordersColl.insertOne(doc);
    const saved = { ...doc, _id: result.insertedId.toString() };

    console.log(`[POST /api/orders] ✅ Order created successfully:`);
    console.log(`  - Order Number: ${saved.orderNumber}`);
    console.log(`  - Order ID: ${saved._id}`);
    console.log(`  - Restaurant ID: ${saved.restaurantId}`);
    console.log(`  - Status: ${saved.status}`);
    console.log(`  - Total: $${saved.total}`);

    // Emit via Socket.io to external server
    try {
      const SOCKET_SERVER_URL =
        process.env.SOCKET_SERVER_URL || "http://localhost:3001";
      const createPayload = {
        event: "order-create",
        data: saved,
      };

      const response = await fetch(`${SOCKET_SERVER_URL}/notify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createPayload),
      });

      if (response.ok) {
        console.log(
          `[POST /api/orders] 📡 Order created notification sent to socket server`,
        );
      }
    } catch (e) {
      console.error("[socket]", e.message);
    }

    return NextResponse.json(
      {
        success: true,
        order: {
          _id: saved._id,
          orderNumber: saved.orderNumber,
          total,
          perPerson,
          persons: p,
          status: "pending",
        },
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[orders POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const status = searchParams.get("status");
    if (!restaurantId)
      return NextResponse.json(
        { error: "restaurantId required" },
        { status: 400 },
      );

    console.log(
      `[GET /api/orders] Fetching orders for restaurant: ${restaurantId}`,
    );

    const coll = await getCollection("orders");
    const query = { restaurantId };
    if (status) query.status = status;

    const orders = await coll
      .find(query)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();

    console.log(`[GET /api/orders] Found ${orders.length} orders`);
    if (orders.length > 0) {
      console.log(`[GET /api/orders] Sample order:`, {
        _id: orders[0]._id.toString(),
        orderNumber: orders[0].orderNumber,
        status: orders[0].status,
        restaurantId: orders[0].restaurantId,
        createdAt: orders[0].createdAt,
      });
    }

    return NextResponse.json(
      orders.map((o) => ({ ...o, _id: o._id.toString() })),
    );
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
