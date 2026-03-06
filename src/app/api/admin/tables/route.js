// src/app/api/admin/tables/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// ─────────────────────────────────────────────────────────────
// GET /api/admin/tables?restaurantId=xxx
// Returns all tables for the restaurant
// ─────────────────────────────────────────────────────────────
export async function GET(request) {
  try {
    // Check authorization from session
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || session?.user?.userRole;

    console.log("[Admin Tables GET]", {
      hasSession: !!session,
      userRole,
      userId: session?.user?.id,
    });

    if (
      !session ||
      !userRole ||
      !["owner", "admin", "restaurant_admin"].includes(userRole)
    ) {
      console.log("❌ Auth failed: missing session or invalid role", userRole);
      return NextResponse.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(request.url);
    const restaurantId = searchParams.get("restaurantId");

    if (!restaurantId) {
      return NextResponse.json(
        { success: false, error: "restaurantId is required" },
        { status: 400 },
      );
    }

    const tblColl = await getCollection("tables");

    // Auto-release expired reservations
    await tblColl.updateMany(
      {
        restaurantId,
        status: "reserved",
        reservationExpiry: { $lt: new Date() },
      },
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

    // Get all tables for this restaurant
    const tables = await tblColl
      .find({ restaurantId })
      .sort({ tableNumber: 1 })
      .toArray();

    // Calculate stats
    const stats = {
      total: tables.length,
      available: tables.filter((t) => t.status === "available").length,
      reserved: tables.filter((t) => t.status === "reserved").length,
      occupied: tables.filter((t) => t.status === "occupied").length,
      dineIn: {
        total: tables.filter((t) => t.areaType === "dine-in").length,
        occupied: tables.filter(
          (t) =>
            t.areaType === "dine-in" &&
            ["reserved", "occupied"].includes(t.status),
        ).length,
      },
      foodCourt: {
        total: tables.filter((t) => t.areaType === "food-court").length,
        occupied: tables.filter(
          (t) =>
            t.areaType === "food-court" &&
            ["reserved", "occupied"].includes(t.status),
        ).length,
      },
    };

    return NextResponse.json({
      success: true,
      tables: tables.map((t) => ({
        ...t,
        _id: t._id.toString(),
        isOccupied: ["reserved", "occupied"].includes(t.status),
      })),
      stats,
    });
  } catch (err) {
    console.error("[admin/tables GET]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

// ─────────────────────────────────────────────────────────────
// PATCH /api/admin/tables
// Body: { restaurantId, tableId, status }
// Manually update table status (for admin release)
// ─────────────────────────────────────────────────────────────
export async function PATCH(request) {
  try {
    const { restaurantId, tableId, status } = await request.json();

    if (!restaurantId || !tableId) {
      return NextResponse.json(
        { success: false, error: "restaurantId and tableId required" },
        { status: 400 },
      );
    }

    const tblColl = await getCollection("tables");

    const updateDoc = {
      $set: {
        status: status || "available",
        updatedAt: new Date(),
      },
    };

    // If releasing table, clear reservation data
    if (status === "available") {
      updateDoc.$unset = {
        reservedAt: "",
        reservationExpiry: "",
        persons: "",
        orderId: "",
      };
    }

    const result = await tblColl.updateOne(
      { _id: new ObjectId(tableId), restaurantId },
      updateDoc,
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Table not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Table updated successfully",
    });
  } catch (err) {
    console.error("[admin/tables PATCH]", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}
