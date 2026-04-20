import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Brain, Eye, CheckCircle2, Clock, AlertTriangle, Heart, Smile, Frown, MessageCircle,
  ShieldCheck, Sparkles, ArrowRight, Home, FileText, PenSquare, Zap,
} from "lucide-react";

export const metadata = { title: "Customer Journey — Homespot Flash" };

type Step = {
  time: string;
  action: string;
  touchpoint: string;
  thinking: string;
  feeling: "happy" | "neutral" | "worried";
  pain?: string;
  icon: React.ReactNode;
};

const knowPhase: Step[] = [
  {
    time: "0:00",
    action: "User buka Homespot, klik 'Cek Limit Kilat'",
    touchpoint: "Landing page · CTA primer",
    thinking: "Sebelum cari rumah, kepengen tahu dulu plafon ku sebenarnya berapa.",
    feeling: "neutral",
    icon: <Home className="h-5 w-5" />,
  },
  {
    time: "0:30",
    action: "Kasih consent SLIK OJK + Open Banking SNAP-BI",
    touchpoint: "/pre-approval (step consent)",
    thinking: "Aman ga sih data aku? Tapi katanya UU PDP · bisa dicabut kapan saja.",
    feeling: "worried",
    pain: "Trust gap — user masih wary soal akses data finansial",
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    time: "0:45",
    action: "AI jalan: tarik data + SHAP scoring + fairness check",
    touchpoint: "Backend LightGBM + explainer",
    thinking: "Progress bar bergerak, feels transparent. Berapa ya hasilnya?",
    feeling: "neutral",
    icon: <Brain className="h-5 w-5" />,
  },
  {
    time: "1:15",
    action: "Lihat hasil: limit Rp 2M, skor 87, Green tier, 3 alasan",
    touchpoint: "/pre-approval (step result)",
    thinking: "Wah jelas banget. Aku bisa cari rumah sesuai plafon, ga cuma mimpi.",
    feeling: "happy",
    icon: <Sparkles className="h-5 w-5" />,
  },
];

const feelPhase: Step[] = [
  {
    time: "1:30",
    action: "Browse properti yang sudah auto-filter by plafon",
    touchpoint: "/properties (list)",
    thinking: "Lebih fokus — ga perlu lihat yang ga kejangkau.",
    feeling: "happy",
    icon: <Eye className="h-5 w-5" />,
  },
  {
    time: "2:10",
    action: "Masuk detail: Grand Serenia Type 36",
    touchpoint: "/properties/[id]",
    thinking: "Ada VR Ready badge — worth dicek detailnya.",
    feeling: "neutral",
    icon: <Home className="h-5 w-5" />,
  },
  {
    time: "2:30",
    action: "VR tour 360° — Ruang Tamu → Dapur → Kamar → Taman",
    touchpoint: "VRViewer (Kuula/Matterport embed)",
    thinking: "Berasa lagi di dalamnya. Ukuran ruang, pencahayaan, view jendela — semua terlihat.",
    feeling: "happy",
    pain: "Capture VR butuh effort developer — adopsi lambat di Tier-2/3",
    icon: <Glasses className="h-5 w-5" />,
  },
  {
    time: "3:30",
    action: "Cek simulasi KPR di tab yang sama",
    touchpoint: "/properties/[id] (tab Simulasi)",
    thinking: "Cicilan Rp 14.6jt/bulan. DP 20% = Rp 600jt. OK, masih masuk budget.",
    feeling: "neutral",
    icon: <FileText className="h-5 w-5" />,
  },
];

const decidePhase: Step[] = [
  {
    time: "4:00",
    action: "Klik 'Apply dengan limit ini' — form sudah auto-filled",
    touchpoint: "/apply?property=grand-serenia-01",
    thinking: "Semua data udah terisi dari consent tadi. Tinggal review aja.",
    feeling: "happy",
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    time: "4:45",
    action: "Tanda tangan digital via PeruriSign (QTSP)",
    touchpoint: "/apply (e-sign block)",
    thinking: "Setara notaris. Ga perlu datang ke cabang.",
    feeling: "happy",
    icon: <PenSquare className="h-5 w-5" />,
  },
  {
    time: "5:00",
    action: "Submit — redirect ke status tracker",
    touchpoint: "/status/APP-2026-00042",
    thinking: "Timeline real-time. Notif via WhatsApp. Klik 'Hubungi sales' kalau butuh.",
    feeling: "happy",
    pain: "Final approval masih bergantung appraisal properti (3-8 jam SLA)",
    icon: <CheckCircle2 className="h-5 w-5" />,
  },
  {
    time: "~8:00 jam",
    action: "e-SPH siap — dana cair ke developer",
    touchpoint: "Notifikasi + tracker update",
    thinking: "Dari 'masih nyari' ke 'udah KPR-an' dalam satu sesi aktif 5 menit. Crazy.",
    feeling: "happy",
    icon: <Zap className="h-5 w-5" />,
  },
];

export default function JourneyPage() {
  return (
    <div className="container max-w-6xl py-10">
      <Badge variant="outline" className="border-accent text-accent">
        Thesis Methodology — Customer Journey Mapping (Kalbach, 2020)
      </Badge>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">Customer Journey Map</h1>
      <p className="mt-2 max-w-3xl text-muted-foreground">
        Visualisasi end-to-end user journey di Homespot Flash Service. Dibagi tiga fase framework
        konseptual thesis: <span className="font-semibold text-primary">KNOW</span> →{" "}
        <span className="font-semibold text-accent">FEEL</span> →{" "}
        <span className="font-semibold text-emerald-600">DECIDE</span>. Setiap step mencatat
        <span className="italic"> touchpoint, thinking, feeling,</span> dan pain point yang diidentifikasi.
      </p>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <LegendItem icon={<Smile className="h-3.5 w-3.5 text-emerald-600" />} label="Happy" />
        <LegendItem icon={<MessageCircle className="h-3.5 w-3.5 text-amber-600" />} label="Neutral" />
        <LegendItem icon={<Frown className="h-3.5 w-3.5 text-red-500" />} label="Worried" />
        <LegendItem icon={<AlertTriangle className="h-3.5 w-3.5 text-accent" />} label="Pain point (opportunity)" />
      </div>

      {/* Summary metric bar */}
      <Card className="mt-8 overflow-hidden">
        <div className="grid gap-0 md:grid-cols-4">
          <Metric label="Total active session" value="~5 min" icon={<Clock className="h-4 w-4" />} />
          <Metric label="Total touchpoint" value="12 step" icon={<ArrowRight className="h-4 w-4" />} />
          <Metric label="Pain points teridentifikasi" value="3" icon={<AlertTriangle className="h-4 w-4" />} />
          <Metric label="Approval final (SLA)" value="< 8 jam" icon={<CheckCircle2 className="h-4 w-4" />} last />
        </div>
      </Card>

      {/* Phases */}
      <Phase
        idx={1}
        title="KNOW — Cognitive Anchor"
        subtitle="AI & Assessment Engine. Resolves financial ambiguity at the start."
        color="primary"
        icon={<Brain className="h-5 w-5" />}
        steps={knowPhase}
      />

      <Phase
        idx={2}
        title="FEEL — Emotional Bridge"
        subtitle="VR Tour Module. 'Clothing fitting room' untuk properti — bangun sense of presence."
        color="accent"
        icon={<Heart className="h-5 w-5" />}
        steps={feelPhase}
      />

      <Phase
        idx={3}
        title="DECIDE — Executive Hub"
        subtitle="Integrated action. Commitment in One Session — financial logic + emotional connection + platform control."
        color="emerald"
        icon={<CheckCircle2 className="h-5 w-5" />}
        steps={decidePhase}
      />

      {/* Mapped to thesis findings */}
      <Card className="mt-12 bg-bri-light p-6">
        <h2 className="font-semibold">Insight Mapping ke Thesis</h2>
        <Separator className="my-4" />
        <div className="grid gap-4 text-sm md:grid-cols-3">
          <Insight
            title="Research Question 1 — AI Engagement"
            text="Tervalidasi visual: AI pre-approval di awal journey (step 0:30–1:15) kasih 'immediate financial clarity' — user langsung masuk ke fase FEEL dengan confidence."
          />
          <Insight
            title="Research Question 2 — VR Confidence"
            text="Step 2:30 (VR tour 360°) adalah momen terbangun emosi tertinggi. Pain point: adopsi VR content terbatas untuk Tier-2/3 developer."
          />
          <Insight
            title="Research Question 3 — Combined Impact"
            text="Journey total ~5 menit aktif → commitment. Signifikan dibanding baseline existing 3–7 hari. Hipotesis H7 (AI × VR synergy) layak ditest kuantitatif."
          />
        </div>
      </Card>
    </div>
  );
}

/* ------- Small helpers ------- */

function Phase({
  idx,
  title,
  subtitle,
  color,
  icon,
  steps,
}: {
  idx: number;
  title: string;
  subtitle: string;
  color: "primary" | "accent" | "emerald";
  icon: React.ReactNode;
  steps: Step[];
}) {
  const colorClass = {
    primary: "bg-primary text-white",
    accent: "bg-accent text-white",
    emerald: "bg-emerald-600 text-white",
  }[color];

  return (
    <section className="mt-12">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${colorClass}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Fase {idx}
          </div>
          <h2 className="text-xl font-bold md:text-2xl">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Card key={i} className="flex flex-col p-5">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="font-mono text-xs">{s.time}</Badge>
              {s.feeling === "happy" && <Smile className="h-4 w-4 text-emerald-600" />}
              {s.feeling === "neutral" && <MessageCircle className="h-4 w-4 text-amber-600" />}
              {s.feeling === "worried" && <Frown className="h-4 w-4 text-red-500" />}
            </div>
            <div className={`mt-3 inline-flex h-9 w-9 items-center justify-center rounded-lg ${colorClass}`}>
              {s.icon}
            </div>
            <div className="mt-3 font-semibold leading-snug">{s.action}</div>
            <div className="mt-1 text-xs text-muted-foreground">{s.touchpoint}</div>
            <div className="mt-3 rounded-md bg-muted/50 p-2 text-xs italic leading-relaxed">
              &ldquo;{s.thinking}&rdquo;
            </div>
            {s.pain && (
              <div className="mt-3 flex items-start gap-1.5 rounded-md border border-accent/30 bg-accent/5 p-2 text-xs leading-relaxed text-accent">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>{s.pain}</span>
              </div>
            )}
          </Card>
        ))}
      </div>
    </section>
  );
}

function LegendItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-full border bg-white px-3 py-1">
      {icon}
      <span>{label}</span>
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
  last,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  last?: boolean;
}) {
  return (
    <div className={`p-5 ${last ? "" : "md:border-r"}`}>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-2xl font-bold text-primary">{value}</div>
    </div>
  );
}

function Insight({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-accent">{title}</div>
      <div className="mt-2 text-sm leading-relaxed">{text}</div>
    </div>
  );
}

/* Inline Glasses icon to avoid extra lucide import (keep tree-shake simple) */
function Glasses({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="6" cy="15" r="4" />
      <circle cx="18" cy="15" r="4" />
      <path d="M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2" />
      <path d="M2.5 13 5 7c.7-1.3 1.4-2 3-2" />
      <path d="M21.5 13 19 7c-.7-1.3-1.5-2-3-2" />
    </svg>
  );
}
