import mongoose from "mongoose";

const TableRequestSchema = new mongoose.Schema(
  {
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    tableNumber: { type: String, required: true },
    action: {
      type: String,
      enum: ["call_waiter", "request_water", "request_bill", "table_cleanup"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "acknowledged", "resolved"],
      default: "pending",
    },
    guestNote: { type: String, default: "" },
    resolvedAt: { type: Date },
  },
  { timestamps: true },
);

const TableRequest =
  mongoose.models.TableRequest ||
  mongoose.model("TableRequest", TableRequestSchema);

export default TableRequest;
