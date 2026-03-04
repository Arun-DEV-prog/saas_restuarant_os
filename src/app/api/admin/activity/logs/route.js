// app/api/admin/activity/logs/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

/**
 * GET /api/admin/activity/logs
 * Protected route - requires admin role
 * Returns activity logs
 */
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = session?.user?.role || session?.user?.userRole;

    if (!session || !userRole || !["owner", "admin"].includes(userRole)) {
      return Response.json(
        { error: "Forbidden - Admin role required" },
        { status: 403 },
      );
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit")) || 50;
    const type = searchParams.get("type");

    const query = {};
    if (type) {
      query.type = type;
    }

    const logs = await db
      .collection("activityLogs")
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return Response.json({
      success: true,
      logs: logs.map((log) => ({
        ...log,
        _id: log._id.toString(),
        userId: log.userId?.toString(),
        targetId: log.targetId?.toString(),
      })),
      total: logs.length,
    });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return Response.json(
      { error: "Failed to fetch activity logs" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/admin/activity/logs
 * Create activity log entry
 */
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const body = await request.json();

    const log = {
      userId: session.user.id,
      type: body.type, // 'role_change', 'settings_update', 'user_action', etc.
      action: body.action, // Description of action
      targetId: body.targetId,
      targetType: body.targetType, // 'user', 'restaurant', 'settings', etc.
      details: body.details,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent"),
      createdAt: new Date(),
    };

    await db.collection("activityLogs").insertOne(log);

    return Response.json({
      success: true,
      message: "Activity logged",
    });
  } catch (error) {
    console.error("Error creating activity log:", error);
    return Response.json(
      { error: "Failed to create activity log" },
      { status: 500 },
    );
  }
}
