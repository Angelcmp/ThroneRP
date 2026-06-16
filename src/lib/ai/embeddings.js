import { getAIClient } from "./client.js";
import { env } from "../../config/env.js";

/**
 * Genera embedding para un texto usando el proveedor configurado.
 * Devuelve { vector: number[], model: string, provider: string }.
 */
export async function embedText(
  text,
  {
    provider = env.DEFAULT_EMBEDDING_PROVIDER,
    model = env.DEFAULT_EMBEDDING_MODEL,
  } = {},
) {
  if (!text || typeof text !== "string") {
    throw new Error("embedText requiere un string no vacio");
  }

  const client = getAIClient(provider);
  const response = await client.embeddings.create({
    model,
    input: text.slice(0, 8000),
  });

  const vector = response.data[0]?.embedding;
  if (!vector) throw new Error("No se recibio embedding del proveedor");

  return { vector, model, provider };
}

/**
 * Embeddings en lote (mas eficiente).
 */
export async function embedBatch(
  texts,
  {
    provider = env.DEFAULT_EMBEDDING_PROVIDER,
    model = env.DEFAULT_EMBEDDING_MODEL,
  } = {},
) {
  if (!Array.isArray(texts) || texts.length === 0) {
    throw new Error("embedBatch requiere un array no vacio");
  }
  const client = getAIClient(provider);
  const response = await client.embeddings.create({
    model,
    input: texts.map((t) => String(t).slice(0, 8000)),
  });
  return response.data.map((d, i) => ({
    index: i,
    vector: d.embedding,
    model,
    provider,
  }));
}
