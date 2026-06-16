import { describe, it, expect, beforeAll, afterAll } from "vitest";
import Fastify from "fastify";
import systemRoutes from "./system.routes.js";

describe("GET /health", () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(systemRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responde 200 con checks de infraestructura", async () => {
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.service).toBe("ThroneRP Backend");
    expect(body.time).toBeDefined();
    expect(body.checks).toBeDefined();
    expect(body.checks.database).toBeDefined();
    expect(body.checks.aiProviders).toBeDefined();
    expect(Array.isArray(body.checks.aiProviders.list)).toBe(true);
  });
});

describe("GET /api/ai/providers", () => {
  let app;

  beforeAll(async () => {
    app = Fastify({ logger: false });
    await app.register(systemRoutes);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responde 200 con array de providers", async () => {
    const res = await app.inject({ method: "GET", url: "/api/ai/providers" });
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(Array.isArray(body.providers)).toBe(true);
  });
});
