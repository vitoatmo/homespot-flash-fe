"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { dummyUser, aiScoreDummy } from "@/lib/data/user";
import { findProperty } from "@/lib/data/properties";
import { formatIDR } from "@/lib/utils";
import { CheckCircle2, PenSquare, ArrowRight, ShieldCheck, FileText } from "lucide-react";

export default function ApplyPage() {
  return (
    <Suspense fallback={<div className="container max-w-5xl py-10">Loading…</div>}>
      <ApplyInner />
    </Suspense>
  );
}

function ApplyInner() {
  const sp = useSearchParams();
  const propId = sp.get("property") || "grand-serenia-01";
  const property = findProperty(propId);
  const [signed, setSigned] = useState(false);

  return (
    <div className="container max-w-5xl py-10">
      <Badge variant="outline" className="border-accent text-accent">DECIDE · One-Session Commitment</Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Ajukan KPR</h1>
      <p className="mt-2 text-muted-foreground">
        Form sudah terisi otomatis dari data consent kamu. Cukup review & tanda tangan digital.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <form className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-semibold">Data Pemohon (auto-filled)</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Nama lengkap" value={dummyUser.fullName} />
              <Field label="NIK" value={dummyUser.nik} />
              <Field label="NPWP" value={dummyUser.npwp} />
              <Field label="Email" value={dummyUser.email} type="email" />
              <Field label="No. HP" value={dummyUser.phone} />
              <Field label="Tanggal lahir" value={dummyUser.dob} type="date" />
              <Field label="Alamat" value={dummyUser.homeAddress} className="md:col-span-2" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Pekerjaan & Penghasilan</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Perusahaan" value={dummyUser.employer} />
              <Field label="Jabatan" value={dummyUser.position} />
              <Field label="Masa kerja (tahun)" value={String(dummyUser.yearsEmployed)} type="number" />
              <Field label="Penghasilan / bulan" value={formatIDR(dummyUser.monthlyIncome)} />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Properti yang Diajukan</h2>
            {property && (
              <div className="mt-4 flex items-start gap-4 rounded-lg bg-bri-light p-4">
                <div className="flex-1">
                  <div className="text-xs text-muted-foreground">{property.developer}</div>
                  <div className="font-semibold">{property.title}</div>
                  <div className="text-sm text-muted-foreground">{property.location}, {property.city}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Harga</div>
                  <div className="font-semibold text-primary">{formatIDR(property.price)}</div>
                </div>
              </div>
            )}
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <Field label="DP (%)" value="20" type="number" />
              <Field label="Tenor (tahun)" value="20" type="number" />
              <Field label="Program bunga" value="Fixed 3 tahun · 6.75%" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold">
              <PenSquare className="h-4 w-4 text-accent" /> Tanda Tangan Digital (PeruriSign)
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Setelah tanda tangan, aplikasi langsung diverifikasi & e-SPH disiapkan.
            </p>
            <div className="mt-4 flex h-32 items-center justify-center rounded-lg border-2 border-dashed bg-muted/50">
              {signed ? (
                <div className="flex items-center gap-2 font-semibold text-emerald-600">
                  <CheckCircle2 className="h-5 w-5" />
                  Ditandatangani oleh {dummyUser.fullName}
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

          <Button size="lg" className="w-full" asChild disabled={!signed}>
            <Link href={signed ? "/status/APP-2026-00042" : "#"}>
              Submit & lihat status <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </form>

        {/* Sticky summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="space-y-4 p-6">
            <div>
              <div className="text-xs text-muted-foreground">Pre-approval aktif</div>
              <div className="text-xl font-bold text-primary">{formatIDR(aiScoreDummy.approvedLimit)}</div>
              <Badge variant="success" className="mt-2">Green · skor {aiScoreDummy.scorePct}</Badge>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <Row label="Harga properti" value={property ? formatIDR(property.price) : "-"} />
              <Row label="DP (20%)" value={property ? formatIDR(property.price * 0.2) : "-"} />
              <Row label="Plafon KPR" value={property ? formatIDR(property.price * 0.8) : "-"} />
              <Row label="Tenor" value="20 tahun" />
              <Row label="Bunga" value="6.75% fixed 3 thn" />
            </div>
            <Separator />
            <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">
              <div className="flex items-center gap-1 font-semibold"><FileText className="h-4 w-4" /> Dokumen otomatis</div>
              <div className="mt-1 text-emerald-600/80">
                KTP, NPWP, slip gaji, mutasi rekening — sudah ditarik dari consent kamu. Tidak perlu upload ulang.
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Field({ label, value, type, className }: { label: string; value: string; type?: string; className?: string }) {
  return (
    <div className={className}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input defaultValue={value} type={type} className="mt-1" />
    </div>
  );
}
function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
