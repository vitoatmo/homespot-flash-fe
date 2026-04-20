"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loadSessionApplicant } from "@/lib/session-data";
import { formatIDR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, ArrowRight, AlertCircle } from "lucide-react";

export function SessionAwareBanner() {
  const [loaded, setLoaded] = useState(false);
  const [limit, setLimit] = useState<number | null>(null);
  const [tier, setTier] = useState<"Green" | "Amber" | "Red" | null>(null);

  useEffect(() => {
    const s = loadSessionApplicant();
    if (s?.score) {
      setLimit(s.score.approved_limit_idr);
      setTier(s.score.tier);
    }
    setLoaded(true);
  }, []);

  if (!loaded) return null;

  if (!limit) {
    return (
      <Card className="border-amber-300 bg-amber-50 p-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-amber-700" />
          <div className="flex-1 text-sm text-amber-900">
            <span className="font-semibold">Belum cek limit?</span> Biar AI bantu filter
            properti sesuai kemampuan finansialmu dalam 60 detik.
          </div>
          <Link
            href="/pre-approval"
            className="inline-flex items-center gap-1 rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-800"
          >
            Cek Limit <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </Card>
    );
  }

  const badgeClass =
    tier === "Green"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : tier === "Amber"
        ? "bg-amber-100 text-amber-700 border-amber-200"
        : "bg-rose-100 text-rose-700 border-rose-200";

  return (
    <Card className="border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/20 text-accent">
          <Sparkles className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-muted-foreground">AI pre-approval aktif</div>
          <div className="font-semibold text-primary">
            Limit kamu: {formatIDR(limit)}{" "}
            {tier && <Badge variant="outline" className={`ml-1 ${badgeClass}`}>{tier}</Badge>}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          Pakai filter <span className="font-semibold">"sesuai limit saya"</span> di sidebar kiri.
        </div>
      </div>
    </Card>
  );
}
