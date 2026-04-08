import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

// GET all foods for a restaurant
export async function GET(req, ctx) {
  const { restaurantId } = await ctx.params;

  if (!ObjectId.isValid(restaurantId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId" },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();

    const foods = await db
      .collection("foods")
      .find({
        restaurantId: new ObjectId(restaurantId),
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
  } catch (error) {
    console.error("[GET /api/restaurants/[restaurantId]/foods] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch foods" },
      { status: 500 },
    );
  }
}

// POST a new food
export async function POST(req, ctx) {
  const { restaurantId } = await ctx.params;
  const body = await req.json();

  if (!ObjectId.isValid(restaurantId)) {
    return NextResponse.json(
      { error: "Invalid restaurantId" },
      { status: 400 },
    );
  }

  try {
    const db = await getDb();

    const foodDoc = {
      ...body,
      restaurantId: new ObjectId(restaurantId),
      categoryId: body.categoryId ? new ObjectId(body.categoryId) : null,
      createdAt: new Date(),
      isAvailable: body.isAvailable !== false,
    };

    const result = await db.collection("foods").insertOne(foodDoc);

    const createdFood = {
      _id: result.insertedId.toString(),
      ...body,
      restaurantId: restaurantId,
      createdAt: foodDoc.createdAt,
    };

    return NextResponse.json(createdFood);
  } catch (error) {
    console.error("[POST /api/restaurants/[restaurantId]/foods] Error:", error);
    return NextResponse.json(
      { error: "Failed to create food" },
      { status: 500 },
    );
  }
}
