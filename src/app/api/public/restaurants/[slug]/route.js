import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

// GET restaurant by slug (public endpoint)
export async function GET(req, ctx) {
  try {
    const { slug } = await ctx.params;

    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    const db = await getDb();

    const restaurant = await db.collection("restaurants").findOne({ slug });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    // Return public restaurant data (exclude sensitive info)
    const publicData = {
      _id: restaurant._id.toString(),
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      hours: restaurant.hours,
      logo: restaurant.logo,
      publicUrl: restaurant.publicUrl,
      qrCodeBase64: restaurant.qrCodeBase64,
      category: restaurant.category,
      mallName: restaurant.mallName,
      tablesCount: restaurant.tablesCount,
    };

    return NextResponse.json(publicData);
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
