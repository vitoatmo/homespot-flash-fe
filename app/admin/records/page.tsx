import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatIDR } from "@/lib/utils";
import { Database, Users, Home, FileCheck, Brain, Eye, Clock } from "lucide-react";
import { DeleteButton } from "./delete-button";

export const dynamic = "force-dynamic";

type Applicant = {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  employer: string | null;
  position: string | null;
  monthly_income_idr: number;
  years_employed: number;
  existing_monthly_debt_idr: number;
  persona: string;
  created_at: string;
};

type Property = {
  id: string;
  slug: string;
  title: string;
  developer: string | null;
  city: string;
  province: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  building_m2: number | null;
  price_idr: number;
  status: string;
  property_type: string | null;
  category: string | null;
};

type ApplicationRow = {
  id: string;
  code: string;
  requested_amount_idr: number;
  tenor_months: number;
  status: string;
  decision_tier: "Green" | "Amber" | "Red" | null;
  created_at: string;
  applicant: { full_name: string; monthly_income_idr: number } | null;
  property: { title: string; city: string; price_idr: number } | null;
  score: {
    score: number;
    approved_limit_idr: number;
    estimated_rate: number;
    dti_ratio_pct: number;
    tier: string;
    top_reasons: string[];
    latency_ms: number | null;
  } | null;
};

type TourRow = {
  id: string;
  duration_sec: number;
  rooms_viewed: string[];
  ended_with_action: string;
  created_at: string;
  applicant: { full_name: string } | null;
  property: { title: string } | null;
};

export default async function RecordsPage() {
  const supabase = await createClient();

  const [applicantsRes, propertiesRes, applicationsRes, toursRes] = await Promise.all([
    supabase.from("applicants").select("*").order("created_at", { ascending: false }),
    supabase.from("properties").select("*").order("price_idr", { ascending: true }),
    supabase
      .from("applications")
      .select(`
        id, code, requested_amount_idr, tenor_months, status, decision_tier, created_at,
        applicant:applicants(full_name, monthly_income_idr),
        property:properties(title, city, price_idr),
        score:ai_scores(score, approved_limit_idr, estimated_rate, dti_ratio_pct, tier, top_reasons, latency_ms)
      `)
      .order("created_at", { ascending: false }),
    supabase
      .from("property_tours")
      .select(`
        id, duration_sec, rooms_viewed, ended_with_action, created_at,
        applicant:applicants(full_name),
        property:properties(title)
      `)
      .order("created_at", { ascending: false }),
  ]);

  const applicants = (applicantsRes.data ?? []) as Applicant[];
  const properties = (propertiesRes.data ?? []) as Property[];
  const applications = ((applicationsRes.data ?? []) as unknown as ApplicationRow[]).map((a) => ({
    ...a,
    score: Array.isArray(a.score) ? (a.score[0] ?? null) : a.score,
  }));
  const tours = (toursRes.data ?? []) as unknown as TourRow[];

  const anyError = applicantsRes.error || propertiesRes.error || applicationsRes.error || toursRes.error;

  // KPIs
  const totalIncome = applicants.reduce((s, a) => s + Number(a.monthly_income_idr), 0);
  const totalPropertyValue = properties.reduce((s, p) => s + Number(p.price_idr), 0);
  const totalRequested = applications.reduce((s, a) => s + Number(a.requested_amount_idr), 0);
  const scoredApps = applications.filter((a) => a.score);
  const avgScore =
    scoredApps.length > 0
      ? Math.round(scoredApps.reduce((s, a) => s + (a.score?.score ?? 0), 0) / scoredApps.length)
      : 0;

  // Group properties by category for visual tier breakdown
  const categoryOrder = ["subsidi", "starter", "mid", "upper_mid", "premium", "luxury", "ultra_luxury"];
  const catCounts = categoryOrder.map((c) => ({
    category: c,
    count: properties.filter((p) => p.category === c).length,
    minPrice: Math.min(...properties.filter((p) => p.category === c).map((p) => p.price_idr)) || 0,
    maxPrice: Math.max(...properties.filter((p) => p.category === c).map((p) => p.price_idr)) || 0,
  })).filter((c) => c.count > 0);

  return (
    <div className="container max-w-7xl py-10">
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="border-accent text-accent">ADMIN · Records</Badge>
      </div>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Live Database Records</h1>
      <p className="mt-2 text-muted-foreground">
        Live view dari Supabase — semua applicants, properties, KPR applications, AI scores,
        dan VR tour sessions. Klik ikon hapus untuk remove record.
      </p>

      {anyError && (
        <Card className="mt-6 border-rose-500 bg-rose-50 p-4 text-sm text-rose-900">
          <div className="font-semibold">Supabase error</div>
          <div className="mt-1">{anyError.message}</div>
        </Card>
      )}

      {/* KPI strip */}
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Kpi icon={<Users className="h-4 w-4" />} label="Applicants" value={applicants.length.toString()} sub={`Total income ${formatIDR(totalIncome)}/bln`} />
        <Kpi icon={<Home className="h-4 w-4" />} label="Properties" value={properties.length.toString()} sub={`Portfolio value ${formatIDR(totalPropertyValue)}`} />
        <Kpi icon={<FileCheck className="h-4 w-4" />} label="Applications" value={applications.length.toString()} sub={`Requested ${formatIDR(totalRequested)}`} />
        <Kpi icon={<Brain className="h-4 w-4" />} label="Avg AI Score" value={`${avgScore}/100`} sub={`${scoredApps.length} scored by Groq`} />
      </div>

      {/* Property tier breakdown */}
      <section className="mt-8">
        <div className="mb-3 flex items-center gap-2">
          <Home className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Property Portfolio by Tier</h2>
        </div>
        <div className="grid gap-2 md:grid-cols-7">
          {catCounts.map((c) => (
            <Card key={c.category} className="p-3">
              <div className="text-xs font-semibold uppercase tracking-wide text-primary">
                {c.category.replace("_", " ")}
              </div>
              <div className="mt-1 text-2xl font-bold">{c.count}</div>
              <div className="text-xs text-muted-foreground">
                {formatIDR(c.minPrice)}
                {c.minPrice !== c.maxPrice && <> – {formatIDR(c.maxPrice)}</>}
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Applications */}
      <Section title="KPR Applications + AI Scores" icon={<FileCheck className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <Th>Code</Th>
                <Th>Applicant</Th>
                <Th>Property</Th>
                <Th>Plafon Diminta</Th>
                <Th>Tenor</Th>
                <Th>AI Score</Th>
                <Th>DTI</Th>
                <Th>Tier</Th>
                <Th>Status</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {applications.map((a) => (
                <tr key={a.id} className="border-t align-top">
                  <Td className="font-mono text-xs">{a.code}</Td>
                  <Td>{a.applicant?.full_name ?? "-"}</Td>
                  <Td>
                    <div className="font-medium">{a.property?.title ?? "-"}</div>
                    <div className="text-xs text-muted-foreground">{a.property?.city ?? ""}</div>
                  </Td>
                  <Td className="text-right">{formatIDR(a.requested_amount_idr)}</Td>
                  <Td className="text-center">{a.tenor_months / 12}th</Td>
                  <Td className="text-center font-semibold">{a.score ? `${a.score.score}/100` : "—"}</Td>
                  <Td className="text-center">{a.score ? `${a.score.dti_ratio_pct}%` : "—"}</Td>
                  <Td><TierPill tier={a.decision_tier} /></Td>
                  <Td><StatusPill status={a.status} /></Td>
                  <Td><DeleteButton table="applications" id={a.id} label={`application ${a.code}`} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* AI reasons */}
      <Section title="AI Decision Explanations" icon={<Brain className="h-5 w-5" />}>
        <div className="grid gap-3 p-4 md:grid-cols-2">
          {scoredApps.map((a) => (
            <div key={a.id} className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="font-mono text-xs text-muted-foreground">{a.code}</div>
                <div className="flex items-center gap-2">
                  <TierPill tier={a.score?.tier as "Green"|"Amber"|"Red"|null} />
                  <span className="text-sm font-semibold">{a.score?.score}/100</span>
                </div>
              </div>
              <div className="mt-1 text-sm font-medium">{a.applicant?.full_name}</div>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {a.score?.top_reasons?.map((r: string, i: number) => (
                  <li key={i} className="flex gap-1.5">
                    <span className="text-primary">·</span>
                    {r}
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                <span>Plafon {formatIDR(a.score?.approved_limit_idr ?? 0)}</span>
                <span>· {a.score?.estimated_rate}% p.a.</span>
                {a.score?.latency_ms && (
                  <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" /> {a.score.latency_ms}ms</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Applicants */}
      <Section title="Applicants" icon={<Users className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <Th>Nama</Th>
                <Th>Employer / Position</Th>
                <Th>Persona</Th>
                <Th>Income / bln</Th>
                <Th>Debt / bln</Th>
                <Th>Masa kerja</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {applicants.map((a) => (
                <tr key={a.id} className="border-t">
                  <Td>
                    <div className="font-medium">{a.full_name}</div>
                    <div className="text-xs text-muted-foreground">{a.email}</div>
                  </Td>
                  <Td>
                    <div>{a.employer}</div>
                    <div className="text-xs text-muted-foreground">{a.position}</div>
                  </Td>
                  <Td><Badge variant="outline" className="text-xs">{a.persona}</Badge></Td>
                  <Td className="text-right">{formatIDR(a.monthly_income_idr)}</Td>
                  <Td className="text-right">{formatIDR(a.existing_monthly_debt_idr)}</Td>
                  <Td className="text-center">{a.years_employed}th</Td>
                  <Td><DeleteButton table="applicants" id={a.id} label={a.full_name} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Properties */}
      <Section title={`Properties (${properties.length} listings)`} icon={<Home className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <Th>Properti</Th>
                <Th>Developer</Th>
                <Th>Lokasi</Th>
                <Th>Type</Th>
                <Th>Tier</Th>
                <Th>Kamar</Th>
                <Th>Luas bangunan</Th>
                <Th>Harga</Th>
                <Th>Status</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => (
                <tr key={p.id} className="border-t">
                  <Td>
                    <div className="font-medium">{p.title}</div>
                    <div className="font-mono text-xs text-muted-foreground">{p.slug}</div>
                  </Td>
                  <Td className="text-xs">{p.developer ?? "-"}</Td>
                  <Td className="text-xs">
                    <div>{p.city}</div>
                    <div className="text-muted-foreground">{p.province}</div>
                  </Td>
                  <Td>
                    <Badge variant="outline" className="text-xs capitalize">
                      {p.property_type?.replace("_", " ") ?? "-"}
                    </Badge>
                  </Td>
                  <Td><CategoryPill category={p.category} /></Td>
                  <Td className="text-center">
                    {p.bedrooms ? `${p.bedrooms}BR / ${p.bathrooms}BA` : "-"}
                  </Td>
                  <Td className="text-right">{p.building_m2 ?? "-"} m²</Td>
                  <Td className="whitespace-nowrap text-right font-medium">{formatIDR(p.price_idr)}</Td>
                  <Td>
                    <Badge variant={p.status === "available" ? "default" : "secondary"} className="text-xs">
                      {p.status}
                    </Badge>
                  </Td>
                  <Td><DeleteButton table="properties" id={p.id} label={p.title} /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Tours */}
      <Section title="VR Tour Sessions (FEEL Phase)" icon={<Eye className="h-5 w-5" />}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-xs uppercase text-muted-foreground">
              <tr>
                <Th>Applicant</Th>
                <Th>Property</Th>
                <Th>Durasi</Th>
                <Th>Rooms viewed</Th>
                <Th>Outcome</Th>
                <Th> </Th>
              </tr>
            </thead>
            <tbody>
              {tours.map((t) => (
                <tr key={t.id} className="border-t">
                  <Td>{t.applicant?.full_name ?? "-"}</Td>
                  <Td>{t.property?.title ?? "-"}</Td>
                  <Td className="text-center">{Math.floor(t.duration_sec / 60)}m {t.duration_sec % 60}s</Td>
                  <Td>{Array.isArray(t.rooms_viewed) ? t.rooms_viewed.join(", ") : "-"}</Td>
                  <Td>
                    <Badge
                      variant={t.ended_with_action === "apply" ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {t.ended_with_action}
                    </Badge>
                  </Td>
                  <Td><DeleteButton table="property_tours" id={t.id} label="tour session" /></Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Card className="mt-8 border-primary/30 bg-primary/5 p-5">
        <div className="flex items-start gap-3">
          <Database className="mt-0.5 h-5 w-5 text-primary" />
          <div className="text-sm">
            <div className="font-semibold">Live data di Supabase · ap-northeast-2 (Seoul)</div>
            <div className="mt-1 text-muted-foreground">
              Setiap pre-approval yang disubmit tercatat sebagai row baru di <code>applicants</code>,
              <code> applications</code>, dan <code>ai_scores</code>. Property portfolio mencakup 7 tier
              (subsidi FLPP s/d ultra-luxury) di Jabodetabek, Bandung, Surabaya, Bali, Jogja, Semarang & Medan.
              Delete di-handle via Next.js Server Action dengan RLS policy yang permissive (demo-only).
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

function Kpi({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <div className="mb-3 flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      <Card className="overflow-hidden">{children}</Card>
    </section>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left font-medium">{children}</th>;
}

function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-3 ${className}`}>{children}</td>;
}

function TierPill({ tier }: { tier: "Green" | "Amber" | "Red" | null | undefined }) {
  if (!tier) return <span className="text-xs text-muted-foreground">—</span>;
  const map = {
    Green: "bg-emerald-100 text-emerald-700",
    Amber: "bg-amber-100 text-amber-700",
    Red: "bg-rose-100 text-rose-700",
  };
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${map[tier]}`}>{tier}</span>;
}

function CategoryPill({ category }: { category: string | null | undefined }) {
  if (!category) return <span className="text-xs text-muted-foreground">—</span>;
  const map: Record<string, string> = {
    subsidi: "bg-gray-100 text-gray-700",
    starter: "bg-sky-100 text-sky-700",
    mid: "bg-emerald-100 text-emerald-700",
    upper_mid: "bg-teal-100 text-teal-700",
    premium: "bg-violet-100 text-violet-700",
    luxury: "bg-amber-100 text-amber-800",
    ultra_luxury: "bg-gradient-to-r from-amber-400 to-rose-400 text-white",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${map[category]}`}>
      {category.replace("_", " ")}
    </span>
  );
}

function StatusPill({ status }: { status: string }) {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    submitted: "bg-blue-100 text-blue-700",
    pre_approved: "bg-emerald-100 text-emerald-700",
    clf_review: "bg-amber-100 text-amber-700",
    final_approved: "bg-emerald-200 text-emerald-800",
    rejected: "bg-rose-100 text-rose-700",
    signed: "bg-violet-100 text-violet-700",
    disbursed: "bg-primary/10 text-primary",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] ?? "bg-gray-100 text-gray-700"}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}
