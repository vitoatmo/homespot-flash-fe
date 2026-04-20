import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Scale, Database, Shield, Users, TrendingUp, Clock } from "lucide-react";

export const metadata = { title: "Limitations & Future Work — Homespot Flash" };

const limitations = [
  {
    icon: <Database className="h-5 w-5" />,
    area: "Data Access",
    title: "Integrasi SLIK OJK & Open Banking SNAP-BI butuh partnership resmi",
    body:
      "Prototype menggunakan dummy data untuk skor kredit dan mutasi rekening. Pipeline produksi memerlukan sertifikasi SNAP-BI + partnership bank anggota API Hub dan kontrak dengan OJK untuk akses SLIK.",
  },
  {
    icon: <Scale className="h-5 w-5" />,
    area: "Regulatori",
    title: "Auto-approval tanpa human review perlu legal clearance",
    body:
      "OJK POJK 10/2022 tentang Kredit mengatur batasan penggunaan AI dalam keputusan kredit. Flash Service mengasumsikan kategori Green auto-approve — perlu legal opinion apakah ini diperkenankan atau harus tetap ada human sign-off.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    area: "Fairness & Bias",
    title: "Model AI belum diaudit untuk fairness terhadap kelompok demografis",
    body:
      "Dataset training prototype synthetic, tidak merepresentasikan distribusi populasi Indonesia. Production butuh fairness audit (disparate impact, equal opportunity) dan pengujian bias terhadap gender, usia, geografis, serta golongan informal earner.",
  },
  {
    icon: <Users className="h-5 w-5" />,
    area: "User Research",
    title: "Sampel quali belum menjangkau informal earner & freelancer",
    body:
      "Interview n=3 saat ini fokus pada fixed-income salaried. KPR rate-outcome bisa berbeda signifikan untuk gig worker, UMKM, atau keluarga single-income — segmen ini justru target besar pasar digital housing.",
  },
  {
    icon: <TrendingUp className="h-5 w-5" />,
    area: "Business Model",
    title: "Unit economics VR content acquisition belum dihitung",
    body:
      "VR tour menambah friction untuk developer onboarding. Biaya capture per unit (Matterport/kamera 360) vs conversion uplift belum di-benchmark. Perlu pilot dengan 1 developer Tier-1 untuk validate ROI.",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    area: "SLA Realitas",
    title: "Klaim 'pre-approval < 60 detik' belum diuji di infrastruktur bank",
    body:
      "Latensi inferensi model + call API SLIK + Open Banking + appraisal otomatis dalam satu rantai belum di-benchmark di stack BRI. Figures prototype adalah simulasi UI, bukan load test nyata.",
  },
];

const futureWork = [
  {
    horizon: "Short-term (3–6 bulan)",
    items: [
      "Pilot partnership 1 bank anggota SNAP-BI untuk validate skor → approval mapping",
      "Fairness audit model LightGBM v1 pada dataset semi-riil (150 kasus interviewee + synthetic augmented)",
      "UX testing dengan 10 calon pembeli KPR (quanti survey TAM + SERVQUAL post-usability)",
    ],
  },
  {
    horizon: "Mid-term (6–12 bulan)",
    items: [
      "Legal opinion OJK compliance untuk auto-approval Green tier",
      "Business case VR acquisition: ROI model dengan 3 developer Tier-1 sebagai pilot",
      "Extension ke segmen informal earner — alternative scoring pakai open banking behavior signal",
    ],
  },
  {
    horizon: "Long-term (12+ bulan)",
    items: [
      "Production deployment dengan continuous fairness monitoring + drift detection",
      "Cross-bank interoperability — bukan cuma BRI, tapi lintas lender di platform yang sama",
      "Integration dengan PPJB digital + BPN untuk end-to-end property + mortgage closing",
    ],
  },
];

export default function LimitationsPage() {
  return (
    <div className="container max-w-5xl py-10">
      <Badge variant="outline" className="border-accent text-accent">Thesis Chapter — Limitations</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Limitations & Future Work</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Prototype ini adalah proof-of-concept visual — bukan sistem produksi. Berikut keterbatasan yang ditemukan
        saat eksplorasi + roadmap riset lanjut untuk mematangkan konsep Flash Service.
      </p>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-semibold">Catatan transparansi</div>
            <div className="mt-1">
              Klaim kuantitatif (sub-60 detik approval, skor 87, plafon Rp 2M) di prototype adalah nilai simulasi untuk demo —
              belum divalidasi di infrastruktur produksi atau di uji dengan data riil pengguna.
            </div>
          </div>
        </div>
      </div>

      {/* Limitations grid */}
      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {limitations.map((l) => (
          <Card key={l.area} className="p-5">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                {l.icon}
              </div>
              <Badge variant="outline" className="text-xs">{l.area}</Badge>
            </div>
            <h3 className="mt-3 font-semibold leading-snug">{l.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{l.body}</p>
          </Card>
        ))}
      </div>

      {/* Future work */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold">Roadmap Penelitian Lanjutan</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tiga horison untuk mematangkan Flash Service dari konsep → produksi → ekosistem.
        </p>
        <div className="mt-6 space-y-4">
          {futureWork.map((w) => (
            <Card key={w.horizon} className="p-6">
              <div className="flex items-center gap-2">
                <Badge variant="accent">{w.horizon}</Badge>
              </div>
              <Separator className="my-4" />
              <ul className="space-y-3 text-sm">
                {w.items.map((it) => (
                  <li key={it} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    <span className="leading-relaxed">{it}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Closing */}
      <Card className="mt-10 p-6">
        <h2 className="font-semibold">Penutup</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Keterbatasan di atas bukan kegagalan — justru menjadi kontribusi thesis ini:{" "}
          <span className="font-semibold text-foreground">
            memetakan area di mana inovasi KPR berbasis AI butuh kolaborasi lintas domain
          </span>{" "}
          (teknologi, regulasi, bisnis, hukum, customer research). Flash Service memberikan kerangka percakapan
          yang konkret untuk diskusi tersebut.
        </p>
      </Card>
    </div>
  );
}
