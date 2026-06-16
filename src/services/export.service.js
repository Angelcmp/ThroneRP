import { Message } from "../models/Message.js";
import { Memory } from "../models/Memory.js";
import { Character } from "../models/Character.js";
import { World } from "../models/World.js";
import { loadCampaignAsPlayer } from "../utils/campaign-auth.js";

async function loadCampaign(campaignId, userId) {
  return loadCampaignAsPlayer(campaignId, userId);
}

export async function exportJSON(campaignId, userId) {
  const campaign = await loadCampaign(campaignId, userId);
  const [world, character, messages, memories] = await Promise.all([
    World.findById(campaign.worldId).lean(),
    Character.findById(campaign.characterId).lean(),
    Message.find({ campaignId }).sort({ turn: 1 }).lean(),
    Memory.find({ campaignId }).sort({ sourceTurn: 1 }).lean(),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    campaign: {
      title: campaign.title,
      totalTurns: campaign.totalTurns,
      state: campaign.state,
      chapters: campaign.chapters,
      createdAt: campaign.createdAt,
    },
    world: world
      ? {
          name: world.name,
          genre: world.genre,
          tone: world.tone,
          premise: world.premise,
        }
      : null,
    character: character
      ? {
          name: character.name,
          race: character.race,
          class: character.class,
          level: character.level,
          stats: character.stats,
        }
      : null,
    messages: messages.map((m) => ({
      turn: m.turn,
      role: m.role,
      content: m.content,
    })),
    memories: memories.map((m) => ({
      turn: m.sourceTurn,
      type: m.type,
      summary: m.summary,
      importance: m.importance,
      entities: m.entities,
    })),
    timeline: memories
      .filter((m) => m.sourceTurn)
      .sort((a, b) => (a.sourceTurn || 0) - (b.sourceTurn || 0))
      .map((m) => ({
        turn: m.sourceTurn,
        type: m.type,
        summary: m.summary,
      })),
  };
}

export async function exportMarkdown(campaignId, userId) {
  const campaign = await loadCampaign(campaignId, userId);
  const [world, character, messages, memories] = await Promise.all([
    World.findById(campaign.worldId).lean(),
    Character.findById(campaign.characterId).lean(),
    Message.find({ campaignId }).sort({ turn: 1 }).lean(),
    Memory.find({ campaignId }).sort({ sourceTurn: 1 }).lean(),
  ]);

  let md = `# ${campaign.title}\n\n`;
  md += `> Mundo: **${world?.name ?? "N/A"}** (${world?.genre ?? "?"}) | Personaje: **${character?.name ?? "N/A"}** | Turnos: ${campaign.totalTurns}\n\n`;
  md += `---\n\n`;

  if (campaign.rollingSummary) {
    md += `## Resumen\n\n${campaign.rollingSummary}\n\n---\n\n`;
  }

  if (campaign.chapters?.length) {
    md += `## Capitulos\n\n`;
    for (const ch of campaign.chapters) {
      md += `### ${ch.title || `Capitulo ${campaign.chapters.indexOf(ch) + 1}`}\n\n`;
      md += `${ch.summary}\n\n`;
    }
    md += `---\n\n`;
  }

  md += `## Cronica\n\n`;
  for (const msg of messages) {
    const prefix =
      msg.role === "user"
        ? `**${character?.name ?? "Jugador"}**`
        : "**🛡️ Narrador**";
    md += `### Turno ${msg.turn} — ${prefix}\n\n${msg.content}\n\n`;
  }

  md += `---\n\n## Memorias\n\n`;
  for (const mem of memories) {
    md += `- **[T${mem.sourceTurn}]** [${mem.type}] ${mem.summary} (★${mem.importance})\n`;
  }

  md += `\n\n---\n*Exportado desde ThroneRP el ${new Date().toISOString()}*`;
  return md;
}

export function exportHTML(_campaignId, _userId) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ThroneRP - Export</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2em; color: #2c1810; line-height: 1.7; }
    h1 { text-align: center; border-bottom: 2px solid #8b7355; padding-bottom: 0.5em; }
    h2 { color: #5c3d2e; margin-top: 2em; }
    h3 { color: #8b7355; }
    .meta { text-align: center; color: #8b7355; margin-bottom: 2em; }
    .narrator { border-left: 3px solid #8b7355; padding-left: 1em; margin: 1.5em 0; }
    .player { border-left: 3px solid #5c8a8a; padding-left: 1em; margin: 1.5em 0; }
    .turn-label { font-size: 0.85em; color: #999; margin-bottom: 0.3em; }
    .memory-list li { margin-bottom: 0.5em; }
    hr { border: none; border-top: 1px solid #d4c5a9; margin: 1.5em 0; }
    .footer { text-align: center; color: #999; font-size: 0.85em; margin-top: 3em; }
    @media print {
      body { font-size: 12pt; }
      .narrator, .player { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <p>Para generar el HTML completo, usa el endpoint <code>GET /api/campaigns/:id/export/html</code></p>
  <p class="footer">Exportado desde ThroneRP — ${new Date().toISOString()}</p>
</body>
</html>`;
}

export async function exportFullHTML(campaignId, userId) {
  const campaign = await loadCampaign(campaignId, userId);
  const [world, character, messages, memories] = await Promise.all([
    World.findById(campaign.worldId).lean(),
    Character.findById(campaign.characterId).lean(),
    Message.find({ campaignId }).sort({ turn: 1 }).lean(),
    Memory.find({ campaignId }).sort({ sourceTurn: 1 }).lean(),
  ]);

  let html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${campaign.title} — ThroneRP</title>
  <style>
    body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2em; color: #2c1810; line-height: 1.7; }
    h1 { text-align: center; border-bottom: 2px solid #8b7355; padding-bottom: 0.5em; }
    h2 { color: #5c3d2e; margin-top: 2em; }
    h3 { color: #8b7355; }
    .meta { text-align: center; color: #8b7355; margin-bottom: 2em; }
    .narrator { border-left: 3px solid #8b7355; padding-left: 1em; margin: 1.5em 0; }
    .player { border-left: 3px solid #5c8a8a; padding-left: 1em; margin: 1.5em 0; }
    .turn-label { font-size: 0.85em; color: #999; margin-bottom: 0.3em; }
    .memory-list li { margin-bottom: 0.5em; }
    hr { border: none; border-top: 1px solid #d4c5a9; margin: 1.5em 0; }
    .footer { text-align: center; color: #999; font-size: 0.85em; margin-top: 3em; }
    @media print { body { font-size: 12pt; } .narrator, .player { break-inside: avoid; } }
  </style>
</head>
<body>
  <h1>${campaign.title}</h1>
  <p class="meta">Mundo: <strong>${world?.name ?? "N/A"}</strong> (${world?.genre ?? "?"}) | Personaje: <strong>${character?.name ?? "N/A"}</strong> | Turnos: ${campaign.totalTurns}</p>
  <hr>`;

  if (campaign.rollingSummary) {
    html += `<h2>Resumen de la campania</h2><p>${campaign.rollingSummary}</p><hr>`;
  }

  if (campaign.chapters?.length) {
    html += `<h2>Capitulos</h2>`;
    for (const ch of campaign.chapters) {
      html += `<h3>${ch.title || ""}</h3><p>${ch.summary}</p>`;
    }
    html += `<hr>`;
  }

  html += `<h2>Cronica</h2>`;
  for (const msg of messages) {
    if (msg.role === "user") {
      html += `<div class="player"><div class="turn-label">Turno ${msg.turn} — ${character?.name ?? "Jugador"}</div><p>${msg.content}</p></div>`;
    } else {
      html += `<div class="narrator"><div class="turn-label">Turno ${msg.turn} — Narrador</div><p>${msg.content}</p></div>`;
    }
  }

  html += `<hr><h2>Memorias</h2><ul class="memory-list">`;
  for (const mem of memories) {
    html += `<li><strong>[T${mem.sourceTurn}]</strong> [${mem.type}] ${mem.summary} (★${mem.importance})</li>`;
  }
  html += `</ul>`;

  html += `<p class="footer">Exportado desde ThroneRP el ${new Date().toISOString()}</p></body></html>`;
  return html;
}
