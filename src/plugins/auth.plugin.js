import fp from "fastify-plugin";
import { getAuth } from "../lib/auth.js";
import { UnauthorizedError } from "../utils/errors.js";

/**
 * Plugin Fastify que monta los endpoints de Better-Auth
 * y expone decoradores request.user, request.session y requireAuth.
 *
 * Better-Auth maneja: /api/auth/sign-up, /sign-in, /sign-out, /session, OAuth, etc.
 */
async function authPlugin(fastify) {
  const auth = getAuth();

  fastify.decorateRequest("user", null);
  fastify.decorateRequest("session", null);

  fastify.addHook("preHandler", async (request) => {
    try {
      const result = await auth.api.getSession({ headers: request.headers });
      if (result) {
        request.user = result.user;
        request.session = result.session;
      }
    } catch (err) {
      request.log.debug({ err }, "No se pudo obtener sesion");
    }
  });

  fastify.decorate("requireAuth", async (request) => {
    if (!request.user) throw new UnauthorizedError();
  });

  fastify.all(
    "/api/auth/*",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (request, reply) => {
      const url = new URL(request.url, `http://${request.headers.host}`);
      const headers = new Headers();
      for (const [k, v] of Object.entries(request.headers)) {
        if (typeof v === "string") headers.set(k, v);
        else if (Array.isArray(v)) headers.set(k, v.join(", "));
      }

      const req = new Request(url.toString(), {
        method: request.method,
        headers,
        body: ["GET", "HEAD"].includes(request.method)
          ? undefined
          : JSON.stringify(request.body ?? {}),
      });

      const response = await auth.handler(req);
      reply.status(response.status);
      response.headers.forEach((value, key) => reply.header(key, value));
      const body = await response.text();
      reply.send(body);
    },
  );
}

export default fp(authPlugin, { name: "auth-plugin" });
