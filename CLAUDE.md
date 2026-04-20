# CLAUDE.md — AI Collaborator Guide

This repo is a thesis demo. Priority = **making the KNOW → FEEL → DECIDE framework visible and testable in a live app**, not shipping a real product.

## Read order for a new session
1. `AUDIT.md` — thesis alignment, feature gaps, priorities
2. `WIP.md` — current status, in-flight, next-up
3. This file — conventions

## Architecture

### Stack
- Next.js 15 (App Router, RSC by default)
- React 19 stable
- TypeScript strict
- Tailwind + shadcn/ui primitives (`components/ui/*`)
- Supabase SSR (`lib/supabase/server.ts` for RSC, `lib/supabase/client.ts` for client components)
- Groq for the AI scoring endpoint

### Data flow
```
/pre-approval (KNOW)
  └─ /api/score (Groq llama-3.3-70b)
       └─ persists to applicants + applications + ai_scores
       └─ session-saves { form, score, application_code }

/properties (FEEL)
  └─ listProperties() — Supabase, filter-aware
  └─ <SessionAwareBanner> reads session.score.approved_limit_idr

/properties/[slug] (FEEL)
  └─ findProperty() — Supabase
  └─ <PropertyApplyCta> checks eligibility; saves session.selectedProperty on click

/apply (DECIDE)
  └─ pure client component
  └─ reads session.* for everything (identity, score, selectedProperty)

/status/[code] (DECIDE)
  └─ server component; currently renders dummy timeline
```

### Session bridge
`lib/session-data.ts` — sessionStorage-backed. Keys:
- `fullName, nik, npwp, phone, employer, position, age, yearsEmployed, monthlyIncome, existingDebt`
- `score: { approved_limit_idr, tier, top_reasons, application_code, … }`
- `selectedProperty: { slug, title, developer, location, city, price }`

Helpers: `saveSessionApplicant()`, `loadSessionApplicant()`, `clearSessionApplicant()`, `saveSelectedProperty()`.

## Atomic design conventions

We follow Brad Frost's atomic hierarchy. Keep components as close to the top of the tree as possible.

```
components/
├── ui/           # shadcn primitives — do not modify; treat as vendor code
├── atoms/        # framework-specific atoms (single-element, no business logic)
├── molecules/    # small compositions of atoms (Field = Label + Input)
├── organisms/    # complex composites with their own state / data fetching
└── templates/    # page-level scaffolds
```

### Rules of placement
- **Atom**: renders one HTML concept, no state, props drive everything. Example: `TierBadge`, `PriceTag`, `JourneyPill`.
- **Molecule**: 2-5 atoms working together, minimal or no state. Example: `Field` (Label + Input), `Stat` (icon + label + value).
- **Organism**: has business logic, fetches data, or holds state. Example: `PropertyApplyCta`, `AiExplainCard`, `JourneyProgress`.
- **Template**: lays out an entire page section. Example: `PageShell`, `SplitHero`.

### DRY triggers
If a small component (Field/Row/Stat/Doc/Row) gets duplicated in **2+ pages**, extract it into `molecules/` immediately.

### Naming
- Files: `kebab-case.tsx`
- Exports: `PascalCase` named exports (no default exports)
- Imports: `@/components/...` alias

## When adding a feature

1. Check `AUDIT.md` — is this a thesis-mapped gap? Tag the commit with `(TAM:PU)`, `(SERVQUAL:Assurance)`, etc.
2. Check `WIP.md` section 3 — is it already queued?
3. Start at the atomic layer that fits, not above.
4. Update `WIP.md` sections 2 and 3 in the same commit.

## Thesis-critical patterns

### AI explainability (Trust — Theme 5)
Every time the app displays an AI output, also display:
- `top_reasons` (at least 2)
- `confidence` badge (Green / Amber / Red)
- `latency_ms`
- `model` name

Wrap this in a reusable `<AiExplainCard>` so it's consistent.

### Consent (UU PDP — Theme 5)
Data sources auto-pulled (Dukcapil / DJP / SLIK / SNAP-BI) must each show an explicit consent line. Use `<ConsentPanel>` organism.

### Journey visibility (Theme 6, Responsiveness)
`<JourneyProgress>` lives in `app/layout.tsx` so every page advertises which stage the user is in. Non-framework routes (`/admin`, `/design-system`, `/findings`, etc.) hide it via prop.

## Supabase

Project id: `kdlplavwojhssuveyvwv` (ap-northeast-2).

Tables:
- `applicants` — PII + consent_log (future)
- `properties` — catalog, 33 rows, 7 categories × 7 types
- `applications` — links applicant + property + tenor + status + decision_tier
- `ai_scores` — one row per AI call (model, latency, reasons, raw_input/output)
- `status_events` — timeline (currently UI-hardcoded; should be wired)
- `property_tours` — VR view analytics

RLS: permissive (anon SELECT/INSERT/DELETE). Fine for demo, **not** for prod.

## Groq

Model: `llama-3.3-70b-versatile` via Groq LPU.
Prompt lives in `app/api/score/route.ts`. System prompt is IDR-calibrated.

If switching models: keep the JSON schema contract (`score`, `approved_limit_idr`, `max_tenor_months`, `estimated_rate`, `tier`, `confidence`, `top_reasons[]`, `monthly_installment_idr`, `dti_ratio_pct`).

## Testing

No test suite yet — demo-stage project. Minimum bar before push:
```bash
npx tsc --noEmit   # zero errors
```

## Do not

- Add runtime dependencies without asking — keeps bundle small
- Modify `components/ui/*` — it's shadcn-generated
- Use localStorage for PII (use sessionStorage which clears on tab close)
- Ship generateStaticParams on property routes — catalog is DB-backed, dynamic
