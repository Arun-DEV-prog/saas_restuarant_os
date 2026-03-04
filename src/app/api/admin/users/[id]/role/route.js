// app/api/admin/users/[id]/role/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { requireOwner } from "@/lib/authHelpers";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * PUT /api/admin/users/[id]/role
 * Protected route - requires OWNER role
 * Updates user role
 */
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    const authCheck = await requireOwner(session);

    if (!authCheck.authorized) {
      return Response.json(
        { error: authCheck.error },
        { status: authCheck.status },
      );
    }

    const body = await request.json();
    const { role } = body;
    const userId = params.id;

    if (
      !role ||
      !["owner", "admin", "restaurant_owner", "user"].includes(role)
    ) {
      return Response.json({ error: "Invalid role" }, { status: 400 });
    }

    if (!ObjectId.isValid(userId)) {
      return Response.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const db = await getDb();

    // Prevent removing the last owner
    if (role !== "owner") {
      const ownerCount = await db.collection("users").countDocuments({
        role: "owner",
        _id: { $ne: new ObjectId(userId) },
      });

      if (ownerCount === 0) {
        return Response.json(
          { error: "Cannot remove the last owner account" },
          { status: 400 },
        );
      }
    }

    const result = await db
      .collection("users")
      .updateOne(
        { _id: new ObjectId(userId) },
        { $set: { role, updatedAt: new Date() } },
      );

    if (result.matchedCount === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    return Response.json({
      success: true,
      message: `User role updated to ${role}`,
    });
  } catch (error) {
    console.error("Error updating user role:", error);
    return Response.json(
      { error: "Failed to update user role" },
      { status: 500 },
    );
  }
}
