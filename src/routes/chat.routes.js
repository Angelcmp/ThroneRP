import {
  handleChatConnection,
  getChatHistory,
  isInCampaign,
} from "../services/chat.service.js";
import { Campaign } from "../models/Campaign.js";
import { NotFoundError, ForbiddenError } from "../utils/errors.js";

export default async function chatRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.get(
    "/api/campaigns/:id/chat",
    { websocket: true },
    async (socket, request) => {
      const campaignId = request.params.id;
      const userId = request.user.id;

      const campaign = await Campaign.findById(campaignId);
      if (!campaign) {
        socket.send(
          JSON.stringify({ type: "error", error: "Campania no encontrada" }),
        );
        socket.close();
        return;
      }
      if (!isInCampaign(campaign, userId)) {
        socket.send(
          JSON.stringify({
            type: "error",
            error: "No perteneces a esta campania",
          }),
        );
        socket.close();
        return;
      }

      handleChatConnection(socket, request, campaignId, userId);
    },
  );

  fastify.get("/api/campaigns/:id/chat/history", async (request) => {
    const campaign = await Campaign.findById(request.params.id);
    if (!campaign) throw new NotFoundError("Campania");
    if (!isInCampaign(campaign, request.user.id)) {
      throw new ForbiddenError("No perteneces a esta campania");
    }

    const limit = Number(request.query?.limit) || 100;
    const messages = await getChatHistory(
      request.params.id,
      request.user.id,
      limit,
    );
    return { messages };
  });
}
