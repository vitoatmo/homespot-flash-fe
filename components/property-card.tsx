import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Ruler, Star, Glasses, MapPin } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import type { Property } from "@/lib/data/properties";
import { PropertyCardEligibility } from "@/components/property-card-overlay";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link href={`/properties/${p.id}`} className="block">
      <Card className="group overflow-hidden transition-all active:scale-[0.99] sm:hover:-translate-y-0.5 sm:hover:shadow-lg">
        <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-auto sm:h-52">
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-2 top-2 flex max-w-[calc(100%-3.5rem)] flex-wrap gap-1 sm:left-3 sm:top-3 sm:gap-1.5">
            <Badge variant="accent" className="text-[10px] sm:text-xs">{p.tier}</Badge>
            {p.hasVR && (
              <Badge variant="secondary" className="gap-1 bg-white/95 text-primary text-[10px] sm:text-xs">
                <Glasses className="h-3 w-3" /> VR
              </Badge>
            )}
          </div>
          <div className="absolute right-2 top-2 flex flex-col items-end gap-1 sm:right-3 sm:top-3">
            <div className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {p.rating}
            </div>
            <PropertyCardEligibility price={p.price} variant="ribbon" />
          </div>
        </div>
        <div className="space-y-2 p-3 sm:p-4">
          <div>
            <h3 className="line-clamp-1 text-sm font-semibold leading-tight sm:text-base">{p.title}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{p.developer}</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="line-clamp-1">{p.location}, {p.city}</span>
          </div>
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {p.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {p.bathrooms}</span>
            <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {p.buildingSize}m²</span>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2 pt-1 sm:pt-2">
            <div>
              <div className="text-[10px] text-muted-foreground sm:text-xs">Mulai</div>
              <div className="text-base font-bold text-primary sm:text-lg">{formatIDR(p.price)}</div>
            </div>
            <PropertyCardEligibility price={p.price} variant="footer" />
          </div>
        </div>
      </Card>
    </Link>
  );
}
