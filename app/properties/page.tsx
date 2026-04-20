import { Suspense } from "react";
import { PropertyCard } from "@/components/property-card";
import { PropertyFilters } from "@/components/property-filters";
import { SessionAwareBanner } from "@/components/session-aware-banner";
import {
  listProperties,
  listCities,
  type PropertyCategory,
  type PropertyType,
} from "@/lib/data/properties";
import { Badge } from "@/components/ui/badge";

type SP = Record<string, string | string[] | undefined>;

function pick(sp: SP, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;

  const maxPriceParam = pick(sp, "maxPrice");
  const minPriceParam = pick(sp, "minPrice");
  const city = pick(sp, "city") ?? "all";
  const category = (pick(sp, "category") ?? "all") as PropertyCategory | "all";
  const propertyType = (pick(sp, "type") ?? "all") as PropertyType | "all";
  const search = pick(sp, "q") ?? "";

  const [items, cities] = await Promise.all([
    listProperties({
      maxPrice: maxPriceParam ? Number(maxPriceParam) : undefined,
      minPrice: minPriceParam ? Number(minPriceParam) : undefined,
      city,
      category,
      propertyType,
      search,
    }),
    listCities(),
  ]);

  const hasFilter =
    !!maxPriceParam ||
    !!minPriceParam ||
    (city && city !== "all") ||
    (category && category !== "all") ||
    (propertyType && propertyType !== "all") ||
    !!search;

  return (
    <div className="container py-10">
      {/* Session banner (shows approved limit if user has done pre-approval) */}
      <Suspense fallback={null}>
        <SessionAwareBanner />
      </Suspense>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-accent text-accent">
            Katalog Properti
          </Badge>
          <h1 className="text-3xl font-bold md:text-4xl">
            {items.length} properti {hasFilter ? "sesuai filter" : "aktif"}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Dari subsidi FLPP sampai ultra-luxury — AI bantu pilih sesuai limit kamu.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[280px_1fr]">
        <PropertyFilters cities={cities} />
        <div>
          {items.length === 0 ? (
            <div className="rounded-xl border bg-muted/30 p-10 text-center text-sm text-muted-foreground">
              Tidak ada properti yang cocok dengan filter. Coba ubah rentang harga atau kota.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {items.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
