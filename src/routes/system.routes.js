import mongoose from "mongoose";
import { getAvailableProviders } from "../config/ai-providers.js";
import { getTemplateList } from "../config/templates.js";
import { getAvailableCommands } from "../services/commands.service.js";

export default async function systemRoutes(fastify) {
  fastify.get("/health", async () => {
    const dbReady = mongoose.connection.readyState;
    const dbStatus =
      dbReady === 1
        ? "connected"
        : dbReady === 2
          ? "connecting"
          : "disconnected";

    const providers = getAvailableProviders();
    const hasAIProvider = providers.length > 0;

    const healthy = dbReady === 1 && hasAIProvider;

    return {
      status: healthy ? "ok" : "degraded",
      service: "ThroneRP Backend",
      version: "0.1.0",
      time: new Date().toISOString(),
      checks: {
        database: dbStatus,
        aiProviders: {
          available: providers.length,
          list: providers.map((p) => p.key),
        },
      },
    };
  });

  fastify.get("/api/ai/providers", async () => ({
    providers: getAvailableProviders(),
  }));

  fastify.get("/api/templates", async () => ({
    templates: getTemplateList(),
  }));

  fastify.get("/api/commands", async () => ({
    commands: getAvailableCommands(),
  }));
}
