import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <header className="flex items-center justify-between px-8 py-5 border-b border-border bg-bg-deep/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-bg-deep font-bold text-lg">
            T
          </div>
          <span className="font-[family-name:var(--font-cinzel)] text-xl font-semibold">
            ThroneRP
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Iniciar sesion
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gold px-3 py-1.5 text-sm text-bg-deep hover:bg-gold-hover transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
        <h1 className="font-[family-name:var(--font-cinzel)] text-5xl md:text-7xl font-bold text-text-primary leading-tight max-w-4xl animate-fade-in">
          Tus historias cobran vida
        </h1>
        <p
          className="mt-6 max-w-2xl text-lg md:text-xl text-text-secondary leading-relaxed animate-fade-in"
          style={{ animationDelay: "0.1s" }}
        >
          Roleplay narrativo con un{" "}
          <span className="text-gold font-medium">Narrador IA</span> que
          recuerda cada decision que tomas. Crea personajes, genera mundos y
          juega campanas con tus amigos.
        </p>
        <div
          className="mt-10 flex flex-col sm:flex-row gap-4 animate-fade-in"
          style={{ animationDelay: "0.2s" }}
        >
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-gold px-8 py-3.5 text-base font-semibold text-bg-deep hover:bg-gold-hover transition-colors"
          >
            Crear cuenta gratis
          </Link>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-bg-elevated px-8 py-3.5 text-base font-semibold text-text-primary hover:border-gold/50 transition-colors"
          >
            Iniciar sesion →
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border bg-bg-panel px-6 py-20">
        <div className="mx-auto max-w-6xl grid grid-cols-1 gap-8 md:grid-cols-3">
          {[
            {
              icon: "⚔️",
              title: "Constructor de personajes",
              desc: "Manual o generado por IA. Fichas completas con stats, inventario y backstory.",
            },
            {
              icon: "🌍",
              title: "Mundos vivos",
              desc: "Genera lore, facciones y lugares. Plantillas de Fantasia, Cyberpunk, Lovecraft y mas.",
            },
            {
              icon: "🧠",
              title: "Memoria persistente",
              desc: "El narrador recuerda eventos, decisiones y personajes a lo largo de toda la campana.",
            },
            {
              icon: "👥",
              title: "Multi-jugador",
              desc: "GM + party. Turnos por ronda, chat en tiempo real y permisos por rol.",
            },
            {
              icon: "⚡",
              title: "Streaming en vivo",
              desc: "El narrador escribe en tiempo real como si estuviera narrando la partida.",
            },
            {
              icon: "🎲",
              title: "Comandos RPG",
              desc: "/roll, /check, /look, /inventory, /stats. Sistema de dados integrado.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-bg-deep p-6 hover:border-gold/30 transition-colors"
            >
              <div className="mb-3 text-3xl">{f.icon}</div>
              <h3 className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-text-primary">
                {f.title}
              </h3>
              <p className="mt-2 text-sm text-text-secondary leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-8 py-6 text-center text-sm text-text-muted">
        ThroneRP — Proyecto privado en desarrollo.
      </footer>
    </div>
  );
}
