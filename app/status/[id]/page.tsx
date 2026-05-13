"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { statusTimeline } from "@/lib/data/user";
import { loadSessionApplicant, type SessionApplicant } from "@/lib/session-data";
import { formatIDR } from "@/lib/utils";
import {
  CheckCircle2, Clock, Loader2, MessageCircle, Phone, FileText, AlertCircle, ArrowRight,
} from "lucide-react";
import { Row } from "@/components/molecules/row";
import { Stat } from "@/components/molecules/stat";

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionApplicant | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setSession(loadSessionApplicant());
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <div className="container max-w-5xl py-10 text-sm text-muted-foreground">
        Memuat data aplikasi…
      </div>
    );
  }

  // Tidak ada session → arahkan user ke pre-approval (jangan tampil dummy data)
  if (!session) {
    return (
      <div className="container max-w-3xl py-10">
        <Badge variant="outline" className="border-accent text-accent">Status KPR</Badge>
        <h1 className="mt-2 text-3xl font-bold md:text-4xl">Aplikasi #{id}</h1>
        <Card className="mt-6 border-amber-300 bg-amber-50 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 text-amber-700" />
            <div className="text-sm">
              <div className="font-semibold text-amber-900">Belum ada data aplikasi</div>
              <div className="mt-1 text-amber-800">
                Halaman status hanya tersedia setelah kamu menyelesaikan pre-approval &amp; submit aplikasi
                dari sesi ini.
              </div>
              <Button size="sm" className="mt-3" asChild>
                <Link href="/pre-approval">
                  Mulai Cek Limit Kilat <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  const score = session.score;
  const property = session.selectedProperty;

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge variant="outline" className="border-accent text-accent">Status KPR</Badge>
          <h1 className="mt-2 text-3xl font-bold md:text-4xl">Aplikasi #{id}</h1>
          <p className="mt-2 text-muted-foreground">
            Update real-time · notifikasi WhatsApp + email di setiap perubahan.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> Chat</Button>
          <Button variant="outline" size="sm"><Phone className="h-4 w-4" /> Hubungi sales</Button>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* timeline */}
        <div className="space-y-6 lg:col-span-2">
          <Card className="p-6">
            <h2 className="font-semibold">Progress</h2>
            <ol className="mt-6 space-y-5">
              {statusTimeline.map((s) => (
                <li key={s.id} className="flex items-start gap-4">
                  <div className="relative">
                    {s.state === "done" ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                    ) : s.state === "in_progress" ? (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white">
                        <Loader2 className="h-5 w-5 animate-spin" />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-muted-foreground/20 text-muted-foreground">
                        <Clock className="h-5 w-5" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{s.label}</div>
                      {s.state === "in_progress" && <Badge variant="accent">Sedang berjalan</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6">
            <h2 className="font-semibold">Catatan CLF Analyst</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Klasifikasi AI:{" "}
              <span className={`font-semibold ${
                score?.tier === "Green" ? "text-emerald-600"
                  : score?.tier === "Amber" ? "text-amber-600"
                  : "text-rose-600"
              }`}>
                {score?.tier ?? "—"}
              </span>{" "}
              · {score?.tier === "Green"
                ? "tidak memerlukan review manual level-2."
                : "akan diverifikasi tambahan oleh CLF Analyst."} Analyst memverifikasi properti Tier-1 via e-Appraisal.
            </p>
            <Separator className="my-4" />
            <div className="grid gap-3 md:grid-cols-3 text-sm">
              <Stat label="SLA target" value="< 8 jam" />
              <Stat label="Waktu berjalan" value="3 jam 12 mnt" />
              <Stat label="Estimasi selesai" value="Hari ini, 17:30" />
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="flex items-center gap-2 font-semibold"><FileText className="h-4 w-4" /> Dokumen</h2>
            <ul className="mt-3 space-y-2 text-sm">
              <Doc name="KTP" src="Dukcapil (auto)" />
              <Doc name="NPWP" src="DJP (auto)" />
              <Doc name="Slip gaji 3 bulan" src="Open Banking SNAP (auto)" />
              <Doc name="Mutasi rekening" src="BRI core (auto)" />
              <Doc name="SLIK OJK" src="OJK (auto)" />
              <Doc name="e-SPH" src="Menunggu approval final" pending />
            </ul>
          </Card>
        </div>

        {/* summary */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="space-y-4 p-6">
            <div>
              <div className="text-xs text-muted-foreground">Pemohon</div>
              <div className="font-semibold">{session.fullName || "—"}</div>
              <div className="text-xs text-muted-foreground">
                {session.email || session.phone || "—"}
              </div>
            </div>
            <Separator />
            <div>
              <div className="text-xs text-muted-foreground">Properti</div>
              <div className="font-semibold">{property?.title ?? "—"}</div>
              <div className="text-xs text-muted-foreground">
                {property ? `${property.developer} · ${property.city}` : "Belum dipilih"}
              </div>
            </div>
            <Separator />
            <div className="space-y-2 text-sm">
              <Row
                label="Plafon"
                value={score ? formatIDR(score.approved_limit_idr) : "—"}
              />
              <Row
                label="Tenor"
                value={score ? `${Math.round((score.max_tenor_months ?? 240) / 12)} tahun` : "—"}
              />
              <Row
                label="Bunga"
                value={score ? `${score.estimated_rate}% fixed 3 thn` : "—"}
              />
            </div>
            <Separator />
            <Button className="w-full" asChild>
              <Link href="/properties">Cari properti lain</Link>
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Doc({ name, src, pending }: { name: string; src: string; pending?: boolean }) {
  return (
    <li className="flex items-center justify-between rounded-lg border px-3 py-2">
      <div>
        <div className="font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{src}</div>
      </div>
      {pending ? <Badge variant="warning">Menunggu</Badge> : <Badge variant="success">Terverifikasi</Badge>}
    </li>
  );
}
