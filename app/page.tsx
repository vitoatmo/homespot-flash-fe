import Link from "next/link";
import Image from "next/image";
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
  const featured = await listProperties();
  const pick = featured.slice(0, 3);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-[#0a5ba8] text-primary-foreground">
        <div className="container relative grid gap-10 py-16 md:grid-cols-2 md:py-24">
          <div className="space-y-6">
            <Badge variant="accent" className="gap-1">
              <Sparkles className="h-3 w-3" /> Powered by AI + VR
            </Badge>
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Beli rumah selesai <span className="text-accent">hari ini</span>.<br />
              Approval KPR dalam <span className="underline decoration-accent">1 jam</span>.
            </h1>
            <p className="max-w-xl text-lg text-white/85">
              Homespot Flash Service menggabungkan AI pre-approval, tur properti VR, dan e-SPH
              digital dalam satu sesi. Tidak ada lagi nunggu berhari-hari.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" variant="accent" asChild>
                <Link href="/pre-approval">
                  Cek Limit Saya <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-primary" asChild>
                <Link href="/properties">Lihat Properti</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-4 pt-4 text-sm">
              <Metric label="Pre-approval" value="< 60 detik" />
              <Metric label="SLA end-to-end" value="< 1 hari kerja" />
              <Metric label="Properti VR Ready" value="60%+" />
            </div>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -right-6 -top-6 h-72 w-72 rounded-full bg-accent/30 blur-3xl" />
            <Card className="relative overflow-hidden rounded-2xl border-white/20 bg-white/95 p-6 text-foreground shadow-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">AI Pre-Approval Hasil</div>
                  <div className="text-2xl font-bold text-primary">Rp 2.000.000.000</div>
                </div>
                <Badge variant="success" className="gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Green
                </Badge>
              </div>
              <div className="space-y-3">
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
      <section className="container py-16">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="outline" className="mb-3 border-accent text-accent">Framework</Badge>
          <h2 className="text-3xl font-bold md:text-4xl">
            KNOW <span className="text-muted-foreground">→</span> FEEL <span className="text-muted-foreground">→</span> DECIDE
          </h2>
          <p className="mt-3 text-muted-foreground">
            Tiga fase terintegrasi yang mengubah 11–16 hari proses KPR menjadi satu sesi.
          </p>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
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
      <section className="bg-bri-light py-16">
        <div className="container">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold md:text-4xl">Kenapa harus Flash?</h2>
            <p className="mt-3 text-muted-foreground">
              Tanpa Flash Service, 1 dari 5 pengajuan batal karena proses terlalu lama.
            </p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Feat icon={<Clock className="h-5 w-5" />} title="11–16 hari → < 1 hari" desc="Reduksi SLA > 80% untuk nasabah fixed income & HNWI." />
            <Feat icon={<Zap className="h-5 w-5" />} title="Pre-approval < 60 detik" desc="AI scoring di atas data Open Banking + SLIK." />
            <Feat icon={<Glasses className="h-5 w-5" />} title="Tur tanpa datang" desc="VR / 360° cukup dari browser HP, tidak butuh headset." />
            <Feat icon={<ShieldCheck className="h-5 w-5" />} title="Patuh OJK & UU PDP" desc="Explainable AI, consent eksplisit, audit trail lengkap." />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES */}
      <section className="container py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold md:text-4xl">Properti Pilihan</h2>
            <p className="mt-2 text-muted-foreground">Tier-1 developer · VR ready · pre-approved eligible</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/properties">Lihat semua <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {pick.map((p) => <PropertyCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="container pb-16">
        <div className="relative overflow-hidden rounded-2xl bg-primary px-8 py-12 text-primary-foreground md:px-16">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative grid items-center gap-6 md:grid-cols-[1fr_auto]">
            <div>
              <h3 className="text-2xl font-bold md:text-3xl">Mulai dari cek limit, 60 detik.</h3>
              <p className="mt-2 text-white/80">
                Data kamu tetap aman — consent eksplisit sesuai standar SNAP-BI dan UU PDP.
              </p>
            </div>
            <Button size="lg" variant="accent" asChild>
              <Link href="/pre-approval">Cek Limit Sekarang <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white/10 px-4 py-2 backdrop-blur">
      <div className="text-xs text-white/70">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  );
}

function Pillar({ icon, phase, title, desc }: { icon: React.ReactNode; phase: string; title: string; desc: string }) {
  return (
    <Card className="p-6 transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="mt-4 text-xs font-bold tracking-wider text-accent">{phase}</div>
      <h3 className="mt-1 text-xl font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}

function Feat({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/15 text-accent">{icon}</div>
      <div className="mt-3 font-semibold">{title}</div>
      <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
    </Card>
  );
}
