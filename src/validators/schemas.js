import { z } from "zod";

// ----- Personajes -----

const statsSchema = z.object({
  STR: z.number().int().min(1).max(30).optional(),
  DEX: z.number().int().min(1).max(30).optional(),
  CON: z.number().int().min(1).max(30).optional(),
  INT: z.number().int().min(1).max(30).optional(),
  WIS: z.number().int().min(1).max(30).optional(),
  CHA: z.number().int().min(1).max(30).optional(),
});

const inventoryItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
  description: z.string().optional(),
  equipped: z.boolean().default(false),
});

const personalitySchema = z.object({
  traits: z.array(z.string()).optional(),
  ideals: z.string().optional(),
  bonds: z.string().optional(),
  flaws: z.string().optional(),
});

const hpSchema = z.object({
  current: z.number().int().min(0).default(10),
  max: z.number().int().min(0).default(10),
});

export const createCharacterSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(80),
  race: z.string().optional(),
  class: z.string().optional(),
  level: z.number().int().min(1).max(30).optional(),
  background: z.string().optional(),
  appearance: z.string().optional(),
  personality: personalitySchema.optional(),
  stats: statsSchema.optional(),
  hp: hpSchema.optional(),
  skills: z.array(z.string()).optional(),
  inventory: z.array(inventoryItemSchema).optional(),
  backstory: z.string().optional(),
  goals: z.array(z.string()).optional(),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const updateCharacterSchema = createCharacterSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo para actualizar",
  });

export const generateCharacterSchema = z.object({
  prompt: z.string().min(1, "Necesitas un prompt o descripcion"),
  worldId: z.string().optional(),
});

// ----- Mundos -----

const factionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  alignment: z.string().optional(),
});

const locationSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  type: z.string().optional(),
});

export const createWorldSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(120),
  genre: z.string().optional(),
  tone: z.string().optional(),
  premise: z.string().max(2000).optional(),
  history: z.string().max(4000).optional(),
  factions: z.array(factionSchema).optional(),
  locations: z.array(locationSchema).optional(),
  magicSystem: z.string().optional(),
  technologyLevel: z.string().optional(),
  majorConflict: z.string().optional(),
  tags: z.array(z.string()).optional(),
  visibility: z.enum(["private", "unlisted", "public"]).optional(),
  coverUrl: z.string().url().optional().or(z.literal("")),
});

export const updateWorldSchema = createWorldSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo para actualizar",
  });

export const generateWorldSchema = z.object({
  prompt: z
    .string()
    .min(1, "Necesitas un prompt o descripcion")
    .or(z.literal("")),
  template: z.string().optional(),
});

// ----- Campanias -----

export const createCampaignSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio").max(150),
  worldId: z.string().min(1, "worldId es obligatorio"),
  characterId: z.string().min(1, "characterId es obligatorio"),
  aiProvider: z.string().optional(),
  aiModel: z.string().optional(),
  openingScene: z.string().optional(),
  generateOpening: z.boolean().optional(),
});

export const updateCampaignSchema = z
  .object({
    title: z.string().min(1).max(150).optional(),
    aiProvider: z.string().optional(),
    aiModel: z.string().optional(),
    state: z
      .object({
        currentLocation: z.string().optional(),
        timeOfDay: z.string().optional(),
        inGameDate: z.string().optional(),
        activeQuest: z.string().optional(),
        mood: z.string().optional(),
        status: z.enum(["active", "paused", "finished"]).optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo para actualizar",
  });

export const narrateTurnSchema = z.object({
  input: z.string().trim().min(1, "Falta `input` con la accion del jugador"),
});

export const generateFactionSchema = z.object({
  prompt: z.string().min(1, "Necesitas un prompt o descripcion"),
});

export const generateLocationSchema = z.object({
  prompt: z.string().min(1, "Necesitas un prompt o descripcion"),
});

// ----- Invitaciones -----

export const createInviteSchema = z.object({
  inviteeUserId: z.string().min(1, "inviteeUserId es obligatorio"),
});

export const inviteResponseSchema = z.object({
  characterId: z.string().min(1, "characterId es obligatorio para aceptar"),
});

// ----- Jugadores en campania -----

export const updatePlayerRoleSchema = z.object({
  role: z.enum(["gm", "player", "spectator"]),
});

// ----- Notas -----

export const createNoteSchema = z.object({
  title: z.string().min(1, "El titulo es obligatorio").max(200),
  content: z.string().optional(),
  visibility: z.enum(["gm", "all"]).optional(),
});

export const updateNoteSchema = z
  .object({
    title: z.string().min(1).max(200).optional(),
    content: z.string().optional(),
    visibility: z.enum(["gm", "all"]).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "Al menos un campo para actualizar",
  });

// ----- Chat -----

export const chatMessageSchema = z.object({
  content: z.string().trim().min(1, "El mensaje no puede estar vacio"),
});

// ----- Rondas -----

export const submitActionSchema = z.object({
  action: z.string().trim().min(1, "La accion no puede estar vacia"),
});

export const gmActionSchema = z.object({
  action: z.string().trim().min(1, "La accion del GM no puede estar vacia"),
});

export const resolveRoundSchema = z.object({
  gmAction: z.string().trim().min(1).optional(),
});
