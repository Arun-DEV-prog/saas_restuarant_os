import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  checkSubscriptionAccess,
  checkUsageLimit,
} from "@/lib/subscriptionHelpers";

/**
 * Middleware to check if restaurant has active subscription
 * Usage: if (!subscriptionCheck.isValid) return subscriptionCheck.response;
 */
export async function checkSubscription(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return {
        isValid: false,
        response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      };
    }

    const restaurantId = session.user.restaurantId;
    if (!restaurantId) {
      return {
        isValid: false,
        response: NextResponse.json(
          { error: "No restaurant associated" },
          { status: 400 },
        ),
      };
    }

    return {
      isValid: true,
      restaurantId,
      session,
    };
  } catch (error) {
    console.error("Subscription check error:", error);
    return {
      isValid: false,
      response: NextResponse.json(
        { error: "Subscription check failed" },
        { status: 500 },
      ),
    };
  }
}

/**
 * Middleware to check feature access
 * Usage: const access = await checkFeatureAccess(restaurantId, 'table-requests');
 *        if (!access.hasAccess) return NextResponse.json(...);
 */
export async function checkFeatureAccess(restaurantId, feature) {
  const result = await checkSubscriptionAccess(restaurantId, feature);
  return result;
}

/**
 * Middleware to check usage limit
 * Usage: const limit = await checkLimit(restaurantId, 'orders');
 *        if (!limit.withinLimit) return NextResponse.json({ error: 'Limit reached' });
 */
export async function checkLimit(restaurantId, limitType) {
  const result = await checkUsageLimit(restaurantId, limitType);
  return result;
}
