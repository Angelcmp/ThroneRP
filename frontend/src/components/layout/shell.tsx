"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: "🏰" },
  { label: "Personajes", href: "/characters", icon: "⚔️" },
  { label: "Mundos", href: "/worlds", icon: "🌍" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-border bg-bg-panel">
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold text-bg-deep font-bold text-lg">
            T
          </div>
          <span className="font-[family-name:var(--font-cinzel)] text-lg font-semibold text-text-primary">
            ThroneRP
          </span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                pathname === item.href || pathname?.startsWith(item.href + "/")
                  ? "bg-bg-elevated text-gold"
                  : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
              )}
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-border px-3 py-4">
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm text-text-muted hover:bg-bg-elevated hover:text-text-secondary transition-colors"
          >
            <span>🏠</span> Inicio
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-64 flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border bg-bg-deep/80 px-8 py-4 backdrop-blur">
          <h1 className="font-[family-name:var(--font-cinzel)] text-xl font-semibold text-text-primary">
            {nav.find((n) => pathname?.startsWith(n.href))?.label || "ThroneRP"}
          </h1>
          <div className="flex items-center gap-4">
            <Link
              href="/play/demo-campaign-1"
              className="rounded-lg bg-gold px-4 py-2 text-sm font-semibold text-bg-deep hover:bg-gold-hover transition-colors"
            >
              Jugar demo
            </Link>
          </div>
        </header>

        <div className="flex-1 px-8 py-6">{children}</div>
      </main>
    </div>
  );
}
