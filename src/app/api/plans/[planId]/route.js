import dbConnect from "@/lib/db";
import Plan from "@/lib/models/Plan";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req, { params }) {
  try {
    const { planId } = params;
    await dbConnect();
    const plan = await Plan.findById(planId);

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error fetching plan:", error);
    return NextResponse.json(
      { error: "Failed to fetch plan" },
      { status: 500 },
    );
  }
}

// Update plan (admin only)
export async function PUT(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { planId } = params;
    const body = await req.json();
    await dbConnect();

    const plan = await Plan.findByIdAndUpdate(planId, body, {
      new: true,
    });

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 });
    }

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error updating plan:", error);
    return NextResponse.json(
      { error: "Failed to update plan" },
      { status: 500 },
    );
  }
}
