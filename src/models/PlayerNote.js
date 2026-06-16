import mongoose from "mongoose";

const { Schema, model } = mongoose;

const PlayerNoteSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    authorUserId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    content: { type: String, default: "" },
    visibility: {
      type: String,
      enum: ["gm", "all"],
      default: "all",
    },
  },
  { timestamps: true },
);

PlayerNoteSchema.index({ campaignId: 1, createdAt: -1 });

export const PlayerNote = model("PlayerNote", PlayerNoteSchema);
