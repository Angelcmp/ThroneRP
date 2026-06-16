/**
 * Estimacion de tokens y chunking inteligente para mensajes.
 * Usa heuristica de ~4 chars por token. Suficiente para seleccionar
 * cuantos mensajes caben en la ventana de contexto.
 */

const CHARS_PER_TOKEN = 4;

export function estimateTokens(text) {
  if (!text) return 0;
  return Math.ceil(String(text).length / CHARS_PER_TOKEN);
}

export function estimateMessagesTokens(messages) {
  if (!Array.isArray(messages)) return 0;
  return messages.reduce(
    (sum, m) => sum + estimateTokens(m.role) + estimateTokens(m.content) + 4,
    0,
  );
}

/**
 * Recorta mensajes antiguos para que el total no exceda maxTokens.
 * Siempre conserva el system prompt y los ultimos minKeep mensajes.
 */
export function smartChunk(messages, { maxTokens = 8192, minKeep = 4 } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) return messages;

  const systemMsg = messages.find((m) => m.role === "system");
  const others = messages.filter((m) => m.role !== "system");
  const systemTokens = systemMsg ? estimateTokens(systemMsg.content) : 0;
  const budget = maxTokens - systemTokens;

  if (budget <= 0) {
    return systemMsg ? [systemMsg] : [];
  }

  const last = others.slice(-minKeep);
  const rest = others.slice(0, -minKeep);

  const lastTokens = estimateMessagesTokens(last);
  let available = budget - lastTokens;

  const kept = [];
  for (let i = rest.length - 1; i >= 0 && available > 0; i--) {
    const msgTokens =
      estimateTokens(rest[i].role) + estimateTokens(rest[i].content) + 4;
    if (msgTokens <= available) {
      kept.unshift(rest[i]);
      available -= msgTokens;
    }
  }

  const result = [];
  if (systemMsg) result.push(systemMsg);
  result.push(...kept, ...last);
  return result;
}
