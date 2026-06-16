import mongoose from "mongoose";

const { Schema, model } = mongoose;

const FactionSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    alignment: String,
  },
  { _id: true },
);

const LocationSchema = new Schema(
  {
    name: { type: String, required: true },
    description: String,
    type: String,
  },
  { _id: true },
);

const WorldSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    genre: { type: String, default: "Fantasia" },
    tone: { type: String, default: "Epico" },
    premise: { type: String, maxlength: 2000 },
    history: { type: String, maxlength: 4000 },
    factions: [FactionSchema],
    locations: [LocationSchema],
    magicSystem: String,
    technologyLevel: String,
    majorConflict: String,
    tags: [String],
    visibility: {
      type: String,
      enum: ["private", "unlisted", "public"],
      default: "private",
    },
    coverUrl: String,
    generatedByAI: { type: Boolean, default: false },
  },
  { timestamps: true },
);

WorldSchema.index({ userId: 1, createdAt: -1 });
WorldSchema.index({ visibility: 1, createdAt: -1 });

WorldSchema.methods.toPromptContext = function toPromptContext() {
  const factions =
    this.factions
      ?.map((f) => `- ${f.name}: ${f.description ?? ""}`)
      .join("\n") ?? "";
  const locations =
    this.locations
      ?.map((l) => `- ${l.name} (${l.type ?? "?"}): ${l.description ?? ""}`)
      .join("\n") ?? "";
  return [
    `Mundo: ${this.name}`,
    `Genero: ${this.genre} | Tono: ${this.tone}`,
    `Premisa: ${this.premise ?? "-"}`,
    `Conflicto principal: ${this.majorConflict ?? "-"}`,
    `Sistema de magia: ${this.magicSystem ?? "ninguno"}`,
    `Nivel tecnologico: ${this.technologyLevel ?? "-"}`,
    factions ? `Facciones:\n${factions}` : "",
    locations ? `Lugares:\n${locations}` : "",
  ]
    .filter(Boolean)
    .join("\n");
};

export const World = model("World", WorldSchema);
