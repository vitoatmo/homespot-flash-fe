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
import { AiExplainCard } from "@/components/organisms/ai-explain-card";

const SLA_MS = 8 * 60 * 60 * 1000; // 8 jam — sesuai janji SLA homepage/journey

function formatDuration(ms: number) {
  if (ms <= 0) return "0 mnt";
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${m} mnt`;
  return `${h} jam ${m} mnt`;
}

function formatHHmm(d: Date) {
  return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
}

export default function StatusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<SessionApplicant | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [now, setNow] = useState<number>(() => Date.now());
  const [startMs, setStartMs] = useState<number | null>(null);

  useEffect(() => {
    const s = loadSessionApplicant();
    setSession(s);
    setLoaded(true);

    // Anchor SLA timer: prefer score.created_at, else fall back to a per-id
    // sessionStorage key so reloads keep the same start.
    const fromScore = s?.score?.created_at ? Date.parse(s.score.created_at) : NaN;
    const storageKey = `hf_status_start_${id}`;
    let start: number;
    if (!Number.isNaN(fromScore) && fromScore > 0) {
      start = fromScore;
    } else if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(storageKey);
      const parsed = stored ? Number(stored) : NaN;
      if (!Number.isNaN(parsed) && parsed > 0) {
        start = parsed;
      } else {
        start = Date.now();
        sessionStorage.setItem(storageKey, String(start));
      }
    } else {
      start = Date.now();
    }
    setStartMs(start);

    const tick = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(tick);
  }, [id]);

  if (!loaded) {
    return (
      <div className="container max-w-5xl py-5 text-sm text-muted-foreground sm:py-10">
        Memuat data aplikasi…
      </div>
    );
  }

  // Tidak ada session → arahkan user ke pre-approval (jangan tampil dummy data)
  if (!session) {
    return (
      <div className="container max-w-3xl py-5 sm:py-10">
        <Badge variant="outline" className="border-accent text-accent">Status KPR</Badge>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl md:text-4xl">Aplikasi #{id}</h1>
        <Card className="mt-5 border-amber-300 bg-amber-50 p-5 sm:mt-6 sm:p-6">
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

  // Live SLA tracker — 8h budget from score.created_at (preferred) or per-id
  // sessionStorage anchor. Updates every 60s.
  const elapsedMs = startMs ? Math.max(0, now - startMs) : 0;
  const remainingMs = startMs ? Math.max(0, SLA_MS - elapsedMs) : SLA_MS;
  const slaBreached = elapsedMs > SLA_MS;
  const etaLabel = startMs ? formatHHmm(new Date(startMs + SLA_MS)) : "—";

  return (
    <div className="container max-w-5xl py-5 sm:py-10">
      <div className="flex flex-wrap items-end justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <Badge variant="outline" className="border-accent text-accent">Status KPR</Badge>
          <h1 className="mt-2 break-all text-2xl font-bold sm:text-3xl md:text-4xl">Aplikasi #{id}</h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            Update real-time · notifikasi WhatsApp + email di setiap perubahan.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm"><MessageCircle className="h-4 w-4" /> Chat</Button>
          <Button variant="outline" size="sm"><Phone className="h-4 w-4" /> Sales</Button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 sm:mt-8 sm:gap-8 lg:grid-cols-3">
        {/* timeline */}
        <div className="space-y-5 sm:space-y-6 lg:col-span-2">
          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Progress</h2>
            {/* TODO: wire status_events query — replace static statusTimeline with
                Supabase query filtered by application_code = id (see CLAUDE.md). */}
            <ol className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {statusTimeline.map((s) => (
                <li key={s.id} className="flex items-start gap-3 sm:gap-4">
                  <div className="relative shrink-0">
                    {s.state === "done" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-white sm:h-9 sm:w-9">
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    ) : s.state === "in_progress" ? (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white sm:h-9 sm:w-9">
                        <Loader2 className="h-4 w-4 animate-spin sm:h-5 sm:w-5" />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-muted-foreground/20 text-muted-foreground sm:h-9 sm:w-9">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="text-sm font-medium sm:text-base">{s.label}</div>
                      {s.state === "in_progress" && <Badge variant="accent" className="text-[10px]">Sedang berjalan</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">{s.time}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="text-sm font-semibold sm:text-base">Catatan CLF Analyst</h2>
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
            {score && (
              <div className="mt-4">
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
              </div>
            )}
            <Separator className="my-4" />
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
              <Stat label="SLA target" value="< 8 jam" />
              <Stat
                label="Waktu berjalan"
                value={startMs ? formatDuration(elapsedMs) : "—"}
              />
              <Stat
                label={slaBreached ? "SLA terlewat" : "Sisa SLA"}
                value={
                  startMs
                    ? slaBreached
                      ? `+${formatDuration(elapsedMs - SLA_MS)}`
                      : `${formatDuration(remainingMs)} · est. ${etaLabel}`
                    : "—"
                }
              />
            </div>
          </Card>

          <Card className="p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold sm:text-base"><FileText className="h-4 w-4" /> Dokumen</h2>
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
          <Card className="space-y-4 p-4 sm:p-6">
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
