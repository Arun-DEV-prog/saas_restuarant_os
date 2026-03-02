import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const body = await request.json();
    console.log("[tables/release] Request body:", body);

    const { tableId, restaurantId } = body;

    if (!tableId) {
      console.error("[tables/release] Missing tableId");
      return NextResponse.json({ error: "tableId required" }, { status: 400 });
    }

    if (!restaurantId) {
      console.error("[tables/release] Missing restaurantId");
      return NextResponse.json(
        { error: "restaurantId required" },
        { status: 400 },
      );
    }

    const tblColl = await getCollection("tables");

    // Build query - restaurantId is stored as string in database
    const query = {
      _id: new ObjectId(tableId),
      restaurantId: restaurantId, // Keep as string, not ObjectId
    };

    console.log("[tables/release] Query:", query);

    // Diagnostic: Check if table exists with just the ID
    const tableExists = await tblColl.findOne({ _id: new ObjectId(tableId) });
    console.log("[tables/release] Table by ID only:", tableExists);

    // Diagnostic: Check all tables for this restaurant
    const restaurantTables = await tblColl
      .find({ restaurantId })
      .limit(3)
      .toArray();
    console.log(
      `[tables/release] Tables for restaurant ${restaurantId}:`,
      restaurantTables,
    );

    const result = await tblColl.findOneAndUpdate(
      query,
      {
        $set: { status: "available" },
        $unset: {
          reservedAt: "",
          reservationExpiry: "",
          persons: "",
          orderId: "",
        },
      },
      { returnDocument: "after" },
    );

    console.log("[tables/release] Update result:", result);

    if (!result) {
      console.error("[tables/release] Table not found for query:", query);
      return NextResponse.json(
        { error: "Table not found or not available" },
        { status: 404 },
      );
    }

    // MongoDB driver returns document directly or wrapped in .value
    const updatedTable = result.value || result;

    // Emit socket update so dashboard reflects instantly
    try {
      const io = global.io;
      if (io)
        io.to(`restaurant-${restaurantId}`).emit("table-updated", {
          tableId,
          status: "available",
          tableNumber: updatedTable.tableNumber,
        });
    } catch {}

    return NextResponse.json({
      success: true,
      tableNumber: updatedTable.tableNumber,
    });
  } catch (err) {
    console.error("[tables/release]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
