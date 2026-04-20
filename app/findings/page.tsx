import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, CheckCircle2, ArrowRight, Clock, FileText, Search } from "lucide-react";

export const metadata = { title: "Findings — Homespot Flash" };

// Data yang bisa Vito isi setelah audit homespot.id
const painPoints = [
  {
    area: "Discovery",
    existing: "Filter listing terbatas (lokasi, harga) · tidak ada indikator afordabilitas per user",
    flash: "Pre-approval dulu → listing otomatis filter by plafon kamu",
    gap: "Butuh validasi: apakah user mau commit cek limit sebelum lihat properti?",
  },
  {
    area: "KPR Application",
    existing: "Redirect ke form BRI / bank · upload dokumen manual (KTP, NPWP, slip gaji, rekening)",
    flash: "Satu sesi · auto-fill dari consent (SLIK + Open Banking) · e-sign PeruriSign",
    gap: "Open Banking SNAP-BI butuh partnership bank — scope integrasi belum jelas di real-world",
  },
  {
    area: "Property Tour",
    existing: "Foto galeri + kadang-kadang video walk-through di event tertentu · belum ada VR 360",
    flash: "VR 360 viewer per listing Tier-1 · remote inspection",
    gap: "Biaya produksi VR per unit mahal — developer mana yang willing invest?",
  },
  {
    area: "Approval Timeline",
    existing: "3–7 hari (SLIK check manual, appraisal fisik, review analyst level 1–3)",
    flash: "< 60 detik pre-approval · SLA 8 jam untuk decision final",
    gap: "Asumsi auto-approval untuk kasus Green — butuh validasi apakah OJK izinkan tanpa human review sama sekali",
  },
  {
    area: "Trust & Transparency",
    existing: "User ga tahu kenapa ditolak · rasio approval tidak transparan",
    flash: "SHAP explainability · top reasons per keputusan · appeal flow via CLF",
    gap: "Explainability AI vs kerahasiaan scoring model bank — ada tension regulatori",
  },
];

const methodology = [
  { label: "Audit situs homespot.id existing", status: "pending" as const },
  { label: "Walkthrough alur pendaftaran KPR BRI eksisting", status: "pending" as const },
  { label: "Interview 3 calon pembeli KPR (quali)", status: "done" as const },
  { label: "Survey kuantitatif TAM + SERVQUAL (n=150)", status: "pending" as const },
  { label: "Prototype Flash Service (build + click-through)", status: "done" as const },
];

export default function FindingsPage() {
  return (
    <div className="container max-w-5xl py-10">
      <Badge variant="outline" className="border-accent text-accent">Thesis Exploration</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Findings: Existing vs Flash</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Hasil eksplorasi pengalaman existing (homespot.id + alur KPR BRI) dibandingkan dengan desain Flash Service.
        Setiap area mencatat pain point, usulan solusi, dan gap yang masih butuh penelitian lanjut.
      </p>

      {/* Methodology */}
      <Card className="mt-8 p-6">
        <h2 className="flex items-center gap-2 font-semibold">
          <Search className="h-4 w-4 text-primary" /> Metodologi Eksplorasi
        </h2>
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {methodology.map((m) => (
            <li key={m.label} className="flex items-start gap-2 text-sm">
              {m.status === "done" ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              ) : (
                <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
              )}
              <span>{m.label}</span>
            </li>
          ))}
        </ul>
      </Card>

      {/* Pain point table */}
      <div className="mt-10 space-y-4">
        <h2 className="text-2xl font-semibold">Pain Points per Area</h2>
        <p className="text-sm text-muted-foreground">
          Format: <span className="font-semibold">Existing</span> → <span className="font-semibold">Flash proposal</span> → <span className="font-semibold">Gap yang ketemu saat develop</span>.
        </p>

        {painPoints.map((p) => (
          <Card key={p.area} className="p-6">
            <div className="flex items-center gap-2">
              <Badge variant="accent">{p.area}</Badge>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Column
                label="Existing (homespot.id / KPR BRI)"
                icon={<AlertTriangle className="h-4 w-4 text-amber-500" />}
                text={p.existing}
              />
              <Column
                label="Flash Service"
                icon={<ArrowRight className="h-4 w-4 text-primary" />}
                text={p.flash}
              />
              <Column
                label="Gap / Butuh Riset Lanjut"
                icon={<FileText className="h-4 w-4 text-accent" />}
                text={p.gap}
                accent
              />
            </div>
          </Card>
        ))}
      </div>

      {/* Summary */}
      <Card className="mt-10 bg-bri-light p-6">
        <h2 className="font-semibold">Kesimpulan Eksplorasi</h2>
        <Separator className="my-4" />
        <p className="text-sm leading-relaxed">
          Prototype memvalidasi bahwa alur <span className="font-semibold">KNOW → FEEL → DECIDE</span> secara konseptual
          layak dikompresi ke satu sesi. Namun temuan saat develop menunjukkan{" "}
          <span className="font-semibold">tiga gap utama</span>: (1) ketergantungan partnership bank untuk Open Banking SNAP-BI,
          (2) biaya akuisisi konten VR per listing, dan (3) batasan regulatori OJK untuk auto-approval tanpa human review.
          Tiga gap ini menjadi dasar rekomendasi penelitian lanjutan di <span className="underline">/limitations</span>.
        </p>
      </Card>
    </div>
  );
}

function Column({
  label,
  icon,
  text,
  accent,
}: {
  label: string;
  icon: React.ReactNode;
  text: string;
  accent?: boolean;
}) {
  return (
    <div className={`rounded-lg border p-4 ${accent ? "border-accent/40 bg-accent/5" : "bg-muted/30"}`}>
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-2 text-sm leading-relaxed">{text}</div>
    </div>
  );
}
