import { notFound } from "next/navigation";
import Link from "next/link";
import { findProperty, properties } from "@/lib/data/properties";
import { VRViewer } from "@/components/vr-viewer";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatIDR } from "@/lib/utils";
import { Bed, Bath, Ruler, MapPin, Star, Check, ArrowRight } from "lucide-react";

export function generateStaticParams() {
  return properties.map((p) => ({ id: p.id }));
}

export default function PropertyDetail({ params }: { params: { id: string } }) {
  const p = findProperty(params.id);
  if (!p) notFound();

  const dp = p.price * 0.2;
  const loan = p.price - dp;
  const tenor = 20 * 12;
  const rate = 6.75 / 100 / 12;
  const monthly = (loan * rate) / (1 - Math.pow(1 + rate, -tenor));

  return (
    <div className="container py-8">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/properties" className="hover:text-primary">Properti</Link>
        <span>/</span>
        <span className="text-foreground">{p.title}</span>
      </div>

      <div className="mt-4 grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex gap-2">
                  <Badge variant="accent">{p.tier}</Badge>
                  {p.hasVR && <Badge variant="secondary" className="bg-primary/10 text-primary">VR Ready</Badge>}
                </div>
                <h1 className="mt-2 text-3xl font-bold">{p.title}</h1>
                <p className="text-sm text-muted-foreground">{p.developer}</p>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {p.location}, {p.city}</span>
                  <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {p.rating}</span>
                </div>
              </div>
            </div>
          </div>

          <VRViewer image={p.image} title={p.title} />

          <Tabs defaultValue="spec">
            <TabsList>
              <TabsTrigger value="spec">Spesifikasi</TabsTrigger>
              <TabsTrigger value="features">Fasilitas</TabsTrigger>
              <TabsTrigger value="sim">Simulasi KPR</TabsTrigger>
            </TabsList>
            <TabsContent value="spec">
              <Card className="p-6">
                <div className="grid gap-6 md:grid-cols-4">
                  <Stat icon={<Bed className="h-4 w-4" />} label="Kamar tidur" value={`${p.bedrooms}`} />
                  <Stat icon={<Bath className="h-4 w-4" />} label="Kamar mandi" value={`${p.bathrooms}`} />
                  <Stat icon={<Ruler className="h-4 w-4" />} label="Luas tanah" value={`${p.landSize} m²`} />
                  <Stat icon={<Ruler className="h-4 w-4" />} label="Luas bangunan" value={`${p.buildingSize} m²`} />
                </div>
                <p className="mt-6 text-sm text-muted-foreground">{p.description}</p>
              </Card>
            </TabsContent>
            <TabsContent value="features">
              <Card className="p-6">
                <ul className="grid gap-3 md:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Check className="h-3 w-3" />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </Card>
            </TabsContent>
            <TabsContent value="sim">
              <Card className="p-6">
                <div className="grid gap-4 md:grid-cols-4">
                  <SimRow label="Harga properti" value={formatIDR(p.price)} />
                  <SimRow label="DP (20%)" value={formatIDR(dp)} />
                  <SimRow label="Plafon KPR" value={formatIDR(loan)} />
                  <SimRow label="Tenor" value="20 tahun" />
                </div>
                <div className="mt-4 rounded-xl bg-bri-light p-4">
                  <div className="text-xs text-muted-foreground">Estimasi cicilan / bulan @ 6.75%</div>
                  <div className="text-2xl font-bold text-primary">{formatIDR(monthly)}</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Bunga mengikuti program Flash BRI · bisa fixed 1–3 tahun pertama.
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sticky apply card */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="space-y-4 p-6">
            <div>
              <div className="text-xs text-muted-foreground">Harga mulai</div>
              <div className="text-3xl font-bold text-primary">{formatIDR(p.price)}</div>
            </div>
            <div className="rounded-lg bg-emerald-50 p-3 text-sm">
              <div className="font-semibold text-emerald-700">Kamu eligible pre-approved</div>
              <div className="text-emerald-600/80">Limit kamu: {formatIDR(2_000_000_000)}</div>
            </div>
            <Button size="lg" className="w-full" asChild>
              <Link href={`/apply?property=${p.id}`}>
                Apply dengan limit ini <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full" asChild>
              <Link href="/pre-approval">Re-check limit</Link>
            </Button>
            <div className="text-xs text-muted-foreground">
              Dengan klik apply, kamu setuju atas ketentuan program Flash dan izin pengecekan SLIK.
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}
function SimRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}
