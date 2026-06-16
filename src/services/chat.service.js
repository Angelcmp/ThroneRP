import { Message } from "../models/Message.js";
import { isInCampaign } from "../utils/campaign-auth.js";

const rooms = new Map();

function getRoom(campaignId) {
  if (!rooms.has(campaignId)) {
    rooms.set(campaignId, new Map());
  }
  return rooms.get(campaignId);
}

export function addConnection(campaignId, userId, socket) {
  const room = getRoom(campaignId);
  room.set(userId, socket);
}

export function removeConnection(campaignId, userId) {
  const room = rooms.get(campaignId);
  if (room) {
    room.delete(userId);
    if (room.size === 0) rooms.delete(campaignId);
  }
}

export function broadcastToRoom(campaignId, message) {
  const room = rooms.get(campaignId);
  if (!room) return;
  const payload = JSON.stringify(message);
  for (const [, socket] of room) {
    try {
      socket.send(payload);
    } catch {
      // socket ya cerrado, se limpiara en onClose
    }
  }
}

export async function storeChatMessage(campaignId, userId, content) {
  const msg = await Message.create({
    campaignId,
    userId,
    playerUserId: userId,
    turn: 0,
    role: "chat",
    content,
  });

  return {
    _id: msg._id,
    userId,
    content: msg.content,
    createdAt: msg.createdAt,
  };
}

export async function handleChatMessage(campaignId, userId, content) {
  if (!content?.trim()) return;

  const msg = await storeChatMessage(campaignId, userId, content);

  broadcastToRoom(campaignId, {
    type: "chat",
    userId,
    content: msg.content,
    createdAt: msg.createdAt,
  });
}

export function handleChatConnection(socket, request, campaignId, userId) {
  addConnection(campaignId, userId, socket);

  broadcastToRoom(campaignId, {
    type: "system",
    content: `Un jugador se ha conectado al chat.`,
    userId: "system",
  });

  socket.on("message", (raw) => {
    try {
      const data = JSON.parse(raw.toString());
      if (data.type === "chat" && data.content) {
        handleChatMessage(campaignId, userId, data.content);
      }
    } catch {
      // ignorar mensajes malformados
    }
  });

  socket.on("close", () => {
    removeConnection(campaignId, userId);
    broadcastToRoom(campaignId, {
      type: "system",
      content: `Un jugador ha abandonado el chat.`,
      userId: "system",
    });
  });

  socket.on("error", () => {
    removeConnection(campaignId, userId);
  });
}

export async function getChatHistory(campaignId, userId, limit = 100) {
  return Message.find({
    campaignId,
    role: "chat",
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean()
    .then((msgs) =>
      msgs.reverse().map((m) => ({
        _id: m._id,
        userId: m.playerUserId ?? m.userId,
        content: m.content,
        createdAt: m.createdAt,
      })),
    );
}

export { isInCampaign };
