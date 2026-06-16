import {
  listWorlds,
  getWorld,
  createWorld,
  updateWorld,
  deleteWorld,
  generateWorldFromAI,
  generateFactionForWorld,
  generateLocationForWorld,
} from "../services/world.service.js";
import {
  createWorldSchema,
  updateWorldSchema,
  generateWorldSchema,
  generateFactionSchema,
  generateLocationSchema,
} from "../validators/schemas.js";
import { validateBody } from "../validators/validate.js";

export default async function worldRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.get("/api/worlds", async (request) => {
    const includePublic = request.query?.includePublic === "true";
    const worlds = await listWorlds(request.user.id, { includePublic });
    return { worlds };
  });

  fastify.get("/api/worlds/:id", async (request) => {
    const world = await getWorld(request.params.id, request.user.id);
    return { world };
  });

  fastify.post(
    "/api/worlds",
    { preHandler: [validateBody(createWorldSchema)] },
    async (request, reply) => {
      const world = await createWorld(request.user.id, request.body);
      reply.code(201);
      return { world };
    },
  );

  fastify.patch(
    "/api/worlds/:id",
    { preHandler: [validateBody(updateWorldSchema)] },
    async (request) => {
      const world = await updateWorld(
        request.params.id,
        request.user.id,
        request.body,
      );
      return { world };
    },
  );

  fastify.delete("/api/worlds/:id", async (request) => {
    return deleteWorld(request.params.id, request.user.id);
  });

  fastify.post(
    "/api/worlds/generate",
    {
      preHandler: [validateBody(generateWorldSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const world = await generateWorldFromAI(request.user.id, request.body);
      reply.code(201);
      return { world };
    },
  );

  fastify.post(
    "/api/worlds/:id/factions/generate",
    {
      preHandler: [validateBody(generateFactionSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request) => {
      const result = await generateFactionForWorld(
        request.params.id,
        request.user.id,
        request.body.prompt,
      );
      return result;
    },
  );

  fastify.post(
    "/api/worlds/:id/locations/generate",
    {
      preHandler: [validateBody(generateLocationSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request) => {
      const result = await generateLocationForWorld(
        request.params.id,
        request.user.id,
        request.body.prompt,
      );
      return result;
    },
  );
}
