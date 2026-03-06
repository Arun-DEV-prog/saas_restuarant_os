// Utility functions for subscription management
import dbConnect from "@/lib/db";
import Subscription from "@/lib/models/Subscription";
import Plan from "@/lib/models/Plan";
import { ObjectId } from "mongodb";

/**
 * Check if restaurant has valid subscription and access to feature
 */
export async function checkSubscriptionAccess(restaurantId, feature) {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({
      restaurantId: new ObjectId(restaurantId),
      status: "active",
      endDate: { $gt: new Date() },
    }).populate("planId");

    if (!subscription) {
      return { hasAccess: false, reason: "no_subscription" };
    }

    const plan = subscription.planId;

    // Check if plan has access to feature
    if (plan.accessFeatures && !plan.accessFeatures.includes(feature)) {
      return {
        hasAccess: false,
        reason: "feature_not_included",
        plan: plan.name,
      };
    }

    return {
      hasAccess: true,
      subscription,
      plan,
    };
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return { hasAccess: false, reason: "error" };
  }
}

/**
 * Check if restaurant has reached limit for a feature
 */
export async function checkUsageLimit(restaurantId, limitType) {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({
      restaurantId: new ObjectId(restaurantId),
      status: "active",
    }).populate("planId");

    if (!subscription) {
      return { withinLimit: false, reason: "no_subscription" };
    }

    const plan = subscription.planId;

    // Get current month usage
    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const monthlyUsage = subscription.monthlyUsage.find(
      (u) => new Date(u.month).getTime() === currentMonth.getTime(),
    );

    const usage = monthlyUsage || {
      ordersCount: 0,
      tableRequestsCount: 0,
      menuItemsCount: 0,
      apiCallsCount: 0,
    };

    const limits = {
      orders: plan.monthlyOrderLimit,
      tableRequests: plan.monthlyTableRequestLimit,
      menuItems: plan.monthlyMenuItemsLimit,
      apiCalls: plan.monthlyUsersLimit,
    };

    const limit = limits[limitType];

    // null = unlimited
    if (limit === null) {
      return { withinLimit: true };
    }

    const currentCount =
      usage[
        {
          orders: "ordersCount",
          tableRequests: "tableRequestsCount",
          menuItems: "menuItemsCount",
          apiCalls: "apiCallsCount",
        }[limitType]
      ] || 0;

    return {
      withinLimit: currentCount < limit,
      currentCount,
      limit,
      remaining: Math.max(0, limit - currentCount),
    };
  } catch (error) {
    console.error("Error checking usage limit:", error);
    return { withinLimit: false, reason: "error" };
  }
}

/**
 * Track usage for a feature
 */
export async function trackUsage(restaurantId, type, increment = 1) {
  try {
    await dbConnect();

    const currentMonth = new Date();
    currentMonth.setDate(1);
    currentMonth.setHours(0, 0, 0, 0);

    const updateField =
      {
        orders: "monthlyUsage.$[elem].ordersCount",
        tableRequests: "monthlyUsage.$[elem].tableRequestsCount",
        menuItems: "monthlyUsage.$[elem].menuItemsCount",
        apiCalls: "monthlyUsage.$[elem].apiCallsCount",
      }[type] || "monthlyUsage.$[elem].ordersCount";

    await Subscription.updateOne(
      {
        restaurantId: new ObjectId(restaurantId),
        status: "active",
      },
      {
        $inc: { [updateField]: increment },
      },
      {
        arrayFilters: [
          {
            "elem.month": {
              $gte: currentMonth,
              $lt: new Date(currentMonth.getTime() + 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    );

    return { success: true };
  } catch (error) {
    console.error("Error tracking usage:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(restaurantId) {
  try {
    await dbConnect();

    const subscription = await Subscription.findOne({
      restaurantId: new ObjectId(restaurantId),
    })
      .populate("planId")
      .lean();

    return subscription || null;
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return null;
  }
}
