import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-sm font-medium text-text-secondary">
          {label}
        </label>
      )}
      <input
        className={cn(
          "w-full rounded-lg border border-border bg-bg-panel px-4 py-2.5 text-text-primary placeholder:text-text-muted",
          "focus:border-gold/60 focus:outline-none focus:ring-1 focus:ring-gold/20",
          "transition-colors",
          error && "border-hp-red focus:border-hp-red focus:ring-hp-red/20",
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-hp-red">{error}</p>}
    </div>
  );
}
