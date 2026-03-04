// app/api/admin/settings/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";

/**
 * GET /api/admin/settings
 * Protected route - requires admin role
 * Returns platform settings
 */
export async function GET() {
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

    const settings = await db.collection("settings").findOne({
      _id: "platform_settings",
    });

    return Response.json({
      success: true,
      settings: settings || {
        _id: "platform_settings",
        platformName: "Restaurant SaaS",
        platformEmail: "support@example.com",
        enableRegistration: true,
        maintenanceMode: false,
        features: {
          orders: true,
          tables: true,
          qrCode: true,
          notifications: true,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return Response.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/admin/settings
 * Protected route - requires OWNER role
 * Updates platform settings
 */
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    const { requireOwner } = await import("@/lib/authHelpers");
    const authCheck = await requireOwner(session);

    if (!authCheck.authorized) {
      return Response.json(
        { error: authCheck.error },
        { status: authCheck.status },
      );
    }

    const body = await request.json();
    const db = await getDb();

    const result = await db.collection("settings").updateOne(
      { _id: "platform_settings" },
      {
        $set: {
          ...body,
          _id: "platform_settings",
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );

    return Response.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return Response.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
