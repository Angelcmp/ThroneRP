import mongoose from "mongoose";

const { Schema, model } = mongoose;

const ChapterSchema = new Schema(
  {
    title: { type: String, default: "" },
    summary: { type: String, default: "" },
    startTurn: { type: Number, required: true },
    endTurn: { type: Number, default: null },
    status: {
      type: String,
      enum: ["active", "complete"],
      default: "active",
    },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const PlayerSchema = new Schema(
  {
    userId: { type: String, required: true },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: true,
    },
    role: {
      type: String,
      enum: ["gm", "player", "spectator"],
      default: "player",
    },
    joinedAt: { type: Date, default: Date.now },
  },
  { _id: true },
);

const RoundSubmissionSchema = new Schema(
  {
    userId: { type: String, required: true },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: true,
    },
    action: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const RoundSchema = new Schema(
  {
    number: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ["idle", "open", "resolving"],
      default: "idle",
    },
    submissions: { type: [RoundSubmissionSchema], default: [] },
  },
  { _id: false },
);

const CampaignSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    worldId: { type: Schema.Types.ObjectId, ref: "World", required: true },
    characterId: {
      type: Schema.Types.ObjectId,
      ref: "Character",
      required: true,
    },

    players: { type: [PlayerSchema], default: [] },

    round: {
      type: RoundSchema,
      default: () => ({ number: 1, status: "idle", submissions: [] }),
    },

    aiProvider: { type: String, default: undefined },
    aiModel: { type: String, default: undefined },

    state: {
      currentLocation: String,
      timeOfDay: { type: String, default: "dia" },
      inGameDate: String,
      activeQuest: String,
      mood: String,
      status: {
        type: String,
        enum: ["active", "paused", "finished"],
        default: "active",
      },
    },

    rollingSummary: { type: String, default: "" },
    totalTurns: { type: Number, default: 0 },
    lastPlayedAt: Date,
    chapters: [ChapterSchema],
  },
  { timestamps: true },
);

CampaignSchema.index({ userId: 1, lastPlayedAt: -1 });
CampaignSchema.index({ userId: 1, "state.status": 1 });
CampaignSchema.index({ "players.userId": 1 });

CampaignSchema.methods.getPlayer = function (targetUserId) {
  if (this.userId === targetUserId) {
    return {
      userId: this.userId,
      characterId: this.characterId,
      role: "gm",
    };
  }
  return this.players?.find((p) => p.userId === targetUserId) ?? null;
};

CampaignSchema.methods.isGM = function (targetUserId) {
  return this.userId === targetUserId;
};

CampaignSchema.methods.isPlayer = function (targetUserId) {
  if (this.userId === targetUserId) return true;
  return this.players?.some((p) => p.userId === targetUserId) ?? false;
};

CampaignSchema.methods.getActivePlayers = function () {
  const players = [
    { userId: this.userId, characterId: this.characterId, role: "gm" },
  ];
  if (this.players?.length) {
    for (const p of this.players) {
      if (p.role === "player" || p.role === "gm") {
        players.push({
          userId: p.userId,
          characterId: p.characterId,
          role: p.role,
        });
      }
    }
  }
  return players;
};

CampaignSchema.methods.hasSubmitted = function (targetUserId) {
  return (
    this.round?.submissions?.some((s) => s.userId === targetUserId) ?? false
  );
};

CampaignSchema.methods.allSubmitted = function () {
  const activePlayers = this.getActivePlayers();
  if (activePlayers.length === 0) return false;
  return activePlayers.every((p) => this.hasSubmitted(p.userId));
};

export const Campaign = model("Campaign", CampaignSchema);
