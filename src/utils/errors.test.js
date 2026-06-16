import { describe, it, expect } from "vitest";
import {
  AppError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  AIProviderError,
} from "./errors.js";

describe("AppError", () => {
  it("creates a base error with defaults", () => {
    const err = new AppError("algo fallo");
    expect(err.message).toBe("algo fallo");
    expect(err.statusCode).toBe(500);
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.isAppError).toBe(true);
  });

  it("accepts custom statusCode and code", () => {
    const err = new AppError("custom", 418, "TEAPOT");
    expect(err.statusCode).toBe(418);
    expect(err.code).toBe("TEAPOT");
  });
});

describe("NotFoundError", () => {
  it("defaults message from resource name", () => {
    const err = new NotFoundError("Personaje");
    expect(err.message).toBe("Personaje no encontrado");
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe("NOT_FOUND");
  });
});

describe("UnauthorizedError", () => {
  it("has default message", () => {
    const err = new UnauthorizedError();
    expect(err.statusCode).toBe(401);
    expect(err.code).toBe("UNAUTHORIZED");
  });
});

describe("ForbiddenError", () => {
  it("has default message", () => {
    const err = new ForbiddenError();
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe("FORBIDDEN");
  });
});

describe("ValidationError", () => {
  it("stores details", () => {
    const details = { name: ["requerido"] };
    const err = new ValidationError("campo invalido", details);
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.details).toEqual(details);
  });
});

describe("AIProviderError", () => {
  it("includes provider name", () => {
    const err = new AIProviderError("timeout", "deepseek");
    expect(err.statusCode).toBe(502);
    expect(err.code).toBe("AI_PROVIDER_ERROR");
    expect(err.provider).toBe("deepseek");
    expect(err.message).toContain("deepseek");
  });
});
