import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "gold" | "green" | "red" | "blue" | "warning";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  const variants = {
    default: "bg-bg-elevated text-text-secondary",
    gold: "bg-gold/10 text-gold border border-gold/20",
    green: "bg-success/10 text-success border border-success/20",
    red: "bg-hp-red/10 text-hp-red border border-hp-red/20",
    blue: "bg-mana-blue/10 text-mana-blue border border-mana-blue/20",
    warning: "bg-warning/10 text-warning border border-warning/20",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
