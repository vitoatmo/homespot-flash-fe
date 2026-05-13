import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PropertyCard } from "@/components/property-card";
import { listProperties } from "@/lib/data/properties";
import { Row } from "@/components/molecules/row";
import {
  Zap, Brain, Glasses, PenSquare, Clock, ShieldCheck,
  CheckCircle2, ArrowRight, Sparkles,
} from "lucide-react";

export default async function HomePage() {
  const all = await listProperties();
  const total = all.length;
  const vrReady = all.filter((p) => p.hasVR).length;
  const vrPct = total > 0 ? Math.round((vrReady / total) * 100) : 0;

  // Smart featured: 1 luxury + 1 mid-range + 1 starter (tier-diverse), all VR-ready
  const vrOnly = all.filter((p) => p.hasVR);
  const sortedHi = [...vrOnly].sort((a, b) => b.price - a.price);
  const sortedLo = [...vrOnly].sort((a, b) => a.price - b.price);
  const luxury = sortedHi[0];
  const starter = sortedLo[0];
  const midPool = vrOnly.filter((p) => p.id !== luxury?.id && p.id !== starter?.id);
  const mid = midPool[Math.floor(midPool.length / 2)];
  const pick = [luxury, mid, starter].filter(Boolean);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0a5ba8] text-primary-foreground">
        <div className="container relative grid gap-8 py-10 sm:py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-4 sm:space-y-6">
            <Badge variant="accent" className="gap-1">
              <Sparkles className="h-3 w-3" /> Powered by AI + VR
            </Badge>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Beli rumah selesai <span className="text-accent">hari ini</span>.<br />
              Approval KPR dalam <span className="underline decoration-accent">1 jam</span>.
            </h1>
            <p className="max-w-xl text-base text-white/85 sm:text-lg">
              Homespot Flash Service menggabungkan AI pre-approval, tur properti VR, dan e-SPH
              digital dalam satu sesi. Tidak ada lagi nunggu berhari-hari.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
              <Button size="lg" variant="accent" className="w-full sm:w-auto" asChild>
                <Link href="/pre-approval">
                  Cek Limit Saya <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white bg-transparent text-white hover:bg-white hover:text-primary sm:w-auto"
                asChild
              >
                <Link href="/properties">Lihat Properti</Link>
              </Button>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-2 text-sm sm:flex sm:flex-wrap sm:gap-4 sm:pt-4">
              <Metric label="Pre-approval" value="< 60s" longValue="< 60 detik" />
              <Metric label="Properti" value={`${total}+`} />
              <Metric label="VR Ready" value={`${vrPct}%`} />
            </div>
          </div>
          <div className="relative">
            <div className="absolute -right-6 -top-6 hidden h-72 w-72 rounded-full bg-accent/30 blur-3xl md:block" />
            <Card className="relative overflow-hidden rounded-2xl border-white/20 bg-white/95 p-4 text-foreground shadow-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[11px] text-muted-foreground sm:text-xs">AI Pre-Approval Hasil</div>
                  <div className="truncate text-xl font-bold text-primary sm:text-2xl">Rp 2.000.000.000</div>
                </div>
                <Badge variant="success" className="shrink-0 gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Green
                </Badge>
              </div>
              <div className="space-y-2.5 sm:space-y-3">
                <Row label="Tenor maksimal" value="20 tahun" />
                <Row label="Estimasi bunga" value="6.75% p.a." />
                <Row label="Estimasi cicilan" value="Rp 15.2 jt / bln" />
                <Row label="Skor" value="87/100" />
              </div>
              <div className="mt-4 rounded-lg bg-secondary p-3 text-xs">
                <div className="font-medium">Alasan utama</div>
                <ul className="ml-4 mt-1 list-disc text-muted-foreground">
                  <li>Riwayat SLIK lancar 24 bulan</li>
                  <li>DTI 28% — sehat</li>
                  <li>Masa kerja 5 tahun</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* KNOW - FEEL - DECIDE */}
      <section className="container py-10 sm:py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-3 border-accent text-accent">Framework</Badge>
          <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">
            KNOW <span className="text-muted-foreground">→</span> FEEL <span className="text-muted-foreground">→</span> DECIDE
          </h2>
          <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
            Tiga fase terintegrasi yang mengubah 11–16 hari proses KPR menjadi satu sesi.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 md:grid-cols-3">
          <Pillar
            icon={<Brain className="h-6 w-6" />}
            phase="KNOW"
            title="AI Pre-Approval"
            desc="Kejelasan finansial real-time via Open Banking + SLIK. Tahu limit kamu sebelum mulai tur properti."
          />
          <Pillar
            icon={<Glasses className="h-6 w-6" />}
            phase="FEEL"
            title="VR Property Tour"
            desc="Walk-through unit dan lingkungan sekitar tanpa perlu datang fisik. Cukup browser + HP."
          />
          <Pillar
            icon={<PenSquare className="h-6 w-6" />}
            phase="DECIDE"
            title="One-Session Commitment"
            desc="Dari pilih properti, pre-approval, apply, sampai e-SPH — selesai dalam satu sesi."
          />
        </div>
      </section>

      {/* WHY FLASH */}
      <section className="bg-bri-light py-10 sm:py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Kenapa harus Flash?</h2>
            <p className="mt-2 text-sm text-muted-foreground sm:mt-3 sm:text-base">
              Tanpa Flash Service, 1 dari 5 pengajuan batal karena proses terlalu lama.
            </p>
          </div>
          <div className="mt-6 grid gap-4 sm:mt-10 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Feat icon={<Clock className="h-5 w-5" />} title="11–16 hari → < 1 hari" desc="Reduksi SLA > 80% untuk nasabah fixed income & HNWI." />
            <Feat icon={<Zap className="h-5 w-5" />} title="Pre-approval < 60 detik" desc="AI scoring di atas data Open Banking + SLIK." />
            <Feat icon={<Glasses className="h-5 w-5" />} title="Tur tanpa datang" desc="VR / 360° cukup dari browser HP, tidak butuh headset." />
            <Feat icon={<ShieldCheck className="h-5 w-5" />} title="Patuh OJK & UU PDP" desc="Explainable AI, consent eksplisit, audit trail lengkap." />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-10 sm:py-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl md:text-4xl">Properti Pilihan</h2>
            <p className="mt-1.5 text-sm text-muted-foreground sm:mt-2 sm:text-base">
              Tier-1 developer · VR ready · pre-approved eligible
            </p>
          </div>
          <Button variant="outline" size="sm" className="sm:size-default" asChild>
            <Link href="/properties">Lihat semua <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-5 grid gap-4 sm:mt-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {pick.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="container pb-10 sm:pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-5 py-8 text-primary-foreground sm:px-8 sm:py-12 md:px-16">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid items-center gap-4 sm:gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-xl font-bold sm:text-2xl md:text-3xl">Mulai dari cek limit, 60 detik.</h3>
              <p className="mt-2 text-sm text-white/80 sm:text-base">
                Data kamu tetap aman — consent eksplisit sesuai standar SNAP-BI dan UU PDP.
              </p>
            </div>
            <Button size="lg" variant="accent" className="w-full sm:w-auto" asChild>
              <Link href="/pre-approval">Cek Limit Sekarang <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value, longValue }: { label: string; value: string; longValue?: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-2.5 py-2 backdrop-blur sm:px-4">
      <div className="text-[10px] text-white/70 sm:text-xs">{label}</div>
      <div className="text-sm font-semibold sm:text-base">
        <span className="sm:hidden">{value}</span>
        <span className="hidden sm:inline">{longValue ?? value}</span>
      </div>
    </div>
  );
}

function Pillar({ icon, phase, title, desc }: { icon: React.ReactNode; phase: string; title: string; desc: string }) {
  return (
    <Card className="p-5 transition-all sm:p-6 sm:hover:-translate-y-1 sm:hover:shadow-md">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary sm:h-12 sm:w-12">
        {icon}
      </div>
      <div className="mt-4 text-xs font-bold tracking-wider text-accent">{phase}</div>
      <h3 className="mt-1 text-lg font-semibold sm:text-xl">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}

function Feat({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">{icon}</div>
      <div className="mt-3 text-sm font-semibold sm:text-base">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}
