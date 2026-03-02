// app/api/restaurants/[restaurantId]/settings/route.js
import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import { ObjectId } from "mongodb";

// ── GET /api/restaurants/[restaurantId]/settings
export async function GET(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const restaurantsColl = await getCollection("restaurants");
    const restaurant = await restaurantsColl.findOne({
      _id: new ObjectId(restaurantId),
    });

    if (!restaurant) {
      return NextResponse.json(
        { error: "Restaurant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      profile: {
        name: restaurant.name || "",
        email: restaurant.email || "",
        phone: restaurant.phone || "",
        description: restaurant.description || "",
        category: restaurant.category || "",
      },
      restaurant: {
        address: restaurant.address || "",
        city: restaurant.city || "",
        country: restaurant.country || "",
        zipCode: restaurant.zipCode || "",
        mallName: restaurant.mallName || "",
        hours: restaurant.hours || "",
        publicUrl: restaurant.publicUrl || "",
      },
      notifications: {
        orderAlerts: restaurant.notifications?.orderAlerts ?? true,
        tableAlerts: restaurant.notifications?.tableAlerts ?? true,
        lowStockAlerts: restaurant.notifications?.lowStockAlerts ?? true,
        emailNotifications:
          restaurant.notifications?.emailNotifications ?? true,
      },
      orders: {
        minOrderValue: restaurant.orders?.minOrderValue ?? 0,
        deliveryFee: restaurant.orders?.deliveryFee ?? 0,
        taxRate: restaurant.orders?.taxRate ?? 10,
        acceptingOrders: restaurant.orders?.acceptingOrders ?? true,
      },
      media: {
        logo: restaurant.logo || null,
        heroImage: restaurant.heroImage || null,
      },
    });
  } catch (err) {
    console.error("[settings GET]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ── PUT /api/restaurants/[restaurantId]/settings
export async function PUT(req, { params: paramsPromise }) {
  try {
    const { restaurantId } = await paramsPromise;

    // Validate ObjectId format
    if (!ObjectId.isValid(restaurantId)) {
      return NextResponse.json(
        { error: "Invalid restaurant ID format" },
        { status: 400 },
      );
    }

    const body = await req.json();

    const restaurantsColl = await getCollection("restaurants");
    const updateData = {
      // Profile
      name: body.profile?.name,
      email: body.profile?.email,
      phone: body.profile?.phone,
      description: body.profile?.description,
      category: body.profile?.category,
      // Restaurant
      address: body.restaurant?.address,
      city: body.restaurant?.city,
      country: body.restaurant?.country,
      zipCode: body.restaurant?.zipCode,
      mallName: body.restaurant?.mallName,
      hours: body.restaurant?.hours,
      // Notifications
      notifications: body.notifications,
      // Orders
      orders: body.orders,
      updatedAt: new Date(),
    };

    await restaurantsColl.updateOne(
      { _id: new ObjectId(restaurantId) },
      { $set: updateData },
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[settings PUT]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
