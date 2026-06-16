import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const demoWorlds = [
  {
    id: "1",
    name: "Reinos Olvidados",
    genre: "Fantasia",
    tone: "Epico",
    factions: 4,
    locations: 6,
  },
  {
    id: "2",
    name: "Neon City",
    genre: "Cyberpunk",
    tone: "Oscuro",
    factions: 3,
    locations: 4,
  },
];

export default function WorldsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Mundos
        </h1>
        <Link
          href="/worlds/new"
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors"
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
              <div className="mt-4 flex items-center gap-4 text-xs text-text-muted">
                <span>⚔️ {w.factions} facciones</span>
                <span>📍 {w.locations} lugares</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
