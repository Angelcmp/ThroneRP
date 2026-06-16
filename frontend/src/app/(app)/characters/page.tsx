import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const demoCharacters = [
  {
    id: "1",
    name: "Thalion",
    race: "Elfo",
    class: "Mago",
    level: 5,
    hp: { current: 18, max: 22 },
  },
  {
    id: "2",
    name: "Korg",
    race: "Orco",
    class: "Guerrero",
    level: 3,
    hp: { current: 28, max: 30 },
  },
];

export default function CharactersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Personajes
        </h1>
        <Link
          href="/characters/new"
          className="rounded-lg bg-gold px-5 py-2.5 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors"
        >
          + Nuevo personaje
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {demoCharacters.map((ch) => (
          <Link key={ch.id} href={`/characters/${ch.id}`}>
            <Card className="hover:border-gold/40 transition-colors cursor-pointer group">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-text-primary group-hover:text-gold transition-colors">
                    {ch.name}
                  </h3>
                  <p className="mt-1 text-sm text-text-secondary">
                    {ch.race} {ch.class}
                  </p>
                </div>
                <Badge variant="default">Nv. {ch.level}</Badge>
              </div>
              <div className="mt-4">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>
                    ❤️ {ch.hp.current}/{ch.hp.max}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full rounded-full bg-bg-elevated">
                  <div
                    className="h-1.5 rounded-full bg-hp-red transition-all"
                    style={{
                      width: `${(ch.hp.current / ch.hp.max) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
