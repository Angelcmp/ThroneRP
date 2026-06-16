"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  playerName?: string;
  turn?: number;
}

const demoMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Despiertas en una celda humeda. El sonido de agua goteando rompe el silencio. A traves de una rendija en la puerta de hierro, ves una antorcha parpadeante en el corredor.",
    turn: 1,
  },
  {
    id: "2",
    role: "user",
    content: "Inspecciono la celda buscando algo util.",
    playerName: "Thalion",
    turn: 2,
  },
  {
    id: "3",
    role: "assistant",
    content:
      "Encuentras un trozo de hierro oxidado en el rincón y un cubo de madera medio podrido. Las cadenas que sujetan la puerta parecen viejas pero resistentes.",
    turn: 2,
  },
];

const demoCharacter = {
  name: "Thalion",
  race: "Elfo",
  class: "Mago",
  level: 5,
  hp: { current: 18, max: 22 },
  mana: { current: 12, max: 20 },
  stats: { STR: 8, DEX: 14, CON: 12, INT: 18, WIS: 16, CHA: 10 },
  inventory: [
    { name: "Baston de roble", equipped: true },
    { name: "Pocion curativa", quantity: 2 },
    { name: "Libro de hechizos", equipped: true },
    { name: "Raciones", quantity: 5 },
  ],
};

const demoState = {
  currentLocation: "Calabozo de Puertonegro",
  timeOfDay: "Noche",
  inGameDate: "3rd de Lunasangre, 847 d.C.",
  activeQuest: "Escapar del calabozo",
  mood: "Tensa",
};

export default function PlayPage() {
  const params = useParams();
  const campaignId = params.id as string;

  const [messages, setMessages] = useState<Message[]>(demoMessages);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamText, setStreamText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streamText]);

  function handleCommand(cmd: string) {
    setInput(cmd);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || streaming) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      playerName: demoCharacter.name,
      turn: (messages[messages.length - 1]?.turn ?? 0) + 1,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setStreaming(true);
    setStreamText("");

    // Demo: simular streaming
    const response =
      "El hierro chirria contra la piedra mientras intentas forzar la cerradura. De repente, oyes pasos en el corredor. Una figura encapuchada se detiene frente a tu celda. 'Silencio', susurra, 'No soy de la guardia. Te ofrezco un trato.'";
    let i = 0;
    const interval = setInterval(() => {
      i += 3;
      setStreamText(response.slice(0, i));
      if (i >= response.length) {
        clearInterval(interval);
        setStreaming(false);
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: response,
            turn: userMsg.turn,
          },
        ]);
        setStreamText("");
      }
    }, 30);
  }

  return (
    <div className="flex h-[calc(100vh-88px)] gap-4">
      {/* Sidebar izquierda — Ficha */}
      <aside className="hidden w-72 flex-col gap-4 xl:flex overflow-y-auto pr-1">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold/10 text-gold text-xl font-bold">
              {demoCharacter.name[0]}
            </div>
            <div>
              <h2 className="font-semibold text-text-primary">
                {demoCharacter.name}
              </h2>
              <p className="text-xs text-text-secondary">
                {demoCharacter.race} {demoCharacter.class} · Nv.
                {demoCharacter.level}
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3">
            <div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>HP</span>
                <span>
                  {demoCharacter.hp.current}/{demoCharacter.hp.max}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-hp-red transition-all"
                  style={{
                    width: `${(demoCharacter.hp.current / demoCharacter.hp.max) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-xs text-text-secondary">
                <span>Mana</span>
                <span>
                  {demoCharacter.mana.current}/{demoCharacter.mana.max}
                </span>
              </div>
              <div className="mt-1 h-2 w-full rounded-full bg-bg-elevated">
                <div
                  className="h-2 rounded-full bg-mana-blue transition-all"
                  style={{
                    width: `${(demoCharacter.mana.current / demoCharacter.mana.max) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Stats
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(demoCharacter.stats).map(([key, val]) => (
              <div
                key={key}
                className="rounded-lg bg-bg-elevated px-2 py-2 text-center"
              >
                <div className="text-xs text-text-muted">{key}</div>
                <div className="text-sm font-semibold text-text-primary">
                  {val}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Inventario
          </h3>
          <ul className="space-y-2">
            {demoCharacter.inventory.map((item, i) => (
              <li key={i} className="flex items-center justify-between text-sm">
                <span className="text-text-primary">
                  {item.equipped ? "⚔️ " : "📦 "}
                  {item.name}
                </span>
                {item.quantity && (
                  <span className="text-xs text-text-muted">
                    x{item.quantity}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </Card>
      </aside>

      {/* Panel central — Chat */}
      <div className="flex flex-1 flex-col min-w-0">
        <Card className="flex flex-1 flex-col overflow-hidden">
          {/* Header del juego */}
          <div className="flex items-center justify-between border-b border-border px-5 py-3">
            <div>
              <h2 className="font-[family-name:var(--font-cinzel)] font-semibold text-text-primary">
                La sombra del dragon
              </h2>
              <p className="text-xs text-text-secondary">
                Ronda 3 · Turno {messages[messages.length - 1]?.turn ?? 0}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary">
                🎲 Tirar dado
              </Button>
              <Button size="sm" variant="secondary">
                📋 Log
              </Button>
            </div>
          </div>

          {/* Mensajes */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
          >
            {messages.map((msg) => (
              <div key={msg.id} className="animate-fade-in">
                {msg.role === "assistant" ? (
                  <div className="rounded-xl border border-gold/10 bg-bg-elevated/50 px-5 py-4">
                    <div className="mb-1 text-xs font-medium text-gold">
                      🛡️ Narrador · Turno {msg.turn}
                    </div>
                    <p className="font-[family-name:var(--font-lora)] text-[15px] leading-relaxed text-text-primary">
                      {msg.content}
                    </p>
                  </div>
                ) : msg.role === "user" ? (
                  <div className="flex flex-col items-end">
                    <div className="mb-1 text-xs font-medium text-text-secondary">
                      {msg.playerName} · Turno {msg.turn}
                    </div>
                    <div className="max-w-[85%] rounded-xl bg-bg-elevated px-5 py-3">
                      <p className="text-sm text-text-primary">{msg.content}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-xs text-text-muted">
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {streaming && streamText && (
              <div className="rounded-xl border border-gold/10 bg-bg-elevated/50 px-5 py-4 animate-fade-in">
                <div className="mb-1 text-xs font-medium text-gold">
                  🛡️ Narrador · Escribiendo...
                </div>
                <p className="font-[family-name:var(--font-lora)] text-[15px] leading-relaxed text-text-primary">
                  {streamText}
                  <span className="inline-block h-4 w-0.5 bg-gold animate-pulse ml-0.5 align-middle" />
                </p>
              </div>
            )}

            {streaming && !streamText && (
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <Spinner className="h-3.5 w-3.5" />
                El narrador prepara la escena...
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border px-5 py-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Que haces?"
                  disabled={streaming}
                  className="flex-1 rounded-lg border border-border bg-bg-panel px-4 py-3 text-sm text-text-primary placeholder:text-text-muted focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/20 transition-colors disabled:opacity-60"
                />
                <Button type="submit" disabled={streaming || !input.trim()}>
                  Enviar
                </Button>
              </div>

              {/* Comandos rapidos */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "/roll d20", icon: "🎲" },
                  { label: "/look", icon: "👁️" },
                  { label: "/inventory", icon: "📦" },
                  { label: "/stats", icon: "📊" },
                  { label: "/check DEX", icon: "🎯" },
                ].map((cmd) => (
                  <button
                    key={cmd.label}
                    type="button"
                    onClick={() => handleCommand(cmd.label)}
                    className="rounded-md bg-bg-elevated px-2.5 py-1 text-xs text-text-secondary hover:text-text-primary hover:border-gold/30 border border-transparent transition-colors"
                  >
                    {cmd.icon} {cmd.label}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </Card>
      </div>

      {/* Sidebar derecha — Estado */}
      <aside className="hidden w-64 flex-col gap-4 lg:flex overflow-y-auto pl-1">
        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Estado del juego
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-text-muted">Lugar</span>
              <p className="text-text-primary font-medium">
                {demoState.currentLocation}
              </p>
            </div>
            <div>
              <span className="text-text-muted">Hora</span>
              <p className="text-text-primary">{demoState.timeOfDay}</p>
            </div>
            <div>
              <span className="text-text-muted">Fecha</span>
              <p className="text-text-primary">{demoState.inGameDate}</p>
            </div>
            <div>
              <span className="text-text-muted">Mision</span>
              <p className="text-text-primary">{demoState.activeQuest}</p>
            </div>
            <div>
              <span className="text-text-muted">Ambiente</span>
              <Badge variant="warning">{demoState.mood}</Badge>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Party
          </h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-text-primary">Thalion (GM)</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-success" />
              <span className="text-text-primary">Korg</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 rounded-full bg-text-muted" />
              <span className="text-text-muted">Lyra (ausente)</span>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            Ronda
          </h3>
          <div className="text-center py-2">
            <div className="text-2xl font-bold text-gold">3</div>
            <div className="text-xs text-text-secondary mt-1">
              Esperando acciones...
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="text-xs text-text-muted">Thalion ✓</div>
              <div className="text-xs text-text-muted">Korg (pendiente)</div>
            </div>
          </div>
        </Card>
      </aside>
    </div>
  );
}
