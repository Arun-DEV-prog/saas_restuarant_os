import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import slugify from "slugify";
import QRCode from "qrcode";
import { getDb } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const {
    ownerName,
    email,
    password,
    restaurantName,
    category,
    mallName,
    tablesCount,
    address,
    restaurantPhone,
    restaurantEmail,
  } = body;

  const db = await getDb();
  const existing = await db.collection("users").findOne({ email });
  if (existing) {
    return NextResponse.json(
      { message: "Email already exists" },
      { status: 409 },
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // 🔥 Generate unique slug
  const rawSlug = slugify(restaurantName, {
    lower: true,
    strict: true,
  });

  const uniqueCode = Date.now().toString().slice(-12);
  const slug = `${rawSlug}-${uniqueCode}`;

  const publicUrl = `https://saas-frontend-gules.vercel.app/${slug}`;

  // 🔥 Generate QR code
  const qrCodeBase64 = await QRCode.toDataURL(publicUrl);

  // 1️⃣ Create restaurant
  const restaurantResult = await db.collection("restaurants").insertOne({
    name: restaurantName,
    slug,
    publicUrl,
    qrCodeBase64,
    category,
    mallName,
    tablesCount: Number(tablesCount),
    address,
    phone: restaurantPhone,
    email: restaurantEmail,
    createdAt: new Date(),
  });

  // 2️⃣ Create admin user
  const userResult = await db.collection("users").insertOne({
    name: ownerName,
    email,
    password: hashedPassword,
    role: "restaurant_admin",
    restaurantId: restaurantResult.insertedId,
    createdAt: new Date(),
  });

  // 3️⃣ Attach owner to restaurant
  await db
    .collection("restaurants")
    .updateOne(
      { _id: restaurantResult.insertedId },
      { $set: { ownerId: userResult.insertedId } },
    );

  return NextResponse.json({
    success: true,
    redirectUrl: "/dashboard",
  });
}
