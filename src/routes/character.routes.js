import {
  listCharacters,
  getCharacter,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  generateCharacterFromAI,
} from "../services/character.service.js";
import {
  createCharacterSchema,
  updateCharacterSchema,
  generateCharacterSchema,
} from "../validators/schemas.js";
import { validateBody } from "../validators/validate.js";

export default async function characterRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.get("/api/characters", async (request) => {
    const characters = await listCharacters(request.user.id);
    return { characters };
  });

  fastify.get("/api/characters/:id", async (request) => {
    const character = await getCharacter(request.params.id, request.user.id);
    return { character };
  });

  fastify.post(
    "/api/characters",
    { preHandler: [validateBody(createCharacterSchema)] },
    async (request, reply) => {
      const character = await createCharacter(request.user.id, request.body);
      reply.code(201);
      return { character };
    },
  );

  fastify.patch(
    "/api/characters/:id",
    { preHandler: [validateBody(updateCharacterSchema)] },
    async (request) => {
      const character = await updateCharacter(
        request.params.id,
        request.user.id,
        request.body,
      );
      return { character };
    },
  );

  fastify.delete("/api/characters/:id", async (request) => {
    return deleteCharacter(request.params.id, request.user.id);
  });

  fastify.post(
    "/api/characters/generate",
    {
      preHandler: [validateBody(generateCharacterSchema)],
      config: { rateLimit: { max: 5, timeWindow: "1 minute" } },
    },
    async (request, reply) => {
      const character = await generateCharacterFromAI(
        request.user.id,
        request.body,
      );
      reply.code(201);
      return { character };
    },
  );
}
