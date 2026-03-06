// app/api/public/settings/route.js
import { getDb } from "@/lib/db";

/**
 * GET /api/public/settings
 * Public route - NO authentication required
 * Returns only safe platform settings for public display
 * Always returns HTTP 200 - never crashes the landing page
 */
export async function GET() {
  try {
    const db = await getDb();

    const settings = await db.collection("settings").findOne({
      _id: "platform_settings",
    });

    // Return only safe fields - no sensitive admin data
    const safeSettings = {
      platformName: settings?.platformName || "Restaurant SaaS",
      platformLogo: settings?.platformLogo || null,
      enableRegistration: settings?.enableRegistration !== false,
      pricingPlans: settings?.pricingPlans || [],
      features: settings?.features || {
        orders: true,
        tables: true,
        qrCode: true,
        notifications: true,
      },
    };

    return Response.json({
      success: true,
      settings: safeSettings,
    });
  } catch (error) {
    console.error("[Public Settings API Error]", error);

    // Always return default settings on error - never crash the landing page
    return Response.json(
      {
        success: true,
        settings: {
          platformName: "Restaurant SaaS",
          platformLogo: null,
          enableRegistration: true,
          pricingPlans: [],
          features: {
            orders: true,
            tables: true,
            qrCode: true,
            notifications: true,
          },
        },
      },
      { status: 200 },
    );
  }
}
