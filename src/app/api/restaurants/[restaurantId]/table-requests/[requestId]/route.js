// FILE: app/api/restaurants/[restaurantId]/table-requests/[requestId]/route.js
// Dashboard uses this to acknowledge or resolve a guest request

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TableRequest from "@/lib/models/TableRequest";
import mongoose from "mongoose";

// ── PATCH /api/restaurants/[restaurantId]/table-requests/[requestId] ──────────
export async function PATCH(request, { params }) {
  try {
    await dbConnect();
    const { requestId } = await params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { message: "Invalid requestId" },
        { status: 400 },
      );
    }

    const { status } = await request.json();

    const validStatuses = ["pending", "acknowledged", "resolved"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const update = { status };
    if (status === "resolved") update.resolvedAt = new Date();

    const updated = await TableRequest.findByIdAndUpdate(
      new mongoose.Types.ObjectId(requestId),
      { $set: update },
      { new: true },
    );

    if (!updated) {
      return NextResponse.json(
        { message: "Request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, request: updated });
  } catch (err) {
    console.error("[table-requests PATCH]", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// ── DELETE /api/restaurants/[restaurantId]/table-requests/[requestId] ─────────
export async function DELETE(request, { params }) {
  try {
    await dbConnect();
    const { requestId } = await params;

    if (!mongoose.Types.ObjectId.isValid(requestId)) {
      return NextResponse.json(
        { message: "Invalid requestId" },
        { status: 400 },
      );
    }

    await TableRequest.findByIdAndDelete(
      new mongoose.Types.ObjectId(requestId),
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
