import { Character } from "../models/Character.js";
import { World } from "../models/World.js";
import { chatCompletion } from "../lib/ai/client.js";
import { SYSTEM_CHARACTER_GENERATOR } from "../lib/ai/prompts.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";

export async function listCharacters(userId) {
  return Character.find({ userId }).sort({ updatedAt: -1 }).lean();
}

export async function getCharacter(id, userId) {
  const character = await Character.findById(id);
  if (!character) throw new NotFoundError("Personaje");
  if (character.userId !== userId) throw new ForbiddenError();
  return character;
}

export async function createCharacter(userId, data) {
  if (!data?.name) throw new ValidationError("El nombre es obligatorio");
  return Character.create({ ...data, userId });
}

export async function updateCharacter(id, userId, data) {
  const character = await getCharacter(id, userId);
  Object.assign(character, data);
  await character.save();
  return character;
}

export async function deleteCharacter(id, userId) {
  const character = await getCharacter(id, userId);
  await character.deleteOne();
  return { deleted: true };
}

/**
 * Genera un personaje completo via IA dadas pistas del usuario y opcionalmente un mundo.
 */
export async function generateCharacterFromAI(userId, { prompt, worldId }) {
  if (!prompt?.trim())
    throw new ValidationError("Necesitas un prompt o descripcion");

  let worldContext = "";
  if (worldId) {
    const world = await World.findById(worldId);
    if (world && world.userId === userId) {
      worldContext = `\n\nMundo donde habita el personaje:\n${world.toPromptContext()}`;
    }
  }

  const { content } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_CHARACTER_GENERATOR },
      {
        role: "user",
        content: `Genera un personaje con estas pistas:\n${prompt}${worldContext}`,
      },
    ],
    temperature: 0.9,
    maxTokens: 1500,
    responseFormat: { type: "json_object" },
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ValidationError("La IA devolvio JSON invalido");
  }

  return Character.create({
    ...parsed,
    userId,
    generatedByAI: true,
    sourceWorldId: worldId || undefined,
    hp: {
      max: 10 + Math.floor((parsed.stats?.CON ?? 10) / 2),
      current: 10 + Math.floor((parsed.stats?.CON ?? 10) / 2),
    },
  });
}
