import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import {
  AUTOMATION_PROMPTS,
  buildRestaurantContext,
  callClaudeWithRetry,
} from "@/lib/anthropic";
import { ObjectId } from "mongodb";

// Get restaurant stats for analysis
async function getRestaurantStats(restaurantId, db) {
  const orders = await db
    .collection("orders")
    .find({ restaurantId: new ObjectId(restaurantId) })
    .sort({ createdAt: -1 })
    .limit(100)
    .toArray();

  const menuItems = await db
    .collection("menu_items")
    .find({ restaurantId: new ObjectId(restaurantId) })
    .toArray();

  const totalOrders = orders.length;
  const totalRevenue = orders.reduce(
    (sum, order) => sum + (order.total || 0),
    0,
  );
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    orders,
    menuItems,
    stats: {
      totalOrders,
      totalRevenue,
      avgOrderValue,
      monthlyOrders: orders.filter(
        (o) => new Date(o.createdAt).getMonth() === new Date().getMonth(),
      ).length,
    },
  };
}

// Route for Revenue Growth Analysis
export async function POST(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { automationType } = params;
    const { customData } = await req.json();

    const db = await getDb();
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(session.user.restaurantId),
      ownerId: new ObjectId(session.user.id),
    });

    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // Get restaurant data for analysis
    const { orders, menuItems, stats } = await getRestaurantStats(
      session.user.restaurantId,
      db,
    );

    // Build analysis data
    const analysisData = {
      restaurant,
      stats,
      orders: orders.slice(0, 50), // Last 50 orders
      menuItems,
      customData,
    };

    const prompt = `
${AUTOMATION_PROMPTS[automationType] || "Analyze the provided restaurant data and provide insights and recommendations."}

Restaurant Context:
${buildRestaurantContext(restaurant)}

Analysis Data:
${JSON.stringify(analysisData, null, 2)}

Please provide:
1. Key insights from the data
2. 3-5 specific, actionable recommendations
3. Expected impact and ROI
4. Timeline for implementation
`;

    // ✅ Call Claude with automatic retry logic
    const result = await callClaudeWithRetry(prompt);
    const analysis = result.content[0].text;

    // Save automation report
    const report = await db.collection("automation_reports").insertOne({
      restaurantId: new ObjectId(session.user.restaurantId),
      userId: new ObjectId(session.user.id),
      type: automationType,
      analysis,
      data: analysisData,
      createdAt: new Date(),
    });

    return Response.json({
      success: true,
      reportId: report.insertedId,
      analysis,
      data: analysisData,
    });
  } catch (error) {
    console.error("Automation analysis error:", error);
    return Response.json(
      { error: "Failed to perform analysis", details: error.message },
      { status: 500 },
    );
  }
}

// Get automation reports
export async function GET(req, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { automationType } = params;
    const db = await getDb();

    const reports = await db
      .collection("automation_reports")
      .find({
        restaurantId: new ObjectId(session.user.restaurantId),
        ...(automationType &&
          automationType !== "all" && { type: automationType }),
      })
      .sort({ createdAt: -1 })
      .limit(20)
      .toArray();

    return Response.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return Response.json({ error: "Failed to fetch reports" }, { status: 500 });
  }
}
