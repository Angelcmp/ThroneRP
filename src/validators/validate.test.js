import { describe, it, expect } from "vitest";
import { z } from "zod";
import { validateBody } from "./validate.js";

const testSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
});

describe("validateBody", () => {
  it("valida y pasa datos limpios", async () => {
    const handler = validateBody(testSchema);
    const request = { body: { name: "Test", age: 25, extra: "ignorado" } };
    await handler(request);
    expect(request.body).toEqual({ name: "Test", age: 25 });
  });

  it("lanza ValidationError con datos invalidos", async () => {
    const handler = validateBody(testSchema);
    const request = { body: { age: "no es numero" } };
    await expect(handler(request)).rejects.toThrow("Datos invalidos");
  });

  it("setea defaults de Zod", async () => {
    const schema = z.object({
      active: z.boolean().default(true),
    });
    const handler = validateBody(schema);
    const request = { body: {} };
    await handler(request);
    expect(request.body.active).toBe(true);
  });
});
