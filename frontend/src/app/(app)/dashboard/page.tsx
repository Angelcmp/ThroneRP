"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Datos de demo hasta que conectemos al backend
const demoCampaigns = [
  {
    id: "1",
    title: "La sombra del dragon",
    world: "Reinos Olvidados",
    turns: 42,
    players: 3,
  },
  {
    id: "2",
    title: "Ciberpunk: Distrito 9",
    world: "Neon City",
    turns: 18,
    players: 2,
  },
];

const demoCharacters = [
  { id: "1", name: "Thalion", race: "Elfo", class: "Mago", level: 5 },
  { id: "2", name: "Korg", race: "Orco", class: "Guerrero", level: 3 },
];

const demoWorlds = [
  { id: "1", name: "Reinos Olvidados", genre: "Fantasia", tone: "Epico" },
  { id: "2", name: "Neon City", genre: "Cyberpunk", tone: "Oscuro" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      {/* Campanas */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold">
            Tus campanas
          </h2>
          <Link
            href="/campaigns/new"
            className="text-sm text-gold hover:underline"
          >
            + Nueva campana
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoCampaigns.map((c) => (
            <Link key={c.id} href={`/play/${c.id}`}>
              <Card className="hover:border-gold/40 transition-colors cursor-pointer group">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-text-primary group-hover:text-gold transition-colors">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-sm text-text-secondary">
                      {c.world}
                    </p>
                  </div>
                  <Badge variant="gold">Activa</Badge>
                </div>
                <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                  <span>🎲 {c.turns} turnos</span>
                  <span>👥 {c.players} jugadores</span>
                </div>
              </Card>
            </Link>
          ))}
          <Link href="/campaigns/new">
            <Card className="flex h-full min-h-[120px] flex-col items-center justify-center border-dashed border-2 border-border hover:border-gold/40 transition-colors cursor-pointer">
              <span className="text-2xl text-text-muted mb-2">+</span>
              <span className="text-sm text-text-secondary">Nueva campana</span>
            </Card>
          </Link>
        </div>
      </section>

      {/* Personajes */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold">
            Personajes recientes
          </h2>
          <Link
            href="/characters/new"
            className="text-sm text-gold hover:underline"
          >
            + Nuevo personaje
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {demoCharacters.map((ch) => (
            <Link key={ch.id} href={`/characters/${ch.id}`}>
              <Card className="hover:border-gold/40 transition-colors cursor-pointer group">
                <h3 className="font-semibold text-text-primary group-hover:text-gold transition-colors">
                  {ch.name}
                </h3>
                <p className="mt-1 text-sm text-text-secondary">
                  {ch.race} {ch.class}
                </p>
                <Badge variant="default" className="mt-3">
                  Nv. {ch.level}
                </Badge>
              </Card>
            </Link>
          ))}
          <Link href="/characters/new">
            <Card className="flex h-full min-h-[100px] flex-col items-center justify-center border-dashed border-2 border-border hover:border-gold/40 transition-colors cursor-pointer">
              <span className="text-2xl text-text-muted mb-2">+</span>
              <span className="text-sm text-text-secondary">
                Nuevo personaje
              </span>
            </Card>
          </Link>
        </div>
      </section>

      {/* Mundos */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold">
            Mundos recientes
          </h2>
          <Link
            href="/worlds/new"
            className="text-sm text-gold hover:underline"
          >
            + Nuevo mundo
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {demoWorlds.map((w) => (
            <Link key={w.id} href={`/worlds/${w.id}`}>
              <Card className="hover:border-gold/40 transition-colors cursor-pointer group">
                <h3 className="font-semibold text-text-primary group-hover:text-gold transition-colors">
                  {w.name}
                </h3>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="default">{w.genre}</Badge>
                  <span className="text-xs text-text-muted">{w.tone}</span>
                </div>
              </Card>
            </Link>
          ))}
          <Link href="/worlds/new">
            <Card className="flex h-full min-h-[100px] flex-col items-center justify-center border-dashed border-2 border-border hover:border-gold/40 transition-colors cursor-pointer">
              <span className="text-2xl text-text-muted mb-2">+</span>
              <span className="text-sm text-text-secondary">Nuevo mundo</span>
            </Card>
          </Link>
        </div>
      </section>
    </div>
  );
}
