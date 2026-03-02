import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// GET categories for a restaurant
export async function GET(req, ctx) {
  const { restaurantId } = await ctx.params;

  if (!ObjectId.isValid(restaurantId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const categories = await db
    .collection("categories")
    .find({ restaurantId: new ObjectId(restaurantId) })
    .toArray();

  // Convert ObjectIds to strings for proper serialization
  const serializedCategories = categories.map((cat) => ({
    ...cat,
    _id: cat._id.toString(),
    restaurantId: cat.restaurantId.toString(),
  }));

  return NextResponse.json(serializedCategories);
}

// POST create a new category
export async function POST(req, ctx) {
  const { restaurantId } = await ctx.params;
  const body = await req.json();

  if (!ObjectId.isValid(restaurantId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  // Create the category document
  const categoryDoc = {
    restaurantId: new ObjectId(restaurantId),
    name: body.name,
    description: body.description || "",
    createdAt: new Date(),
  };

  const result = await db.collection("categories").insertOne(categoryDoc);

  // ✅ IMPORTANT: Return the complete category object with _id as a string
  const createdCategory = {
    _id: result.insertedId.toString(), // Convert ObjectId to string
    restaurantId: restaurantId,
    name: body.name,
    description: body.description || "",
    createdAt: categoryDoc.createdAt,
  };

  return NextResponse.json(createdCategory);
}
