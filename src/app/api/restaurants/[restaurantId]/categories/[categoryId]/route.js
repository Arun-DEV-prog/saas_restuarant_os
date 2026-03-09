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

  try {
    const db = await getDb();

    console.log(
      `[DELETE Category] Attempting to delete category: ${categoryId}`,
    );

    // First, delete all foods in this category
    const foodsDeleteResult = await db.collection("foods").deleteMany({
      categoryId: new ObjectId(categoryId),
      restaurantId: new ObjectId(restaurantId),
    });

    console.log(
      `[DELETE Category] Deleted ${foodsDeleteResult.deletedCount} foods from category`,
    );

    // Then delete the category itself
    const categoryDeleteResult = await db.collection("categories").deleteOne({
      _id: new ObjectId(categoryId),
      restaurantId: new ObjectId(restaurantId),
    });

    console.log(
      `[DELETE Category] Category delete result:`,
      categoryDeleteResult,
    );

    if (categoryDeleteResult.deletedCount === 0) {
      console.warn(`[DELETE Category] Category not found: ${categoryId}`);
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    console.log(
      `[DELETE Category] Successfully deleted category ${categoryId} and ${foodsDeleteResult.deletedCount} foods`,
    );

    return NextResponse.json({
      success: true,
      message: "Category deleted",
      foodsDeleted: foodsDeleteResult.deletedCount,
      categoryDeleted: categoryDeleteResult.deletedCount,
    });
  } catch (error) {
    console.error("[DELETE Category] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete category" },
      { status: 500 },
    );
  }
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
