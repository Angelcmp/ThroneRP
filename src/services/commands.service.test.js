import { describe, it, expect } from "vitest";
import { parseCommand, getAvailableCommands } from "./commands.service.js";

const mockContext = {
  character: {
    name: "Aragorn",
    race: "Humano",
    class: "Montaraz",
    level: 5,
    stats: { STR: 16, DEX: 14, CON: 14, INT: 12, WIS: 16, CHA: 12 },
    hp: { current: 35, max: 35 },
    mana: { current: 10, max: 10 },
    skills: ["Supervivencia", "Rastreo"],
    inventory: [
      {
        name: "Anduril",
        quantity: 1,
        equipped: true,
        description: "Espada legendaria",
      },
      { name: "Antorchas", quantity: 3, equipped: false },
    ],
    conditions: [],
  },
  campaign: {
    state: { currentLocation: "Bosque de Fangorn" },
  },
};

describe("parseCommand", () => {
  it("retorna null para texto normal (sin comando)", () => {
    expect(parseCommand("Quiero explorar el bosque")).toBeNull();
    expect(parseCommand("Hola narrador")).toBeNull();
  });

  it("/roll ejecuta tirada de dados", () => {
    const result = parseCommand("/roll d20", mockContext);
    expect(result.type).toBe("dice_roll");
    expect(result.results).toHaveLength(1);
  });

  it("/roll con formula compleja", () => {
    const result = parseCommand("/roll 3d6+2", mockContext);
    expect(result.type).toBe("dice_roll");
    expect(result.results).toHaveLength(3);
    expect(result.modifier).toBe(2);
  });

  it("/check hace ability check", () => {
    const result = parseCommand("/check STR 15", mockContext);
    expect(result.type).toBe("ability_check");
    expect(result.stat).toBe("STR");
    expect(result.modifier).toBe(3);
  });

  it("/look devuelve ubicacion actual", () => {
    const result = parseCommand("/look", mockContext);
    expect(result.type).toBe("look");
    expect(result.location).toBe("Bosque de Fangorn");
  });

  it("/inventory lista items", () => {
    const result = parseCommand("/inventory", mockContext);
    expect(result.type).toBe("inventory");
    expect(result.items).toHaveLength(2);
    expect(result.items[0].equipped).toBe(true);
  });

  it("/stats muestra estadisticas completas", () => {
    const result = parseCommand("/stats", mockContext);
    expect(result.type).toBe("stats");
    expect(result.name).toBe("Aragorn");
    expect(result.stats.STR).toBe(16);
  });

  it("/stats STR muestra una stat especifica con su mod", () => {
    const result = parseCommand("/stats STR", mockContext);
    expect(result.type).toBe("stats");
    expect(result.stat).toBe("STR");
    expect(result.value).toBe(16);
    expect(result.modifier).toBe(3);
  });

  it("/character muestra ficha completa", () => {
    const result = parseCommand("/character", mockContext);
    expect(result.type).toBe("character_sheet");
    expect(result.character.name).toBe("Aragorn");
    expect(result.character.stats.STR).toBe(16);
  });

  it("comando desconocido retorna error con ayuda", () => {
    const result = parseCommand("/asdf", mockContext);
    expect(result.error).toBeDefined();
    expect(result.available).toBeDefined();
  });
});

describe("getAvailableCommands", () => {
  it("devuelve lista de comandos", () => {
    const commands = getAvailableCommands();
    expect(commands.length).toBeGreaterThan(0);
    expect(commands.every((c) => c.command && c.description)).toBe(true);
  });
});
