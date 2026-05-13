// Property data access — source of truth is Supabase.
// Kept as type-only module; the old hardcoded array is removed.

import { createClient } from "@/lib/supabase/server";

// Extract Matterport model ID from any tour URL form.
function matterportThumbnail(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("matterport.com")) return null;
    let id = u.searchParams.get("m");
    if (!id) {
      const parts = u.pathname.split("/").filter(Boolean);
      if (parts[0] === "models" && parts[1]) id = parts[1];
    }
    if (!id) return null;
    return `https://my.matterport.com/api/v1/player/models/${id}/thumb?width=1280&dpr=1&disable=upscale`;
  } catch {
    return null;
  }
}

export type PropertyCategory =
  | "subsidi"
  | "starter"
  | "mid"
  | "upper_mid"
  | "premium"
  | "luxury"
  | "ultra_luxury";

export type PropertyType =
  | "rumah_tapak"
  | "apartemen"
  | "townhouse"
  | "ruko"
  | "villa"
  | "penthouse"
  | "rumah_subsidi";

export type Property = {
  id: string;              // slug used in URLs
  uuid: string;            // DB primary key
  title: string;
  developer: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  location: string;        // city
  city: string;            // province (kept backward-compat display)
  price: number;           // IDR
  bedrooms: number;
  bathrooms: number;
  landSize: number;        // m2
  buildingSize: number;    // m2
  image: string;
  hasVR: boolean;
  vrTourUrl: string | null;
  rating: number;
  features: string[];
  description: string;
  category: PropertyCategory;
  propertyType: PropertyType;
};

type DbProperty = {
  id: string;
  slug: string;
  title: string;
  developer: string;
  city: string;
  province: string;
  address: string | null;
  bedrooms: number;
  bathrooms: number;
  land_m2: number | string;
  building_m2: number | string;
  price_idr: number;
  vr_tour_url: string | null;
  hero_image_url: string | null;
  status: string;
  property_type: PropertyType;
  category: PropertyCategory;
  description: string | null;
  features: string[] | null;
  rating: number | string | null;
  tier: "Tier 1" | "Tier 2" | "Tier 3" | null;
};

function mapRow(r: DbProperty): Property {
  return {
    id: r.slug,
    uuid: r.id,
    title: r.title,
    developer: r.developer,
    tier: r.tier ?? "Tier 1",
    location: r.city,
    city: r.province,
    price: Number(r.price_idr),
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    landSize: Number(r.land_m2),
    buildingSize: Number(r.building_m2),
    image:
      r.hero_image_url ??
      matterportThumbnail(r.vr_tour_url) ??
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    hasVR: !!r.vr_tour_url,
    vrTourUrl: r.vr_tour_url ?? null,
    rating: Number(r.rating ?? 4.5),
    features: Array.isArray(r.features) ? r.features : [],
    description: r.description ?? "",
    category: r.category,
    propertyType: r.property_type,
  };
}

export type PropertyFilter = {
  maxPrice?: number;
  minPrice?: number;
  city?: string;
  category?: PropertyCategory | "all";
  propertyType?: PropertyType | "all";
  search?: string;
};

export async function listProperties(f: PropertyFilter = {}): Promise<Property[]> {
  const sb = await createClient();
  let q = sb.from("properties").select("*").order("price_idr", { ascending: true });

  if (f.maxPrice && f.maxPrice > 0) q = q.lte("price_idr", f.maxPrice);
  if (f.minPrice && f.minPrice > 0) q = q.gte("price_idr", f.minPrice);
  if (f.city && f.city !== "all") q = q.eq("city", f.city);
  if (f.category && f.category !== "all") q = q.eq("category", f.category);
  if (f.propertyType && f.propertyType !== "all") q = q.eq("property_type", f.propertyType);
  if (f.search && f.search.trim()) q = q.ilike("title", `%${f.search.trim()}%`);

  const { data, error } = await q;
  if (error || !data) return [];
  return (data as DbProperty[]).map(mapRow);
}

export async function findProperty(slug: string): Promise<Property | null> {
  const sb = await createClient();
  const { data, error } = await sb.from("properties").select("*").eq("slug", slug).maybeSingle();
  if (error || !data) return null;
  return mapRow(data as DbProperty);
}

export async function listCities(): Promise<string[]> {
  const sb = await createClient();
  const { data } = await sb.from("properties").select("city");
  const set = new Set<string>();
  (data ?? []).forEach((r: { city: string }) => set.add(r.city));
  return Array.from(set).sort();
}

export const CATEGORY_LABEL: Record<PropertyCategory, string> = {
  subsidi: "Subsidi FLPP",
  starter: "Starter",
  mid: "Mid",
  upper_mid: "Upper Mid",
  premium: "Premium",
  luxury: "Luxury",
  ultra_luxury: "Ultra Luxury",
};

export const TYPE_LABEL: Record<PropertyType, string> = {
  rumah_tapak: "Rumah Tapak",
  apartemen: "Apartemen",
  townhouse: "Townhouse",
  ruko: "Ruko",
  villa: "Villa",
  penthouse: "Penthouse",
  rumah_subsidi: "Rumah Subsidi",
};
