import { Message } from "../models/Message.js";
import { Campaign } from "../models/Campaign.js";
import { Character } from "../models/Character.js";
import { World } from "../models/World.js";
import {
  getRecentMessages,
  searchRelevantMemories,
  extractAndStoreMemories,
  summarizeOldMessages,
} from "./memory.service.js";
import { chatCompletion } from "../lib/ai/client.js";
import {
  SYSTEM_NARRATOR_ROUND,
  SYSTEM_GM_NARRATION,
  renderTemplate,
} from "../lib/ai/prompts.js";
import { smartChunk, estimateTokens } from "../lib/ai/tokenizer.js";
import {
  loadCampaignAsGM,
  isInCampaign,
  isPlayer,
} from "../utils/campaign-auth.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";

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

function characterToPrompt(character) {
  const stats = Object.entries(
    character.stats?.toObject?.() ?? character.stats ?? {},
  )
    .map(([k, v]) => `${k} ${v}`)
    .join(" / ");

  return [
    `Nombre: ${character.name} (${character.race} ${character.class} nv.${character.level})`,
    `Stats: ${stats}`,
    `HP: ${character.hp?.current ?? "?"} / ${character.hp?.max ?? "?"}`,
    character.personality?.traits?.length
      ? `Rasgos: ${character.personality.traits.join(", ")}`
      : "",
    character.goals?.length ? `Metas: ${character.goals.join("; ")}` : "",
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

async function buildRoundPrompt({
  campaign,
  world,
  submissions,
  characters,
  userInput,
}) {
  const [recent, memories] = await Promise.all([
    getRecentMessages(campaign._id),
    searchRelevantMemories(campaign._id, userInput),
  ]);

  const playerActions = submissions
    .map((sub) => {
      const char = characters.get(sub.characterId.toString());
      const charName = char?.name ?? "Desconocido";
      return `**${charName}**: ${sub.action}`;
    })
    .join("\n\n");

  const systemPrompt = renderTemplate(SYSTEM_NARRATOR_ROUND, {
    worldName: world.name,
    worldTone: world.tone,
    worldGenre: world.genre,
    worldState: `${world.toPromptContext()}\n\nESTADO ACTUAL:\n${worldStateToPrompt(campaign.state)}`,
    playerActions,
    relevantMemories: memoriesToPrompt(memories),
    rollingSummary: campaign.rollingSummary || "Sin resumen previo.",
  });

  const messages = [
    { role: "system", content: systemPrompt },
    ...recent.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userInput || "Resuelve la ronda actual." },
  ];

  return { messages: smartChunk(messages, { maxTokens: 8192 }), memories };
}

export async function startRound(campaignId, userId) {
  const campaign = await loadCampaignAsGM(campaignId, userId);

  if (campaign.round?.status === "open") {
    throw new ValidationError(
      "Ya hay una ronda abierta. Resuelve o cancela la actual primero.",
    );
  }

  campaign.round = {
    number: (campaign.round?.number ?? 0) + 1,
    status: "open",
    submissions: [],
  };
  await campaign.save();

  return {
    roundNumber: campaign.round.number,
    status: campaign.round.status,
    activePlayers: campaign.getActivePlayers().length,
  };
}

export async function submitAction(campaignId, userId, action) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new NotFoundError("Campania");
  if (!isInCampaign(campaign, userId)) {
    throw new ForbiddenError("No perteneces a esta campania");
  }
  if (!isPlayer(campaign, userId)) {
    throw new ForbiddenError("Los espectadores no pueden enviar acciones");
  }
  if (campaign.round?.status !== "open") {
    throw new ValidationError(
      "No hay una ronda abierta. Espera a que el GM abra una.",
    );
  }
  if (campaign.hasSubmitted(userId)) {
    throw new ValidationError("Ya enviaste tu accion para esta ronda");
  }

  const playerEntry = campaign.getPlayer(userId);
  if (!playerEntry) throw new NotFoundError("Jugador");

  campaign.round.submissions.push({
    userId,
    characterId: playerEntry.characterId,
    action: action.trim(),
    submittedAt: new Date(),
  });
  await campaign.save();

  return {
    roundNumber: campaign.round.number,
    submitted: campaign.round.submissions.length,
    total: campaign.getActivePlayers().length,
    allSubmitted: campaign.allSubmitted(),
  };
}

export async function getRoundState(campaignId, userId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign) throw new NotFoundError("Campania");
  if (!isInCampaign(campaign, userId)) throw new ForbiddenError();

  const activePlayers = campaign.getActivePlayers();
  const submissions = campaign.round?.submissions ?? [];
  const submittedUserIds = new Set(submissions.map((s) => s.userId));
  const pending = activePlayers.filter((p) => !submittedUserIds.has(p.userId));

  const characterIds = [
    ...new Set(activePlayers.map((p) => p.characterId.toString())),
  ];
  const chars = await Character.find({ _id: { $in: characterIds } })
    .select("name race class level")
    .lean();
  const charMap = new Map(chars.map((c) => [c._id.toString(), c]));

  return {
    round: campaign.round,
    players: activePlayers.map((p) => ({
      userId: p.userId,
      role: p.role,
      character: charMap.get(p.characterId.toString()) ?? null,
      hasSubmitted: submittedUserIds.has(p.userId),
      action: submissions.find((s) => s.userId === p.userId)?.action ?? null,
    })),
    pendingCount: pending.length,
    allSubmitted: campaign.allSubmitted(),
  };
}

export async function cancelRound(campaignId, userId) {
  const campaign = await loadCampaignAsGM(campaignId, userId);

  if (campaign.round?.status !== "open") {
    throw new ValidationError("No hay una ronda abierta para cancelar");
  }

  campaign.round.status = "idle";
  campaign.round.submissions = [];
  await campaign.save();

  return { cancelled: true, roundNumber: campaign.round.number };
}

export async function resolveRound({ campaignId, userId, gmAction }) {
  const campaign = await loadCampaignAsGM(campaignId, userId);

  if (campaign.round?.status !== "open") {
    throw new ValidationError("No hay una ronda abierta para resolver");
  }

  const submissions = campaign.round.submissions ?? [];
  if (submissions.length === 0 && !gmAction) {
    throw new ValidationError(
      "No hay acciones de jugador ni del GM para resolver",
    );
  }

  campaign.round.status = "resolving";
  await campaign.save();

  const world = await World.findById(campaign.worldId);
  if (!world) throw new NotFoundError("Mundo");

  const characterIds = [...new Set(submissions.map((s) => s.characterId))];
  if (campaign.characterId) characterIds.push(campaign.characterId);
  const chars = await Character.find({ _id: { $in: characterIds } }).lean();
  const charMap = new Map(chars.map((c) => [c._id.toString(), c]));

  let userInput;
  if (gmAction) {
    userInput = `ACCION DEL GM: ${gmAction}\n\nAcciones de los jugadores: ${submissions
      .map((s) => {
        const ch = charMap.get(s.characterId.toString());
        return `- ${ch?.name ?? "Jugador"}: ${s.action}`;
      })
      .join("\n")}`;
  } else {
    userInput = submissions
      .map((s) => {
        const ch = charMap.get(s.characterId.toString());
        return `${ch?.name ?? "Jugador"}: ${s.action}`;
      })
      .join("\n");
  }

  const { messages, memories } = await buildRoundPrompt({
    campaign,
    world,
    submissions,
    characters: charMap,
    userInput,
  });

  const response = await chatCompletion({
    provider: campaign.aiProvider || undefined,
    model: campaign.aiModel || undefined,
    messages,
    temperature: 0.9,
    maxTokens: 2000,
  });

  const nextTurn = campaign.totalTurns + 1;

  const msgsToInsert = [];

  for (const sub of submissions) {
    const ch = charMap.get(sub.characterId.toString());
    msgsToInsert.push({
      campaignId,
      userId: sub.userId,
      playerUserId: sub.userId,
      turn: nextTurn,
      role: "user",
      content: `[${ch?.name ?? "Jugador"}] ${sub.action}`,
    });
  }

  if (gmAction) {
    msgsToInsert.push({
      campaignId,
      userId,
      playerUserId: userId,
      turn: nextTurn,
      role: "user",
      content: `[GM] ${gmAction}`,
    });
  }

  msgsToInsert.push({
    campaignId,
    userId,
    playerUserId: userId,
    turn: nextTurn,
    role: "assistant",
    content: response.content,
    tokensUsed: response.usage?.total_tokens ?? 0,
    provider: campaign.aiProvider ?? null,
    model: campaign.aiModel ?? null,
  });

  await Message.insertMany(msgsToInsert);

  campaign.totalTurns = nextTurn;
  campaign.lastPlayedAt = new Date();
  campaign.round.status = "idle";
  campaign.round.submissions = [];
  await campaign.save();

  setImmediate(async () => {
    try {
      const summaryText = submissions.map((s) => s.action).join(" | ");
      await extractAndStoreMemories({
        campaignId,
        userId,
        userText: summaryText,
        assistantText: response.content,
        turn: nextTurn,
      });
      await summarizeOldMessages({ campaign });
    } catch (err) {
      console.error("Tarea post-ronda fallo:", err);
    }
  });

  return {
    turn: nextTurn,
    roundNumber: campaign.round.number,
    assistantMessage: response.content,
    reasoningContent: response.reasoningContent,
    usage: response.usage,
    retrievedMemories: memories.length,
    estimatedTokens: estimateTokens(messages.map((m) => m.content).join(" ")),
  };
}

export async function* resolveRoundStream({ campaignId, userId, gmAction }) {
  const campaign = await loadCampaignAsGM(campaignId, userId);

  if (campaign.round?.status !== "open") {
    yield { type: "error", error: "No hay una ronda abierta para resolver" };
    return;
  }

  const submissions = campaign.round.submissions ?? [];
  if (submissions.length === 0 && !gmAction) {
    yield { type: "error", error: "No hay acciones para resolver" };
    return;
  }

  campaign.round.status = "resolving";
  await campaign.save();

  const world = await World.findById(campaign.worldId);
  if (!world) throw new NotFoundError("Mundo");

  const characterIds = [...new Set(submissions.map((s) => s.characterId))];
  if (campaign.characterId) characterIds.push(campaign.characterId);
  const chars = await Character.find({ _id: { $in: characterIds } }).lean();
  const charMap = new Map(chars.map((c) => [c._id.toString(), c]));

  let userInput;
  if (gmAction) {
    userInput = `ACCION DEL GM: ${gmAction}\n\nAcciones de los jugadores: ${submissions
      .map((s) => {
        const ch = charMap.get(s.characterId.toString());
        return `- ${ch?.name ?? "Jugador"}: ${s.action}`;
      })
      .join("\n")}`;
  } else {
    userInput = submissions
      .map((s) => {
        const ch = charMap.get(s.characterId.toString());
        return `${ch?.name ?? "Jugador"}: ${s.action}`;
      })
      .join("\n");
  }

  const { messages, memories } = await buildRoundPrompt({
    campaign,
    world,
    submissions,
    characters: charMap,
    userInput,
  });

  const nextTurn = campaign.totalTurns + 1;

  yield {
    type: "meta",
    roundNumber: campaign.round.number,
    turn: nextTurn,
    submissions: submissions.length,
    retrievedMemories: memories.length,
  };

  const msgsToInsert = [];
  for (const sub of submissions) {
    const ch = charMap.get(sub.characterId.toString());
    msgsToInsert.push({
      campaignId,
      userId: sub.userId,
      playerUserId: sub.userId,
      turn: nextTurn,
      role: "user",
      content: `[${ch?.name ?? "Jugador"}] ${sub.action}`,
    });
  }
  if (gmAction) {
    msgsToInsert.push({
      campaignId,
      userId,
      playerUserId: userId,
      turn: nextTurn,
      role: "user",
      content: `[GM] ${gmAction}`,
    });
  }
  await Message.insertMany(msgsToInsert);

  const stream = await chatCompletion({
    provider: campaign.aiProvider || undefined,
    model: campaign.aiModel,
    messages,
    temperature: 0.9,
    maxTokens: 2000,
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
  campaign.round.status = "idle";
  campaign.round.submissions = [];
  await campaign.save();

  yield {
    type: "done",
    roundNumber: campaign.round.number,
    turn: nextTurn,
    usage,
    reasoningContent: reasoningContent || undefined,
  };

  setImmediate(async () => {
    try {
      const summaryText = submissions.map((s) => s.action).join(" | ");
      await extractAndStoreMemories({
        campaignId,
        userId,
        userText: summaryText,
        assistantText: fullContent,
        turn: nextTurn,
      });
      await summarizeOldMessages({ campaign });
    } catch (err) {
      console.error("Tarea post-ronda fallo:", err);
    }
  });
}

export async function gmNarrate({ campaignId, userId, action }) {
  const campaign = await loadCampaignAsGM(campaignId, userId);

  if (!action?.trim()) {
    throw new ValidationError("La accion del GM es obligatoria");
  }

  const world = await World.findById(campaign.worldId);
  if (!world) throw new NotFoundError("Mundo");

  const activePlayers = campaign.getActivePlayers();
  const characterIds = activePlayers.map((p) => p.characterId);
  const chars = await Character.find({ _id: { $in: characterIds } }).lean();

  const characterSheets = chars
    .map((c) => characterToPrompt(c))
    .join("\n\n---\n\n");

  const [memories] = await Promise.all([
    searchRelevantMemories(campaign._id, action),
  ]);

  const systemPrompt = renderTemplate(SYSTEM_GM_NARRATION, {
    worldName: world.name,
    worldTone: world.tone,
    worldGenre: world.genre,
    worldState: `${world.toPromptContext()}\n\nESTADO ACTUAL:\n${worldStateToPrompt(campaign.state)}`,
    characterSheets,
    gmAction: action,
    relevantMemories: memoriesToPrompt(memories),
    rollingSummary: campaign.rollingSummary || "Sin resumen previo.",
  });

  const recent = await getRecentMessages(campaign._id);
  const messages = smartChunk(
    [
      { role: "system", content: systemPrompt },
      ...recent.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: action },
    ],
    { maxTokens: 8192 },
  );

  const response = await chatCompletion({
    provider: campaign.aiProvider || undefined,
    model: campaign.aiModel || undefined,
    messages,
    temperature: 0.9,
    maxTokens: 1500,
  });

  const nextTurn = campaign.totalTurns + 1;

  await Message.insertMany([
    {
      campaignId,
      userId,
      playerUserId: userId,
      turn: nextTurn,
      role: "user",
      content: `[GM] ${action}`,
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
        userText: `[GM] ${action}`,
        assistantText: response.content,
        turn: nextTurn,
      });
      await summarizeOldMessages({ campaign });
    } catch (err) {
      console.error("Tarea post-narracion fallo:", err);
    }
  });

  return {
    turn: nextTurn,
    assistantMessage: response.content,
    reasoningContent: response.reasoningContent,
    usage: response.usage,
    estimatedTokens: estimateTokens(messages.map((m) => m.content).join(" ")),
  };
}
