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

const systemPrompt = `You are an AI credit scoring engine for BRI mortgage (KPR) pre-approval.
You must evaluate applicants fairly based on Indonesian market context and BRI's risk appetite.
Output strictly valid JSON — no prose, no markdown fences.

Rules of thumb (calibrated for IDR):
- Plafon max ~= (monthlyIncome * 0.35 - existingMonthlyDebt) amortized over tenor (max 240 months) at ~6.75% p.a.
- DTI (debt-to-income) > 50% → Red tier; 35-50% → Amber; < 35% → Green.
- Tenor shorter if age > 50 (retirement cutoff 65).
- Reasons must be specific, Indonesian, and reference actual input values (not generic).`;

function buildUserPrompt(i: ScoreInput) {
  const debt = i.existingMonthlyDebt ?? 0;
  return `Score this KPR applicant:
- Name: ${i.fullName ?? "(anonymous)"}
- Monthly income: Rp ${i.monthlyIncome.toLocaleString("id-ID")}
- Years employed: ${i.yearsEmployed}
- Age: ${i.age}
- Existing monthly debt obligations: Rp ${debt.toLocaleString("id-ID")}
- Employer: ${i.employer ?? "-"}
- Position: ${i.position ?? "-"}

Return JSON with these fields:
{
  "score": <integer 0-100>,
  "approved_limit_idr": <integer in IDR>,
  "max_tenor_months": <integer, 60-240>,
  "estimated_rate": <number, annual percent e.g. 6.75>,
  "tier": "Green" | "Amber" | "Red",
  "confidence": "Green" | "Amber" | "Red",
  "top_reasons": [<exactly 3 short Indonesian reasons, max 80 chars each>],
  "monthly_installment_idr": <integer>,
  "dti_ratio_pct": <number>
}`;
}

export async function POST(req: Request) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GROQ_API_KEY not set. Add it to .env.local or Vercel env vars." },
      { status: 500 }
    );
  }

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
  const groq = new Groq({ apiKey });

  try {
    const res = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0.2,
      max_tokens: 600,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: buildUserPrompt(input) },
      ],
    });

    const text = res.choices[0]?.message?.content ?? "{}";
    const parsed = JSON.parse(text);

    const latency = Date.now() - started;

    const result: ScoreResult = {
      score: clampInt(parsed.score, 0, 100),
      approved_limit_idr: clampInt(parsed.approved_limit_idr, 0, 50_000_000_000),
      max_tenor_months: clampInt(parsed.max_tenor_months, 60, 240),
      estimated_rate: Number(parsed.estimated_rate ?? 6.75),
      tier: normalizeTier(parsed.tier),
      confidence: normalizeTier(parsed.confidence ?? parsed.tier),
      top_reasons: Array.isArray(parsed.top_reasons)
        ? parsed.top_reasons.slice(0, 3).map(String)
        : [],
      monthly_installment_idr: clampInt(parsed.monthly_installment_idr, 0, 1_000_000_000),
      dti_ratio_pct: Number(parsed.dti_ratio_pct ?? 0),
      latency_ms: latency,
      model: "llama-3.3-70b-versatile (Groq LPU)",
    };

    // Optional persistence — enabled via persist:true in body
    if (input.persist && input.fullName) {
      try {
        const sb = await createClient();

        // 1) Find or create applicant
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

        // 2) Optional property lookup
        let propertyId: string | null = null;
        if (input.propertySlug) {
          const { data: prop } = await sb
            .from("properties")
            .select("id")
            .eq("slug", input.propertySlug)
            .maybeSingle();
          propertyId = prop?.id ?? null;
        }

        // 3) Create application
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

        // 4) Create ai_score row
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
          raw_output: parsed,
        });

        result.application_code = appRow.code;
      } catch (dbErr: unknown) {
        // Don't fail the API if persistence breaks — just log
        console.error("persist failed:", dbErr);
      }
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Groq call failed: ${msg}` }, { status: 502 });
  }
}

function clampInt(v: unknown, min: number, max: number): number {
  const n = Math.round(Number(v));
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function normalizeTier(t: unknown): "Green" | "Amber" | "Red" {
  const s = String(t ?? "").toLowerCase();
  if (s.includes("green")) return "Green";
  if (s.includes("amber") || s.includes("yellow")) return "Amber";
  if (s.includes("red")) return "Red";
  return "Amber";
}
