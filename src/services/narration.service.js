import { Message } from "../models/Message.js";
import { Character } from "../models/Character.js";
import { World } from "../models/World.js";
import {
  getRecentMessages,
  searchRelevantMemories,
  extractAndStoreMemories,
  summarizeOldMessages,
} from "./memory.service.js";
import { chatCompletion } from "../lib/ai/client.js";
import { SYSTEM_NARRATOR, renderTemplate } from "../lib/ai/prompts.js";
import { smartChunk, estimateTokens } from "../lib/ai/tokenizer.js";
import { parseCommand } from "./commands.service.js";
import { NotFoundError } from "../utils/errors.js";
import {
  loadCampaignAsPlayer,
  getPlayerCharacter,
} from "../utils/campaign-auth.js";

function characterToPrompt(character) {
  const stats = Object.entries(
    character.stats?.toObject?.() ?? character.stats ?? {},
  )
    .map(([k, v]) => `${k} ${v}`)
    .join(" / ");

  const conditions =
    character.conditions
      ?.map(
        (c) =>
          `  - ${c.name}: ${c.description ?? ""}${c.expiresAt ? ` (hasta ${new Date(c.expiresAt).toISOString().slice(0, 10)})` : ""}`,
      )
      .join("\n") ?? "";

  const equipment =
    character.inventory
      ?.filter((i) => i.equipped)
      ?.map(
        (i) =>
          `  - ${i.name}${
            i.stats
              ? ` (${Object.entries(Object.fromEntries(i.stats))
                  .map(([k, v]) => `${k}${v >= 0 ? "+" : ""}${v}`)
                  .join(", ")})`
              : ""
          }`,
      )
      .join("\n") ?? "";

  const mana = character.mana?.max
    ? `\nMana: ${character.mana.current ?? "?"} / ${character.mana.max}`
    : "";

  const tempEffects = character.temporaryEffects
    ?.filter((e) => !e.expiresAt || new Date(e.expiresAt) > new Date())
    ?.map((e) => `${e.stat}${e.value >= 0 ? "+" : ""}${e.value}`)
    .join(", ");

  return [
    `Nombre: ${character.name} (${character.race} ${character.class} nv.${character.level})`,
    `Stats: ${stats}${tempEffects ? ` [Efectos temporales: ${tempEffects}]` : ""}`,
    `HP: ${character.hp?.current ?? "?"} / ${character.hp?.max ?? "?"}${mana}`,
    character.personality?.traits?.length
      ? `Rasgos: ${character.personality.traits.join(", ")}`
      : "",
    character.personality?.flaws
      ? `Defectos: ${character.personality.flaws}`
      : "",
    character.goals?.length ? `Metas: ${character.goals.join("; ")}` : "",
    equipment ? `Equipado:\n${equipment}` : "",
    character.inventory?.length
      ? `Inventario: ${character.inventory.map((i) => `${i.name} x${i.quantity}${i.equipped ? " (equipado)" : ""}`).join(", ")}`
      : "",
    conditions ? `Condiciones activas:\n${conditions}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function memoriesToPrompt(memories) {
  if (!memories?.length) return "Aun no hay memorias relevantes.";
  return memories
    .map(
      (m, i) =>
        `${i + 1}. [${m.type}] ${m.summary} (importancia ${m.importance})`,
    )
    .join("\n");
}

function worldStateToPrompt(state = {}) {
  return (
    [
      state.currentLocation ? `Lugar actual: ${state.currentLocation}` : "",
      state.timeOfDay ? `Momento: ${state.timeOfDay}` : "",
      state.inGameDate ? `Fecha en juego: ${state.inGameDate}` : "",
      state.activeQuest ? `Mision activa: ${state.activeQuest}` : "",
      state.mood ? `Atmosfera: ${state.mood}` : "",
    ]
      .filter(Boolean)
      .join("\n") || "Estado inicial."
  );
}

async function buildPromptContext({ campaign, world, character, userInput }) {
  const [recent, memories] = await Promise.all([
    getRecentMessages(campaign._id),
    searchRelevantMemories(campaign._id, userInput),
  ]);

  const systemPrompt = renderTemplate(SYSTEM_NARRATOR, {
    worldName: world.name,
    worldTone: world.tone,
    worldGenre: world.genre,
    worldState: `${world.toPromptContext()}\n\nESTADO ACTUAL DE LA PARTIDA:\n${worldStateToPrompt(campaign.state)}`,
    characterSheet: characterToPrompt(character),
    relevantMemories: memoriesToPrompt(memories),
    rollingSummary: campaign.rollingSummary || "Sin resumen previo.",
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userInput },
  ];

  return { messages: smartChunk(messages, { maxTokens: 8192 }), memories };
}

export async function narrateTurn({ campaignId, userId, userInput }) {
  const campaign = await loadCampaignAsPlayer(campaignId, userId);
  const playerCharacterId = getPlayerCharacter(campaign, userId);
  const [world, character] = await Promise.all([
    World.findById(campaign.worldId),
    Character.findById(playerCharacterId),
  ]);

  if (!world) throw new NotFoundError("Mundo");
  if (!character) throw new NotFoundError("Personaje");

  const { messages, memories } = await buildPromptContext({
    campaign,
    world,
    character,
    userInput,
  });

  const response = await chatCompletion({
    provider: campaign.aiProvider || undefined,
    model: campaign.aiModel || undefined,
    messages,
    temperature: 0.9,
    maxTokens: 1200,
  });

  const nextTurn = campaign.totalTurns + 1;

  const [userMsg, assistantMsg] = await Message.insertMany([
    {
      campaignId,
      userId,
      playerUserId: userId,
      turn: nextTurn,
      role: "user",
      content: userInput,
    },
    {
      campaignId,
      userId,
      playerUserId: userId,
      turn: nextTurn,
      role: "assistant",
      content: response.content,
      tokensUsed: response.usage?.total_tokens ?? 0,
      provider: campaign.aiProvider ?? null,
      model: campaign.aiModel ?? null,
    },
  ]);

  campaign.totalTurns = nextTurn;
  campaign.lastPlayedAt = new Date();
  await campaign.save();

  setImmediate(async () => {
    try {
      await extractAndStoreMemories({
        campaignId,
        userId,
        userText: userInput,
        assistantText: response.content,
        turn: nextTurn,
      });
      await summarizeOldMessages({ campaign });
    } catch (err) {
      console.error("Tarea post-turno fallo:", err);
    }
  });

  return {
    turn: nextTurn,
    userMessage: userMsg,
    assistantMessage: assistantMsg,
    reasoningContent: response.reasoningContent,
    usage: response.usage,
    retrievedMemories: memories.length,
    estimatedTokens: estimateTokens(messages.map((m) => m.content).join(" ")),
  };
}

export async function* narrateTurnStream({ campaignId, userId, userInput }) {
  const campaign = await loadCampaignAsPlayer(campaignId, userId);
  const playerCharacterId = getPlayerCharacter(campaign, userId);
  const [world, character] = await Promise.all([
    World.findById(campaign.worldId),
    Character.findById(playerCharacterId),
  ]);

  if (!world) throw new NotFoundError("Mundo");
  if (!character) throw new NotFoundError("Personaje");

  const { messages, memories } = await buildPromptContext({
    campaign,
    world,
    character,
    userInput,
  });

  const nextTurn = campaign.totalTurns + 1;

  yield {
    type: "meta",
    turn: nextTurn,
    retrievedMemories: memories.length,
  };

  await Message.create({
    campaignId,
    userId,
    playerUserId: userId,
    turn: nextTurn,
    role: "user",
    content: userInput,
  });

  const stream = await chatCompletion({
    provider: campaign.aiProvider || undefined,
    model: campaign.aiModel,
    messages,
    temperature: 0.9,
    maxTokens: 1200,
    stream: true,
  });

  let fullContent = "";
  let reasoningContent = "";
  let usage = null;

  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta;

    if (delta?.reasoning_content) {
      reasoningContent += delta.reasoning_content;
      yield { type: "reasoning", content: delta.reasoning_content };
    }

    if (delta?.content) {
      fullContent += delta.content;
      yield { type: "chunk", content: delta.content };
    }

    if (chunk.usage) usage = chunk.usage;
  }

  await Message.create({
    campaignId,
    userId,
    playerUserId: userId,
    turn: nextTurn,
    role: "assistant",
    content: fullContent,
    tokensUsed: usage?.total_tokens ?? 0,
    provider: campaign.aiProvider ?? null,
    model: campaign.aiModel ?? null,
  });

  campaign.totalTurns = nextTurn;
  campaign.lastPlayedAt = new Date();
  await campaign.save();

  yield {
    type: "done",
    turn: nextTurn,
    usage,
    reasoningContent: reasoningContent || undefined,
  };

  setImmediate(async () => {
    try {
      await extractAndStoreMemories({
        campaignId,
        userId,
        userText: userInput,
        assistantText: fullContent,
        turn: nextTurn,
      });
      await summarizeOldMessages({ campaign });
    } catch (err) {
      console.error("Tarea post-turno fallo:", err);
    }
  });
}

export async function* handleTurnWithCommands({
  campaignId,
  userId,
  userInput,
}) {
  const command = parseCommand(userInput);
  if (command) {
    if (command.error) {
      yield {
        type: "command_error",
        error: command.error,
        available: command.available,
        hint: command.hint,
      };
      return;
    }
    yield { type: "command_result", command };
    return;
  }

  yield* narrateTurnStream({ campaignId, userId, userInput });
}

export async function getCampaignLog({
  campaignId,
  userId,
  limit = 50,
  beforeTurn,
}) {
  await loadCampaignAsPlayer(campaignId, userId);
  const filter = { campaignId };
  if (beforeTurn) filter.turn = { $lt: beforeTurn };
  return Message.find(filter).sort({ turn: -1 }).limit(limit).lean();
}
