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
import { formatIDR } from "@/lib/utils";
import { saveSessionApplicant } from "@/lib/session-data";
import {
  ShieldCheck, CheckCircle2, Brain, ArrowRight, Sparkles, Clock, Lock,
  AlertTriangle, RefreshCw, User,
} from "lucide-react";

type Step = "consent" | "scoring" | "result" | "error";

type ScoreResult = {
  score: number;
  approved_limit_idr: number;
  max_tenor_months: number;
  estimated_rate: number;
  tier: "Green" | "Amber" | "Red";
  confidence: "Green" | "Amber" | "Red";
  top_reasons: string[];
  monthly_installment_idr: number;
  dti_ratio_pct: number;
  latency_ms: number;
  model: string;
  application_code?: string;
};

type FormState = {
  fullName: string;
  nik: string;
  npwp: string;
  phone: string;
  employer: string;
  position: string;
  age: number;
  yearsEmployed: number;
  monthlyIncome: number;
  existingDebt: number;
};

const emptyForm: FormState = {
  fullName: "",
  nik: "",
  npwp: "",
  phone: "",
  employer: "",
  position: "",
  age: 0,
  yearsEmployed: 0,
  monthlyIncome: 0,
  existingDebt: 0,
};

export default function PreApprovalPage() {
  const [step, setStep] = useState<Step>("consent");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ScoreResult | null>(null);
  const [error, setError] = useState<string>("");
  const [form, setForm] = useState<FormState>(emptyForm);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // Validation: minimum required fields
  const isValid =
    form.fullName.trim().length >= 2 &&
    form.monthlyIncome > 0 &&
    form.age > 0 &&
    form.yearsEmployed >= 0;

  const runScoring = async () => {
    if (!isValid) return;
    setStep("scoring");
    setProgress(0);
    setError("");

    let p = 0;
    const ticker = setInterval(() => {
      p += 8;
      setProgress(Math.min(p, 92));
      if (p >= 92) clearInterval(ticker);
    }, 180);

    try {
      const res = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.fullName,
          nik: form.nik || undefined,
          npwp: form.npwp || undefined,
          phone: form.phone || undefined,
          monthlyIncome: form.monthlyIncome,
          yearsEmployed: form.yearsEmployed,
          age: form.age,
          existingMonthlyDebt: form.existingDebt,
          employer: form.employer || undefined,
          position: form.position || undefined,
          persist: true,
        }),
      });

      clearInterval(ticker);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const data: ScoreResult = await res.json();
      setProgress(100);
      setResult(data);

      // Persist to sessionStorage so /apply & /status can prefill from real user input
      saveSessionApplicant({
        fullName: form.fullName,
        nik: form.nik,
        npwp: form.npwp,
        phone: form.phone,
        employer: form.employer,
        position: form.position,
        age: form.age,
        yearsEmployed: form.yearsEmployed,
        monthlyIncome: form.monthlyIncome,
        existingDebt: form.existingDebt,
        score: {
          score: data.score,
          approved_limit_idr: data.approved_limit_idr,
          max_tenor_months: data.max_tenor_months,
          estimated_rate: data.estimated_rate,
          tier: data.tier,
          confidence: data.confidence,
          top_reasons: data.top_reasons,
          monthly_installment_idr: data.monthly_installment_idr,
          dti_ratio_pct: data.dti_ratio_pct,
          application_code: data.application_code,
        },
      });

      setTimeout(() => setStep("result"), 400);
    } catch (e: unknown) {
      clearInterval(ticker);
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
      setStep("error");
    }
  };

  const fillDemo = () => {
    setForm({
      fullName: "Vito Atmo",
      nik: "3175061509910001",
      npwp: "12.345.678.9-012.345",
      phone: "+62 812 3456 7890",
      employer: "PT Kreatif Digital Indonesia",
      position: "Senior Digital Marketing Strategist",
      age: 34,
      yearsEmployed: 5,
      monthlyIncome: 35000000,
      existingDebt: 0,
    });
  };

  const resetForm = () => setForm(emptyForm);

  return (
    <div className="container max-w-4xl py-10">
      <Badge variant="outline" className="border-accent text-accent">KNOW · AI Pre-Approval</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Cek Limit Kilat</h1>
      <p className="mt-2 text-muted-foreground">
        Kejelasan finansial sebelum kamu lihat properti. Hasil dalam &lt; 60 detik — powered by Groq LPU + Llama 3.3 70B.
      </p>

      <div className="mt-8">
        {step === "consent" && (
          <ConsentStep
            form={form}
            update={update}
            isValid={isValid}
            onStart={runScoring}
            onDemo={fillDemo}
            onReset={resetForm}
          />
        )}
        {step === "scoring" && <ScoringStep progress={progress} />}
        {step === "result" && result && <ResultStep r={result} />}
        {step === "error" && <ErrorStep message={error} onRetry={runScoring} />}
      </div>
    </div>
  );
}

function ConsentStep({
  form, update, isValid, onStart, onDemo, onReset,
}: {
  form: FormState;
  update: <K extends keyof FormState>(key: K, value: FormState[K]) => void;
  isValid: boolean;
  onStart: () => void;
  onDemo: () => void;
  onReset: () => void;
}) {
  return (
    <Card className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">Isi data pribadi kamu</h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDemo}>
            <User className="h-3.5 w-3.5" /> Isi demo
          </Button>
          <Button variant="ghost" size="sm" onClick={onReset}>Reset</Button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        Sesuai standar BI SNAP &amp; UU PDP. Data dipakai hanya untuk pre-approval, dienkripsi, dan bisa dihapus
        kapan saja dari halaman records.
      </p>

      <Separator className="my-6" />
      <div className="grid gap-4 md:grid-cols-2">
        <Consent title="SLIK OJK" desc="Riwayat kredit resmi" />
        <Consent title="Rekening BRI & Open Banking (SNAP)" desc="Pola transaksi & penghasilan" />
        <Consent title="E-wallet (opsional)" desc="GoPay, OVO, ShopeePay" />
        <Consent title="E-commerce (opsional)" desc="Tokopedia, Shopee" />
      </div>

      <Separator className="my-6" />
      <h3 className="mb-3 text-sm font-semibold">Identitas</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Nama lengkap *" value={form.fullName} onChange={(v) => update("fullName", v)} placeholder="Sesuai KTP" />
        <TextField label="NIK" value={form.nik} onChange={(v) => update("nik", v)} placeholder="16 digit" />
        <TextField label="NPWP" value={form.npwp} onChange={(v) => update("npwp", v)} placeholder="opsional" />
        <TextField label="No. HP" value={form.phone} onChange={(v) => update("phone", v)} placeholder="+62 ..." />
      </div>

      <h3 className="mb-3 mt-6 text-sm font-semibold">Pekerjaan</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <TextField label="Perusahaan" value={form.employer} onChange={(v) => update("employer", v)} placeholder="PT / UMKM / freelance" />
        <TextField label="Jabatan" value={form.position} onChange={(v) => update("position", v)} placeholder="misal: Manager" />
        <NumberField label="Usia (tahun) *" value={form.age} onChange={(v) => update("age", v)} />
        <NumberField label="Lama kerja (tahun) *" value={form.yearsEmployed} onChange={(v) => update("yearsEmployed", v)} />
      </div>

      <h3 className="mb-3 mt-6 text-sm font-semibold">Keuangan</h3>
      <div className="grid gap-4 md:grid-cols-2">
        <NumberField label="Penghasilan / bulan (IDR) *" value={form.monthlyIncome} onChange={(v) => update("monthlyIncome", v)} />
        <NumberField label="Cicilan berjalan / bulan (IDR)" value={form.existingDebt} onChange={(v) => update("existingDebt", v)} />
      </div>
      {form.monthlyIncome > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          Penghasilan = {formatIDR(form.monthlyIncome)}/bulan
          {form.existingDebt > 0 && <> · cicilan existing {formatIDR(form.existingDebt)}/bulan</>}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button size="lg" onClick={onStart} disabled={!isValid}>
          Setuju &amp; Cek Limit <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Enkripsi TLS 1.3 · audit trail lengkap
        </div>
      </div>
      {!isValid && (
        <p className="mt-2 text-xs text-rose-600">
          Nama, usia, lama kerja, dan penghasilan wajib diisi untuk scoring.
        </p>
      )}
    </Card>
  );
}

function ScoringStep({ progress }: { progress: number }) {
  const steps = [
    { t: 15, label: "Menarik data SLIK & Open Banking…" },
    { t: 35, label: "Memverifikasi dokumen & KTP…" },
    { t: 60, label: "Menjalankan model AI (Llama 3.3 70B on Groq LPU)…" },
    { t: 85, label: "Menghitung alasan & fairness check…" },
    { t: 100, label: "Selesai." },
  ];
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        <Brain className="h-8 w-8 animate-pulse" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold">AI sedang menilai…</h2>
      <p className="text-sm text-muted-foreground">Groq LPU inference · rata-rata &lt; 60 detik.</p>
      <Progress value={progress} className="mt-6" />
      <div className="mt-4 space-y-1 text-left text-sm">
        {steps.map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            {progress >= s.t ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-muted-foreground/30" />
            )}
            <span>{s.label}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ResultStep({ r }: { r: ScoreResult }) {
  const tierStyle =
    r.tier === "Green" ? "from-emerald-600 to-emerald-700"
      : r.tier === "Amber" ? "from-amber-500 to-orange-600"
      : "from-rose-600 to-red-700";

  const tierLabel =
    r.tier === "Green" ? "Approved" : r.tier === "Amber" ? "Review oleh CLF" : "Tidak memenuhi syarat";

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className={`bg-gradient-to-br ${tierStyle} p-6 text-white md:p-8`}>
          <div className="flex items-start justify-between">
            <div>
              <Badge variant="secondary" className="bg-white/20 text-white">{r.confidence} · {tierLabel}</Badge>
              <div className="mt-3 text-sm text-white/80">Limit kredit kamu</div>
              <div className="text-4xl font-bold">{formatIDR(r.approved_limit_idr)}</div>
              <div className="mt-1 text-sm text-white/80">
                Tenor max {r.max_tenor_months / 12} tahun · bunga estimasi {r.estimated_rate}%
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-white/80">Skor AI</div>
              <div className="text-4xl font-bold">{r.score}</div>
              <div className="text-xs text-white/80">/ 100</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
              <Clock className="h-4 w-4" /> {(r.latency_ms / 1000).toFixed(2)} detik
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
              <Sparkles className="h-4 w-4" /> {r.model}
            </div>
            <div className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1">
              <ShieldCheck className="h-4 w-4" /> DTI {r.dti_ratio_pct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2 md:p-8">
          <div>
            <h3 className="font-semibold">Kenapa {tierLabel.toLowerCase()}?</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {r.top_reasons.map((t, i) => (
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
              <div className="text-xs text-muted-foreground">Untuk plafon {formatIDR(r.approved_limit_idr)}</div>
              <div className="text-2xl font-bold text-primary">
                {formatIDR(r.monthly_installment_idr)}
                <span className="text-sm font-normal text-muted-foreground"> / bulan</span>
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                @ {r.estimated_rate}% p.a. · tenor {r.max_tenor_months / 12} tahun
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button className="flex-1" asChild disabled={r.tier === "Red"}>
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
              AI decision menggunakan model terdaftar, diaudit triwulanan untuk fairness &amp; drift.
            </div>
            {r.application_code && (
              <div className="mt-2 text-xs">
                Tersimpan di Supabase sebagai{" "}
                <code className="rounded bg-muted px-1.5 py-0.5 font-mono">{r.application_code}</code>
                {" · "}
                <Link href="/admin/records" className="text-primary underline">
                  lihat di records
                </Link>
              </div>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

function ErrorStep({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <Card className="p-8 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <h2 className="mt-4 text-2xl font-semibold">AI scoring gagal</h2>
      <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Pastikan <code>GROQ_API_KEY</code> sudah di-set di environment variables.
      </p>
      <Button className="mt-4" onClick={onRetry}>
        <RefreshCw className="h-4 w-4" /> Coba lagi
      </Button>
    </Card>
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

function TextField({
  label, value, onChange, placeholder,
}: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-1"
      />
    </div>
  );
}

function NumberField({
  label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        placeholder="0"
        className="mt-1"
      />
    </div>
  );
}
