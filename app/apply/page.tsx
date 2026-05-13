"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatIDR } from "@/lib/utils";
import { loadSessionApplicant, type SessionApplicant } from "@/lib/session-data";
import { CheckCircle2, PenSquare, ArrowRight, ShieldCheck, FileText, AlertCircle } from "lucide-react";
import { Field } from "@/components/molecules/field";
import { Row } from "@/components/molecules/row";
import { AiExplainCard } from "@/components/organisms/ai-explain-card";

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="container max-w-5xl py-10">Loading…</div>}>
      <ApplyInner />
    </Suspense>
  );
}

function ApplyInner() {
  useSearchParams(); // keeps Suspense boundary satisfied for URL-driven routing
  const [signed, setSigned] = useState(false);
  const [session, setSession] = useState<SessionApplicant | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSession(loadSessionApplicant());
    setLoaded(true);
  }, []);

  // Property comes from session.selectedProperty (set when user clicked "Apply"
  // on the property detail page). Full property data is carried via session so
  // this client page doesn't need a DB roundtrip.
  const property = session?.selectedProperty ?? null;

  // Loading state (prevents hydration mismatch)
  if (!loaded) {
    return <div className="container max-w-5xl py-5 text-sm text-muted-foreground sm:py-10">Loading session…</div>;
  }

  // No session data → prompt user to run pre-approval first
  if (!session) {
    return (
      <div className="container max-w-3xl py-5 sm:py-10">
        <Badge variant="outline" className="border-accent text-accent">DECIDE · One-Session Commitment</Badge>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">Ajukan KPR</h1>
        <Card className="mt-5 border-amber-300 bg-amber-50 p-5 sm:mt-6 sm:p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="text-sm">
              <div className="font-semibold text-amber-900">Belum ada data pre-approval</div>
              <div className="mt-1 text-amber-800">
                Untuk mengajukan KPR, kamu harus cek limit kilat dulu supaya AI bisa hitung plafon &amp; menyiapkan dokumen otomatis.
              </div>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/pre-approval">Cek Limit Kilat <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const score = session.score;
  const tierBadgeClass =
    score?.tier === "Green" ? "bg-emerald-100 text-emerald-700"
      : score?.tier === "Amber" ? "bg-amber-100 text-amber-700"
      : "bg-rose-100 text-rose-700";

  const defaultTenor = (score?.max_tenor_months ?? 240) / 12;
  const defaultRate = score?.estimated_rate ?? 6.75;

  return (
    <div className="container max-w-5xl pb-24 pt-5 sm:py-10">
      <Badge variant="outline" className="border-accent text-accent">DECIDE · One-Session Commitment</Badge>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">Ajukan KPR</h1>
      <p className="mt-2 text-sm text-muted-foreground sm:text-base">
        Form terisi otomatis dari data yang kamu input di pre-approval. Review &amp; tanda tangan digital.
      </p>

      <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-8 lg:grid-cols-3">
        <form className="space-y-5 sm:space-y-6 lg:col-span-2 lg:order-1">
          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Data Pemohon (auto-filled dari pre-approval)</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Nama lengkap" value={session.fullName} />
              <Field label="NIK" value={session.nik ?? ""} />
              <Field label="NPWP" value={session.npwp ?? ""} />
              <Field label="No. HP" value={session.phone ?? ""} />
              <Field label="Usia" value={String(session.age)} type="number" />
              <Field label="Email" value={session.email ?? ""} type="email" />
              <Field label="Alamat" value={session.homeAddress ?? ""} className="sm:col-span-2" placeholder="Alamat sesuai KTP" />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Pekerjaan &amp; Penghasilan</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Perusahaan" value={session.employer ?? ""} />
              <Field label="Jabatan" value={session.position ?? ""} />
              <Field label="Masa kerja (tahun)" value={String(session.yearsEmployed)} type="number" />
              <Field label="Penghasilan / bulan" value={formatIDR(session.monthlyIncome)} />
              {session.existingDebt > 0 && (
                <Field label="Cicilan berjalan / bulan" value={formatIDR(session.existingDebt)} />
              )}
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Properti yang Diajukan</h2>
            {property && (
              <div className="mt-4 flex flex-wrap items-start gap-3 rounded-lg bg-bri-light p-4 sm:gap-4">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-muted-foreground">{property.developer}</div>
                  <div className="line-clamp-1 font-semibold">{property.title}</div>
                  <div className="line-clamp-1 text-sm text-muted-foreground">{property.location}, {property.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Harga</div>
                  <div className="font-semibold text-primary">{formatIDR(property.price)}</div>
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="DP (%)" value="20" type="number" />
              <Field label="Tenor (tahun)" value={String(defaultTenor)} type="number" />
              <Field label="Program bunga" value={`Fixed 3 thn · ${defaultRate}%`} />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold sm:text-base">
              <PenSquare className="h-4 w-4 text-accent" /> Tanda Tangan Digital (PeruriSign)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Setelah tanda tangan, aplikasi langsung diverifikasi &amp; e-SPH disiapkan.
            </p>
            <div className="mt-4 flex h-28 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 sm:h-32">
              {signed ? (
                <div className="flex items-center gap-2 font-semibold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Ditandatangani oleh {session.fullName}
                </div>
              ) : (
                <Button type="button" variant="accent" onClick={() => setSigned(true)}>
                  <PenSquare className="h-4 w-4" /> Tanda tangan sekarang
                </Button>
              )}
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5" />
              Tanda tangan elektronik tersertifikasi (QTSP) — setara notaris untuk dokumen digital di Indonesia.
            </div>
          </Card>

          {/* Desktop inline submit */}
          <Button size="lg" className="hidden w-full sm:flex" asChild disabled={!signed}>
            <Link href={signed ? `/status/${score?.application_code ?? "APP-2026-00042"}` : "#"}>
              Submit &amp; lihat status <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </form>

        {/* Summary — moves below on mobile (order-1), sticky on desktop */}
        <aside className="space-y-4 lg:sticky lg:top-20 lg:order-2 lg:self-start">
          {score && (
            <AiExplainCard
              variant="compact"
              tier={score.tier}
              score={score.score}
              confidence={score.confidence}
              top_reasons={score.top_reasons}
              latency_ms={score.latency_ms ?? 0}
              model={score.model ?? "llama-3.3-70b-versatile"}
              dti_ratio_pct={score.dti_ratio_pct}
              approved_limit_idr={score.approved_limit_idr}
              estimated_rate={score.estimated_rate}
              max_tenor_months={score.max_tenor_months}
              monthly_installment_idr={score.monthly_installment_idr}
            />
          )}
          <Card className="space-y-4 p-5 sm:p-6">
            <div>
              <div className="text-xs text-muted-foreground">Pre-approval aktif</div>
              <div className="text-xl font-bold text-primary">
                {formatIDR(score?.approved_limit_idr ?? 0)}
              </div>
              {score && (
                <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${tierBadgeClass}`}>
                  {score.tier} · skor {score.score}
                </span>
              )}
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <Row label="Harga properti" value={property ? formatIDR(property.price) : "-"} />
              <Row label="DP (20%)" value={property ? formatIDR(property.price * 0.2) : "-"} />
              <Row label="Plafon KPR" value={property ? formatIDR(property.price * 0.8) : "-"} />
              <Row label="Tenor" value={`${defaultTenor} tahun`} />
              <Row label="Bunga" value={`${defaultRate}% fixed 3 thn`} />
              <Row label="DTI" value={score ? `${score.dti_ratio_pct.toFixed(1)}%` : "-"} />
            </div>
            <Separator />
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <div className="flex items-center gap-1 font-semibold"><FileText className="h-4 w-4" /> Dokumen otomatis</div>
              <div className="mt-1 text-emerald-600/80">
                KTP, NPWP, slip gaji, mutasi rekening — sudah ditarik dari consent kamu. Tidak perlu upload ulang.
              </div>
            </div>
            {score?.application_code && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs">
                <span className="text-muted-foreground">Application code:</span>{" "}
                <code className="font-mono font-semibold">{score.application_code}</code>
              </div>
            )}
          </Card>
        </aside>
      </div>

      {/* Mobile sticky submit */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 px-4 py-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] backdrop-blur sm:hidden">
        <Button size="lg" className="w-full" asChild disabled={!signed}>
          <Link href={signed ? `/status/${score?.application_code ?? "APP-2026-00042"}` : "#"}>
            {signed ? "Submit & lihat status" : "Tanda tangan dulu"} <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

