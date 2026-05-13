"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const s = loadSessionApplicant();
    if (s?.score?.approved_limit_idr) setApprovedLimit(s.score.approved_limit_idr);
  }, []);

  // Lock body scroll when mobile drawer open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

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

  const activeCount =
    (current.maxPrice ? 1 : 0) +
    (current.minPrice ? 1 : 0) +
    (current.city !== "all" ? 1 : 0) +
    (current.category !== "all" ? 1 : 0) +
    (current.type !== "all" ? 1 : 0) +
    (current.q ? 1 : 0);

  const hasAny = activeCount > 0;

  const FilterBody = (
    <>
      {approvedLimit && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
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
            onClick={() => {
              applyAIMatch();
              setOpen(false);
            }}
            disabled={pending}
          >
            Filter sesuai limit saya
          </Button>
        </div>
      )}

      <div className="space-y-4">
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
            className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm sm:h-9"
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
            className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm sm:h-9"
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
            className="mt-1 h-11 w-full rounded-md border bg-background px-3 text-sm sm:h-9"
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
              inputMode="numeric"
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
              inputMode="numeric"
              defaultValue={current.maxPrice}
              placeholder="∞"
              onBlur={(e) => push({ maxPrice: e.currentTarget.value })}
              className="mt-1"
            />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile trigger — sticky chip-style bar */}
      <div className="sticky top-16 z-20 -mx-4 mb-4 flex items-center gap-2 border-b bg-background/95 px-4 py-2 backdrop-blur lg:hidden">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setOpen(true)}
          className="gap-1"
        >
          <Filter className="h-4 w-4" />
          Filter
          {activeCount > 0 && (
            <Badge variant="accent" className="ml-1 h-5 min-w-5 justify-center px-1.5 text-[10px]">
              {activeCount}
            </Badge>
          )}
        </Button>
        {hasAny && (
          <button
            onClick={clearAll}
            disabled={pending}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
        {approvedLimit && (
          <button
            onClick={applyAIMatch}
            disabled={pending}
            className="ml-auto flex items-center gap-1 rounded-full border border-accent/40 bg-accent/5 px-2.5 py-1 text-[11px] font-medium text-accent"
          >
            <Sparkles className="h-3 w-3" /> Sesuai limit
          </button>
        )}
      </div>

      {/* Desktop sidebar */}
      <Card className="sticky top-20 hidden h-fit space-y-5 p-5 lg:block">
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
        {FilterBody}
      </Card>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl bg-background pb-[max(env(safe-area-inset-bottom),1rem)] shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-background px-4 py-3">
              <div className="flex items-center gap-2 font-semibold">
                <Filter className="h-4 w-4" /> Filter
                {activeCount > 0 && (
                  <Badge variant="accent" className="h-5 min-w-5 justify-center px-1.5 text-[10px]">
                    {activeCount}
                  </Badge>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Tutup"
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-5 p-4">{FilterBody}</div>
            <div className="sticky bottom-0 flex gap-2 border-t bg-background px-4 py-3">
              {hasAny && (
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    clearAll();
                    setOpen(false);
                  }}
                  disabled={pending}
                >
                  Reset
                </Button>
              )}
              <Button className="flex-1" onClick={() => setOpen(false)}>
                Lihat hasil
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
