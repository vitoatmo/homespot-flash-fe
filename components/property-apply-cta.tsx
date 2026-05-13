"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { loadSessionApplicant, saveSelectedProperty, type SessionApplicant } from "@/lib/session-data";
import { AiExplainCard } from "@/components/organisms/ai-explain-card";
import { ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

type Props = {
  slug: string;
  title: string;
  developer: string;
  location: string;
  city: string;
  price: number;
};

export function PropertyApplyCta({ slug, title, developer, location, city, price }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);
  const [score, setScore] = useState<NonNullable<SessionApplicant["score"]> | null>(null);

  useEffect(() => {
    const s = loadSessionApplicant();
    if (s?.score?.approved_limit_idr) setLimit(s.score.approved_limit_idr);
    if (s?.score) setScore(s.score);
    setLoaded(true);
  }, []);

  const onApply = () => {
    saveSelectedProperty({ slug, title, developer, location, city, price });
  };

  const eligible = limit !== null && price <= limit * 1.05; // 5% buffer
  const coveredPct = limit ? Math.min(100, Math.round((limit / price) * 100)) : 0;

  const StatusBlock = !loaded ? (
    <div className="h-16 animate-pulse rounded-lg bg-muted/50" />
  ) : limit === null ? (
    <div className="rounded-lg bg-amber-50 p-3 text-sm">
      <div className="flex items-center gap-1 font-semibold text-amber-700">
        <AlertTriangle className="h-4 w-4" /> Belum tahu limit KPR kamu
      </div>
      <div className="mt-1 text-amber-700/80 text-xs">
        Cek limit dulu supaya AI bisa konfirmasi properti ini cocok untuk finansialmu.
      </div>
    </div>
  ) : eligible ? (
    <div className="space-y-2">
      <div className="rounded-lg bg-emerald-50 p-3 text-sm">
        <div className="flex items-center gap-1 font-semibold text-emerald-700">
          <Sparkles className="h-4 w-4" /> Pre-approved eligible
        </div>
        <div className="text-emerald-600/80 text-xs">
          Limit kamu {formatIDR(limit)} cukup untuk properti ini.
        </div>
      </div>
      {score && score.top_reasons.length > 0 && (
        <AiExplainCard
          variant="inline"
          tier={score.tier}
          score={score.score}
          confidence={score.confidence}
          top_reasons={score.top_reasons}
          latency_ms={score.latency_ms ?? 0}
          model={score.model ?? "llama-3.3-70b-versatile"}
          dti_ratio_pct={score.dti_ratio_pct}
          approved_limit_idr={score.approved_limit_idr}
          estimated_rate={score.estimated_rate}
          max_tenor_months={score.max_tenor_months}
          monthly_installment_idr={score.monthly_installment_idr}
        />
      )}
    </div>
  ) : (
    <div className="rounded-lg bg-rose-50 p-3 text-sm">
      <div className="flex items-center gap-1 font-semibold text-rose-700">
        <AlertTriangle className="h-4 w-4" /> Di luar limit kamu
      </div>
      <div className="text-rose-600/80 text-xs">
        Limit kamu {formatIDR(limit)} ({coveredPct}% dari harga). Coba properti lebih terjangkau
        atau upgrade data penghasilan.
      </div>
    </div>
  );

  const PrimaryCta =
    limit === null ? (
      <Button size="lg" className="w-full" asChild>
        <Link href="/pre-approval">Cek limit saya dulu <ArrowRight className="h-4 w-4" /></Link>
      </Button>
    ) : (
      <Button size="lg" className="w-full" asChild onClick={onApply} disabled={!eligible}>
        <Link href={`/apply?property=${slug}`}>
          Apply dengan limit ini <ArrowRight className="h-4 w-4" />
        </Link>
      </Button>
    );

  return (
    <>
      {/* Desktop / tablet inline card */}
      <Card className="hidden space-y-4 p-6 lg:block">
        <div>
          <div className="text-xs text-muted-foreground">Harga mulai</div>
          <div className="text-3xl font-bold text-primary">{formatIDR(price)}</div>
        </div>

        {StatusBlock}
        {PrimaryCta}

        <Button size="lg" variant="outline" className="w-full" asChild>
          <Link href="/pre-approval">{limit ? "Re-check limit" : "Cek limit"}</Link>
        </Button>

        <div className="text-xs text-muted-foreground">
          Dengan klik apply, kamu setuju atas ketentuan program Flash dan izin pengecekan SLIK.
        </div>
      </Card>

      {/* Mobile: inline status card (no CTA, CTA is in sticky bar below) */}
      <Card className="space-y-3 p-4 lg:hidden">
        <div>
          <div className="text-xs text-muted-foreground">Harga mulai</div>
          <div className="text-2xl font-bold text-primary">{formatIDR(price)}</div>
        </div>
        {StatusBlock}
        <Button size="sm" variant="outline" className="w-full" asChild>
          <Link href="/pre-approval">{limit ? "Re-check limit" : "Cek limit"}</Link>
        </Button>
        <div className="text-[11px] leading-snug text-muted-foreground">
          Dengan apply, kamu setuju atas ketentuan Flash dan izin pengecekan SLIK.
        </div>
      </Card>

      {/* Mobile sticky bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <div
          className="mx-auto flex max-w-md items-center gap-3 pb-[max(env(safe-area-inset-bottom),0px)]"
        >
          <div className="min-w-0 flex-shrink">
            <div className="text-[10px] text-muted-foreground">Mulai</div>
            <div className="truncate text-base font-bold text-primary">{formatIDR(price)}</div>
          </div>
          <div className="ml-auto flex-1">
            {limit === null ? (
              <Button size="lg" className="w-full" asChild>
                <Link href="/pre-approval">
                  Cek limit <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="w-full" asChild onClick={onApply} disabled={!eligible}>
                <Link href={`/apply?property=${slug}`}>
                  Apply <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
