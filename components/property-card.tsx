import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bed, Bath, Ruler, Star, Glasses, MapPin } from "lucide-react";
import { formatIDR } from "@/lib/utils";
import type { Property } from "@/lib/data/properties";

export function PropertyCard({ p }: { p: Property }) {
  return (
    <Link href={`/properties/${p.id}`}>
      <Card className="group overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative h-52 w-full overflow-hidden">
          <Image
            src={p.image}
            alt={p.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute left-3 top-3 flex gap-1.5">
            <Badge variant="accent">{p.tier}</Badge>
            {p.hasVR && (
              <Badge variant="secondary" className="gap-1 bg-white/95 text-primary">
                <Glasses className="h-3 w-3" /> VR Ready
              </Badge>
            )}
          </div>
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2 py-0.5 text-xs font-medium">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            {p.rating}
          </div>
        </div>
        <div className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold leading-tight">{p.title}</h3>
              <p className="text-xs text-muted-foreground">{p.developer}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3" />
            {p.location}, {p.city}
          </div>
          <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Bed className="h-3 w-3" /> {p.bedrooms}</span>
            <span className="flex items-center gap-1"><Bath className="h-3 w-3" /> {p.bathrooms}</span>
            <span className="flex items-center gap-1"><Ruler className="h-3 w-3" /> {p.buildingSize} m²</span>
          </div>
          <div className="flex items-end justify-between pt-2">
            <div>
              <div className="text-xs text-muted-foreground">Mulai</div>
              <div className="text-lg font-bold text-primary">{formatIDR(p.price)}</div>
            </div>
            <Badge variant="success">Pre-approved eligible</Badge>
          </div>
        </div>
      </Card>
    </Link>
  );
}
