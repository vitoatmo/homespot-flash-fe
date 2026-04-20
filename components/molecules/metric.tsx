import { cn } from "@/lib/utils";

export function Metric({
  label,
  value,
  accent = "primary",
  className,
}: {
  label: string;
  value: React.ReactNode;
  accent?: "primary" | "accent" | "muted";
  className?: string;
}) {
  const valueCls =
    accent === "accent"
      ? "text-accent"
      : accent === "muted"
      ? "text-foreground"
      : "text-primary";
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <div className={cn("text-2xl md:text-3xl font-bold", valueCls)}>{value}</div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}
