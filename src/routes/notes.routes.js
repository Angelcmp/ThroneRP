import {
  createNote,
  listNotes,
  updateNote,
  deleteNote,
} from "../services/player-note.service.js";
import { validateBody } from "../validators/validate.js";
import { createNoteSchema, updateNoteSchema } from "../validators/schemas.js";

export default async function noteRoutes(fastify) {
  fastify.addHook("preHandler", fastify.requireAuth);

  fastify.post(
    "/api/campaigns/:id/notes",
    { preHandler: [validateBody(createNoteSchema)] },
    async (request, reply) => {
      const note = await createNote(
        request.params.id,
        request.user.id,
        request.body,
      );
      reply.code(201);
      return { note };
    },
  );

  fastify.get("/api/campaigns/:id/notes", async (request) => {
    const notes = await listNotes(request.params.id, request.user.id);
    return { notes };
  });

  fastify.patch(
    "/api/campaigns/:id/notes/:noteId",
    { preHandler: [validateBody(updateNoteSchema)] },
    async (request) => {
      const note = await updateNote(
        request.params.id,
        request.user.id,
        request.params.noteId,
        request.body,
      );
      return { note };
    },
  );

  fastify.delete("/api/campaigns/:id/notes/:noteId", async (request) => {
    return deleteNote(
      request.params.id,
      request.user.id,
      request.params.noteId,
    );
  });
}
