import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function PATCH(req, { params }) {
  const db = await getDb();
  const body = await req.json();
  await db
    .collection("menus")
    .updateOne({ _id: new ObjectId(params.foodId) }, { $set: body });
  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const db = await getDb();
  await db.collection("menus").deleteOne({
    _id: new ObjectId(params.foodId),
  });
  return Response.json({ success: true });
}
