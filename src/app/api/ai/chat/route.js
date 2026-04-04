import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import {
  buildRestaurantContext,
  RESTAURANT_SYSTEM_PROMPT,
  callClaudeWithRetry,
} from "@/lib/anthropic";
import { ObjectId } from "mongodb";

export async function POST(req) {
  try {
    // ✅ Auth check
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { message, conversationId } = await req.json();

    if (!message || message.trim().length === 0) {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const db = await getDb();

    // ✅ Restaurant
    const restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(session.user.restaurantId),
      ownerId: new ObjectId(session.user.id),
    });

    if (!restaurant) {
      return Response.json({ error: "Restaurant not found" }, { status: 404 });
    }

    // ✅ User
    const user = await db.collection("users").findOne({
      _id: new ObjectId(session.user.id),
    });

    // ✅ Context
    const restaurantContext = buildRestaurantContext(restaurant, {
      role: user?.role || "Owner",
    });

    // ✅ Load conversation
    let conversation = null;
    if (conversationId && conversationId !== "new") {
      conversation = await db.collection("ai_conversations").findOne({
        _id: new ObjectId(conversationId),
        restaurantId: new ObjectId(session.user.restaurantId),
      });
    }

    // ✅ Limit history (IMPORTANT)
    const chatHistory = (conversation?.messages || []).slice(-10);

    // ✅ Convert history to text
    const historyText = chatHistory
      .map(
        (msg) =>
          `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`,
      )
      .join("\n");

    // ✅ Build final prompt (SYSTEM + CONTEXT + HISTORY + USER)
    const fullPrompt = `${RESTAURANT_SYSTEM_PROMPT}

${restaurantContext}

Conversation History:
${historyText}

User: ${message}
Assistant:`;

    // ✅ Call Claude with automatic retry logic
    const result = await callClaudeWithRetry(fullPrompt);

    const assistantMessage = result.content[0].text;

    // ✅ Store conversation
    if (!conversation) {
      const insertResult = await db.collection("ai_conversations").insertOne({
        restaurantId: new ObjectId(session.user.restaurantId),
        userId: new ObjectId(session.user.id),
        title: message.substring(0, 100) || "New Conversation",
        messages: [
          { role: "user", content: message, timestamp: new Date() },
          {
            role: "assistant",
            content: assistantMessage,
            timestamp: new Date(),
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      conversation = { _id: insertResult.insertedId };
    } else {
      await db.collection("ai_conversations").updateOne(
        { _id: conversation._id },
        {
          $push: {
            messages: {
              $each: [
                { role: "user", content: message, timestamp: new Date() },
                {
                  role: "assistant",
                  content: assistantMessage,
                  timestamp: new Date(),
                },
              ],
            },
          },
          $set: { updatedAt: new Date() },
        },
      );
    }

    return Response.json({
      response: assistantMessage,
      conversationId: conversation._id,
      messages: [
        { role: "user", content: message },
        { role: "assistant", content: assistantMessage },
      ],
    });
  } catch (error) {
    console.error("Chatbot error:", error);

    return Response.json(
      {
        error: "Failed to process message",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await getDb();
    const conversations = await db
      .collection("ai_conversations")
      .find({ restaurantId: new ObjectId(session.user.restaurantId) })
      .sort({ updatedAt: -1 })
      .limit(20)
      .toArray();

    return Response.json(conversations);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return Response.json(
      { error: "Failed to fetch conversations" },
      { status: 500 },
    );
  }
}
