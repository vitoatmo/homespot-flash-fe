"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatIDR } from "@/lib/utils";
import { loadSessionApplicant, saveSelectedProperty } from "@/lib/session-data";
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

  useEffect(() => {
    const s = loadSessionApplicant();
    if (s?.score?.approved_limit_idr) setLimit(s.score.approved_limit_idr);
    setLoaded(true);
  }, []);

  const onApply = () => {
    saveSelectedProperty({ slug, title, developer, location, city, price });
  };

  const eligible = limit !== null && price <= limit * 1.05; // 5% buffer
  const coveredPct = limit ? Math.min(100, Math.round((limit / price) * 100)) : 0;

  return (
    <Card className="space-y-4 p-6">
      <div>
        <div className="text-xs text-muted-foreground">Harga mulai</div>
        <div className="text-3xl font-bold text-primary">{formatIDR(price)}</div>
      </div>

      {!loaded ? (
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
        <div className="rounded-lg bg-emerald-50 p-3 text-sm">
          <div className="flex items-center gap-1 font-semibold text-emerald-700">
            <Sparkles className="h-4 w-4" /> Pre-approved eligible
          </div>
          <div className="text-emerald-600/80 text-xs">
            Limit kamu {formatIDR(limit)} cukup untuk properti ini.
          </div>
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
      )}

      {limit === null ? (
        <Button size="lg" className="w-full" asChild>
          <Link href="/pre-approval">Cek limit saya dulu <ArrowRight className="h-4 w-4" /></Link>
        </Button>
      ) : (
        <Button size="lg" className="w-full" asChild onClick={onApply} disabled={!eligible}>
          <Link href={`/apply?property=${slug}`}>
            Apply dengan limit ini <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      )}

      <Button size="lg" variant="outline" className="w-full" asChild>
        <Link href="/pre-approval">{limit ? "Re-check limit" : "Cek limit"}</Link>
      </Button>

      <div className="text-xs text-muted-foreground">
        Dengan klik apply, kamu setuju atas ketentuan program Flash dan izin pengecekan SLIK.
      </div>
    </Card>
  );
}
