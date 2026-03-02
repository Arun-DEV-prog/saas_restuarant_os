import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// GET foods
export async function GET(req, ctx) {
  const { restaurantId, categoryId } = await ctx.params;

  if (!ObjectId.isValid(restaurantId) || !ObjectId.isValid(categoryId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId or categoryId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  const foods = await db
    .collection("foods")
    .find({
      restaurantId: new ObjectId(restaurantId),
      categoryId: new ObjectId(categoryId),
    })
    .toArray();

  // Convert ObjectIds to strings for proper serialization
  const serializedFoods = foods.map((food) => ({
    ...food,
    _id: food._id.toString(),
    restaurantId: food.restaurantId.toString(),
    categoryId: food.categoryId.toString(),
  }));

  return NextResponse.json(serializedFoods);
}

// POST food
export async function POST(req, ctx) {
  const { restaurantId, categoryId } = await ctx.params;
  const body = await req.json();

  if (!ObjectId.isValid(restaurantId) || !ObjectId.isValid(categoryId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId or categoryId" },
      { status: 400 },
    );
  }

  const db = await getDb();

  // Create the food document
  const foodDoc = {
    ...body,
    restaurantId: new ObjectId(restaurantId),
    categoryId: new ObjectId(categoryId),
    createdAt: new Date(),
  };

  const result = await db.collection("foods").insertOne(foodDoc);

  // Return the complete food object with _id
  const createdFood = {
    _id: result.insertedId,
    ...body,
    restaurantId: restaurantId,
    categoryId: categoryId,
    createdAt: foodDoc.createdAt,
  };

  return NextResponse.json(createdFood);
}
