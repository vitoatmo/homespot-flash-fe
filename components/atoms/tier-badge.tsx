import { Badge } from "@/components/ui/badge";

export type Tier = "Green" | "Amber" | "Red";

const VARIANT: Record<Tier, "success" | "warning" | "danger"> = {
  Green: "success",
  Amber: "warning",
  Red: "danger",
};

const LABEL_ID: Record<Tier, string> = {
  Green: "Aman",
  Amber: "Perlu review",
  Red: "Ditolak",
};

export function TierBadge({ tier, withLabel = false }: { tier: Tier; withLabel?: boolean }) {
  return (
    <Badge variant={VARIANT[tier]} className="uppercase tracking-wide">
      {tier}
      {withLabel && <span className="ml-1 lowercase opacity-80">· {LABEL_ID[tier]}</span>}
    </Badge>
  );
}
