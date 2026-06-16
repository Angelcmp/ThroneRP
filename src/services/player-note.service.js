import { PlayerNote } from "../models/PlayerNote.js";
import { loadCampaignAs, isGM } from "../utils/campaign-auth.js";
import { requireInCampaign } from "../utils/campaign-auth.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export async function createNote(
  campaignId,
  userId,
  { title, content, visibility },
) {
  await loadCampaignAs(campaignId, userId, requireInCampaign);

  return PlayerNote.create({
    campaignId,
    authorUserId: userId,
    title,
    content: content ?? "",
    visibility: visibility ?? "all",
  });
}

export async function listNotes(campaignId, userId) {
  const campaign = await loadCampaignAs(campaignId, userId, requireInCampaign);
  const isCampaignGM = isGM(campaign, userId);

  const filter = { campaignId };
  if (!isCampaignGM) {
    filter.$or = [{ visibility: "all" }, { authorUserId: userId }];
  }

  return PlayerNote.find(filter).sort({ createdAt: -1 }).lean();
}

export async function updateNote(campaignId, userId, noteId, data) {
  await loadCampaignAs(campaignId, userId, requireInCampaign);

  const note = await PlayerNote.findById(noteId);
  if (!note) throw new NotFoundError("Nota");
  if (note.campaignId.toString() !== campaignId)
    throw new ForbiddenError("La nota no pertenece a esta campania");
  if (note.authorUserId !== userId) {
    const campaign = await loadCampaignAs(
      campaignId,
      userId,
      requireInCampaign,
    );
    if (!isGM(campaign, userId))
      throw new ForbiddenError("Solo el GM puede editar notas de otros");
  }

  if (data.title !== undefined) note.title = data.title;
  if (data.content !== undefined) note.content = data.content;
  if (data.visibility !== undefined) note.visibility = data.visibility;

  await note.save();
  return note;
}

export async function deleteNote(campaignId, userId, noteId) {
  await loadCampaignAs(campaignId, userId, requireInCampaign);

  const note = await PlayerNote.findById(noteId);
  if (!note) throw new NotFoundError("Nota");
  if (note.campaignId.toString() !== campaignId)
    throw new ForbiddenError("La nota no pertenece a esta campania");
  if (note.authorUserId !== userId) {
    const campaign = await loadCampaignAs(
      campaignId,
      userId,
      requireInCampaign,
    );
    if (!isGM(campaign, userId))
      throw new ForbiddenError("Solo el GM puede eliminar notas de otros");
  }

  await note.deleteOne();
  return { deleted: true };
}
