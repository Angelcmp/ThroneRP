import {
  createInvite,
  acceptInvite,
  declineInvite,
  listPendingInvites,
} from "../services/invitation.service.js";
import { validateBody } from "../validators/validate.js";
import {
  createInviteSchema,
  inviteResponseSchema,
} from "../validators/schemas.js";

export default async function invitationRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.post(
    "/api/campaigns/:id/invite",
    { preHandler: [validateBody(createInviteSchema)] },
    async (request, reply) => {
      const invitation = await createInvite(request.user.id, {
        campaignId: request.params.id,
        inviteeUserId: request.body.inviteeUserId,
      });
      reply.code(201);
      return { invitation };
    },
  );

  fastify.get("/api/invitations", async (request) => {
    const invitations = await listPendingInvites(request.user.id);
    return { invitations };
  });

  fastify.post(
    "/api/invitations/:token/accept",
    { preHandler: [validateBody(inviteResponseSchema)] },
    async (request) => {
      const result = await acceptInvite(
        request.user.id,
        request.params.token,
        request.body.characterId,
      );
      return result;
    },
  );

  fastify.post("/api/invitations/:token/decline", async (request) => {
    const result = await declineInvite(request.user.id, request.params.token);
    return result;
  });
}
