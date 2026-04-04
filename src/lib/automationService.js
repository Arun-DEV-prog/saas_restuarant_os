import {
  AUTOMATION_PROMPTS,
  buildRestaurantContext,
  callClaudeWithRetry,
} from "./anthropic";

/**
 - Restaurant Automation Service
 - Handles automated analysis and recommendations for restaurant operations
 */

export class RestaurantAutomationService {
  /**
   * Analyze and generate daily restaurant insights
   */
  static async generateDailyInsights(restaurantData, db) {
    try {
      const { restaurantId } = restaurantData;

      // Get today's orders
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrowStart = new Date(today);
      tomorrowStart.setDate(tomorrowStart.getDate() + 1);

      const todaysOrders = await db
        .collection("orders")
        .find({
          restaurantId: restaurantId,
          createdAt: { $gte: today, $lt: tomorrowStart },
        })
        .toArray();

      const totalRevenue = todaysOrders.reduce(
        (sum, order) => sum + (order.total || 0),
        0,
      );
      const totalOrders = todaysOrders.length;
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      // Get top items ordered today
      const itemCounts = {};
      todaysOrders.forEach((order) => {
        order.items?.forEach((item) => {
          itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity;
        });
      });

      const topItems = Object.entries(itemCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }));

      return {
        date: today.toISOString().split("T")[0],
        totalOrders,
        totalRevenue: totalRevenue.toFixed(2),
        avgOrderValue: avgOrderValue.toFixed(2),
        topItems,
        peakHours: this.analyzePeakHours(todaysOrders),
        insights: `Today's Performance: ${totalOrders} orders, $${totalRevenue.toFixed(2)} revenue`,
      };
    } catch (error) {
      console.error("Error generating daily insights:", error);
      throw error;
    }
  }

  /**
   * Analyze peek hours from orders
   */
  static analyzePeakHours(orders) {
    const hourCounts = {};

    orders.forEach((order) => {
      const hour = new Date(order.createdAt).getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    const sorted = Object.entries(hourCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return sorted.map(([hour, count]) => ({
      hour: `${hour}:00-${hour}:59`,
      orders: count,
    }));
  }

  /**
   * Generate menu optimization recommendations
   */
  static async generateMenuOptimization(restaurantId, db) {
    try {
      // Get menu items and their sales
      const menuItems = await db
        .collection("menu_items")
        .find({ restaurantId: restaurantId })
        .toArray();

      // Get recent orders to analyze item sales
      const orders = await db
        .collection("orders")
        .find({ restaurantId: restaurantId })
        .sort({ createdAt: -1 })
        .limit(100)
        .toArray();

      const itemSalesCount = {};
      const itemRevenue = {};

      orders.forEach((order) => {
        order.items?.forEach((item) => {
          itemSalesCount[item.name] =
            (itemSalesCount[item.name] || 0) + item.quantity;
          itemRevenue[item.name] =
            (itemRevenue[item.name] || 0) + item.price * item.quantity;
        });
      });

      const menuAnalysis = menuItems.map((item) => ({
        name: item.name,
        price: item.price,
        category: item.category,
        sales: itemSalesCount[item.name] || 0,
        revenue: itemRevenue[item.name] || 0,
        margin: item.marginPercentage || "Not set",
      }));

      const prompt = `
Analyze the following menu data and provide optimization recommendations:

Menu Items Performance:
${JSON.stringify(menuAnalysis, null, 2)}

Provide recommendations on:
1. High-margin items to promote
2. Low-performing items to remove or revise
3. Price optimization opportunities
4. Add-on or combo suggestions
5. Seasonal menu considerations
`;

      const result = await callClaudeWithRetry(prompt);

      return {
        analysis: result.content[0].text,
        itemsPerformance: menuAnalysis,
      };
    } catch (error) {
      console.error("Error generating menu optimization:", error);
      throw error;
    }
  }

  /**
   * Generate staffing recommendations based on order patterns
   */
  static async generateStaffingRecommendations(restaurantId, db) {
    try {
      // Get orders for the past 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const orders = await db
        .collection("orders")
        .find({
          restaurantId: restaurantId,
          createdAt: { $gte: thirtyDaysAgo },
        })
        .toArray();

      // Analyze by day of week and hour
      const patterns = {};
      orders.forEach((order) => {
        const date = new Date(order.createdAt);
        const dayOfWeek = date.toLocaleDateString("en-US", { weekday: "long" });
        const hour = date.getHours();
        const key = `${dayOfWeek}-${hour}`;
        patterns[key] = (patterns[key] || 0) + 1;
      });

      const prompt = `
Based on these restaurant order patterns, provide staffing recommendations:

Order Patterns (Day-Hour: Count):
${JSON.stringify(patterns, null, 2)}

Analyze and provide:
1. Optimal staff levels for each day of week and time period
2. Peak hours that need more staff
3. Off-peak hours where staff can be reduced
4. Suggested shift patterns
5. Cross-training opportunities
`;

      const result = await callClaudeWithRetry(prompt);

      return {
        recommendations: result.content[0].text,
        patterns,
      };
    } catch (error) {
      console.error("Error generating staffing recommendations:", error);
      throw error;
    }
  }

  /**
   * Generate customer retention strategies
   */
  static async generateRetentionStrategy(restaurantId, db) {
    try {
      // Get customer data
      const orders = await db
        .collection("orders")
        .find({ restaurantId: restaurantId })
        .sort({ createdAt: -1 })
        .limit(500)
        .toArray();

      // Analyze repeat customers
      const customerOrderCounts = {};
      orders.forEach((order) => {
        const customerId = order.customerId || order.email;
        customerOrderCounts[customerId] =
          (customerOrderCounts[customerId] || 0) + 1;
      });

      const repeatCustomers = Object.values(customerOrderCounts).filter(
        (count) => count > 1,
      ).length;
      const totalCustomers = Object.keys(customerOrderCounts).length;
      const repeatRate = ((repeatCustomers / totalCustomers) * 100).toFixed(2);

      const prompt = `
Restaurant Customer Analysis:
- Total Customers: ${totalCustomers}
- Repeat Customers: ${repeatCustomers}
- Repeat Customer Rate: ${repeatRate}%
- Orders per Customer: ${(orders.length / totalCustomers).toFixed(2)}

Provide customer retention strategies including:
1. Loyalty program recommendations
2. Personalized engagement tactics
3. Target re-engagement campaigns
4. Special offers for repeat customers
5. Referral program ideas
`;

      const result = await callClaudeWithRetry(prompt);

      return {
        strategy: result.content[0].text,
        metrics: {
          totalCustomers,
          repeatCustomers,
          repeatRate: `${repeatRate}%`,
        },
      };
    } catch (error) {
      console.error("Error generating retention strategy:", error);
      throw error;
    }
  }

  /**
   * Generate operational efficiency recommendations
   */
  static async generateEfficiencyRecommendations(restaurantId, db) {
    try {
      // Get recent orders to analyze fulfillment
      const orders = await db
        .collection("orders")
        .find({ restaurantId: restaurantId })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();

      // Calculate average order processing time
      const processingTimes = orders
        .filter((o) => o.completedAt && o.createdAt)
        .map((o) => new Date(o.completedAt) - new Date(o.createdAt));

      const avgProcessingTime =
        processingTimes.length > 0
          ? (
              processingTimes.reduce((a, b) => a + b, 0) /
              processingTimes.length /
              60000
            ).toFixed(2)
          : 0;

      const cancelledOrders = orders.filter(
        (o) => o.status === "cancelled",
      ).length;
      const cancelRate = ((cancelledOrders / orders.length) * 100).toFixed(2);

      const prompt = `
Operational Efficiency Analysis:
- Average Order Processing Time: ${avgProcessingTime} minutes
- Order Cancellation Rate: ${cancelRate}%
- Recent Orders Analyzed: ${orders.length}

Provide recommendations to improve:
1. Order fulfillment speed
2. Reduce cancellation rates
3. Streamline kitchen operations
4. Optimize delivery processes
5. Customer communication improvements
`;

      const result = await callClaudeWithRetry(prompt);

      return {
        recommendations: result.content[0].text,
        metrics: {
          avgProcessingTime: `${avgProcessingTime} min`,
          cancelRate: `${cancelRate}%`,
        },
      };
    } catch (error) {
      console.error("Error generating efficiency recommendations:", error);
      throw error;
    }
  }

  /**
   * Get or create automation schedule
   */
  static async getOrCreateSchedule(restaurantId, db) {
    let schedule = await db
      .collection("automation_schedules")
      .findOne({ restaurantId });

    if (!schedule) {
      schedule = await db.collection("automation_schedules").insertOne({
        restaurantId,
        dailyInsights: { enabled: true, time: "08:00" },
        menuOptimization: { enabled: true, frequency: "weekly", day: "Monday" },
        staffingAnalysis: { enabled: true, frequency: "weekly", day: "Sunday" },
        customerRetention: { enabled: true, frequency: "monthly", day: 1 },
        efficiencyReview: { enabled: true, frequency: "weekly", day: "Friday" },
        createdAt: new Date(),
      });

      return db
        .collection("automation_schedules")
        .findOne({ _id: schedule.insertedId });
    }

    return schedule;
  }
}

export default RestaurantAutomationService;
