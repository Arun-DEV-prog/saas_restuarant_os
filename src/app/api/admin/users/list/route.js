// app/api/admin/users/list/route.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * GET /api/admin/users/list
 * Protected route - requires admin role
 * Returns all users with their information
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
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      query.role = role;
    }

    const users = await db
      .collection("users")
      .aggregate([
        { $match: query },
        {
          $lookup: {
            from: "restaurants",
            localField: "restaurantId",
            foreignField: "_id",
            as: "restaurant",
          },
        },
        {
          $project: {
            password: 0,
          },
        },
        { $sort: { createdAt: -1 } },
      ])
      .toArray();

    return Response.json({
      success: true,
      users: users.map((u) => ({
        ...u,
        _id: u._id.toString(),
        restaurantId: u.restaurantId?.toString(),
        restaurant: u.restaurant[0],
      })),
      total: users.length,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return Response.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
