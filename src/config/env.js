import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  HOST: z.string().default("0.0.0.0"),
  LOG_LEVEL: z
    .enum(["fatal", "error", "warn", "info", "debug", "trace"])
    .default("info"),

  FRONTEND_URL: z.string().url().default("http://localhost:5173"),

  MONGODB_URI: z.string().min(1, "MONGODB_URI es obligatorio"),
  MONGODB_DB_NAME: z.string().default("thronerp"),

  BETTER_AUTH_SECRET: z
    .string()
    .min(16, "BETTER_AUTH_SECRET debe tener al menos 16 chars"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3000"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  DISCORD_CLIENT_ID: z.string().optional(),
  DISCORD_CLIENT_SECRET: z.string().optional(),

  DEFAULT_NARRATION_PROVIDER: z
    .enum(["deepseek", "qwen", "kimi", "glm", "mimo", "llama"])
    .default("deepseek"),
  DEFAULT_NARRATION_MODEL: z.string().default("deepseek-chat"),

  DEFAULT_EMBEDDING_PROVIDER: z
    .enum(["deepseek", "qwen", "kimi", "glm", "mimo", "llama"])
    .default("qwen"),
  DEFAULT_EMBEDDING_MODEL: z.string().default("text-embedding-v3"),
  EMBEDDING_DIMENSIONS: z.coerce.number().int().positive().default(1024),

  DEEPSEEK_API_KEY: z.string().optional(),
  DEEPSEEK_BASE_URL: z.string().url().default("https://api.deepseek.com/v1"),

  QWEN_API_KEY: z.string().optional(),
  QWEN_BASE_URL: z
    .string()
    .url()
    .default("https://dashscope-intl.aliyuncs.com/compatible-mode/v1"),

  KIMI_API_KEY: z.string().optional(),
  KIMI_BASE_URL: z.string().url().default("https://api.moonshot.ai/v1"),

  GLM_API_KEY: z.string().optional(),
  GLM_BASE_URL: z
    .string()
    .url()
    .default("https://open.bigmodel.cn/api/paas/v4"),

  MIMO_API_KEY: z.string().optional(),
  MIMO_BASE_URL: z.string().url().default("https://openrouter.ai/api/v1"),

  LLAMA_API_KEY: z.string().optional(),
  LLAMA_BASE_URL: z.string().url().default("https://api.groq.com/openai/v1"),

  MEMORY_RECENT_WINDOW: z.coerce.number().int().positive().default(20),
  MEMORY_RAG_TOP_K: z.coerce.number().int().positive().default(5),
  MEMORY_SUMMARIZE_THRESHOLD: z.coerce.number().int().positive().default(4000),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Variables de entorno invalidas:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const isDev = env.NODE_ENV === "development";
