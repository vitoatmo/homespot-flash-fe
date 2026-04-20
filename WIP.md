---
project: homespot-flash-fe
owner: vitoatmo
thesis: Cipto Haryabri — MBA ITB 2026
framework: KNOW → FEEL → DECIDE (TAM + SERVQUAL)
stack: Next.js 15 (App Router) · React 19 · Tailwind · shadcn/ui · Supabase SSR · Groq llama-3.3-70b
updated: 2026-04-20
---

# Work-in-Progress Log

Machine-readable log of what ships, what's in flight, and what's next. Written so a future AI collaborator can pick up in one read.

## 1. Delivered (merged on `main`)

### Infrastructure
- [x] Next.js 15 App Router scaffold, React 19, Tailwind, shadcn/ui
- [x] Supabase SSR client (`lib/supabase/{server,client}.ts`) with anon key + RLS
- [x] Groq AI scoring endpoint `/api/score` (llama-3.3-70b, JSON mode, DTI+tenor+plafon calibrated for IDR)
- [x] Persistence: `applicants`, `properties`, `applications`, `ai_scores`, `status_events`, `property_tours`

### Journey coverage
- [x] **KNOW** — `/pre-approval` real-input form, AI call, `top_reasons[]` stored, session-save
- [x] **FEEL** — `/properties` catalog (33 items, 7 tiers, Supabase-backed), basic `<VRViewer>` on detail
- [x] **DECIDE** — `/apply` prefilled from session, `/status/[code]` timeline with auto-pulled docs

### UX continuity
- [x] `sessionStorage` helper (`lib/session-data.ts`) carries applicant + score + selectedProperty between pages
- [x] `SessionAwareBanner` + `PropertyApplyCta` adapt to user's approved limit
- [x] URL-driven filters on `/properties` (category, type, city, min/max price, search)
- [x] "Filter sesuai limit saya" one-click AI-match

### Admin / thesis demo
- [x] `/admin/records` — live DB table of applicants, applications, ai_scores, properties
- [x] Delete actions wired as Server Actions
- [x] Properties seeded with varied categories (subsidi → ultra_luxury, Rp 172jt → 38M)

## 2. In flight

| Task | Status | Owner | Notes |
|---|---|---|---|
| Atomic design folders (atoms/molecules/organisms/templates) | in_progress | claude | landing folder structure + first migrations |
| `JourneyProgress` persistent stepper | in_progress | claude | P0 thesis-defense asset |
| `AiExplainCard` organism | pending | claude | surface `top_reasons[]` with tooltips |
| `ConsentPanel` (UU PDP + SNAP-BI) | pending | claude | needs `applicants.consent_log` column |
| Migrate Field/Row/Stat to shared molecules | pending | claude | DRY — 5 pages duplicate these |

## 3. Next up (ordered by thesis ROI)

See `AUDIT.md` for the full list. Highest-leverage in order:

1. **`JourneyProgress` stepper** — makes the framework visible on every page
2. **`AiExplainCard`** — "why AI approved X" modal; addresses Trust (Theme 5) + PU (TAM)
3. **`ConsentPanel`** — explicit data-access consent before scoring (SERVQUAL · Assurance)
4. **Match-score % per property card** — quantify AI fit beyond eligible/not
5. **Neighborhood insights** — strengthens FEEL/Tangibles
6. **Shortlist + `/compare` page** — BI / reduce decision hesitation
7. **Post-decision micro-survey** — captures CS quantitatively for the defense
8. **Developer dashboard** — addresses T2 "developer conversion challenge"

## 4. Known debt

- `components/` is flat; P0 is to introduce `atoms/molecules/organisms/templates` split
- Duplicate local helpers (Field / Row / Stat / Doc / SimRow) exist in 5+ page files
- `/apply` page still hardcodes property fallback if `session.selectedProperty` empty — decide: redirect to catalog or accept
- `<VRViewer>` is a single pannable image, not a true 360 room walkthrough
- `status_events` timeline is still dummy/hardcoded in `/status/[id]` — needs to pull real rows for the `id`
- Admin delete uses permissive RLS — fine for demo, requires service_role + server routes in prod

## 5. Environment

`.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon>
GROQ_API_KEY=gsk_...            # rotate post-demo
```
Supabase project: `kdlplavwojhssuveyvwv` (ap-northeast-2)

## 6. Commands

```bash
npm run dev         # local dev on :3000
npx tsc --noEmit    # type-check (must pass before push)
npm run build       # production build
```

## 7. How to read this repo (for future AI)

1. Start with `AUDIT.md` — thesis alignment gap analysis
2. Then `CLAUDE.md` — architecture overview + atomic conventions
3. Skim `WIP.md` section 2–3 to see what's in flight
4. `lib/data/properties.ts` is the DB access surface for property catalog
5. `lib/session-data.ts` is the cross-page session bridge
6. The framework flow is: `/pre-approval` (KNOW) → `/properties` + `/properties/[id]` (FEEL) → `/apply` → `/status/[id]` (DECIDE)
