import { getCollection } from "@/lib/db";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is admin or owner
    const userRole = session?.user?.role || session?.user?.userRole;
    if (!session || !["admin", "owner"].includes(userRole)) {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 403 },
      );
    }

    const { searchParams } = new URL(req.url);
    const planFilter = searchParams.get("plan");
    const sortBy = searchParams.get("sortBy") || "name";
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;

    const restaurants = await getCollection("restaurants");

    // Build filter
    let query = { deletedAt: { $exists: false } };
    if (planFilter && planFilter !== "all") {
      query.planId = planFilter;
    }

    // Count total
    const total = await restaurants.countDocuments(query);

    // Fetch restaurants with pagination
    const data = await restaurants
      .find(query)
      .sort({ [sortBy]: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich with plan info
    const restaurantsWithPlans = data.map((restaurant) => {
      const planId = restaurant.planId || "starter";
      let planName = "Starter Plan";
      let planPrice = 29;

      if (planId === "professional") {
        planName = "Professional Plan";
        planPrice = 79;
      } else if (planId === "enterprise") {
        planName = "Enterprise Plan";
        planPrice = 199;
      }

      return {
        id: restaurant._id.toString(),
        name: restaurant.name,
        email: restaurant.email,
        owner: restaurant.ownerName || "Unknown",
        planId,
        planName,
        planPrice,
        planStatus: restaurant.planStatus || "active",
        planActiveSince: restaurant.planActiveSince,
        planRenewalDate: restaurant.planRenewalDate,
        createdAt: restaurant.createdAt,
        status: restaurant.status || "active",
        phone: restaurant.phone,
        city: restaurant.city,
      };
    });

    return NextResponse.json({
      data: restaurantsWithPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Get Restaurants Plans Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to get restaurants plans" },
      { status: 500 },
    );
  }
}
