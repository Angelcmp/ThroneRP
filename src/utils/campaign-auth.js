import { Campaign } from "../models/Campaign.js";
import { NotFoundError, ForbiddenError } from "./errors.js";

export const CAMPAIGN_ROLES = {
  GM: "gm",
  PLAYER: "player",
  SPECTATOR: "spectator",
};

export function getPlayerRole(campaign, userId) {
  if (!campaign || !userId) return null;
  if (campaign.userId === userId) return CAMPAIGN_ROLES.GM;
  const player = campaign.players?.find((p) => p.userId === userId);
  return player?.role ?? null;
}

export function isInCampaign(campaign, userId) {
  return getPlayerRole(campaign, userId) !== null;
}

export function isGM(campaign, userId) {
  return getPlayerRole(campaign, userId) === CAMPAIGN_ROLES.GM;
}

export function isPlayer(campaign, userId) {
  const role = getPlayerRole(campaign, userId);
  return role === CAMPAIGN_ROLES.GM || role === CAMPAIGN_ROLES.PLAYER;
}

export function canView(campaign, userId) {
  return isInCampaign(campaign, userId);
}

export function canPlay(campaign, userId) {
  return isPlayer(campaign, userId);
}

export function canManage(campaign, userId) {
  return isGM(campaign, userId);
}

export function requireGM(campaign, userId) {
  if (!isGM(campaign, userId)) {
    throw new ForbiddenError("Solo el Game Master puede realizar esta accion");
  }
}

export function requirePlayer(campaign, userId) {
  if (!isPlayer(campaign, userId)) {
    throw new ForbiddenError(
      "Necesitas ser jugador o GM para realizar un turno",
    );
  }
}

export function requireInCampaign(campaign, userId) {
  if (!isInCampaign(campaign, userId)) {
    throw new ForbiddenError("No perteneces a esta campania");
  }
}

export async function loadCampaignAs(
  campaignId,
  userId,
  checkFn = requireInCampaign,
) {
  const campaign = await Campaign.findById(campaignId)
    .populate("worldId")
    .populate("characterId");

  if (!campaign) throw new NotFoundError("Campania");
  checkFn(campaign, userId);
  return campaign;
}

export async function loadCampaignAsGM(campaignId, userId) {
  return loadCampaignAs(campaignId, userId, requireGM);
}

export async function loadCampaignAsPlayer(campaignId, userId) {
  return loadCampaignAs(campaignId, userId, requirePlayer);
}

export function getPlayerCharacter(campaign, userId) {
  if (!campaign || !userId) return null;
  if (campaign.userId === userId) {
    return campaign.characterId;
  }
  const player = campaign.players?.find((p) => p.userId === userId);
  return player?.characterId ?? null;
}

export async function listPlayableCampaigns(userId) {
  return Campaign.find({
    $or: [
      { userId },
      { "players.userId": userId, "players.role": { $ne: "spectator" } },
    ],
  })
    .sort({ lastPlayedAt: -1, createdAt: -1 })
    .populate("worldId", "name genre coverUrl")
    .populate("characterId", "name race class level avatarUrl")
    .lean();
}
