import mongoose from "mongoose";

const { Schema, model } = mongoose;

const MessageSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },
    playerUserId: { type: String, index: true },
    turn: { type: Number, required: true },
    role: {
      type: String,
      enum: ["system", "user", "assistant", "chat"],
      required: true,
    },
    content: { type: String, required: true },
    tokensUsed: { type: Number, default: 0 },
    provider: String,
    model: String,
    summarized: { type: Boolean, default: false },
  },
  { timestamps: true },
);

MessageSchema.index({ campaignId: 1, turn: 1 });
MessageSchema.index({ campaignId: 1, createdAt: -1 });

export const Message = model("Message", MessageSchema);
