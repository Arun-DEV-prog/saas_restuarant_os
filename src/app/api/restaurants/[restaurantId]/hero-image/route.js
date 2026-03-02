// app/api/restaurants/[id]/hero-image/route.js
//
// ✅ Uses MongoDB driver to update restaurants collection.
//    Writes heroImage field to the restaurant document.
//
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── GET /api/restaurants/[id]/hero-image ──────────────────────────────────────
// Retrieves the hero image URL for a restaurant
export async function GET(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;
    const restaurantsColl = await getCollection("restaurants");
    const restaurant = await restaurantsColl.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant?.heroImage) {
      return NextResponse.json({ heroImage: null }, { status: 200 });
    }

    return NextResponse.json(
      { heroImage: restaurant.heroImage },
      { status: 200 },
    );
  } catch (err) {
    console.error("[hero-image GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/restaurants/[id]/hero-image ─────────────────────────────────────
// Body: multipart/form-data  →  field "file" (image)
// Returns: { heroImage: "https://res.cloudinary.com/..." }
export async function POST(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    // Convert to base64 for Cloudinary
    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload — auto-crops to 1920×600 banner, overwrites previous upload
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "restaurant-heroes",
      public_id: `hero_${restaurantId}`,
      overwrite: true,
      transformation: [
        {
          width: 1920,
          height: 600,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    // Update restaurant document with heroImage
    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $set: { heroImage: result.secure_url } },
    );

    return NextResponse.json({ heroImage: result.secure_url });
  } catch (err) {
    console.error("[hero-image POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE /api/restaurants/[id]/hero-image ───────────────────────────────────
export async function DELETE(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;
    // Remove from Cloudinary (best-effort)
    try {
      await cloudinary.uploader.destroy(
        `restaurant-heroes/hero_${restaurantId}`,
      );
    } catch {}

    // Remove heroImage field from restaurant document
    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $unset: { heroImage: "" } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[hero-image DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
