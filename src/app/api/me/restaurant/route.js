// app/api/me/restaurant/route.js
import { getDb } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    // Check if user is authenticated
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { error: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    const db = await getDb();

    // Get the restaurantId from session
    const restaurantId = session.user.restaurantId;

    if (!restaurantId) {
      return Response.json(
        { error: "No restaurant found for this user" },
        { status: 404 },
      );
    }

    // Find the restaurant by ID
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    return Response.json(restaurant);
  } catch (error) {
    console.error("GET /api/me/restaurant error:", error);
    return Response.json(
      { error: "Failed to load restaurant" },
      { status: 500 },
    );
  }
}
