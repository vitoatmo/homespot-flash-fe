import { cn } from "@/lib/utils";

export type JourneyStage = "KNOW" | "FEEL" | "DECIDE";

const STYLE: Record<JourneyStage, string> = {
  KNOW: "bg-sky-100 text-sky-700 border-sky-200",
  FEEL: "bg-amber-100 text-amber-700 border-amber-200",
  DECIDE: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export function JourneyPill({
  stage,
  active = false,
  className,
}: {
  stage: JourneyStage;
  active?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide",
        STYLE[stage],
        active && "ring-2 ring-offset-1 ring-offset-background",
        active && stage === "KNOW" && "ring-sky-400",
        active && stage === "FEEL" && "ring-amber-400",
        active && stage === "DECIDE" && "ring-emerald-400",
        className,
      )}
    >
      {stage}
    </span>
  );
}
