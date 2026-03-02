// src/app/api/admin/tables/config/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// ─────────────────────────────────────────────────────────────
// GET /api/admin/tables/config?restaurantId=xxx
// Returns all configs + tables + stats
// ─────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    if (!restaurantId)
      return NextResponse.json(
        { error: "restaurantId required" },
        { status: 400 },
      );

    const [cfgColl, tblColl] = await Promise.all([
      getCollection("seatingConfigs"),
      getCollection("tables"),
    ]);

    // Auto-release expired reservations on every read
    await tblColl.updateMany(
      { status: "reserved", reservationExpiry: { $lt: new Date() } },
      {
        $set: { status: "available" },
        $unset: {
          reservedAt: "",
          reservationExpiry: "",
          persons: "",
          orderId: "",
        },
      },
    );

    const configs = await cfgColl
      .find({ restaurantId })
      .sort({ areaType: 1, capacity: 1 })
      .toArray();

    const tables = await tblColl
      .find({ restaurantId })
      .sort({ tableNumber: 1 })
      .toArray();

    const total = tables.length;
    const occupied = tables.filter((t) =>
      ["reserved", "occupied"].includes(t.status),
    ).length;

    return NextResponse.json({
      configs: configs.map((c) => ({ ...c, _id: c._id.toString() })),
      tables: tables.map((t) => ({ ...t, _id: t._id.toString() })),
      stats: {
        total,
        occupied,
        available: total - occupied,
        occupancy: total ? Math.round((occupied / total) * 100) : 0,
      },
    });
  } catch (err) {
    console.error("[admin/tables/config GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
// POST /api/admin/tables/config
// Body: { restaurantId, areaType, capacity, totalTables, price }
// Creates config + auto-generates table records
// ─────────────────────────────────────────────────────────────
export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 },
      );
    }

    const { restaurantId, areaType, capacity, totalTables, price } = body;

    // Validate required fields with better error messages
    if (!restaurantId)
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    if (!areaType)
      return NextResponse.json(
        { error: "areaType is required" },
        { status: 400 },
      );
    if (capacity === undefined || capacity === null)
      return NextResponse.json(
        { error: "capacity is required" },
        { status: 400 },
      );
    if (totalTables === undefined || totalTables === null)
      return NextResponse.json(
        { error: "totalTables is required" },
        { status: 400 },
      );
    if (price === undefined || price === null)
      return NextResponse.json({ error: "price is required" }, { status: 400 });

    const [cfgColl, tblColl] = await Promise.all([
      getCollection("seatingConfigs"),
      getCollection("tables"),
    ]);

    // Prevent duplicate config
    const existing = await cfgColl.findOne({
      restaurantId,
      areaType,
      capacity: parseInt(capacity),
    });
    if (existing)
      return NextResponse.json(
        {
          error: `Config for ${areaType} table-for-${capacity} already exists`,
        },
        { status: 409 },
      );

    // Insert config
    const cfgDoc = {
      restaurantId,
      areaType,
      capacity: parseInt(capacity),
      totalTables: parseInt(totalTables),
      price: parseFloat(price),
      createdAt: new Date(),
    };
    const cfgResult = await cfgColl.insertOne(cfgDoc);
    const configId = cfgResult.insertedId.toString();

    // Auto-generate table records: D4-01 … D4-15 (dine-in) or F4-01 … (food-court)
    const prefix = areaType === "dine-in" ? "D" : "F";
    const cap = parseInt(capacity);
    const count = parseInt(totalTables);

    const tableDocs = Array.from({ length: count }, (_, i) => ({
      configId,
      restaurantId,
      areaType,
      capacity: cap,
      tableNumber: `${prefix}${cap}-${String(i + 1).padStart(2, "0")}`,
      status: "available",
      createdAt: new Date(),
    }));

    await tblColl.insertMany(tableDocs);

    return NextResponse.json(
      {
        success: true,
        configId,
        tablesCreated: count,
        prefix: `${prefix}${cap}-`,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("[admin/tables/config POST]", err);
    console.error("[admin/tables/config POST] Stack:", err.stack);
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// DELETE /api/admin/tables/config?configId=xxx&restaurantId=xxx
// Removes config + all its tables
// ─────────────────────────────────────────────────────────────
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const configId = searchParams.get("configId");
    const restaurantId = searchParams.get("restaurantId");

    if (!configId)
      return NextResponse.json({ error: "configId required" }, { status: 400 });

    const [cfgColl, tblColl] = await Promise.all([
      getCollection("seatingConfigs"),
      getCollection("tables"),
    ]);

    const [cfgResult, tblResult] = await Promise.all([
      cfgColl.deleteOne({ _id: new ObjectId(configId) }),
      tblColl.deleteMany({ configId, restaurantId }),
    ]);

    return NextResponse.json({
      success: true,
      deletedConfig: cfgResult.deletedCount,
      deletedTables: tblResult.deletedCount,
    });
  } catch (err) {
    console.error("[admin/tables/config DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
