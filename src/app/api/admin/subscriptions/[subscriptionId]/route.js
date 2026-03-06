import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect, { getDb } from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import { ObjectId } from "mongodb";

// Get specific subscription (admin only)
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "owner" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { subscriptionId } = params;
    await dbConnect();

    const subscription = await Subscription.findById(subscriptionId)
      .populate("planId")
      .lean();

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Fetch restaurant name
    const db = await getDb();
    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(subscription.restaurantId) });

    return NextResponse.json({
      ...subscription,
      restaurantName: restaurant?.name || "Unknown Restaurant",
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Failed to fetch subscription" },
      { status: 500 },
    );
  }
}

// Update subscription (admin only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "owner" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { subscriptionId } = params;
    const body = await req.json();
    const { status, endDate, notes, autoRenewal } = body;

    await dbConnect();

    const updates = {};
    if (status) updates.status = status;
    if (endDate) updates.endDate = new Date(endDate);
    if (notes !== undefined) updates.notes = notes;
    if (autoRenewal !== undefined) updates.autoRenewal = autoRenewal;

    if (status === "canceled") {
      updates.canceledAt = new Date();
    }

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      updates,
      { new: true },
    ).populate("planId");

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Fetch restaurant name
    const db = await getDb();
    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(subscription.restaurantId) });

    return NextResponse.json({
      ...subscription.toObject(),
      restaurantName: restaurant?.name || "Unknown Restaurant",
    });
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Failed to update subscription" },
      { status: 500 },
    );
  }
}

// Delete/cancel subscription (admin only)
export async function DELETE(req, { params }) {
  try {
    const session = await getServerSession(authOptions);

    if (
      !session ||
      (session.user.role !== "owner" && session.user.role !== "admin")
    ) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { subscriptionId } = params;
    await dbConnect();

    const subscription = await Subscription.findByIdAndUpdate(
      subscriptionId,
      {
        status: "canceled",
        canceledAt: new Date(),
      },
      { new: true },
    );

    if (!subscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    // Fetch restaurant name
    const db = await getDb();
    const restaurant = await db
      .collection("restaurants")
      .findOne({ _id: new ObjectId(subscription.restaurantId) });

    return NextResponse.json({
      ...subscription.toObject(),
      restaurantName: restaurant?.name || "Unknown Restaurant",
    });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    return NextResponse.json(
      { error: "Failed to cancel subscription" },
      { status: 500 },
    );
  }
}
