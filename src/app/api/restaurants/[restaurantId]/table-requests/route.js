// FILE: app/api/restaurants/[restaurantId]/table-requests/route.js
// Handles real-time table action requests from guests → dashboard

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TableRequest from "@/lib/models/TableRequest";
import mongoose from "mongoose";

// ── POST /api/restaurants/[restaurantId]/table-requests ───────────────────────
// Guest submits an action from the public menu page
export async function POST(request, { params }) {
  try {
    await dbConnect();
    const { restaurantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { message: "Invalid restaurantId" },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { tableNumber, action, guestNote } = body;

    if (!tableNumber || !action) {
      return NextResponse.json(
        { message: "tableNumber and action are required" },
        { status: 400 },
      );
    }

    const validActions = [
      "call_waiter",
      "request_water",
      "request_bill",
      "table_cleanup",
    ];
    if (!validActions.includes(action)) {
      return NextResponse.json({ message: "Invalid action" }, { status: 400 });
    }

    // Prevent duplicate pending requests for same table + action
    const existing = await TableRequest.findOne({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      tableNumber,
      action,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { message: "Request already pending", request: existing },
        { status: 200 },
      );
    }

    const req = await TableRequest.create({
      restaurantId: new mongoose.Types.ObjectId(restaurantId),
      tableNumber,
      action,
      guestNote: guestNote || "",
    });

    return NextResponse.json({ success: true, request: req }, { status: 201 });
  } catch (err) {
    console.error("[table-requests POST]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ── GET /api/restaurants/[restaurantId]/table-requests ────────────────────────
// Dashboard polls this for real-time updates (status filter, recent 100)
export async function GET(request, { params }) {
  try {
    await dbConnect();
    const { restaurantId } = await params;

    if (!mongoose.Types.ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { message: "Invalid restaurantId" },
        { status: 400 },
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending" | "acknowledged" | "resolved" | null

    const query = { restaurantId: new mongoose.Types.ObjectId(restaurantId) };
    if (status) query.status = status;

    const requests = await TableRequest.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    return NextResponse.json(requests, { status: 200 });
  } catch (err) {
    console.error("[table-requests GET]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
