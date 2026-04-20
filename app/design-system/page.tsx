import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = { title: "Design System — Homespot Flash" };

export default function DesignSystemPage() {
  return (
    <div className="container max-w-6xl py-10">
      <Badge variant="outline" className="border-accent text-accent">Thesis Appendix</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Design System</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Token, tipografi, dan komponen yang dipakai di prototype Homespot Flash Service.
        Fondasi visual yang konsisten — penting untuk trust di produk finansial.
      </p>

      {/* Color tokens */}
      <Section title="1. Color Tokens" desc="Palet BRI + semantic state. HSL-based untuk kemudahan theming.">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Swatch name="primary" hsl="211 100% 24%" hex="#003D79" usage="Brand utama, CTA kunci" />
          <Swatch name="accent" hsl="22 91% 54%" hex="#F37021" usage="Highlight, aksen thesis" />
          <Swatch name="emerald-600" hsl="160 84% 39%" hex="#059669" usage="Success, Green triage" />
          <Swatch name="amber-500" hsl="38 92% 50%" hex="#F59E0B" usage="Warning, Amber triage" />
          <Swatch name="red-600" hsl="0 84% 60%" hex="#DC2626" usage="Destructive, Red triage" />
          <Swatch name="muted" hsl="210 40% 96%" hex="#F1F5F9" usage="Background section, card alt" />
          <Swatch name="border" hsl="214 32% 91%" hex="#E2E8F0" usage="Divider, outline input" />
          <Swatch name="foreground" hsl="222 47% 11%" hex="#0F172A" usage="Body text, headline" />
        </div>
      </Section>

      {/* Typography */}
      <Section title="2. Typography" desc="System font — fokus readability, bukan brand typography (prototype).">
        <div className="space-y-4 rounded-xl border bg-white p-6">
          <TypeRow label="Display (4xl / bold)" className="text-4xl font-bold">Homespot Flash</TypeRow>
          <TypeRow label="H1 (3xl / bold)" className="text-3xl font-bold">AI Pre-Approval</TypeRow>
          <TypeRow label="H2 (2xl / semibold)" className="text-2xl font-semibold">KNOW · FEEL · DECIDE</TypeRow>
          <TypeRow label="H3 (xl / semibold)" className="text-xl font-semibold">Cek limit kilat</TypeRow>
          <TypeRow label="Body (base)" className="text-base">Kejelasan finansial sebelum kamu lihat properti. Hasil dalam kurang dari 60 detik.</TypeRow>
          <TypeRow label="Small / muted (sm)" className="text-sm text-muted-foreground">Pre-approval indikatif, berlaku 30 hari.</TypeRow>
          <TypeRow label="Caption (xs)" className="text-xs text-muted-foreground">Enkripsi TLS 1.3 · audit trail lengkap</TypeRow>
        </div>
      </Section>

      {/* Spacing & radius */}
      <Section title="3. Spacing & Radius" desc="Grid 4px · radius lembut (0.75rem) untuk tone finansial modern.">
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="p-6">
            <div className="text-sm font-semibold">Spacing scale</div>
            <div className="mt-4 space-y-2">
              {[2, 4, 6, 8, 12, 16, 24].map((n) => (
                <div key={n} className="flex items-center gap-3">
                  <div className="w-16 text-xs text-muted-foreground">p-{n} ({n * 4}px)</div>
                  <div className="h-3 bg-primary/20" style={{ width: `${n * 8}px` }} />
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6">
            <div className="text-sm font-semibold">Radius scale</div>
            <div className="mt-4 flex flex-wrap gap-3">
              {[{ r: "sm", px: 4 }, { r: "md", px: 6 }, { r: "lg", px: 8 }, { r: "xl", px: 12 }, { r: "2xl", px: 16 }].map((x) => (
                <div key={x.r} className="flex flex-col items-center gap-1">
                  <div className="h-14 w-14 bg-primary/20" style={{ borderRadius: x.px }} />
                  <div className="text-xs text-muted-foreground">{x.r}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </Section>

      {/* Components */}
      <Section title="4. Components" desc="Primitives dari shadcn/ui, customized untuk brand BRI.">
        <Tabs defaultValue="buttons" className="mt-2">
          <TabsList>
            <TabsTrigger value="buttons">Buttons</TabsTrigger>
            <TabsTrigger value="badges">Badges</TabsTrigger>
            <TabsTrigger value="inputs">Inputs</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="buttons">
            <Card className="p-6">
              <div className="flex flex-wrap gap-3">
                <Button>Primary</Button>
                <Button variant="accent">Accent</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="destructive">Destructive</Button>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button size="sm">Small</Button>
                <Button>Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="badges">
            <Card className="p-6">
              <div className="flex flex-wrap gap-3">
                <Badge>Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="accent">Accent</Badge>
                <Badge variant="success">Green · Auto-approve</Badge>
                <Badge variant="warning">Amber · Manual review</Badge>
                <Badge variant="danger">Red · Decline</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="inputs">
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label>NIK</Label>
                  <Input className="mt-1" placeholder="16 digit NIK" />
                </div>
                <div>
                  <Label>Penghasilan / bulan</Label>
                  <Input className="mt-1" defaultValue="Rp 35.000.000" />
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="feedback">
            <Card className="p-6 space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Progress bar</Label>
                <Progress value={72} className="mt-2" />
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">Separator di atas ini ↑</div>
            </Card>
          </TabsContent>
        </Tabs>
      </Section>

      {/* Usage rules */}
      <Section title="5. Usage Rules" desc="Prinsip konsistensi supaya tampilan tetap stabil di semua flow.">
        <div className="grid gap-4 md:grid-cols-2">
          <Rule ok title="DO — Primary untuk CTA utama per halaman">
            Satu CTA primary dominan per viewport supaya user tahu next step paling penting.
          </Rule>
          <Rule title="DON'T — 3+ CTA primary dalam satu card">
            Kalau semua kelihatan penting, tidak ada yang penting. Gunakan outline / ghost untuk sekunder.
          </Rule>
          <Rule ok title="DO — Badge Green/Amber/Red = triage CLF">
            Semantic konsisten: hijau approve, kuning review manual, merah decline.
          </Rule>
          <Rule title="DON'T — Pakai merah untuk notifikasi biasa">
            Merah eksklusif untuk destructive / declined state.
          </Rule>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-2xl font-semibold">{title}</h2>
      {desc && <p className="mt-1 text-sm text-muted-foreground">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Swatch({ name, hsl, hex, usage }: { name: string; hsl: string; hex: string; usage: string }) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className="h-20" style={{ background: `hsl(${hsl})` }} />
      <div className="p-3">
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-sm font-semibold">{name}</div>
          <div className="font-mono text-xs text-muted-foreground">{hex}</div>
        </div>
        <div className="mt-1 text-xs text-muted-foreground">{usage}</div>
      </div>
    </div>
  );
}

function TypeRow({ label, className, children }: { label: string; className: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b pb-3 last:border-b-0 last:pb-0 md:flex-row md:items-baseline md:gap-6">
      <div className="w-52 shrink-0 text-xs font-mono text-muted-foreground">{label}</div>
      <div className={className}>{children}</div>
    </div>
  );
}

function Rule({ ok, title, children }: { ok?: boolean; title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <div className="flex items-start gap-2">
        <span className={`mt-0.5 rounded px-2 py-0.5 text-xs font-semibold ${ok ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
          {ok ? "DO" : "DON'T"}
        </span>
      </div>
      <div className="mt-2 font-semibold">{title}</div>
      <div className="mt-1 text-sm text-muted-foreground">{children}</div>
    </Card>
  );
}
