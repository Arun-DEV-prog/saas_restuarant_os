// app/api/tables/availability/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");
    const areaType = searchParams.get("areaType"); // "dine-in" | "food-court"
    const persons = parseInt(searchParams.get("persons") || "1");

    if (!restaurantId)
      return NextResponse.json(
        { error: "restaurantId required" },
        { status: 400 },
      );

    const [cfgColl, tblColl] = await Promise.all([
      getCollection("seatingConfigs"),
      getCollection("tables"),
    ]);

    // Auto-release expired 15-min reservations
    await tblColl.updateMany(
      { status: "reserved", reservationExpiry: { $lt: new Date() } },
      {
        $set: { status: "available" },
        $unset: { reservedAt: "", reservationExpiry: "", persons: "" },
      },
    );

    const query = { restaurantId };
    if (areaType) query.areaType = areaType;
    const configs = await cfgColl.find(query).sort({ capacity: 1 }).toArray();

    const availability = await Promise.all(
      configs.map(async (cfg) => {
        const occupied = await tblColl.countDocuments({
          configId: cfg._id.toString(),
          restaurantId,
          status: { $in: ["reserved", "occupied"] },
        });
        const available = cfg.totalTables - occupied;
        return {
          configId: cfg._id.toString(),
          areaType: cfg.areaType,
          capacity: cfg.capacity,
          price: cfg.price, // ← always from DB
          label: `Table for ${cfg.capacity}`,
          total: cfg.totalTables,
          occupied,
          available,
          canAccommodate: cfg.capacity >= persons,
          isFull: available <= 0,
        };
      }),
    );

    return NextResponse.json({ availability, TAX_RATE: 0.1 });
  } catch (err) {
    console.error("[availability]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
