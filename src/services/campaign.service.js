import { Campaign } from "../models/Campaign.js";
import { Character } from "../models/Character.js";
import { World } from "../models/World.js";
import { Message } from "../models/Message.js";
import { Memory } from "../models/Memory.js";
import { chatCompletion } from "../lib/ai/client.js";
import { SYSTEM_OPENING_SCENE, renderTemplate } from "../lib/ai/prompts.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";
import {
  requireGM,
  requireInCampaign,
  loadCampaignAs,
  listPlayableCampaigns,
} from "../utils/campaign-auth.js";

export async function listCampaigns(userId) {
  return listPlayableCampaigns(userId);
}

export async function getCampaign(id, userId) {
  return loadCampaignAs(id, userId, requireInCampaign);
}

export async function createCampaign(
  userId,
  {
    title,
    worldId,
    characterId,
    aiProvider,
    aiModel,
    openingScene,
    generateOpening,
  },
) {
  if (!title || !worldId || !characterId) {
    throw new ValidationError("Faltan campos: title, worldId, characterId");
  }

  const [world, character] = await Promise.all([
    World.findById(worldId),
    Character.findById(characterId),
  ]);

  if (!world || (world.userId !== userId && world.visibility === "private")) {
    throw new ForbiddenError("Mundo no accesible");
  }
  if (!character || character.userId !== userId) {
    throw new ForbiddenError("Personaje no accesible");
  }

  const campaign = await Campaign.create({
    userId,
    title,
    worldId,
    characterId,
    aiProvider: aiProvider || undefined,
    aiModel: aiModel || undefined,
    state: {
      currentLocation: world.locations?.[0]?.name ?? "Lugar desconocido",
      timeOfDay: "manana",
      status: "active",
    },
    lastPlayedAt: new Date(),
  });

  if (openingScene) {
    await Message.create({
      campaignId: campaign._id,
      userId,
      playerUserId: userId,
      turn: 0,
      role: "assistant",
      content: openingScene,
    });
  } else if (generateOpening) {
    await generateOpeningScene({ campaign, world, character, userId });
  }

  return campaign;
}

async function generateOpeningScene({ campaign, world, character, userId }) {
  const characterSheet = [
    `Nombre: ${character.name} (${character.race} ${character.class})`,
    character.backstory ? `Historia: ${character.backstory}` : "",
    character.personality?.traits
      ? `Rasgos: ${character.personality.traits.join(", ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = renderTemplate(SYSTEM_OPENING_SCENE, {
    worldName: world.name,
    worldTone: world.tone,
    worldGenre: world.genre,
    worldContext: world.toPromptContext(),
    characterName: character.name,
    characterSheet,
  });

  try {
    const { content } = await chatCompletion({
      messages: [
        { role: "system", content: prompt },
        {
          role: "user",
          content: "Genera la escena de apertura para esta campania.",
        },
      ],
      temperature: 0.9,
      maxTokens: 800,
    });

    await Message.create({
      campaignId: campaign._id,
      userId,
      playerUserId: userId,
      turn: 0,
      role: "assistant",
      content: content.trim(),
    });

    campaign.rollingSummary = `Inicio de la campania en ${world.name}. ${content.trim().slice(0, 200)}`;
    await campaign.save();
  } catch (err) {
    console.warn("Generacion de escena inicial fallo:", err.message);
  }
}

export async function updateCampaign(id, userId, data) {
  const campaign = await loadCampaignAs(id, userId, requireGM);

  const allowed = ["title", "aiProvider", "aiModel", "state", "rollingSummary"];
  for (const key of allowed) {
    if (data[key] !== undefined) campaign[key] = data[key];
  }
  await campaign.save();
  return campaign;
}

export async function deleteCampaign(id, userId) {
  const campaign = await loadCampaignAs(id, userId, requireGM);

  await Promise.all([
    Message.deleteMany({ campaignId: id }),
    Memory.deleteMany({ campaignId: id }),
    campaign.deleteOne(),
  ]);

  return { deleted: true };
}

export async function getPlayers(campaignId, userId) {
  const campaign = await loadCampaignAs(campaignId, userId, requireInCampaign);

  const gm = await Character.findById(campaign.characterId).select(
    "name race class level avatarUrl",
  );

  const playerDetails = await Promise.all(
    (campaign.players ?? []).map(async (p) => {
      const char = await Character.findById(p.characterId).select(
        "name race class level avatarUrl",
      );
      return {
        userId: p.userId,
        role: p.role,
        joinedAt: p.joinedAt,
        character: char
          ? {
              _id: char._id,
              name: char.name,
              race: char.race,
              class: char.class,
              level: char.level,
              avatarUrl: char.avatarUrl,
            }
          : null,
      };
    }),
  );

  return {
    gm: {
      userId: campaign.userId,
      character: gm
        ? {
            _id: gm._id,
            name: gm.name,
            race: gm.race,
            class: gm.class,
            level: gm.level,
            avatarUrl: gm.avatarUrl,
          }
        : null,
    },
    players: playerDetails,
  };
}

export async function updatePlayerRole(campaignId, userId, targetUserId, role) {
  const campaign = await loadCampaignAs(campaignId, userId, requireGM);

  if (targetUserId === campaign.userId) {
    throw new ValidationError("No puedes cambiar el rol del GM");
  }

  const player = campaign.players?.find((p) => p.userId === targetUserId);
  if (!player) {
    throw new NotFoundError("Jugador");
  }

  player.role = role;
  await campaign.save();
  return campaign;
}

export async function removePlayer(campaignId, userId, targetUserId) {
  const campaign = await loadCampaignAs(campaignId, userId, requireGM);

  if (targetUserId === campaign.userId) {
    throw new ValidationError("No puedes remover al GM de la campania");
  }

  const idx = campaign.players?.findIndex((p) => p.userId === targetUserId);
  if (idx === -1 || idx === undefined) {
    throw new NotFoundError("Jugador");
  }

  campaign.players.splice(idx, 1);
  await campaign.save();
  return campaign;
}
