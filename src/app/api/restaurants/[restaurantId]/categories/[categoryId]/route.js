import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// DELETE a category
export async function DELETE(req, ctx) {
  const { restaurantId, categoryId } = await ctx.params;

  if (!ObjectId.isValid(restaurantId) || !ObjectId.isValid(categoryId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId or categoryId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  // Delete the category
  const result = await db.collection("categories").deleteOne({
    _id: new ObjectId(categoryId),
    restaurantId: new ObjectId(restaurantId),
  });

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Category deleted" });
}

// GET a specific category
export async function GET(req, ctx) {
  const { restaurantId, categoryId } = await ctx.params;

  if (!ObjectId.isValid(restaurantId) || !ObjectId.isValid(categoryId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId or categoryId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const category = await db.collection("categories").findOne({
    _id: new ObjectId(categoryId),
    restaurantId: new ObjectId(restaurantId),
  });

  if (!category) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json(category);
}

// PUT update a category
export async function PUT(req, ctx) {
  const { restaurantId, categoryId } = await ctx.params;
  const body = await req.json();

  if (!ObjectId.isValid(restaurantId) || !ObjectId.isValid(categoryId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId or categoryId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const result = await db.collection("categories").updateOne(
    {
      _id: new ObjectId(categoryId),
      restaurantId: new ObjectId(restaurantId),
    },
    {
      $set: {
        name: body.name,
        description: body.description || "",
        updatedAt: new Date(),
      },
    },
  );

  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Category not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Category updated" });
}
