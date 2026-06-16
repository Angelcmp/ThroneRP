"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function NewWorldPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [genre, setGenre] = useState("Fantasia");
  const [tone, setTone] = useState("Epico");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold mb-6">
        Crear mundo
      </h1>

      <Card className="space-y-5">
        <Input
          label="Nombre del mundo"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Reinos Olvidados"
        />

        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Genero
            </label>
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary"
            >
              {[
                "Fantasia",
                "Cyberpunk",
                "Lovecraftiano",
                "Space Opera",
                "Steampunk",
              ].map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-text-secondary">
              Tono
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary"
            >
              {["Epico", "Oscuro", "Heroico", "Misterioso", "Tragico"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-text-secondary">
            Premisa
          </label>
          <textarea
            className="mt-1.5 w-full h-24 rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary placeholder:text-text-muted resize-none focus:border-gold/60 focus:outline-none"
            placeholder="Describe la premisa del mundo en 2-3 frases..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-text-secondary">
              Sistema de magia
            </label>
            <input
              className="mt-1.5 w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary focus:border-gold/60 focus:outline-none"
              placeholder="Arcana, Tecnologica, Divina..."
            />
          </div>
          <div>
            <label className="text-sm font-medium text-text-secondary">
              Nivel tecnologico
            </label>
            <input
              className="mt-1.5 w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary focus:border-gold/60 focus:outline-none"
              placeholder="Medieval, Futurista, Mixto..."
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <Button variant="secondary" onClick={() => router.push("/worlds")}>
            Cancelar
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary">✨ Generar con IA</Button>
            <Button onClick={() => router.push("/worlds")}>
              Guardar mundo
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
