import { roll, rollCheck } from "./dice.service.js";

const COMMANDS = {
  "/roll": {
    description: "Tira dados. Ej: /roll d20, /roll 3d6+2, /roll 4d6kh3",
    handler: (input, _context) => {
      const formula = input.slice("/roll".length).trim();
      if (!formula) return { error: "Falta la formula. Ej: /roll d20" };
      try {
        const result = roll(formula);
        return { type: "dice_roll", ...result };
      } catch (err) {
        return { error: err.message };
      }
    },
  },
  "/check": {
    description:
      "Tirada de habilidad. Ej: /check STR 15 (tira d20 + mod STR vs dificultad 15)",
    handler: (input, context) => {
      const parts = input.slice("/check".length).trim().split(/\s+/);
      if (parts.length < 1) return { error: "Uso: /check STAT [dificultad]" };
      const stat = parts[0].toUpperCase();
      const validStats = ["STR", "DEX", "CON", "INT", "WIS", "CHA"];
      if (!validStats.includes(stat)) {
        return {
          error: `Stat invalido. Usa: ${validStats.join(", ")}`,
        };
      }
      const statValue = context.character?.stats?.[stat] ?? 10;
      const difficulty = parts[1] ? Number(parts[1]) : 10;
      const result = rollCheck(statValue, difficulty);
      return { type: "ability_check", stat, ...result };
    },
  },
  "/look": {
    description: "Observa tu entorno actual.",
    handler: (_input, context) => {
      if (!context.campaign?.state?.currentLocation) {
        return { error: "No hay ubicacion definida en la campania." };
      }
      return {
        type: "look",
        location: context.campaign.state.currentLocation,
        action: "look",
      };
    },
  },
  "/inventory": {
    description: "Muestra tu inventario.",
    handler: (_input, context) => {
      const inventory = context.character?.inventory ?? [];
      if (inventory.length === 0)
        return { items: [], message: "No tienes items." };
      return {
        type: "inventory",
        items: inventory.map((item) => ({
          name: item.name,
          quantity: item.quantity ?? 1,
          equipped: item.equipped ?? false,
          description: item.description ?? "",
        })),
      };
    },
  },
  "/stats": {
    description: "Muestra tus estadisticas. Ej: /stats o /stats STR",
    handler: (input, context) => {
      const statFilter = input.slice("/stats".length).trim().toUpperCase();
      const character = context.character;
      if (!character) return { error: "Personaje no encontrado." };

      const allStats = {
        name: character.name,
        race: character.race,
        class: character.class,
        level: character.level,
        hp: character.hp,
        mana: character.mana ?? { current: 0, max: 0 },
        stats: character.stats,
        skills: character.skills ?? [],
        conditions: character.conditions ?? [],
      };

      if (statFilter && character.stats?.[statFilter] !== undefined) {
        return {
          type: "stats",
          stat: statFilter,
          value: character.stats[statFilter],
          modifier: Math.floor((character.stats[statFilter] - 10) / 2),
        };
      }

      return { type: "stats", ...allStats };
    },
  },
  "/character": {
    description: "Muestra tu ficha completa.",
    handler: (_input, context) => {
      const character = context.character;
      if (!character) return { error: "Personaje no encontrado." };
      return {
        type: "character_sheet",
        character: {
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
          background: character.background,
          appearance: character.appearance,
          personality: character.personality,
          stats: character.stats,
          hp: character.hp,
          mana: character.mana ?? { current: 0, max: 0 },
          skills: character.skills,
          inventory: character.inventory,
          backstory: character.backstory,
          goals: character.goals,
        },
      };
    },
  },
};

/**
 * Interpreta la entrada del jugador y ejecuta comandos internos.
 * Devuelve null si no es un comando (se envia al narrador).
 */
export function parseCommand(input, context = {}) {
  const trimmed = input.trim();
  if (!trimmed.startsWith("/")) return null;

  const commandName = trimmed.split(/\s+/)[0].toLowerCase();
  const handler = COMMANDS[commandName];

  if (!handler) {
    return {
      error: `Comando desconocido: ${commandName}`,
      available: Object.keys(COMMANDS).join(", "),
      hint: "Prueba: /roll d20, /look, /inventory, /stats, /character",
    };
  }

  return handler.handler(trimmed, context);
}

export function getAvailableCommands() {
  return Object.entries(COMMANDS).map(([cmd, info]) => ({
    command: cmd,
    description: info.description,
  }));
}
