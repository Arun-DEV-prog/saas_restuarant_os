import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { getDb } from "@/lib/db";
import DashboardClient from "./dashboard-client";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const db = await getDb();

  let restaurant = null;

  try {
    restaurant = await db.collection("restaurants").findOne({
      _id: new ObjectId(session.user.restaurantId),
      ownerId: new ObjectId(session.user.id), // ensure ownership
    });
  } catch (err) {
    console.error("Error fetching restaurant:", err);
  }

  if (!restaurant) {
    console.error("Restaurant not found for user:", session.user);
    redirect("/login");
  }

  return (
    <DashboardClient
      restaurant={JSON.parse(JSON.stringify(restaurant))}
      user={session.user}
    />
  );
}
