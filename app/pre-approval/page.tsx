"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { dummyUser, aiScoreDummy } from "@/lib/data/user";
import { formatIDR } from "@/lib/utils";
import {
  ShieldCheck, CheckCircle2, Brain, ArrowRight, Sparkles, Clock, Lock,
} from "lucide-react";

type Step = "consent" | "scoring" | "result";

export default function PreApprovalPage() {
  const [step, setStep] = useState<Step>("consent");
  const [progress, setProgress] = useState(0);

  const startScoring = () => {
    setStep("scoring");
    let p = 0;
    const t = setInterval(() => {
      p += 10;
      setProgress(p);
      if (p >= 100) {
        clearInterval(t);
        setTimeout(() => setStep("result"), 400);
      }
    }, 220);
  };

  return (
    <div className="container max-w-4xl py-10">
      <Badge variant="outline" className="border-accent text-accent">KNOW · AI Pre-Approval</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Cek Limit Kilat</h1>
      <p className="mt-2 text-muted-foreground">
        Kejelasan finansial sebelum kamu lihat properti. Hasil dalam &lt; 60 detik.
      </p>

      <div className="mt-8">
        {step === "consent" && <ConsentStep onStart={startScoring} />}
        {step === "scoring" && <ScoringStep progress={progress} />}
        {step === "result" && <ResultStep />}
      </div>
    </div>
  );
}

function ConsentStep({ onStart }: { onStart: () => void }) {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Kami butuh izin akses data (sekali, bisa dicabut)</h2>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Sesuai standar BI SNAP &amp; UU PDP. Data dipakai hanya untuk pre-approval dan tidak disimpan tanpa izin.
      </p>
      <Separator className="my-6" />
      <div className="grid gap-4 md:grid-cols-2">
        <Consent title="SLIK OJK" desc="Riwayat kredit resmi" />
        <Consent title="Rekening BRI & Open Banking (SNAP)" desc="Pola transaksi & penghasilan" />
        <Consent title="E-wallet (opsional)" desc="GoPay, OVO, ShopeePay" />
        <Consent title="E-commerce (opsional)" desc="Tokopedia, Shopee" />
      </div>

      <Separator className="my-6" />
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nama lengkap" value={dummyUser.fullName} />
        <Field label="NIK" value={dummyUser.nik} />
        <Field label="NPWP" value={dummyUser.npwp} />
        <Field label="No. HP" value={dummyUser.phone} />
        <Field label="Perusahaan" value={dummyUser.employer} />
        <Field label="Penghasilan / bulan" value={formatIDR(dummyUser.monthlyIncome)} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Pre-filled dari profil kamu — edit jika perlu.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onStart}>
          Setuju &amp; Cek Limit <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Enkripsi TLS 1.3 · audit trail lengkap
        </div>
      </div>
    </Card>
  );
}

function ScoringStep({ progress }: { progress: number }) {
  const steps = [
    { t: 20, label: "Menarik data SLIK & Open Banking…" },
    { t: 45, label: "Memverifikasi dokumen &amp; KTP…" },
    { t: 70, label: "Menjalankan model AI (LightGBM)…" },
    { t: 95, label: "Menghitung alasan &amp; SHAP explainability…" },
    { t: 100, label: "Selesai." },
  ];
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Brain className="h-8 w-8 animate-pulse" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold">AI sedang menilai…</h2>
      <p className="text-sm text-muted-foreground">Rata-rata &lt; 60 detik.</p>
      <Progress value={progress} className="mt-6" />
      <div className="mt-4 space-y-1 text-left text-sm">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {progress >= s.t ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
            )}
            <span dangerouslySetInnerHTML={{ __html: s.label }} />
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResultStep() {
  const r = aiScoreDummy;
  const monthly = (2_000_000_000 * (6.75 / 100 / 12)) / (1 - Math.pow(1 + 6.75 / 100 / 12, -240));
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 p-6 text-white md:p-8">
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="bg-white/20 text-white">{r.confidence}</Badge>
              <div className="mt-3 text-sm text-white/80">Limit kredit kamu</div>
              <div className="text-4xl font-bold">{formatIDR(r.approvedLimit)}</div>
              <div className="mt-1 text-sm text-white/80">Tenor max {r.maxTenorMonths / 12} tahun · bunga estimasi {r.estimatedRate}%</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80">Skor AI</div>
              <div className="text-4xl font-bold">{r.scorePct}</div>
              <div className="text-xs text-white/80">/ 100</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1"><Clock className="h-4 w-4" /> 42 detik</div>
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1"><Sparkles className="h-4 w-4" /> LightGBM + SHAP</div>
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1"><ShieldCheck className="h-4 w-4" /> OJK compliant</div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          <div>
            <h3 className="font-semibold">Kenapa approved?</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {r.topReasons.map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold">Estimasi cicilan</h3>
            <div className="mt-3 rounded-lg bg-bri-light p-4">
              <div className="text-xs text-muted-foreground">Untuk plafon {formatIDR(r.approvedLimit)}</div>
              <div className="text-2xl font-bold text-primary">{formatIDR(monthly)}<span className="text-sm font-normal text-muted-foreground"> / bulan</span></div>
              <div className="mt-1 text-xs text-muted-foreground">@ 6.75% p.a. · tenor 20 tahun</div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" asChild>
                <Link href="/properties">Pilih properti <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/apply?property=grand-serenia-01">Apply langsung</Link>
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className="text-sm">
            <div className="font-semibold">Pre-approval ini bersifat indikatif &amp; berlaku 30 hari.</div>
            <div className="text-muted-foreground">
              Approval final bergantung pada appraisal properti dan review CLF untuk kasus non-green.
              AI decision ini menggunakan model terdaftar, diaudit triwulanan untuk fairness &amp; drift.
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Consent({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border p-3">
      <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded bg-emerald-100 text-emerald-600">
        <CheckCircle2 className="h-3.5 w-3.5" />
      </div>
      <div className="text-sm">
        <div className="font-medium">{title}</div>
        <div className="text-muted-foreground">{desc}</div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} className="mt-1" />
    </div>
  );
}
