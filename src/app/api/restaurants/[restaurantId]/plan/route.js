import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getPlanById } from "@/lib/plans";

export async function GET(req, { params: paramsPromise }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await paramsPromise;

    const restaurants = await getCollection("restaurants");
    const restaurant = await restaurants.findOne({
      _id: new ObjectId(restaurantId),
      ownerId: new ObjectId(session.user.id),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    const currentPlan = getPlanById(restaurant.planId || "starter");

    return NextResponse.json({
      planId: restaurant.planId || "starter",
      plan: currentPlan,
      activeSince: restaurant.planActiveSince,
      renewalDate: restaurant.planRenewalDate,
      status: restaurant.planStatus || "active",
    });
  } catch (error) {
    console.error("[Get Plan Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to get plan" },
      { status: 500 },
    );
  }
}

export async function PUT(req, { params: paramsPromise }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId } = await paramsPromise;
    const { planId } = await req.json();

    if (!planId) {
      return NextResponse.json(
        { error: "planId is required" },
        { status: 400 },
      );
    }

    const plan = getPlanById(planId);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const restaurants = await getCollection("restaurants");
    const result = await restaurants.updateOne(
      {
        _id: new ObjectId(restaurantId),
        ownerId: new ObjectId(session.user.id),
      },
      {
        $set: {
          planId,
          planStatus: "active",
          planActiveSince: new Date(),
          planRenewalDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          updatedAt: new Date(),
        },
      },
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Plan upgraded to ${plan.name}`,
      plan,
      planId,
    });
  } catch (error) {
    console.error("[Update Plan Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update plan" },
      { status: 500 },
    );
  }
}
