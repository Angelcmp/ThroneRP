import { Memory } from "../models/Memory.js";
import { Message } from "../models/Message.js";
import { embedText } from "../lib/ai/embeddings.js";
import { chatCompletion } from "../lib/ai/client.js";
import {
  SYSTEM_MEMORY_EXTRACTOR,
  SYSTEM_SUMMARIZER,
  SYSTEM_CHAPTER_TITLE,
} from "../lib/ai/prompts.js";
import { env } from "../config/env.js";

export async function getRecentMessages(
  campaignId,
  limit = env.MEMORY_RECENT_WINDOW,
) {
  const docs = await Message.find({ campaignId, summarized: false })
    .sort({ turn: -1 })
    .limit(limit)
    .lean();
  return docs.reverse();
}

export async function searchRelevantMemories(
  campaignId,
  queryText,
  k = env.MEMORY_RAG_TOP_K,
) {
  if (!queryText?.trim()) return [];

  let queryVector;
  try {
    const { vector } = await embedText(queryText);
    queryVector = vector;
  } catch (err) {
    console.warn("Fallback sin embeddings:", err.message);
    return Memory.find({ campaignId })
      .sort({ importance: -1, createdAt: -1 })
      .limit(k)
      .lean();
  }

  try {
    const results = await Memory.aggregate([
      {
        $vectorSearch: {
          index: "memory_vector_index",
          path: "embedding",
          queryVector,
          numCandidates: Math.max(50, k * 10),
          limit: k * 2,
          filter: { campaignId: { $eq: campaignId } },
        },
      },
      {
        $project: {
          summary: 1,
          type: 1,
          importance: 1,
          entities: 1,
          sourceTurn: 1,
          contradicts: 1,
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    return rerankMemories(results, k);
  } catch (err) {
    console.warn(
      "Vector search fallo, usando fallback por importancia:",
      err.message,
    );
    return Memory.find({ campaignId })
      .sort({ importance: -1, createdAt: -1 })
      .limit(k)
      .lean();
  }
}

function rerankMemories(memories, k) {
  if (!memories.length) return [];

  const now = Date.now();
  const scored = memories.map((m) => {
    const vectorScore = m.score ?? 0.5;
    const importanceScore = (m.importance ?? 5) / 10;
    const ageHours =
      (now - new Date(m.createdAt || now).getTime()) / (1000 * 60 * 60);
    const recencyScore = Math.max(0, 1 - ageHours / 72);

    const combined =
      vectorScore * 0.45 + importanceScore * 0.35 + recencyScore * 0.2;

    return { ...m, score: Math.round(combined * 100) / 100 };
  });

  return scored.sort((a, b) => b.score - a.score).slice(0, k);
}

export async function extractAndStoreMemories({
  campaignId,
  userId,
  userText,
  assistantText,
  turn,
}) {
  const exchange = `JUGADOR: ${userText}\n\nNARRADOR: ${assistantText}`;

  const existingMemories = await Memory.find({ campaignId })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("summary type entities sourceTurn")
    .lean();

  const contextBlock =
    existingMemories.length > 0
      ? `\n\nMEMORIAS RECIENTES DE LA CAMPANIA (usa para detectar contradicciones):\n${existingMemories.map((m, i) => `${i + 1}. [T${m.sourceTurn}] ${m.summary}`).join("\n")}`
      : "";

  let parsed;
  try {
    const { content } = await chatCompletion({
      messages: [
        { role: "system", content: SYSTEM_MEMORY_EXTRACTOR },
        {
          role: "user",
          content: exchange + contextBlock,
        },
      ],
      temperature: 0.2,
      maxTokens: 800,
      responseFormat: { type: "json_object" },
    });
    parsed = JSON.parse(content);
  } catch (err) {
    console.warn("Extraccion de memorias fallo:", err.message);
    return [];
  }

  const memories = parsed?.memories ?? [];
  if (!Array.isArray(memories) || memories.length === 0) return [];

  const contradictingList = parsed?.contradictions_detected ?? [];

  const docs = await Promise.all(
    memories
      .filter((m) => m?.summary && m?.type)
      .map(async (m) => {
        let embedding = null;
        let embeddingModel = null;
        let embeddingProvider = null;
        try {
          const result = await embedText(m.summary);
          embedding = result.vector;
          embeddingModel = result.model;
          embeddingProvider = result.provider;
        } catch (err) {
          console.warn("Embed memoria fallo:", err.message);
        }
        return {
          campaignId,
          userId,
          type: m.type,
          summary: m.summary,
          importance: m.importance ?? 5,
          entities: m.entities ?? [],
          sourceTurn: turn,
          contradicts: m.contradicts_previous ? true : undefined,
          embedding,
          embeddingModel,
          embeddingProvider,
        };
      }),
  );

  if (docs.length === 0) return [];
  const inserted = await Memory.insertMany(docs);

  if (contradictingList.length > 0) {
    await Promise.all(
      contradictingList.map(async (c) => {
        const idx = c.new_memory_index ?? 0;
        const memory = inserted[idx >= 0 && idx < inserted.length ? idx : 0];
        if (memory && c.contradicts) {
          const similar = await Memory.findOne({
            campaignId,
            _id: { $ne: memory._id },
          })
            .sort({ createdAt: -1 })
            .lean();

          memory.contradictions.push({
            memoryId: similar?._id,
            note: c.contradicts,
          });
          await memory.save();
        }
      }),
    );
  }

  return inserted;
}

export async function summarizeOldMessages({
  campaign,
  keep = env.MEMORY_RECENT_WINDOW,
}) {
  const total = await Message.countDocuments({
    campaignId: campaign._id,
    summarized: false,
  });
  if (total <= keep + 10) return null;

  const toSummarize = await Message.find({
    campaignId: campaign._id,
    summarized: false,
  })
    .sort({ turn: 1 })
    .limit(total - keep)
    .lean();

  if (toSummarize.length === 0) return null;

  const text = toSummarize.map((m) => `[${m.role}] ${m.content}`).join("\n\n");

  let summary;
  try {
    const { content } = await chatCompletion({
      messages: [
        { role: "system", content: SYSTEM_SUMMARIZER },
        { role: "user", content: text.slice(0, 12000) },
      ],
      temperature: 0.4,
      maxTokens: 500,
    });
    summary = content.trim();
  } catch (err) {
    console.warn("Resumen fallo:", err.message);
    return null;
  }

  campaign.rollingSummary = campaign.rollingSummary
    ? `${campaign.rollingSummary}\n\n${summary}`
    : summary;

  const activeChapter = campaign.chapters?.find((ch) => ch.status === "active");
  if (!activeChapter) {
    await closeChapter({ campaign, summary: campaign.rollingSummary });
  } else if (campaign.totalTurns - (activeChapter.startTurn ?? 0) > 15) {
    const chapterSummary = campaign.chapters
      .filter((ch) => ch.summary)
      .map((ch) => ch.summary)
      .slice(-2)
      .join("\n\n");
    await closeChapter({
      campaign,
      summary: chapterSummary || summary,
    });
  }

  await campaign.save();

  await Message.updateMany(
    { _id: { $in: toSummarize.map((m) => m._id) } },
    { $set: { summarized: true } },
  );

  return summary;
}

export async function closeChapter({ campaign, summary }) {
  const activeChapter = campaign.chapters?.find((ch) => ch.status === "active");
  if (activeChapter) {
    activeChapter.endTurn = campaign.totalTurns;
    activeChapter.summary = summary;
    activeChapter.status = "complete";

    try {
      const title = await generateChapterTitle(activeChapter.summary);
      activeChapter.title = title;
    } catch (err) {
      console.warn("Titulo de capitulo fallo:", err.message);
      activeChapter.title = `Capitulo ${campaign.chapters.length}`;
    }
  }

  campaign.chapters = campaign.chapters || [];
  campaign.chapters.push({
    title: "",
    summary: "",
    startTurn: campaign.totalTurns + 1,
    status: "active",
  });

  await campaign.save();
  return activeChapter;
}

async function generateChapterTitle(summary) {
  const { content } = await chatCompletion({
    messages: [
      { role: "system", content: SYSTEM_CHAPTER_TITLE },
      {
        role: "user",
        content: `Resumen: ${summary.slice(0, 800)}\n\nGenera un titulo para este capitulo.`,
      },
    ],
    temperature: 0.8,
    maxTokens: 80,
    responseFormat: { type: "json_object" },
  });

  const parsed = JSON.parse(content);
  return parsed.title || `Capitulo sin nombre`;
}

export async function getTimeline(campaignId) {
  const memories = await Memory.find({ campaignId })
    .sort({ sourceTurn: 1, createdAt: 1 })
    .lean();

  return memories.map((m) => ({
    turn: m.sourceTurn,
    type: m.type,
    summary: m.summary,
    importance: m.importance,
    entities: m.entities ?? [],
    timestamp: m.createdAt,
    hasContradictions: m.contradictions?.length > 0,
    chapter: m.chapter,
  }));
}
