import mongoose from "mongoose";

const ListSchema = new mongoose.Schema(
  {
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: "Board", required: true, index: true },
    title: { type: String, required: true, trim: true },
    order: { type: Number, required: true, default: 0 }
  },
  { timestamps: true }
);

export default mongoose.models.List || mongoose.model("List", ListSchema);
