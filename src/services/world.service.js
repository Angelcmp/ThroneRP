import { World } from "../models/World.js";
import { chatCompletion } from "../lib/ai/client.js";
import {
  SYSTEM_WORLD_GENERATOR,
  SYSTEM_FACTION_GENERATOR,
  SYSTEM_LOCATION_GENERATOR,
} from "../lib/ai/prompts.js";
import { getTemplate } from "../config/templates.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";

export async function listWorlds(userId, { includePublic = false } = {}) {
  const filter = includePublic
    ? { $or: [{ userId }, { visibility: "public" }] }
    : { userId };
  return World.find(filter).sort({ updatedAt: -1 }).lean();
}

export async function getWorld(id, userId) {
  const world = await World.findById(id);
  if (!world) throw new NotFoundError("Mundo");
  if (world.userId !== userId && world.visibility === "private") {
    throw new ForbiddenError();
  }
  return world;
}

export async function createWorld(userId, data) {
  if (!data?.name) throw new ValidationError("El nombre es obligatorio");
  return World.create({ ...data, userId });
}

export async function updateWorld(id, userId, data) {
  const world = await World.findById(id);
  if (!world) throw new NotFoundError("Mundo");
  if (world.userId !== userId) throw new ForbiddenError();
  Object.assign(world, data);
  await world.save();
  return world;
}

export async function deleteWorld(id, userId) {
  const world = await World.findById(id);
  if (!world) throw new NotFoundError("Mundo");
  if (world.userId !== userId) throw new ForbiddenError();
  await world.deleteOne();
  return { deleted: true };
}

/**
 * Genera un mundo completo via IA a partir de un prompt corto.
 */
export async function generateWorldFromAI(
  userId,
  { prompt, template: templateKey },
) {
  let finalPrompt = prompt?.trim();
  let templateContext = null;

  if (templateKey) {
    templateContext = getTemplate(templateKey);
    if (!finalPrompt) {
      finalPrompt = templateContext.prompt;
    }
  }

  if (!finalPrompt)
    throw new ValidationError("Necesitas un prompt o descripcion");

  const { content } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_WORLD_GENERATOR },
      {
        role: "user",
        content: `Genera un mundo de rol con estas pistas:\n${prompt}`,
      },
    ],
    temperature: 0.95,
    maxTokens: 2000,
    responseFormat: { type: "json_object" },
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ValidationError("La IA devolvio JSON invalido");
  }

  return World.create({
    ...parsed,
    userId,
    generatedByAI: true,
  });
}

export async function generateFactionForWorld(worldId, userId, prompt) {
  const world = await getWorld(worldId, userId);
  if (!prompt?.trim())
    throw new ValidationError("Necesitas un prompt o descripcion");

  const worldContext = `Mundo: ${world.name} (${world.genre}, tono ${world.tone})\nPremisa: ${world.premise ?? "N/A"}\nFacciones existentes: ${world.factions?.map((f) => f.name).join(", ") ?? "ninguna"}`;

  const { content } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_FACTION_GENERATOR },
      {
        role: "user",
        content: `${worldContext}\n\nGenera una faccion con estas pistas: ${prompt}`,
      },
    ],
    temperature: 0.9,
    maxTokens: 500,
    responseFormat: { type: "json_object" },
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ValidationError("La IA devolvio JSON invalido");
  }

  world.factions.push({
    name: parsed.name,
    description: parsed.description ?? "",
    alignment: parsed.alignment ?? "",
  });
  await world.save();

  return { faction: parsed, world };
}

export async function generateLocationForWorld(worldId, userId, prompt) {
  const world = await getWorld(worldId, userId);
  if (!prompt?.trim())
    throw new ValidationError("Necesitas un prompt o descripcion");

  const worldContext = `Mundo: ${world.name} (${world.genre}, tono ${world.tone})\nPremisa: ${world.premise ?? "N/A"}\nUbicaciones existentes: ${world.locations?.map((l) => l.name).join(", ") ?? "ninguna"}`;

  const { content } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_LOCATION_GENERATOR },
      {
        role: "user",
        content: `${worldContext}\n\nGenera una ubicacion con estas pistas: ${prompt}`,
      },
    ],
    temperature: 0.9,
    maxTokens: 500,
    responseFormat: { type: "json_object" },
  });

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ValidationError("La IA devolvio JSON invalido");
  }

  world.locations.push({
    name: parsed.name,
    description: parsed.description ?? "",
    type: parsed.type ?? "Lugar",
  });
  await world.save();

  return { location: parsed, world };
}
