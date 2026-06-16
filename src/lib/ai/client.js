import OpenAI from "openai";
import { getProviderConfig } from "../../config/ai-providers.js";
import { env } from "../../config/env.js";

const clientCache = new Map();

/**
 * Devuelve (o crea) un cliente OpenAI-compatible apuntando al baseURL del proveedor.
 * Se cachea por proveedor para reusar conexiones.
 */
export function getAIClient(providerKey) {
  if (clientCache.has(providerKey)) {
    return clientCache.get(providerKey);
  }
  const cfg = getProviderConfig(providerKey);
  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL,
  });
  clientCache.set(providerKey, client);
  return client;
}

/**
 * Llama al endpoint chat.completions del proveedor elegido.
 *
 * @param {object} opts
 * @param {string} [opts.provider] - Clave del proveedor; default DEFAULT_NARRATION_PROVIDER.
 * @param {string} [opts.model]    - Modelo concreto.
 * @param {Array}  opts.messages   - [{ role, content }]
 * @param {number} [opts.temperature=0.85]
 * @param {number} [opts.maxTokens=1500]
 * @param {boolean}[opts.stream=false]
 * @param {object} [opts.responseFormat] - p.ej. { type: 'json_object' }
 */
export async function chatCompletion({
  provider = env.DEFAULT_NARRATION_PROVIDER,
  model,
  messages,
  temperature = 0.85,
  maxTokens = 1500,
  stream = false,
  responseFormat,
} = {}) {
  const client = getAIClient(provider);
  const finalModel = model || env.DEFAULT_NARRATION_MODEL;

  const payload = {
    model: finalModel,
    messages,
    temperature,
    max_tokens: maxTokens,
    stream,
  };
  if (responseFormat) payload.response_format = responseFormat;

  if (stream) {
    return client.chat.completions.create(payload);
  }

  const response = await client.chat.completions.create(payload);
  const choice = response.choices[0]?.message ?? {};

  return {
    content: choice.content ?? "",
    reasoningContent: choice.reasoning_content ?? choice.reasoning ?? undefined,
    finishReason: response.choices[0]?.finish_reason,
    usage: response.usage,
    raw: response,
  };
}
