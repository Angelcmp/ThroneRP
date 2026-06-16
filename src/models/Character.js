import mongoose from "mongoose";

const { Schema, model } = mongoose;

const StatsSchema = new Schema(
  {
    STR: { type: Number, default: 10, min: 1, max: 30 },
    DEX: { type: Number, default: 10, min: 1, max: 30 },
    CON: { type: Number, default: 10, min: 1, max: 30 },
    INT: { type: Number, default: 10, min: 1, max: 30 },
    WIS: { type: Number, default: 10, min: 1, max: 30 },
    CHA: { type: Number, default: 10, min: 1, max: 30 },
  },
  { _id: false },
);

const InventoryItemSchema = new Schema(
  {
    name: { type: String, required: true },
    quantity: { type: Number, default: 1 },
    description: String,
    equipped: { type: Boolean, default: false },
    stats: {
      type: Map,
      of: Number,
      default: undefined,
    },
  },
  { _id: true },
);

const PersonalitySchema = new Schema(
  {
    traits: [String],
    ideals: String,
    bonds: String,
    flaws: String,
  },
  { _id: false },
);

const CharacterSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 80 },
    race: { type: String, default: "Humano" },
    class: { type: String, default: "Aventurero" },
    level: { type: Number, default: 1, min: 1, max: 30 },
    background: String,
    appearance: String,
    personality: { type: PersonalitySchema, default: () => ({}) },
    stats: { type: StatsSchema, default: () => ({}) },
    hp: {
      current: { type: Number, default: 10 },
      max: { type: Number, default: 10 },
    },
    mana: {
      current: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    conditions: [
      {
        name: { type: String, required: true },
        description: String,
        effects: { type: Schema.Types.Mixed },
        expiresAt: Date,
        appliedAt: { type: Date, default: Date.now },
      },
    ],
    temporaryEffects: [
      {
        stat: { type: String, required: true },
        value: { type: Number, required: true },
        source: String,
        expiresAt: Date,
      },
    ],
    skills: [String],
    inventory: [InventoryItemSchema],
    backstory: String,
    goals: [String],
    avatarUrl: String,
    generatedByAI: { type: Boolean, default: false },
    sourceWorldId: { type: Schema.Types.ObjectId, ref: "World" },
  },
  { timestamps: true },
);

CharacterSchema.index({ userId: 1, createdAt: -1 });

export const Character = model("Character", CharacterSchema);
