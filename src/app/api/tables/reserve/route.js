import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

export async function POST(request) {
  try {
    const { restaurantId, configId, persons } = await request.json();
    if (!restaurantId || !configId)
      return NextResponse.json(
        { error: "restaurantId and configId required" },
        { status: 400 },
      );

    const [cfgColl, tblColl] = await Promise.all([
      getCollection("seatingConfigs"),
      getCollection("tables"),
    ]);

    // Price always from DB — never trust client
    const cfg = await cfgColl.findOne({ _id: new ObjectId(configId) });
    if (!cfg)
      return NextResponse.json({ error: "Config not found" }, { status: 404 });

    const p = parseInt(persons);
    if (cfg.capacity < p)
      return NextResponse.json(
        { error: `Table for ${cfg.capacity} cannot seat ${p} people` },
        { status: 400 },
      );

    const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15-min hold

    // Atomic — prevents double-booking race condition
    const reserved = await tblColl.findOneAndUpdate(
      { configId, restaurantId, status: "available" },
      {
        $set: {
          status: "reserved",
          reservedAt: new Date(),
          reservationExpiry: expiry,
          persons: p,
        },
      },
      { returnDocument: "after" },
    );

    if (!reserved)
      return NextResponse.json(
        { error: "No tables available for this size", available: false },
        { status: 409 },
      );

    return NextResponse.json({
      success: true,
      tableId: reserved._id.toString(),
      tableNumber: reserved.tableNumber,
      capacity: cfg.capacity,
      seatingPrice: cfg.price, // ← from DB only
      expiresAt: expiry,
      minutesLeft: 15,
    });
  } catch (err) {
    console.error("[reserve]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
