// app/api/restaurants/[restaurantId]/api-keys/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import crypto from "crypto";

// ── GET /api/restaurants/[restaurantId]/api-keys
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

    const apiKeys = restaurant.apiKeys || [];
    // Don't expose full keys, only last 4 chars
    const safeKeys = apiKeys.map((key) => ({
      id: key.id,
      name: key.name,
      lastChars: key.key.slice(-4),
      createdAt: key.createdAt,
      isActive: key.isActive,
    }));

    return NextResponse.json({ apiKeys: safeKeys });
  } catch (err) {
    console.error("[api-keys GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/restaurants/[restaurantId]/api-keys (create new key)
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
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Key name required" }, { status: 400 });
    }

    const newKey = {
      id: crypto.randomBytes(16).toString("hex"),
      name,
      key: `sk_${restaurantId}_${crypto.randomBytes(32).toString("hex")}`,
      createdAt: new Date(),
      isActive: true,
    };

    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $push: { apiKeys: newKey } },
    );

    return NextResponse.json({
      id: newKey.id,
      name: newKey.name,
      key: newKey.key, // Only shown once on creation
      createdAt: newKey.createdAt,
    });
  } catch (err) {
    console.error("[api-keys POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE /api/restaurants/[restaurantId]/api-keys/[keyId]
export async function DELETE(req, { params: paramsPromise }) {
  try {
    const { restaurantId, keyId } = await paramsPromise;

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
      { $pull: { apiKeys: { id: keyId } } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api-keys DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
