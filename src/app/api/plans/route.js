import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Plan from "@/lib/models/Plan";

// Get all active plans
export async function GET(req) {
  try {
    await dbConnect();
    const plans = await Plan.find({ isActive: true }).sort({ sort: 1 });
    return NextResponse.json(plans);
  } catch (error) {
    console.error("Error fetching plans:", error);
    return NextResponse.json(
      { error: "Failed to fetch plans" },
      { status: 500 },
    );
  }
}

// Create a new plan (admin only)
export async function POST(req) {
  try {
    await dbConnect();
    const body = await req.json();
    const plan = new Plan(body);
    await plan.save();
    return NextResponse.json(plan, { status: 201 });
  } catch (error) {
    console.error("Error creating plan:", error);
    return NextResponse.json(
      { error: "Failed to create plan" },
      { status: 500 },
    );
  }
}
