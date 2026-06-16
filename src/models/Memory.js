import mongoose from "mongoose";
import { env } from "../config/env.js";

const { Schema, model } = mongoose;

const MemorySchema = new Schema(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
      index: true,
    },
    userId: { type: String, required: true, index: true },

    type: {
      type: String,
      enum: [
        "event",
        "npc_interaction",
        "discovery",
        "decision",
        "item_gained",
        "location_visited",
        "relationship_change",
        "summary",
      ],
      required: true,
    },
    summary: { type: String, required: true, maxlength: 1000 },
    importance: { type: Number, default: 5, min: 1, max: 10 },
    entities: [String],
    sourceTurn: Number,

    contradicts: {
      type: Schema.Types.ObjectId,
      ref: "Memory",
      default: null,
    },
    contradictions: [
      {
        memoryId: { type: Schema.Types.ObjectId, ref: "Memory" },
        detectedAt: { type: Date, default: Date.now },
        resolved: { type: Boolean, default: false },
        note: String,
      },
    ],
    score: { type: Number, default: 0 },
    chapter: { type: Number, default: null },

    embedding: {
      type: [Number],
      validate: {
        validator(v) {
          return !v || v.length === env.EMBEDDING_DIMENSIONS;
        },
        message: (props) =>
          `El embedding debe tener ${env.EMBEDDING_DIMENSIONS} dimensiones (recibido ${props.value?.length})`,
      },
    },
    embeddingModel: String,
    embeddingProvider: String,
  },
  { timestamps: true },
);

MemorySchema.index({ campaignId: 1, importance: -1, createdAt: -1 });
MemorySchema.index({ campaignId: 1, type: 1 });
MemorySchema.index({ campaignId: 1, score: -1 });

export const Memory = model("Memory", MemorySchema);
