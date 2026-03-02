// app/api/restaurants/[restaurantId]/webhooks/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// ── GET /api/restaurants/[restaurantId]/webhooks
export async function GET(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const restaurantsColl = await getCollection("restaurants");
    const restaurant = await restaurantsColl.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    const webhooks = restaurant.webhooks || [];
    return NextResponse.json({ webhooks });
  } catch (err) {
    console.error("[webhooks GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/restaurants/[restaurantId]/webhooks (create new webhook)
export async function POST(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { url, events } = body;

    if (!url || !events || !Array.isArray(events)) {
      return NextResponse.json(
        { error: "URL and events array required" },
        { status: 400 },
      );
    }

    const newWebhook = {
      id: crypto.randomBytes(16).toString("hex"),
      url,
      events,
      secret: crypto.randomBytes(32).toString("hex"),
      createdAt: new Date(),
      isActive: true,
      lastTriggeredAt: null,
      failureCount: 0,
    };

    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $push: { webhooks: newWebhook } },
    );

    return NextResponse.json(newWebhook);
  } catch (err) {
    console.error("[webhooks POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT /api/restaurants/[restaurantId]/webhooks/[webhookId] (update webhook)
export async function PUT(req, { params: paramsPromise }) {
  try {
    const { restaurantId, webhookId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const { url, events, isActive } = body;

    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId), "webhooks.id": webhookId },
      {
        $set: {
          "webhooks.$.url": url,
          "webhooks.$.events": events,
          "webhooks.$.isActive": isActive,
          "webhooks.$.updatedAt": new Date(),
        },
      },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[webhooks PUT]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE /api/restaurants/[restaurantId]/webhooks/[webhookId]
export async function DELETE(req, { params: paramsPromise }) {
  try {
    const { restaurantId, webhookId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $pull: { webhooks: { id: webhookId } } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[webhooks DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
