// app/api/restaurants/[restaurantId]/logo/route.js
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ── GET /api/restaurants/[restaurantId]/logo
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

    if (!restaurant?.logo) {
      return NextResponse.json({ logo: null }, { status: 200 });
    }

    return NextResponse.json({ logo: restaurant.logo }, { status: 200 });
  } catch (err) {
    console.error("[logo GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── POST /api/restaurants/[restaurantId]/logo
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

    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    // Upload logo (square, 500x500)
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "restaurant-logos",
      public_id: `logo_${restaurantId}`,
      overwrite: true,
      transformation: [
        {
          width: 500,
          height: 500,
          crop: "fill",
          gravity: "auto",
          quality: "auto",
          fetch_format: "auto",
        },
      ],
    });

    // Update restaurant document with logo
    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $set: { logo: result.secure_url } },
    );

    return NextResponse.json({ logo: result.secure_url });
  } catch (err) {
    console.error("[logo POST]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── DELETE /api/restaurants/[restaurantId]/logo
export async function DELETE(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    // Remove from Cloudinary (best-effort)
    try {
      await cloudinary.uploader.destroy(
        `restaurant-logos/logo_${restaurantId}`,
      );
    } catch {}

    // Remove logo field from restaurant document
    const restaurantsColl = await getCollection("restaurants");
    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $unset: { logo: "" } },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[logo DELETE]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
