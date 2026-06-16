"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

export default function NewCharacterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [race, setRace] = useState("Humano");
  const [classType, setClassType] = useState("Aventurero");

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl font-bold">
          Crear personaje
        </h1>
        <p className="text-sm text-text-secondary">
          Paso {step} de 4:{" "}
          {step === 1
            ? "Identidad"
            : step === 2
              ? "Stats"
              : step === 3
                ? "Apariencia"
                : "Backstory"}
        </p>
      </div>

      <Card>
        {step === 1 && (
          <div className="space-y-4">
            <Input
              label="Nombre"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Thalion"
            />
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Raza
                </label>
                <select
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary"
                >
                  {["Humano", "Elfo", "Enano", "Orco", "Mediano"].map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary">
                  Clase
                </label>
                <select
                  value={classType}
                  onChange={(e) => setClassType(e.target.value)}
                  className="w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary"
                >
                  {[
                    "Aventurero",
                    "Guerrero",
                    "Mago",
                    "Clerigo",
                    "Picaro",
                    "Ranger",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-text-secondary">
              Distribuye 75 puntos entre tus stats. Cada stat empieza en 8.
            </p>
            {["STR", "DEX", "CON", "INT", "WIS", "CHA"].map((stat) => (
              <div key={stat} className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">
                  {stat}
                </span>
                <input
                  type="range"
                  min={8}
                  max={18}
                  defaultValue={10}
                  className="w-48 accent-gold"
                />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-secondary">
              Apariencia
            </label>
            <textarea
              className="w-full h-24 rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary placeholder:text-text-muted resize-none focus:border-gold/60 focus:outline-none"
              placeholder="Describe como luce tu personaje..."
            />
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <label className="text-sm font-medium text-text-secondary">
              Historia
            </label>
            <textarea
              className="w-full h-32 rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary placeholder:text-text-muted resize-none focus:border-gold/60 focus:outline-none"
              placeholder="Cuenta la historia de tu personaje..."
            />
          </div>
        )}

        <div className="mt-6 flex items-center justify-between">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep((s) => s - 1)}>
              ← Atras
            </Button>
          ) : (
            <div />
          )}
          {step < 4 ? (
            <Button onClick={() => setStep((s) => s + 1)}>Siguiente →</Button>
          ) : (
            <Button onClick={() => router.push("/characters")}>
              Guardar personaje
            </Button>
          )}
        </div>
      </Card>

      <div className="mt-6 border-t border-border pt-6 text-center">
        <p className="text-sm text-text-muted mb-3">— o genera con IA —</p>
        <textarea
          className="w-full h-20 rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary placeholder:text-text-muted resize-none focus:border-gold/60 focus:outline-none"
          placeholder="Describe tu personaje en una frase: un elfo mago traicionado por su hermano..."
        />
        <Button variant="secondary" className="mt-3 w-full">
          ✨ Generar con IA
        </Button>
      </div>
    </div>
  );
}
