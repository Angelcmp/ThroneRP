import { env } from "./env.js";

/**
 * Catalogo central de proveedores de IA.
 * Todos exponen API compatible con OpenAI (Chat Completions + Embeddings).
 * Cambiar de modelo es tan simple como cambiar `provider` y `model` en una campania.
 */
export const AI_PROVIDERS = {
  deepseek: {
    label: "DeepSeek",
    apiKey: env.DEEPSEEK_API_KEY,
    baseURL: env.DEEPSEEK_BASE_URL,
    chatModels: [
      {
        id: "deepseek-chat",
        label: "DeepSeek V3",
        contextWindow: 64_000,
        supportsTools: true,
      },
      {
        id: "deepseek-reasoner",
        label: "DeepSeek R1 (razonamiento)",
        contextWindow: 64_000,
      },
    ],
    embeddingModels: [],
    pricing: "low",
    notes: "Excelente calidad/precio para narracion larga.",
  },

  qwen: {
    label: "Qwen (Alibaba)",
    apiKey: env.QWEN_API_KEY,
    baseURL: env.QWEN_BASE_URL,
    chatModels: [
      {
        id: "qwen-max",
        label: "Qwen Max",
        contextWindow: 32_000,
        supportsTools: true,
      },
      {
        id: "qwen-plus",
        label: "Qwen Plus",
        contextWindow: 131_000,
        supportsTools: true,
      },
      { id: "qwen-turbo", label: "Qwen Turbo", contextWindow: 1_000_000 },
    ],
    embeddingModels: [
      { id: "text-embedding-v3", label: "Qwen Embedding v3", dimensions: 1024 },
    ],
    pricing: "medium",
    notes: "Buen soporte multiidioma (espanol incluido) y embeddings nativos.",
  },

  kimi: {
    label: "Kimi (Moonshot)",
    apiKey: env.KIMI_API_KEY,
    baseURL: env.KIMI_BASE_URL,
    chatModels: [
      {
        id: "kimi-k2-0905-preview",
        label: "Kimi K2 (preview)",
        contextWindow: 256_000,
        supportsTools: true,
      },
      {
        id: "moonshot-v1-128k",
        label: "Moonshot v1 128k",
        contextWindow: 128_000,
      },
      {
        id: "moonshot-v1-32k",
        label: "Moonshot v1 32k",
        contextWindow: 32_000,
      },
    ],
    embeddingModels: [],
    pricing: "medium",
    notes: "Ideal para campanias muy largas con su gran ventana de contexto.",
  },

  glm: {
    label: "GLM (Zhipu AI)",
    apiKey: env.GLM_API_KEY,
    baseURL: env.GLM_BASE_URL,
    chatModels: [
      {
        id: "glm-4.6",
        label: "GLM 4.6",
        contextWindow: 128_000,
        supportsTools: true,
      },
      { id: "glm-4-plus", label: "GLM 4 Plus", contextWindow: 128_000 },
    ],
    embeddingModels: [
      { id: "embedding-3", label: "GLM Embedding 3", dimensions: 2048 },
    ],
    pricing: "medium",
    notes: "Bueno para roleplay creativo y juego de rol estructurado.",
  },

  mimo: {
    label: "MiMo (Xiaomi)",
    apiKey: env.MIMO_API_KEY,
    baseURL: env.MIMO_BASE_URL,
    chatModels: [
      { id: "xiaomi/mimo-7b-rl", label: "MiMo 7B RL", contextWindow: 32_000 },
    ],
    embeddingModels: [],
    pricing: "low",
    notes: "Modelo pequeno, ideal para resumenes y tareas auxiliares.",
  },

  llama: {
    label: "Llama 4 (Groq)",
    apiKey: env.LLAMA_API_KEY,
    baseURL: env.LLAMA_BASE_URL,
    chatModels: [
      {
        id: "meta-llama/llama-4-maverick-17b-128e-instruct",
        label: "Llama 4 Maverick",
        contextWindow: 131_000,
        supportsTools: true,
      },
      {
        id: "meta-llama/llama-4-scout-17b-16e-instruct",
        label: "Llama 4 Scout",
        contextWindow: 131_000,
      },
    ],
    embeddingModels: [],
    pricing: "free",
    notes: "Gratis via Groq, ultra-rapido. Ideal para draft y modo demo.",
  },
};

/**
 * Devuelve la lista de proveedores disponibles (con API key configurada).
 */
export function getAvailableProviders() {
  return Object.entries(AI_PROVIDERS)
    .filter(([, cfg]) => Boolean(cfg.apiKey))
    .map(([key, cfg]) => ({
      key,
      label: cfg.label,
      chatModels: cfg.chatModels,
      embeddingModels: cfg.embeddingModels,
      pricing: cfg.pricing,
      notes: cfg.notes,
    }));
}

export function getProviderConfig(providerKey) {
  const cfg = AI_PROVIDERS[providerKey];
  if (!cfg) {
    throw new Error(`Proveedor desconocido: ${providerKey}`);
  }
  if (!cfg.apiKey) {
    throw new Error(`Proveedor ${providerKey} no tiene API key configurada`);
  }
  return cfg;
}
