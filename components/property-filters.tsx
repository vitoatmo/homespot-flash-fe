"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Filter, Sparkles, X } from "lucide-react";
import { loadSessionApplicant } from "@/lib/session-data";
import { formatIDR } from "@/lib/utils";

const CATEGORIES = [
  { value: "all", label: "Semua" },
  { value: "subsidi", label: "Subsidi FLPP" },
  { value: "starter", label: "Starter" },
  { value: "mid", label: "Mid" },
  { value: "upper_mid", label: "Upper Mid" },
  { value: "premium", label: "Premium" },
  { value: "luxury", label: "Luxury" },
  { value: "ultra_luxury", label: "Ultra Luxury" },
];

const TYPES = [
  { value: "all", label: "Semua" },
  { value: "rumah_tapak", label: "Rumah Tapak" },
  { value: "apartemen", label: "Apartemen" },
  { value: "townhouse", label: "Townhouse" },
  { value: "villa", label: "Villa" },
  { value: "penthouse", label: "Penthouse" },
  { value: "ruko", label: "Ruko" },
  { value: "rumah_subsidi", label: "Rumah Subsidi" },
];

export function PropertyFilters({ cities }: { cities: string[] }) {
  const router = useRouter();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [approvedLimit, setApprovedLimit] = useState<number | null>(null);

  useEffect(() => {
    const s = loadSessionApplicant();
    if (s?.score?.approved_limit_idr) setApprovedLimit(s.score.approved_limit_idr);
  }, []);

  const params = (overrides: Record<string, string | undefined>) => {
    const next = new URLSearchParams(sp.toString());
    Object.entries(overrides).forEach(([k, v]) => {
      if (!v || v === "all" || v === "") next.delete(k);
      else next.set(k, v);
    });
    return next.toString();
  };

  const push = (overrides: Record<string, string | undefined>) => {
    startTransition(() => {
      router.push(`/properties?${params(overrides)}`);
    });
  };

  const current = {
    maxPrice: sp.get("maxPrice") ?? "",
    minPrice: sp.get("minPrice") ?? "",
    city: sp.get("city") ?? "all",
    category: sp.get("category") ?? "all",
    type: sp.get("type") ?? "all",
    q: sp.get("q") ?? "",
  };

  const clearAll = () => startTransition(() => router.push("/properties"));

  const applyAIMatch = () => {
    if (!approvedLimit) return;
    push({ maxPrice: String(approvedLimit) });
  };

  const hasAny =
    current.maxPrice || current.minPrice || current.city !== "all" ||
    current.category !== "all" || current.type !== "all" || current.q;

  return (
    <Card className="sticky top-20 h-fit p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Filter className="h-4 w-4" /> Filter
        </div>
        {hasAny && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            disabled={pending}
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      {approvedLimit && (
        <div className="mt-4 rounded-lg border border-accent/40 bg-accent/5 p-3">
          <div className="flex items-center gap-1 text-xs font-semibold text-accent">
            <Sparkles className="h-3 w-3" /> Limit pre-approval kamu
          </div>
          <div className="mt-0.5 text-base font-bold text-primary">
            {formatIDR(approvedLimit)}
          </div>
          <Button
            size="sm"
            variant="accent"
            className="mt-3 w-full"
            onClick={applyAIMatch}
            disabled={pending}
          >
            Filter sesuai limit saya
          </Button>
        </div>
      )}

      <div className="mt-5 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Cari nama</Label>
          <Input
            defaultValue={current.q}
            placeholder="BSD, Villa, Podomoro…"
            onBlur={(e) => push({ q: e.currentTarget.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") push({ q: e.currentTarget.value });
            }}
            className="mt-1"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Kategori</Label>
          <select
            value={current.category}
            onChange={(e) => push({ category: e.target.value })}
            disabled={pending}
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Tipe properti</Label>
          <select
            value={current.type}
            onChange={(e) => push({ type: e.target.value })}
            disabled={pending}
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            {TYPES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground">Kota</Label>
          <select
            value={current.city}
            onChange={(e) => push({ city: e.target.value })}
            disabled={pending}
            className="mt-1 h-9 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="all">Semua kota</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label className="text-xs text-muted-foreground">Min (Rp)</Label>
            <Input
              type="number"
              defaultValue={current.minPrice}
              placeholder="0"
              onBlur={(e) => push({ minPrice: e.currentTarget.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max (Rp)</Label>
            <Input
              type="number"
              defaultValue={current.maxPrice}
              placeholder="∞"
              onBlur={(e) => push({ maxPrice: e.currentTarget.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </Card>
  );
}
