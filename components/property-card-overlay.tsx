"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { loadSessionApplicant } from "@/lib/session-data";
import { cn } from "@/lib/utils";

// Naive AI-derived match score:
//   clamp(100 - max(0, price - limit) / limit * 100, 0, 100)
// 100 when price <= limit, scales down past limit.
// Band: Green ≥ 80, Amber 60–79, Red < 60.
function computeMatchScore(price: number, limit: number) {
  if (!limit || limit <= 0) return 0;
  const overflow = Math.max(0, price - limit);
  const raw = 100 - (overflow / limit) * 100;
  return Math.max(0, Math.min(100, Math.round(raw)));
}

function band(score: number): "green" | "amber" | "red" {
  if (score >= 80) return "green";
  if (score >= 60) return "amber";
  return "red";
}

const RIBBON_CLS: Record<"green" | "amber" | "red", string> = {
  green: "bg-emerald-600 text-white",
  amber: "bg-amber-500 text-white",
  red: "bg-rose-600 text-white",
};

const FOOTER_CLS: Record<"green" | "amber" | "red", string> = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-rose-100 text-rose-700",
};

const LABEL: Record<"green" | "amber" | "red", string> = {
  green: "Cocok limit",
  amber: "Mepet limit",
  red: "Di atas limit",
};

type Variant = "ribbon" | "footer";

export function PropertyCardEligibility({
  price,
  variant,
}: {
  price: number;
  variant: Variant;
}) {
  const [loaded, setLoaded] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);

  useEffect(() => {
    const s = loadSessionApplicant();
    setLimit(s?.score?.approved_limit_idr ?? null);
    setLoaded(true);
  }, []);

  // No session → hide both ribbon and the (previously misleading)
  // "Pre-approved" footer badge.
  if (!loaded || limit === null) return null;

  const score = computeMatchScore(price, limit);
  const b = band(score);

  if (variant === "ribbon") {
    return (
      <Badge
        className={cn(
          "gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-sm sm:text-xs",
          RIBBON_CLS[b],
        )}
        aria-label={`AI match ${score} dari 100 — ${LABEL[b]}`}
      >
        AI {score}
      </Badge>
    );
  }

  return (
    <Badge className={cn("text-[10px] sm:text-xs", FOOTER_CLS[b])}>
      {LABEL[b]}
    </Badge>
  );
}
