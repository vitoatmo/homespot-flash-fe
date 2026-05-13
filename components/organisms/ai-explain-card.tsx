import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stat } from "@/components/molecules/stat";
import { TierBadge, type Tier } from "@/components/atoms/tier-badge";
import { formatIDR, cn } from "@/lib/utils";
import { CheckCircle2, Clock, Sparkles, ShieldCheck } from "lucide-react";

// Props mirror the /api/score JSON contract — see app/api/score/route.ts
// and CLAUDE.md (Groq section). All fields except top_reasons are required
// because they are the AI-output values the panel must always see.
export type AiExplainCardProps = {
  tier: Tier;
  score: number;
  confidence: Tier;
  top_reasons: string[];
  latency_ms: number;
  model: string;
  dti_ratio_pct: number;
  approved_limit_idr: number;
  estimated_rate: number;
  max_tenor_months: number;
  monthly_installment_idr: number;
  variant?: "full" | "compact" | "inline";
  className?: string;
};

const TIER_LABEL: Record<Tier, string> = {
  Green: "Approved",
  Amber: "Review oleh CLF",
  Red: "Tidak memenuhi syarat",
};

const TIER_GRADIENT: Record<Tier, string> = {
  Green: "from-emerald-600 to-emerald-700",
  Amber: "from-amber-500 to-orange-600",
  Red: "from-rose-600 to-red-700",
};

const TIER_TEXT: Record<Tier, string> = {
  Green: "text-emerald-700",
  Amber: "text-amber-700",
  Red: "text-rose-700",
};

const TIER_BG: Record<Tier, string> = {
  Green: "bg-emerald-50 border-emerald-200",
  Amber: "bg-amber-50 border-amber-200",
  Red: "bg-rose-50 border-rose-200",
};

export function AiExplainCard(props: AiExplainCardProps) {
  const { variant = "full" } = props;
  if (variant === "inline") return <InlineVariant {...props} />;
  if (variant === "compact") return <CompactVariant {...props} />;
  return <FullVariant {...props} />;
}

function FullVariant({
  tier,
  score,
  confidence,
  top_reasons,
  latency_ms,
  model,
  dti_ratio_pct,
  approved_limit_idr,
  estimated_rate,
  max_tenor_months,
  monthly_installment_idr,
  className,
}: AiExplainCardProps) {
  const tierLabel = TIER_LABEL[tier];
  const tenorYears = Math.round(max_tenor_months / 12);

  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className={cn("bg-gradient-to-br p-5 text-white sm:p-6 md:p-8", TIER_GRADIENT[tier])}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Badge variant="secondary" className="bg-white/20 text-white">
              {confidence} · {tierLabel}
            </Badge>
            <div className="mt-3 text-xs text-white/80 sm:text-sm">Limit kredit kamu</div>
            <div className="text-2xl font-bold leading-tight sm:text-3xl md:text-4xl">
              {formatIDR(approved_limit_idr)}
            </div>
            <div className="mt-1 text-xs text-white/80 sm:text-sm">
              Tenor max {tenorYears} tahun · bunga {estimated_rate}%
            </div>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-[10px] text-white/80 sm:text-xs">Skor AI</div>
            <div className="text-3xl font-bold sm:text-4xl">{score}</div>
            <div className="text-[10px] text-white/80 sm:text-xs">/ 100</div>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            <Clock className="h-4 w-4" /> {(latency_ms / 1000).toFixed(2)} detik
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            <Sparkles className="h-4 w-4" /> {model}
          </div>
          <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
            <ShieldCheck className="h-4 w-4" /> DTI {dti_ratio_pct.toFixed(1)}%
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 sm:gap-6 sm:p-6 md:grid-cols-2 md:p-8">
        <div>
          <h3 className="font-semibold">Kenapa {tierLabel.toLowerCase()}?</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {top_reasons.map((t, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold">Estimasi cicilan</h3>
          <div className="mt-3 rounded-lg bg-bri-light p-4">
            <div className="text-xs text-muted-foreground">
              Untuk plafon {formatIDR(approved_limit_idr)}
            </div>
            <div className="text-2xl font-bold text-primary">
              {formatIDR(monthly_installment_idr)}
              <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              @ {estimated_rate}% p.a. · tenor {tenorYears} tahun
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function CompactVariant({
  tier,
  score,
  top_reasons,
  latency_ms,
  model,
  dti_ratio_pct,
  approved_limit_idr,
  estimated_rate,
  max_tenor_months,
  className,
}: AiExplainCardProps) {
  const tenorYears = Math.round(max_tenor_months / 12);
  const reasons = top_reasons.slice(0, 3);
  return (
    <Card className={cn("space-y-3 p-4 sm:p-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <TierBadge tier={tier} />
            <span className="text-xs text-muted-foreground">Skor {score}/100</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">Plafon disetujui AI</div>
          <div className="text-lg font-bold text-primary sm:text-xl">
            {formatIDR(approved_limit_idr)}
          </div>
          <div className="text-xs text-muted-foreground">
            Tenor {tenorYears} thn · {estimated_rate}% p.a.
          </div>
        </div>
      </div>

      {reasons.length > 0 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground">Alasan AI</div>
          <ul className="mt-1.5 space-y-1 text-xs">
            {reasons.map((t, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
                <span className="leading-snug">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2 border-t pt-3 text-[11px]">
        <Stat
          icon={<Clock className="h-3 w-3" />}
          label="Latensi"
          value={<span className="text-xs">{(latency_ms / 1000).toFixed(2)}s</span>}
        />
        <Stat
          icon={<ShieldCheck className="h-3 w-3" />}
          label="DTI"
          value={<span className="text-xs">{dti_ratio_pct.toFixed(1)}%</span>}
        />
        <Stat
          icon={<Sparkles className="h-3 w-3" />}
          label="Model"
          value={<span className="truncate text-xs">{model}</span>}
        />
      </div>
    </Card>
  );
}

function InlineVariant({
  tier,
  top_reasons,
  latency_ms,
  model,
  className,
}: AiExplainCardProps) {
  const reasons = top_reasons.slice(0, 2);
  return (
    <div className={cn("rounded-lg border bg-white p-3 text-xs", TIER_BG[tier], className)}>
      <div className="flex items-center gap-2">
        <Sparkles className={cn("h-3.5 w-3.5", TIER_TEXT[tier])} />
        <span className={cn("font-semibold", TIER_TEXT[tier])}>Penilaian AI</span>
        <TierBadge tier={tier} />
      </div>
      {reasons.length > 0 && (
        <ul className="mt-2 space-y-1">
          {reasons.map((t, i) => (
            <li key={i} className="flex items-start gap-1.5 text-foreground/80">
              <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />
              <span className="leading-snug">{t}</span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3" /> {(latency_ms / 1000).toFixed(2)}s
        </span>
        <span aria-hidden="true">·</span>
        <span className="truncate">{model}</span>
      </div>
    </div>
  );
}
