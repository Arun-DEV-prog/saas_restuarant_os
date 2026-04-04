import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import RestaurantAutomationService from "@/lib/automationService";
import { ObjectId } from "mongodb";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(session.user.restaurantId),
    });

    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get or create schedule
    const schedule = await RestaurantAutomationService.getOrCreateSchedule(
      new ObjectId(session.user.restaurantId),
      db,
    );

    // Get recent analysis results
    const recentReports = await db
      .collection("automation_reports")
      .find({ restaurantId: new ObjectId(session.user.restaurantId) })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    return Response.json({
      schedule,
      recentReports,
      isMissingApiKey: !process.env.GEMINI_API_KEY,
    });
  } catch (error) {
    console.error("Error fetching automation config:", error);
    return Response.json(
      { error: "Failed to fetch configuration" },
      { status: 500 },
    );
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { schedule } = await req.json();
    const db = await getDb();

    const updated = await db
      .collection("automation_schedules")
      .updateOne(
        { restaurantId: new ObjectId(session.user.restaurantId) },
        { $set: { ...schedule, updatedAt: new Date() } },
      );

    return Response.json({ success: true, updated: updated.modifiedCount > 0 });
  } catch (error) {
    console.error("Error updating automation schedule:", error);
    return Response.json(
      { error: "Failed to update schedule" },
      { status: 500 },
    );
  }
}
