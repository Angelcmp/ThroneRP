import mongoose from "mongoose";

const { Schema, model } = mongoose;

const InvitationSchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    inviterUserId: { type: String, required: true, index: true },
    inviteeUserId: { type: String, required: true, index: true },
    token: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined", "expired"],
      default: "pending",
    },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

InvitationSchema.index({ inviteeUserId: 1, status: 1 });
InvitationSchema.index({ campaignId: 1, status: 1 });

export const Invitation = model("Invitation", InvitationSchema);
