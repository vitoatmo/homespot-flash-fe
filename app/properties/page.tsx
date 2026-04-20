import { PropertyCard } from "@/components/property-card";
import { properties } from "@/lib/data/properties";
import { Badge } from "@/components/ui/badge";

export default function PropertiesPage() {
  return (
    <div className="container py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="mb-2 border-accent text-accent">Katalog Properti</Badge>
          <h1 className="text-3xl font-bold md:text-4xl">{properties.length} properti VR-ready</h1>
          <p className="mt-2 text-muted-foreground">
            Tur virtual dulu, tahu limitmu dulu, commit di satu sesi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <Badge variant="accent">Tier 1</Badge>
          <Badge variant="secondary">Tier 2</Badge>
          <Badge variant="success">Pre-approved eligible</Badge>
        </div>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((p) => <PropertyCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
