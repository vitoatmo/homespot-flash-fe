import { cn } from "@/lib/utils";

export function Row({
  label,
  value,
  size = "sm",
  className,
}: {
  label: string;
  value: React.ReactNode;
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const textCls = size === "xs" ? "text-xs" : size === "md" ? "text-base" : "text-sm";
  return (
    <div className={cn("flex justify-between", textCls, className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
