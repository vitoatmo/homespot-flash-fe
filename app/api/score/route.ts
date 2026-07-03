import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ScoreInput = {
  fullName?: string;
  nik?: string;
  npwp?: string;
  phone?: string;
  monthlyIncome: number;
  yearsEmployed: number;
  age: number;
  existingMonthlyDebt?: number;
  employer?: string;
  position?: string;
  // Optional — if provided, will persist to DB
  persist?: boolean;
  propertySlug?: string;
  tenorMonths?: number;
};

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

// ── Deterministic decision engine ────────────────────────────────────────
// Same input ALWAYS yields the same numbers. This is the trust guarantee.
// AI (Groq) is used ONLY to phrase the explanation, never to decide numbers.
const MAX_DTI_POLICY = 0.35; // BRI risk appetite: max 35% of income to installment
const RETIREMENT_AGE = 65;

type Decision = {
  score: number;
  approved_limit_idr: number;
  max_tenor_months: number;
  estimated_rate: number;
  tier: "Green" | "Amber" | "Red";
  confidence: "Green" | "Amber" | "Red";
  monthly_installment_idr: number;
  dti_ratio_pct: number;
};

function computeDecision(i: ScoreInput): Decision {
  const income = Math.max(0, i.monthlyIncome);
  const debt = Math.max(0, i.existingMonthlyDebt ?? 0);
  const age = Math.max(18, Math.min(70, i.age));
  const yearsEmployed = Math.max(0, i.yearsEmployed);

  // Current debt burden (before the new KPR)
  const currentDti = income > 0 ? debt / income : 1;

  // Tenor: cap at 240 months, and never past retirement (age 65)
  const maxTenor = clampInt((RETIREMENT_AGE - age) * 12, 60, 240);

  // Installment capacity = how much new installment the applicant can carry
  const capacity = Math.max(0, income * MAX_DTI_POLICY - debt);

  // Tier drives the rate (better profile → cheaper money)
  const tier = deriveTier(capacity, currentDti, yearsEmployed, age);
  const estimated_rate = tier === "Green" ? 6.75 : tier === "Amber" ? 8.25 : 10.5;

  // Plafon = present value of an annuity of `capacity` over `maxTenor` at the rate
  const r = estimated_rate / 100 / 12;
  const plafon =
    capacity <= 0
      ? 0
      : r > 0
        ? capacity * (1 - Math.pow(1 + r, -maxTenor)) / r
        : capacity * maxTenor;

  const approved_limit_idr = roundTo(plafon, 1_000_000); // round to nearest juta
  const monthly_installment_idr = Math.round(capacity);

  // Post-approval DTI (existing debt + new installment) as % of income
  const dti_ratio_pct =
    income > 0
      ? Number((((debt + monthly_installment_idr) / income) * 100).toFixed(2))
      : 100;

  const score = computeScore(income, yearsEmployed, age, currentDti);

  // Confidence reflects input completeness, not the decision itself
  const complete = income > 0 && yearsEmployed > 0 && age > 0;
  const confidence: Decision["confidence"] = complete
    ? tier === "Red"
      ? "Amber"
      : "Green"
    : "Amber";

  return {
    score,
    approved_limit_idr,
    max_tenor_months: maxTenor,
    estimated_rate,
    tier,
    confidence,
    monthly_installment_idr,
    dti_ratio_pct,
  };
}

function deriveTier(
  capacity: number,
  currentDti: number,
  yearsEmployed: number,
  age: number
): "Green" | "Amber" | "Red" {
  if (capacity <= 0 || currentDti >= 0.5) return "Red";
  if (currentDti <= 0.2 && yearsEmployed >= 2 && age <= 55) return "Green";
  return "Amber";
}

function computeScore(
  income: number,
  yearsEmployed: number,
  age: number,
  currentDti: number
): number {
  const incomePts = clamp(income / 20_000_000, 0, 1) * 35; // 20jt+/bln → full
  const tenurePts = clamp(yearsEmployed / 8, 0, 1) * 20; // 8yr+ → full
  const agePts =
    age >= 25 && age <= 45
      ? 20
      : age < 25
        ? clamp((age - 20) / 5, 0, 1) * 20
        : clamp((60 - age) / 15, 0, 1) * 20;
  const dtiPts = clamp(1 - currentDti / 0.5, 0, 1) * 25; // 0% debt → full, 50%+ → 0
  return clampInt(Math.round(incomePts + tenurePts + agePts + dtiPts), 0, 100);
}

// ── AI layer: explanation only ───────────────────────────────────────────
const systemPrompt = `You are the explanation layer of a KPR (mortgage) pre-approval engine for BRI.
The numeric decision has ALREADY been computed by a deterministic engine — you do NOT change any number.
Your only job: write 3 short reasons (in Indonesian) that justify the given decision to the applicant.
Rules:
- Reference the actual figures provided (income, debt, plafon, DTI, tenor, tier).
- Be specific and human, max 80 chars per reason.
- Output strictly valid JSON: {"top_reasons": ["...","...","..."]}. No prose, no markdown.`;

function buildReasonPrompt(i: ScoreInput, d: Decision) {
  const debt = i.existingMonthlyDebt ?? 0;
  return `Decision to explain:
- Applicant: ${i.fullName ?? "(anonim)"}, umur ${i.age}, masa kerja ${i.yearsEmployed} th
- Penghasilan: Rp ${i.monthlyIncome.toLocaleString("id-ID")}/bln
- Utang existing: Rp ${debt.toLocaleString("id-ID")}/bln
- Employer/posisi: ${i.employer ?? "-"} / ${i.position ?? "-"}
- HASIL (final, jangan diubah): tier ${d.tier}, skor ${d.score}/100,
  plafon Rp ${d.approved_limit_idr.toLocaleString("id-ID")},
  cicilan Rp ${d.monthly_installment_idr.toLocaleString("id-ID")}/bln,
  DTI ${d.dti_ratio_pct}%, tenor ${d.max_tenor_months} bln, bunga ${d.estimated_rate}% p.a.

Return JSON: {"top_reasons": ["<alasan 1>","<alasan 2>","<alasan 3>"]}`;
}

// Deterministic fallback reasons if Groq is unavailable — keeps the app working.
function fallbackReasons(i: ScoreInput, d: Decision): string[] {
  const incomeStr = `Rp ${i.monthlyIncome.toLocaleString("id-ID")}/bln`;
  const tierWord =
    d.tier === "Green" ? "sangat sehat" : d.tier === "Amber" ? "perlu tinjauan" : "berisiko";
  return [
    `Penghasilan ${incomeStr} mendukung plafon Rp ${d.approved_limit_idr.toLocaleString("id-ID")}.`,
    `DTI ${d.dti_ratio_pct}% dengan tenor ${d.max_tenor_months / 12} tahun — profil ${tierWord}.`,
    `Masa kerja ${i.yearsEmployed} th & umur ${i.age} th sesuai kebijakan usia pensiun 65.`,
  ];
}

export async function POST(req: Request) {
  let input: ScoreInput;
  try {
    input = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (typeof input.monthlyIncome !== "number" || input.monthlyIncome <= 0) {
    return NextResponse.json({ error: "monthlyIncome required (number > 0)" }, { status: 400 });
  }

  const started = Date.now();

  // 1) Deterministic numbers — the source of truth
  const decision = computeDecision(input);

  // 2) AI explanation (best-effort; falls back to deterministic reasons)
  let top_reasons = fallbackReasons(input, decision);
  let model = "deterministic-engine (fallback reasons)";
  const apiKey = process.env.GROQ_API_KEY;
  if (apiKey) {
    try {
      const groq = new Groq({ apiKey });
      const res = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        temperature: 0.2,
        max_tokens: 300,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: buildReasonPrompt(input, decision) },
        ],
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content ?? "{}");
      if (Array.isArray(parsed.top_reasons) && parsed.top_reasons.length > 0) {
        top_reasons = parsed.top_reasons.slice(0, 3).map(String);
        model = "llama-3.3-70b-versatile (Groq LPU) · deterministic numbers";
      }
    } catch (err) {
      console.error("Groq reason generation failed, using fallback:", err);
    }
  }

  const result: ScoreResult = {
    ...decision,
    top_reasons,
    latency_ms: Date.now() - started,
    model,
  };

  // 3) Optional persistence — enabled via persist:true in body
  if (input.persist && input.fullName) {
    try {
      const sb = await createClient();

      const { data: existingApplicant } = await sb
        .from("applicants")
        .select("id")
        .eq("full_name", input.fullName)
        .maybeSingle();

      let applicantId = existingApplicant?.id;
      if (!applicantId) {
        const { data: newApp, error: aErr } = await sb
          .from("applicants")
          .insert({
            full_name: input.fullName,
            nik: input.nik || null,
            npwp: input.npwp || null,
            phone: input.phone || null,
            monthly_income_idr: input.monthlyIncome,
            years_employed: input.yearsEmployed,
            existing_monthly_debt_idr: input.existingMonthlyDebt ?? 0,
            employer: input.employer || null,
            position: input.position || null,
            persona: "fixed_income",
          })
          .select("id")
          .single();
        if (aErr) throw aErr;
        applicantId = newApp.id;
      }

      let propertyId: string | null = null;
      if (input.propertySlug) {
        const { data: prop } = await sb
          .from("properties")
          .select("id")
          .eq("slug", input.propertySlug)
          .maybeSingle();
        propertyId = prop?.id ?? null;
      }

      const code = `APP-2026-${String(Math.floor(Math.random() * 90000) + 10000)}`;
      const { data: appRow, error: appErr } = await sb
        .from("applications")
        .insert({
          code,
          applicant_id: applicantId,
          property_id: propertyId,
          requested_amount_idr: result.approved_limit_idr,
          tenor_months: input.tenorMonths ?? result.max_tenor_months,
          status:
            result.tier === "Green" ? "pre_approved" : result.tier === "Amber" ? "clf_review" : "rejected",
          decision_tier: result.tier,
        })
        .select("id, code")
        .single();
      if (appErr) throw appErr;

      await sb.from("ai_scores").insert({
        application_id: appRow.id,
        score: result.score,
        approved_limit_idr: result.approved_limit_idr,
        max_tenor_months: result.max_tenor_months,
        estimated_rate: result.estimated_rate,
        tier: result.tier,
        confidence: result.confidence,
        monthly_installment_idr: result.monthly_installment_idr,
        dti_ratio_pct: result.dti_ratio_pct,
        top_reasons: result.top_reasons,
        latency_ms: result.latency_ms,
        model: result.model,
        raw_input: input as unknown as Record<string, unknown>,
        raw_output: result as unknown as Record<string, unknown>,
      });

      result.application_code = appRow.code;
    } catch (dbErr: unknown) {
      console.error("persist failed:", dbErr);
    }
  }

  return NextResponse.json(result);
}

// ── helpers ──────────────────────────────────────────────────────────────
function clamp(v: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, v));
}

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function roundTo(v: number, step: number): number {
  if (step <= 0) return Math.round(v);
  return Math.round(v / step) * step;
}
