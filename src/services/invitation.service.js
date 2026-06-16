import crypto from "node:crypto";
import { Invitation } from "../models/Invitation.js";
import { Campaign } from "../models/Campaign.js";
import { Character } from "../models/Character.js";
import { loadCampaignAsGM, isInCampaign } from "../utils/campaign-auth.js";
import {
  NotFoundError,
  ForbiddenError,
  ValidationError,
} from "../utils/errors.js";

function generateToken() {
  return crypto.randomBytes(24).toString("base64url");
}

export async function createInvite(userId, { campaignId, inviteeUserId }) {
  if (!inviteeUserId) {
    throw new ValidationError("inviteeUserId es obligatorio");
  }
  if (inviteeUserId === userId) {
    throw new ValidationError("No puedes invitarte a ti mismo");
  }

  const campaign = await loadCampaignAsGM(campaignId, userId);
  await campaign.populate("worldId", "name genre");

  const existingPlayer = campaign.players?.find(
    (p) => p.userId === inviteeUserId,
  );
  if (existingPlayer) {
    throw new ValidationError("El usuario ya es jugador de esta campania");
  }
  if (campaign.userId === inviteeUserId) {
    throw new ValidationError("El usuario ya es el GM de esta campania");
  }

  const existingInvite = await Invitation.findOne({
    campaignId,
    inviteeUserId,
    status: "pending",
  });
  if (existingInvite) {
    return existingInvite;
  }

  const token = generateToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await Invitation.updateMany(
    { campaignId, inviteeUserId, status: "pending" },
    { $set: { status: "expired" } },
  );

  const invitation = await Invitation.create({
    campaignId,
    inviterUserId: userId,
    inviteeUserId,
    token,
    status: "pending",
    expiresAt,
  });

  await (
    await Campaign.findById(campaignId).populate("worldId", "name genre")
  ).populate("characterId", "name");

  return {
    _id: invitation._id,
    token: invitation.token,
    status: invitation.status,
    expiresAt: invitation.expiresAt,
    campaign: {
      _id: campaign._id,
      title: campaign.title,
      world: campaign.worldId?.name
        ? { name: campaign.worldId.name, genre: campaign.worldId.genre }
        : null,
    },
  };
}

export async function acceptInvite(userId, token, characterId) {
  if (!characterId) {
    throw new ValidationError("characterId es obligatorio para unirse");
  }

  const invitation = await Invitation.findOne({ token, status: "pending" });
  if (!invitation)
    throw new NotFoundError("Invitacion no encontrada o ya expirada");

  if (invitation.inviteeUserId !== userId) {
    throw new ForbiddenError("Esta invitacion no es para ti");
  }
  if (new Date() > invitation.expiresAt) {
    invitation.status = "expired";
    await invitation.save();
    throw new ValidationError("La invitacion ha expirado");
  }

  const character = await Character.findById(characterId);
  if (!character || character.userId !== userId) {
    throw new ForbiddenError("Personaje no accesible");
  }

  const campaign = await Campaign.findById(invitation.campaignId);
  if (!campaign) throw new NotFoundError("Campania");
  if (isInCampaign(campaign, userId)) {
    invitation.status = "declined";
    await invitation.save();
    throw new ValidationError("Ya formas parte de esta campania");
  }

  campaign.players = campaign.players ?? [];
  campaign.players.push({
    userId,
    characterId,
    role: "player",
    joinedAt: new Date(),
  });
  await campaign.save();

  invitation.status = "accepted";
  await invitation.save();

  return {
    campaign: {
      _id: campaign._id,
      title: campaign.title,
    },
    character: {
      _id: character._id,
      name: character.name,
      race: character.race,
      class: character.class,
    },
  };
}

export async function declineInvite(userId, token) {
  const invitation = await Invitation.findOne({ token, status: "pending" });
  if (!invitation) throw new NotFoundError("Invitacion no encontrada");

  if (invitation.inviteeUserId !== userId) {
    throw new ForbiddenError("Esta invitacion no es para ti");
  }

  invitation.status = "declined";
  await invitation.save();
  return { declined: true };
}

export async function listPendingInvites(userId) {
  const invitations = await Invitation.find({
    inviteeUserId: userId,
    status: "pending",
    expiresAt: { $gt: new Date() },
  })
    .sort({ createdAt: -1 })
    .populate({
      path: "campaignId",
      select: "title userId characterId",
      populate: [
        { path: "worldId", select: "name genre" },
        { path: "characterId", select: "name" },
      ],
    })
    .lean();

  return invitations.map((inv) => {
    const campaign = inv.campaignId || {};
    return {
      _id: inv._id,
      token: inv.token,
      status: inv.status,
      expiresAt: inv.expiresAt,
      inviterUserId: inv.inviterUserId,
      createdAt: inv.createdAt,
      campaign: {
        _id: campaign._id,
        title: campaign.title,
        gmName: campaign.characterId?.name ?? null,
        world: campaign.worldId?.name ?? null,
      },
    };
  });
}

export async function listSentInvites(userId) {
  return Invitation.find({ inviterUserId: userId })
    .sort({ createdAt: -1 })
    .populate({
      path: "campaignId",
      select: "title",
    })
    .lean();
}
