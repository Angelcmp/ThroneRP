import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import sensible from "@fastify/sensible";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";

import { env, isProd, isDev } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import { buildAuth } from "./lib/auth.js";

import errorHandler from "./plugins/error-handler.js";
import authPlugin from "./plugins/auth.plugin.js";

import systemRoutes from "./routes/system.routes.js";
import characterRoutes from "./routes/character.routes.js";
import worldRoutes from "./routes/world.routes.js";
import campaignRoutes from "./routes/campaign.routes.js";
import invitationRoutes from "./routes/invitation.routes.js";
import noteRoutes from "./routes/notes.routes.js";
import chatRoutes from "./routes/chat.routes.js";

async function buildServer() {
  const fastify = Fastify({
    logger: isDev
      ? {
          level: env.LOG_LEVEL,
          transport: {
            target: "pino-pretty",
            options: { colorize: true, translateTime: "HH:MM:ss.l" },
          },
        }
      : {
          level: env.LOG_LEVEL,
          redact: {
            paths: [
              "req.headers.authorization",
              "req.headers.cookie",
              "req.headers[*].x-api-key",
            ],
            censor: "[REDACTED]",
          },
        },
    genReqId: () =>
      `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`,
    trustProxy: isProd,
  });

  await connectDatabase(fastify.log);
  buildAuth();

  await fastify.register(helmet, { contentSecurityPolicy: false });
  await fastify.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
  });
  await fastify.register(sensible);
  await fastify.register(rateLimit, {
    max: 200,
    timeWindow: "1 minute",
    allowList: isDev ? ["127.0.0.1", "::1"] : [],
  });
  await fastify.register(websocket);

  fastify.setErrorHandler(errorHandler);

  await fastify.register(authPlugin);

  await fastify.register(systemRoutes);
  await fastify.register(characterRoutes);
  await fastify.register(worldRoutes);
  await fastify.register(campaignRoutes);
  await fastify.register(invitationRoutes);
  await fastify.register(noteRoutes);
  await fastify.register(chatRoutes);

  return fastify;
}

async function start() {
  let fastify;
  try {
    fastify = await buildServer();
    await fastify.listen({ port: env.PORT, host: env.HOST });
    fastify.log.info(
      `ThroneRP API escuchando en http://${env.HOST}:${env.PORT}`,
    );
  } catch (err) {
    console.error("Error al iniciar el servidor:", err);
    process.exit(1);
  }

  const shutdown = async (signal) => {
    fastify.log.info(`Recibido ${signal}, apagando...`);
    try {
      await fastify.close();
      await disconnectDatabase();
      process.exit(0);
    } catch (err) {
      fastify.log.error({ err }, "Error durante shutdown");
      process.exit(1);
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

start();
