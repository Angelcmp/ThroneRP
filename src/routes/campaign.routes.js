import {
  listCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  getPlayers,
  updatePlayerRole,
  removePlayer,
} from "../services/campaign.service.js";
import {
  narrateTurn,
  handleTurnWithCommands,
  getCampaignLog,
} from "../services/narration.service.js";
import {
  startRound,
  submitAction,
  resolveRound,
  resolveRoundStream,
  getRoundState,
  cancelRound,
  gmNarrate,
} from "../services/narration-round.service.js";
import { parseCommand } from "../services/commands.service.js";
import { getTimeline } from "../services/memory.service.js";
import {
  exportJSON,
  exportMarkdown,
  exportFullHTML,
} from "../services/export.service.js";
import { Memory } from "../models/Memory.js";
import { Character } from "../models/Character.js";
import {
  createCampaignSchema,
  updateCampaignSchema,
  narrateTurnSchema,
  updatePlayerRoleSchema,
  submitActionSchema,
  gmActionSchema,
  resolveRoundSchema,
} from "../validators/schemas.js";
import { validateBody } from "../validators/validate.js";

export default async function campaignRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.get("/api/campaigns", async (request) => {
    const campaigns = await listCampaigns(request.user.id);
    return { campaigns };
  });

  fastify.get("/api/campaigns/:id", async (request) => {
    const campaign = await getCampaign(request.params.id, request.user.id);
    return { campaign };
  });

  fastify.post(
    "/api/campaigns",
    { preHandler: [validateBody(createCampaignSchema)] },
    async (request, reply) => {
      const campaign = await createCampaign(request.user.id, request.body);
      reply.code(201);
      return { campaign };
    },
  );

  fastify.patch(
    "/api/campaigns/:id",
    { preHandler: [validateBody(updateCampaignSchema)] },
    async (request) => {
      const campaign = await updateCampaign(
        request.params.id,
        request.user.id,
        request.body,
      );
      return { campaign };
    },
  );

  fastify.delete("/api/campaigns/:id", async (request) => {
    return deleteCampaign(request.params.id, request.user.id);
  });

  fastify.post(
    "/api/campaigns/:id/turns",
    {
      preHandler: [validateBody(narrateTurnSchema)],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (request) => {
      const userInput = request.body.input;

      const command = parseCommand(userInput);

      if (command) {
        if (command.error) {
          return { type: "command_error", ...command };
        }
        return { type: command.type, ...command };
      }

      const result = await narrateTurn({
        campaignId: request.params.id,
        userId: request.user.id,
        userInput,
      });
      return result;
    },
  );

  fastify.post(
    "/api/campaigns/:id/turns/stream",
    {
      preHandler: [validateBody(narrateTurnSchema)],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      try {
        for await (const chunk of handleTurnWithCommands({
          campaignId: request.params.id,
          userId: request.user.id,
          userInput: request.body.input,
        })) {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        reply.raw.write("data: [DONE]\n\n");
      } catch (err) {
        request.log.error({ err }, "Error en streaming de narracion");
        reply.raw.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      reply.raw.end();
    },
  );

  fastify.get("/api/campaigns/:id/log", async (request) => {
    const limit = Number(request.query?.limit) || 50;
    const beforeTurn = request.query?.beforeTurn
      ? Number(request.query.beforeTurn)
      : undefined;
    const messages = await getCampaignLog({
      campaignId: request.params.id,
      userId: request.user.id,
      limit,
      beforeTurn,
    });
    return { messages };
  });

  fastify.get("/api/campaigns/:id/memories", async (request) => {
    const campaign = await getCampaign(request.params.id, request.user.id);
    const memories = await Memory.find({ campaignId: campaign._id })
      .sort({ importance: -1, createdAt: -1 })
      .lean();
    return { memories };
  });

  fastify.get("/api/campaigns/:id/timeline", async (request) => {
    const campaign = await getCampaign(request.params.id, request.user.id);
    const timeline = await getTimeline(campaign._id);
    return { timeline };
  });

  fastify.get("/api/campaigns/:id/chapters", async (request) => {
    const campaign = await getCampaign(request.params.id, request.user.id);
    return {
      chapters:
        campaign.chapters
          ?.filter((ch) => ch.title || ch.summary)
          .map((ch) => ({
            title: ch.title,
            summary: ch.summary,
            startTurn: ch.startTurn,
            endTurn: ch.endTurn,
            status: ch.status,
          })) ?? [],
    };
  });

  fastify.get("/api/campaigns/:id/export/json", async (request) => {
    const data = await exportJSON(request.params.id, request.user.id);
    return data;
  });

  fastify.get("/api/campaigns/:id/export/markdown", async (request, reply) => {
    const md = await exportMarkdown(request.params.id, request.user.id);
    reply.header("Content-Type", "text/markdown; charset=utf-8");
    reply.header("Content-Disposition", 'attachment; filename="campania.md"');
    return md;
  });

  fastify.get("/api/campaigns/:id/export/html", async (request, reply) => {
    const html = await exportFullHTML(request.params.id, request.user.id);
    reply.header("Content-Type", "text/html; charset=utf-8");
    return html;
  });

  fastify.post("/api/campaigns/:id/commands", async (request) => {
    const campaign = await getCampaign(request.params.id, request.user.id);
    const character = await Character.findById(campaign.characterId);

    const command = parseCommand(request.body?.input ?? "", {
      character,
      campaign,
    });

    if (!command) return { error: "No es un comando valido" };
    return command;
  });

  fastify.get("/api/campaigns/:id/players", async (request) => {
    return getPlayers(request.params.id, request.user.id);
  });

  fastify.patch(
    "/api/campaigns/:id/players/:targetUserId",
    { preHandler: [validateBody(updatePlayerRoleSchema)] },
    async (request) => {
      const campaign = await updatePlayerRole(
        request.params.id,
        request.user.id,
        request.params.targetUserId,
        request.body.role,
      );
      return { campaign };
    },
  );

  fastify.delete(
    "/api/campaigns/:id/players/:targetUserId",
    async (request) => {
      const campaign = await removePlayer(
        request.params.id,
        request.user.id,
        request.params.targetUserId,
      );
      return { campaign };
    },
  );

  fastify.post("/api/campaigns/:id/rounds/start", async (request) => {
    return startRound(request.params.id, request.user.id);
  });

  fastify.post(
    "/api/campaigns/:id/rounds/submit",
    { preHandler: [validateBody(submitActionSchema)] },
    async (request) => {
      return submitAction(
        request.params.id,
        request.user.id,
        request.body.action,
      );
    },
  );

  fastify.get("/api/campaigns/:id/rounds/current", async (request) => {
    return getRoundState(request.params.id, request.user.id);
  });

  fastify.post("/api/campaigns/:id/rounds/cancel", async (request) => {
    return cancelRound(request.params.id, request.user.id);
  });

  fastify.post(
    "/api/campaigns/:id/rounds/resolve",
    {
      preHandler: [validateBody(resolveRoundSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request) => {
      const result = await resolveRound({
        campaignId: request.params.id,
        userId: request.user.id,
        gmAction: request.body.gmAction,
      });
      return result;
    },
  );

  fastify.post(
    "/api/campaigns/:id/rounds/resolve/stream",
    {
      preHandler: [validateBody(resolveRoundSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      reply.raw.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      });

      try {
        for await (const chunk of resolveRoundStream({
          campaignId: request.params.id,
          userId: request.user.id,
          gmAction: request.body.gmAction,
        })) {
          reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
        }
        reply.raw.write("data: [DONE]\n\n");
      } catch (err) {
        request.log.error({ err }, "Error en streaming de ronda");
        reply.raw.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
      }
      reply.raw.end();
    },
  );

  fastify.post(
    "/api/campaigns/:id/gm-narrate",
    {
      preHandler: [validateBody(gmActionSchema)],
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
    },
    async (request) => {
      const result = await gmNarrate({
        campaignId: request.params.id,
        userId: request.user.id,
        action: request.body.action,
      });
      return result;
    },
  );
}
