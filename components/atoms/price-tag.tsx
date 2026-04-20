import { formatIDR } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function PriceTag({
  amount,
  size = "md",
  prefix = "mulai",
  className,
}: {
  amount: number;
  size?: "sm" | "md" | "lg";
  prefix?: string | null;
  className?: string;
}) {
  const sizeCls =
    size === "lg" ? "text-2xl md:text-3xl" : size === "sm" ? "text-sm" : "text-lg";
  return (
    <div className={cn("flex flex-col leading-tight", className)}>
      {prefix && <span className="text-[10px] uppercase tracking-wide text-muted-foreground">{prefix}</span>}
      <span className={cn("font-bold text-primary", sizeCls)}>{formatIDR(amount)}</span>
    </div>
  );
}
