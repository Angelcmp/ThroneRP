import { describe, it, expect } from "vitest";
import {
  createCharacterSchema,
  updateCharacterSchema,
  generateCharacterSchema,
  createWorldSchema,
  updateWorldSchema,
  generateWorldSchema,
  createCampaignSchema,
  updateCampaignSchema,
  narrateTurnSchema,
} from "./schemas.js";

describe("createCharacterSchema", () => {
  it("acepta personaje valido minimo", () => {
    const result = createCharacterSchema.safeParse({ name: "Aragorn" });
    expect(result.success).toBe(true);
    expect(result.data.name).toBe("Aragorn");
  });

  it("rechaza sin nombre", () => {
    const result = createCharacterSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("acepta personaje completo con stats e inventario", () => {
    const result = createCharacterSchema.safeParse({
      name: "Gandalf",
      race: "Istar",
      class: "Mago",
      level: 20,
      stats: { STR: 8, DEX: 10, CON: 12, INT: 20, WIS: 18, CHA: 16 },
      hp: { current: 50, max: 50 },
      inventory: [{ name: "Baculo", quantity: 1, equipped: true }],
    });
    expect(result.success).toBe(true);
    expect(result.data.stats.INT).toBe(20);
    expect(result.data.inventory[0].name).toBe("Baculo");
  });
});

describe("updateCharacterSchema", () => {
  it("acepta partial update", () => {
    const result = updateCharacterSchema.safeParse({ level: 5 });
    expect(result.success).toBe(true);
    expect(result.data.level).toBe(5);
  });

  it("rechaza objeto vacio", () => {
    const result = updateCharacterSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("generateCharacterSchema", () => {
  it("requiere prompt", () => {
    const result = generateCharacterSchema.safeParse({
      prompt: "un heroe elfo",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza prompt vacio", () => {
    const result = generateCharacterSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  it("permite worldId opcional", () => {
    const result = generateCharacterSchema.safeParse({
      prompt: "un heroe",
      worldId: "507f1f77bcf86cd799439011",
    });
    expect(result.success).toBe(true);
  });
});

describe("createWorldSchema", () => {
  it("requiere nombre", () => {
    const result = createWorldSchema.safeParse({ name: "Tierra Media" });
    expect(result.success).toBe(true);
  });

  it("acepta facciones y ubicaciones", () => {
    const result = createWorldSchema.safeParse({
      name: "Westeros",
      genre: "Fantasia oscura",
      factions: [{ name: "Stark", description: "Guardianes del Norte" }],
      locations: [{ name: "Invernalia", type: "Castillo" }],
    });
    expect(result.success).toBe(true);
  });
});

describe("updateWorldSchema", () => {
  it("acepta partial update", () => {
    const result = updateWorldSchema.safeParse({ genre: "Cyberpunk" });
    expect(result.success).toBe(true);
  });

  it("rechaza objeto vacio", () => {
    const result = updateWorldSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("generateWorldSchema", () => {
  it("requiere prompt", () => {
    const result = generateWorldSchema.safeParse({
      prompt: "un mundo oscuro",
    });
    expect(result.success).toBe(true);
  });

  it("permite prompt vacio con template", () => {
    const withTemplate = generateWorldSchema.safeParse({
      prompt: "",
      template: "fantasia-epica",
    });
    expect(withTemplate.success).toBe(true);

    const withoutTemplate = generateWorldSchema.safeParse({ prompt: "" });
    expect(withoutTemplate.success).toBe(true);
  });
});

describe("createCampaignSchema", () => {
  it("requiere title, worldId, characterId", () => {
    const result = createCampaignSchema.safeParse({
      title: "Mi campania",
      worldId: "507f1f77bcf86cd799439011",
      characterId: "507f1f77bcf86cd799439022",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza sin worldId", () => {
    const result = createCampaignSchema.safeParse({
      title: "test",
      characterId: "507f1f77bcf86cd799439022",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateCampaignSchema", () => {
  it("acepta partial update", () => {
    const result = updateCampaignSchema.safeParse({ title: "Nuevo titulo" });
    expect(result.success).toBe(true);
  });

  it("rechaza objeto vacio", () => {
    const result = updateCampaignSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("permite actualizar state", () => {
    const result = updateCampaignSchema.safeParse({
      state: { status: "finished" },
    });
    expect(result.success).toBe(true);
  });
});

describe("narrateTurnSchema", () => {
  it("requiere input no vacio", () => {
    const result = narrateTurnSchema.safeParse({
      input: "Quiero explorar el bosque",
    });
    expect(result.success).toBe(true);
  });

  it("rechaza input vacio", () => {
    const result = narrateTurnSchema.safeParse({ input: "   " });
    expect(result.success).toBe(false);
  });

  it("rechaza input faltante", () => {
    const result = narrateTurnSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
