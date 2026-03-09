import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

export async function PATCH(req, { params: paramsPromise }) {
  const params = await paramsPromise;
  const db = await getDb();
  const body = await req.json();
  await db
    .collection("foods")
    .updateOne({ _id: new ObjectId(params.foodId) }, { $set: body });
  return Response.json({ success: true });
}

export async function DELETE(req, { params: paramsPromise }) {
  try {
    const params = await paramsPromise;

    if (!ObjectId.isValid(params.foodId)) {
      return Response.json({ error: "Invalid food ID" }, { status: 400 });
    }

    const db = await getDb();

    console.log(`[DELETE Food] params.foodId: ${params.foodId}`);

    // DELETE from "foods" collection, not "menus"
    const result = await db.collection("foods").deleteOne({
      _id: new ObjectId(params.foodId),
    });

    console.log(`[DELETE Food] deleteOne result:`, result);

    if (result.deletedCount === 0) {
      console.warn(`[DELETE Food] No document found with ID: ${params.foodId}`);
      return Response.json(
        { error: "Food item not found", deletedCount: 0 },
        { status: 404 },
      );
    }

    console.log(`[DELETE Food] Successfully deleted food: ${params.foodId}`);
    return Response.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    console.error("[DELETE Food] Error:", error);
    return Response.json(
      { error: error.message || "Failed to delete food item" },
      { status: 500 },
    );
  }
}
