// api/orders/checkout-preview/route.js
// Returns pricing preview WITHOUT creating an order
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { restaurantId, cartItems, tableId, persons, areaType } =
      await request.json();

    if (!restaurantId || !cartItems?.length)
      return NextResponse.json(
        { error: "restaurantId and cartItems required" },
        { status: 400 },
      );

    const [foodsColl, tblColl, cfgColl, restColl] = await Promise.all([
      getCollection("foods"),
      getCollection("tables"),
      getCollection("seatingConfigs"),
      getCollection("restaurants"),
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

    // 2. For dine-in: Verify table still reserved
    let seatingPrice = 0;
    if (tableId) {
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

      // 3. Seating price from DB
      const cfg = await cfgColl.findOne({ _id: new ObjectId(table.configId) });
      seatingPrice = cfg ? parseFloat(cfg.price) : 0;
    }
    // For online orders, seatingPrice remains 0

    // 4. Food prices from DB
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

    // 5. Calculate pricing
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

    return NextResponse.json(
      {
        success: true,
        preview: {
          items: enrichedItems,
          foodTotal,
          seatingPrice,
          subtotal,
          taxRate: taxRatePercent,
          taxAmount,
          total,
          perPerson,
          persons: p,
        },
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("[checkout-preview]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
