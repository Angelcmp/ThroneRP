import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  const variants = {
    primary:
      "bg-gold text-bg-deep hover:bg-gold-hover disabled:opacity-50 disabled:cursor-not-allowed",
    secondary:
      "bg-bg-elevated text-text-primary border border-border hover:border-gold/50 disabled:opacity-50",
    ghost: "text-text-secondary hover:text-text-primary hover:bg-bg-elevated",
    danger: "bg-hp-red text-white hover:opacity-90",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm rounded-md",
    md: "px-5 py-2.5 text-sm font-medium rounded-lg",
    lg: "px-8 py-3.5 text-base font-semibold rounded-xl",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 transition-colors duration-200 cursor-pointer",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
