# UI/UX Audit — 2026-05-13

Auditor: ui-ux-designer subagent
Scope: routes `/`, `/pre-approval`, `/properties`, `/properties/[id]`, `/apply`, `/status/[id]`, plus `app/layout.tsx` + `<JourneyProgress>`. Atomic-design layers: `components/atoms`, `components/molecules`, `components/organisms`, plus flat-root organisms still pending migration.

---

## Executive Summary

1. **AI explainability is the single biggest thesis gap.** `top_reasons[]`, `latency_ms`, `model`, and `confidence` are wired through the API and stored in session, but they only surface inside the `/pre-approval` result card (`app/pre-approval/page.tsx:336-410`) and are completely missing from `/properties`, `/properties/[id]`, `/apply`, `/status/[id]`. The thesis's strongest defense asset (Theme 5, Trust + TAM:PU) is only visible on one screen — it must be promoted to a reusable `<AiExplainCard>` and dropped into every page that shows an AI-derived value (limit, eligibility, tier).
2. **There is no `<ConsentPanel>` yet.** The four data sources (Dukcapil / DJP / SLIK OJK / SNAP-BI / e-wallet / e-commerce) are listed as decorative "Consent" tiles with a green check pre-filled (`app/pre-approval/page.tsx:456-468`). They are not real checkboxes, no per-source toggling, no revoke, no consent log. This is the most thesis-fragile element under UU PDP scrutiny and panel questioning.
3. **Hardcoded property fallback breaks the framework demo.** `app/pre-approval/page.tsx:405` and `app/journey/page.tsx:97` hardcode `?property=grand-serenia-01`. If that slug ever drifts in Supabase, the post-score CTA dead-ends. Worse, it teaches the panel that "Apply langsung" bypasses FEEL — diluting the KNOW→FEEL→DECIDE narrative.
4. **Status timeline is dummy data.** `app/status/[id]/page.tsx:88-114` iterates over `statusTimeline` from `lib/data/user.ts:10-17` (hardcoded). The page already accepts `id` from params but never queries `status_events`. The SLA metrics ("3 jam 12 mnt", "Hari ini 17:30" — `app/status/[id]/page.tsx:134-136`) are static strings. This kills the Responsiveness (SERVQUAL · Theme 6) story.
5. **Two duplicate stage indicators compete for the user's attention.** `<JourneyProgress>` sits at the top of every flow page (sticky `top-14`), and `<SessionTimer>` floats bottom-right showing the same KNOW→FEEL→DECIDE progress as a percentage (`components/session-timer.tsx:16-21`). Conceptually overlapping, visually noisy, and the timer is hidden on `/` (the home page where the framework should be most visible). Consolidate.

---

## Per-route findings

### `app/layout.tsx` + `<JourneyProgress>`

- **Stage:** N/A (chrome)
- **What works:**
  - Single `<JourneyProgress>` in the root layout (`app/layout.tsx:23`) makes the framework visible across every flow page, exactly per `CLAUDE.md` guidance.
  - Clean `HIDE_ON` regex pattern (`components/organisms/journey-progress.tsx:45`) keeps the stepper off `/admin`, `/design-system`, `/findings`, `/limitations`, `/journey`, and the home page.

- **Issues:**

  1. **Stepper is hidden on `/`** — Severity: **P1** · Theme: **TAM:PEOU** · Where: `components/organisms/journey-progress.tsx:45`. The home page is exactly where a thesis panelist first sees the framework. Hiding the stepper there makes KNOW→FEEL→DECIDE feel like a hidden-feature instead of a product backbone. Fix: remove `/^\/$/` from `HIDE_ON` and add a non-clickable "preview" state, or render an inline `<JourneyMap>` molecule inside the home hero. Effort: **S**.

  2. **Active match for `/status` collapses into DECIDE alongside `/apply`** — Severity: **P1** · Theme: **SERVQUAL:Responsiveness** · Where: `components/organisms/journey-progress.tsx:40` (`matches: /^\/(apply|status)/`). `/status` is post-DECIDE waiting; merging it into the same pill prevents the user from understanding "I'm done; I'm waiting on the bank". Fix: introduce a 4-stage variant — KNOW → FEEL → DECIDE → TRACK — or render a sub-state pill ("Submitted · awaiting decision") when pathname starts with `/status`. Effort: **S**.

  3. **Stepper has no SR-friendly current-step announcement** — Severity: **P2** · Theme: **Visual**. `aria-current="step"` is set on the link (line 66) but there is no `<ol>` semantic ordering nor visible step numbering. Wrap the stages in `<ol>` and add `aria-label="Step X of 3"`. Effort: **S**.

  4. **`<SessionTimer>` overlaps with `<JourneyProgress>` conceptually** — Severity: **P1** · Theme: **TAM:PEOU** · Where: `components/session-timer.tsx:16-21` and `components/organisms/journey-progress.tsx`. The timer's `progressMap` (`25/50/75/100`) restates the stepper. The bottom-right floating card also blocks the mobile sticky CTAs on small viewports. Either fold the timer's clock-only feature into the stepper (e.g., a small "10:24" pill on the active step) or restrict the timer to a single page (`/status`). Effort: **M**.

### `/` (home)

- **Stage:** N/A (marketing entry)
- **What works:**
  - Hero pairs a clear value-prop with a working AI-result mock card (`app/page.tsx:68-92`), so the panel can see the proof artifact before clicking anything.
  - Featured-properties section uses `<PropertyCard>` (line 162) so the look matches `/properties`.
  - Tier-diverse picker (`luxury + mid + starter`, line 21-27) is a thoughtful demo touch.

- **Issues:**

  1. **No `<JourneyProgress>` visible on home** — Severity: **P0** · Theme: **TAM:PEOU / Theme 6** · Where: `components/organisms/journey-progress.tsx:45`. See layout finding #1. The home is the framework's billboard; hiding the stepper here forces the user to enter a flow page just to see the construct that the thesis is built around. Fix: render the stepper in "preview" mode on `/` (all stages "upcoming"), or replace it with a static `<JourneyMap>` molecule below the hero. Effort: **S**.

  2. **Mock score card hardcodes "Rp 2.000.000.000" and "87/100"** — Severity: **P2** · Theme: **Visual** · Where: `app/page.tsx:72,82`. If the panel asks "is this a real screenshot?", "no, this is a static mock" weakens the demo. Fix: either drive these from a deterministic sample in `lib/data/`, or stamp it with a `Demo` micro-badge. Effort: **S**.

  3. **Local `Metric`, `Pillar`, `Feat` helpers duplicate molecule-layer patterns** — Severity: **P2** · Theme: **Atomic** · Where: `app/page.tsx:187-220`. `Metric` already exists as `components/molecules/metric.tsx:3`. Replace the inline helper and consider extracting `Pillar` and `Feat` as `components/molecules/{pillar,feature-tile}.tsx` (they are nearly identical 3-line cards). Effort: **S**.

  4. **CTA "Apply langsung" path is invisible on the home** — Severity: **P2** · Theme: **TAM:PU**. The home pitches "selesai dalam satu sesi" but only offers "Cek Limit" / "Lihat Properti" as primary CTAs. A small tertiary "Lihat contoh sesi penuh →" linking to a guided demo would tighten the one-session story. Effort: **S**. (Defer — `/journey` route already exists; consider only if `/journey` doesn't already demo it.)

  5. **Hero gradient uses raw hex `#0a5ba8`** — Severity: **P2** · Theme: **Visual** · Where: `app/page.tsx:31`. Tailwind theme has `--primary`; an inline hex breaks token discipline. Fix: extend the Tailwind config with `primary-700` (or use `from-primary to-primary/90`). Effort: **S**.

### `/pre-approval`

- **Stage:** KNOW
- **What works:**
  - Three-step state machine (`consent → scoring → result`) is intuitive and recoverable on error (`app/pre-approval/page.tsx:62-200`).
  - Result card surfaces `latency_ms`, `model`, `dti_ratio_pct`, `top_reasons` — the explainable-AI building blocks are all here, just not extracted yet (`app/pre-approval/page.tsx:336-410`).
  - Mobile sticky CTA + validation copy is polished (lines 289-298).
  - Stores `application_code` and links to `/admin/records` with a clear "Tersimpan di Supabase sebagai..." breadcrumb (lines 421-430).

- **Issues:**

  1. **"Consent" tiles are decorative, not real checkboxes** — Severity: **P0** · Theme: **UU-PDP / Trust** · Where: `app/pre-approval/page.tsx:236-240` (block), `app/pre-approval/page.tsx:456-468` (helper). Every source is shown with a pre-filled green check, no input, no per-source revoke, no persistence in `applicants.consent_log`. This is the exact gap called out in `AUDIT.md` line 36-39 for `ConsentPanel`. Fix: build `<ConsentPanel>` organism with one Switch per source, gate `Setuju & Cek Limit` behind ≥SLIK + SNAP-BI consents, and POST consent_log to Supabase before calling `/api/score`. Effort: **M**. [already queued in `WIP.md:45`]

  2. **AI-result block is bespoke; should be the `<AiExplainCard>`** — Severity: **P0** · Theme: **Trust / TAM:PU** · Where: `app/pre-approval/page.tsx:346-410`. `top_reasons` are rendered as a plain `<ul>` with no per-reason input attribution (the panel would say: "kenapa DTI 28% dibilang sehat? threshold-nya berapa?"). Fix: extract `<AiExplainCard>` organism — header (tier+score+confidence), section A (limit+rate+tenor), section B (reasons with a `<ReasonChip>` molecule that has a tooltip linking back to the input that drove it), section C (model + latency + DTI footer). Same component must then be re-used on `/properties/[id]`, `/apply` sidebar, `/status/[id]`. Effort: **M**. [already queued in `WIP.md:44`]

  3. **"Apply langsung" hardcodes a property slug** — Severity: **P1** · Theme: **SERVQUAL:Reliability** · Where: `app/pre-approval/page.tsx:405`. If `grand-serenia-01` is removed from Supabase the CTA 404s. It also bypasses FEEL entirely. Fix: replace with "Lihat properti sesuai limitku" → `/properties?maxPrice={approved_limit_idr}` so the user always passes through the FEEL stage. Effort: **S**.

  4. **`r.max_tenor_months / 12` displayed twice without formatting safety** — Severity: **P2** · Theme: **Visual** · Where: `app/pre-approval/page.tsx:354,397`. If `max_tenor_months = 234` (edge AI output), this renders "19.5 tahun". Wrap with `Math.round()` or display as months. Effort: **S**.

  5. **`fillDemo()` blanks identity fields** — Severity: **P2** · Theme: **TAM:PEOU** · Where: `app/pre-approval/page.tsx:160-173`. The label says "Isi demo" but only seeds age/income; required fields (fullName) stay empty so `isValid` is still false and the button stays disabled. Either prefix the button text with "Isi demo numerik" or actually seed a placeholder name like "Demo User". Effort: **S**.

  6. **Local `TextField`, `NumberField`, `Consent` helpers duplicate atom/molecule patterns** — Severity: **P2** · Theme: **Atomic** · Where: `app/pre-approval/page.tsx:456-501`. `Field` already exists in `components/molecules/field.tsx`. Replace `TextField` + `NumberField` with `<Field type="number">` and extract `Consent` as the molecule that the future `<ConsentPanel>` will compose. Effort: **S**.

  7. **Scoring step uses synthetic progress** — Severity: **P2** · Theme: **TAM:PEOU** · Where: `app/pre-approval/page.tsx:86-91`. The 180ms ticker is honest enough but if the Groq call returns in 800ms the bar hops from 32% to 100% mid-step ("Memverifikasi dokumen & KTP"). At minimum, hold the visible step at "Menjalankan model AI" until the fetch resolves. Effort: **S**.

  8. **`Consent` molecule label "E-wallet (opsional)" implies opt-in but renders as a green check** — Severity: **P1** · Theme: **UU-PDP** · Where: `app/pre-approval/page.tsx:238-239`. An "optional" data source that auto-shows as consented is exactly the dark-pattern UU PDP cracks down on. Fix: differentiate optional from required, default optional to off. Effort: **S** (folds into the `<ConsentPanel>` work).

### `/properties`

- **Stage:** FEEL
- **What works:**
  - `<SessionAwareBanner>` (line 4, `components/session-aware-banner.tsx`) is a clean continuity signal — shows the user their carried-over limit, with a fallback prompt for users who skipped pre-approval.
  - URL-driven filters with `useTransition` (`components/property-filters.tsx:39`) keep the address bar shareable.
  - "Filter sesuai limit saya" one-click AI-match (lines 83-86) is the strongest existing affordance for TAM:PU in the catalog.
  - Mobile filter drawer is well executed (lines 266-311) — body-scroll lock, sticky action bar, dismissable.

- **Issues:**

  1. **No per-property match-score** — Severity: **P1** · Theme: **TAM:PU / Trust** · Where: `components/property-card.tsx:9-59`. `AUDIT.md` calls this out as a P1 (line 44-46). Currently every card carries the same green "Pre-approved" badge (line 53) regardless of whether it actually fits the user's limit. Even a basic `f(affordabilityRatio, cityMatch)` would let the panel see the AI working in the catalog. Fix: add a `matchScore: number` field computed at render time using session limit + price; render as a top-right ribbon or tier-color dot. Effort: **S**. [already queued in `WIP.md:54`]

  2. **"Pre-approved" badge is misleading when user has no session** — Severity: **P1** · Theme: **Trust** · Where: `components/property-card.tsx:53`. Same badge ships even when no session exists. A non-pre-approved visitor sees "Pre-approved" on a property they have not been approved for — that confuses what "pre-approval" means. Fix: hide the badge when `loadSessionApplicant()` returns null, or rename it to "Eligible KPR" with neutral phrasing. (The card is currently server-rendered though, so this needs to be moved to a client wrapper or read via cookie.) Effort: **S–M**.

  3. **`<SessionAwareBanner>` and the filter sidebar both say "filter sesuai limit"** — Severity: **P2** · Theme: **Atomic / TAM:PEOU** · Where: `components/session-aware-banner.tsx:67-69` ("Pakai filter ... di sidebar kiri.") and `components/property-filters.tsx:108-119` (the actual button). The banner tells the user to look elsewhere; on mobile the sidebar is a drawer that's not on the left. Fix: collapse the banner into a single CTA button that fires `applyAIMatch()` directly, removing the indirection. Effort: **S**.

  4. **Empty-state message gives no recovery action** — Severity: **P2** · Theme: **SERVQUAL:Responsiveness** · Where: `app/properties/page.tsx:77-79`. "Coba ubah rentang harga atau kota." is passive. Add a single "Reset semua filter" button inline. Effort: **S**.

  5. **City filter labelled "Kota" but reads from `province` field** — Severity: **P2** · Theme: **Microcopy** · Where: `lib/data/properties.ts:91-97` (mapping `location = r.city`, `city = r.province`). The taxonomy is confusing: detail page shows "Tangerang, Banten" with `Banten` in `p.city`. Either rename the model fields or relabel the filter as "Provinsi". Effort: **S**.

### `/properties/[id]`

- **Stage:** FEEL
- **What works:**
  - 3-source VR fallback (Matterport → multi-scene Pannellum → 2D pannable) is robust and labelled (lines 60-66).
  - Tabbed Spec / Fasilitas / Simulasi KPR (`app/properties/[id]/page.tsx:68-120`) is the right level of detail for FEEL.
  - `<PropertyApplyCta>` distinguishes "no session → cek limit dulu" vs "eligible" vs "over limit" with color-coded blocks (`components/property-apply-cta.tsx:36-67`) — strong eligibility signaling.

- **Issues:**

  1. **Apply CTA shows no AI reasoning** — Severity: **P0** · Theme: **Trust / TAM:PU** · Where: `components/property-apply-cta.tsx:48-56`. The eligible state simply says "Limit kamu Rp X cukup untuk properti ini." This is the highest-stakes decision moment in the FEEL stage — it must show *why* the AI says yes (carry over `top_reasons` from session). Fix: render a compact `<AiExplainCard variant="inline">` here, or at minimum show 1-2 reason chips. Effort: **S** (depends on #2 above).

  2. **"Pre-approved eligible" is binary at 105% buffer** — Severity: **P1** · Theme: **TAM:PU** · Where: `components/property-apply-cta.tsx:34`. A property at 106% of limit is "Di luar limit" with a red banner. There is no middle "Amber — perlu DP lebih besar / tenor lebih panjang" state, which is exactly what the thesis Tier system (Green/Amber/Red) is designed for. Fix: introduce an Amber band (105-130%) with copy "Bisa, tapi DP 30% / tenor 25 thn". Effort: **M**.

  3. **Simulasi KPR ignores the user's actual approved rate/tenor** — Severity: **P1** · Theme: **SERVQUAL:Reliability** · Where: `app/properties/[id]/page.tsx:27-31`. The detail page hardcodes `tenor = 240`, `rate = 6.75%` and uses 20% DP. If the user's `session.score.estimated_rate` is 7.5% (Amber), the simulation lies. Fix: read session score; fallback to defaults only when none. Effort: **S**.

  4. **VR controls use English fragments mixed with Indonesian** — Severity: **P2** · Theme: **Microcopy** · Where: `components/vr-viewer.tsx:80-86` ("Drag to rotate", "Scroll to zoom", "Matterport-grade capture"). Fix: "Geser untuk memutar", "Scroll untuk zoom", "Kualitas Matterport". Effort: **S**.

  5. **Local `Stat` and `SimRow` duplicate molecule layer** — Severity: **P2** · Theme: **Atomic** · Where: `app/properties/[id]/page.tsx:139-154`. `Stat` already exists at `components/molecules/stat.tsx`. `SimRow` is essentially a `<Row layout="stack">` variant. Extend `Row` with a `layout?: "inline" | "stack"` prop or extract `SimRow` to a molecule and reuse. Effort: **S**.

  6. **No "neighborhood" panel** — Severity: **P1** · Theme: **SERVQUAL:Tangibles** · Where: `app/properties/[id]/page.tsx:75-100` (spec tab content). FEEL is the emotional stage; the only emotional asset right now is the VR tour. Even seeded data (`{walkScore, nearestStation, schoolsWithin1km}`) would deepen the FEEL story. [already queued in `AUDIT.md:46-48`]

### `/apply`

- **Stage:** DECIDE
- **What works:**
  - Strong empty-state when no session (`app/apply/page.tsx:46-66`) — does not fake data, sends the user back to `/pre-approval`. This is exactly the right pattern.
  - Right-rail summary is reused atomically with `<Row>`, `<Field>` (lines 91-110, 184-191).
  - Mobile sticky submit + spacer pattern matches `/pre-approval` (lines 209-216), keeping interaction consistent.

- **Issues:**

  1. **AI scoring context disappears on this page** — Severity: **P0** · Theme: **Trust / TAM:PU** · Where: `app/apply/page.tsx:170-205` (right-rail aside). The sidebar shows `tier`, `score`, `DTI%`, and the approved limit — but no `top_reasons` and no model/latency. The user is about to digitally sign; they deserve to be reminded *why* AI greenlit them, especially for Amber tier ("akan diverifikasi tambahan oleh CLF Analyst" — `app/status/[id]/page.tsx:128-130`). Fix: drop `<AiExplainCard variant="compact">` into the right rail above the breakdown. Effort: **S** (depends on the card extraction).

  2. **Default `tenor` of 20 yrs but no tenor selector** — Severity: **P1** · Theme: **TAM:PEOU** · Where: `app/apply/page.tsx:131`. Tenor is presented as a read-only `<Field>` defaulting to whatever the AI returned. The user can't shorten the tenor to reduce total interest (the most common KPR-buyer optimization). At DECIDE stage, the only knob should not be locked. Fix: convert tenor and DP% to a slider or stepped selector that live-updates the right-rail's "Estimasi cicilan" line. Effort: **M**.

  3. **`<Field>` is read-only by visual convention but not by `readOnly` prop** — Severity: **P1** · Theme: **SERVQUAL:Reliability** · Where: `app/apply/page.tsx:91-98` and `components/molecules/field.tsx:5-39`. None of the auto-filled fields pass `readOnly={true}`. The user can therefore type into "NIK" or "Penghasilan" and silently desync from `session.score`. Fix: set `readOnly` on every auto-filled field, or add a visible "Edit" affordance per row that explicitly re-routes them to update pre-approval. Effort: **S**.

  4. **Header copy "auto-filled dari pre-approval" lies for empty fields** — Severity: **P2** · Theme: **Microcopy** · Where: `app/apply/page.tsx:89,97`. If user skipped NPWP/email/phone, the field is blank with no inline hint that they need to add it. Fix: render "Belum diisi · klik untuk lengkapi" placeholder text and make those specific fields editable. Effort: **S**.

  5. **Digital signature is a single button — no QTSP simulation** — Severity: **P2** · Theme: **SERVQUAL:Assurance** · Where: `app/apply/page.tsx:136-159`. Clicking "Tanda tangan sekarang" flips state instantly with no modal, OTP, or PIN. For a thesis demo of an "e-SPH digital" claim, even a 2-step pseudo-OTP (entered code → success) would dramatically strengthen the Assurance story. Effort: **M**.

  6. **`session.email`, `session.homeAddress` referenced but never written** — Severity: **P1** · Theme: **SERVQUAL:Reliability** · Where: `app/apply/page.tsx:96-97` and `lib/session-data.ts:13-14`. `SessionApplicant` includes `email?` and `homeAddress?`, but `/pre-approval` (`app/pre-approval/page.tsx:124-147`) never sets either. The fields render empty. Either add them to the pre-approval form or remove from the apply UI. Effort: **S**.

  7. **Hardcoded application code fallback `APP-2026-00042`** — Severity: **P2** · Theme: **SERVQUAL:Reliability** · Where: `app/apply/page.tsx:163,212`. If the score API failed but session was saved (unlikely but possible), this lands users on a fake `/status` URL. Fix: disable Submit when `score?.application_code` is missing. Effort: **S**.

### `/status/[id]`

- **Stage:** DECIDE (post-submission)
- **What works:**
  - Same empty-state pattern as `/apply` — refuses to render dummy data if no session (`app/status/[id]/page.tsx:37-61`). Good.
  - Document list with source attribution ("Dukcapil (auto)", "DJP (auto)") — `app/status/[id]/page.tsx:143-148` — directly supports the "no upload" thesis claim.

- **Issues:**

  1. **Timeline is fully hardcoded** — Severity: **P0** · Theme: **SERVQUAL:Responsiveness** · Where: `app/status/[id]/page.tsx:88-114`, source `lib/data/user.ts:10-17`. The `id` from `params` is shown in `#APP-...` but the timeline rows ignore it. A panelist who runs two pre-approvals and opens both `/status` pages will see identical "12:50" timestamps — kills the "live tracking" narrative. Fix: query `status_events` table by `application_code = id`. Until that's wired, at least derive `time` strings from `Date.now() - hf_session_start` so different sessions show different progress. Effort: **M**. [already known debt: `WIP.md:67`]

  2. **SLA stats are static** — Severity: **P0** · Theme: **SERVQUAL:Responsiveness** · Where: `app/status/[id]/page.tsx:133-137`. "Waktu berjalan: 3 jam 12 mnt" and "Estimasi selesai: Hari ini, 17:30" are hardcoded strings. Fix: compute from `session.score.created_at` (would need to be persisted) or `hf_session_start`. The thesis claims "SLA < 8 jam" — actually showing a live ticker against that 8h budget is high-impact, low-effort. Effort: **S**.

  3. **CLF analyst note conditional logic is brittle** — Severity: **P2** · Theme: **Microcopy** · Where: `app/status/[id]/page.tsx:119-130`. The sentence reads awkwardly: "Klasifikasi AI: Green · tidak memerlukan review manual level-2." vs "Klasifikasi AI: Amber · akan diverifikasi tambahan oleh CLF Analyst. Analyst memverifikasi properti Tier-1 via e-Appraisal." The second sentence about Tier-1 e-Appraisal applies to both tiers but lives in the Amber branch grammatically. Fix: split into two distinct sentences and always show the e-Appraisal one. Effort: **S**.

  4. **No `<AiExplainCard>` here either** — Severity: **P1** · Theme: **Trust** · Where: `app/status/[id]/page.tsx:117-138`. The CLF card mentions tier but offers no reasons. If status takes 4 hours, the user has 4 hours to second-guess the AI decision. Showing the explainability persistently is the antidote. Effort: **S** (post extraction).

  5. **Chat / Sales buttons are non-functional** — Severity: **P2** · Theme: **SERVQUAL:Assurance** · Where: `app/status/[id]/page.tsx:77-79`. The user may need help most when waiting — these two buttons do nothing on click. Either wire to a `mailto:` / `tel:` or an `<a href="https://wa.me/...">` (cheap), or remove them. Effort: **S**.

  6. **Local `Doc` helper duplicates a row pattern** — Severity: **P2** · Theme: **Atomic** · Where: `app/status/[id]/page.tsx:197-207`. Extract to `components/molecules/doc-row.tsx`. Effort: **S**.

  7. **Title `Aplikasi #{id}` can be very long (e.g., `APP-2026-00042-A1B2C3`)** — Severity: **P2** · Theme: **Visual** · Where: `app/status/[id]/page.tsx:71`. `break-all` is applied which is correct, but pairing with the heading at `text-4xl` looks ugly at the top of mobile. Fix: shorten via `id.slice(0, 14) + "…"`. Effort: **S**.

---

## Component layer findings

### Atomic placement

| Component | Current path | Should be |
|---|---|---|
| `nav.tsx` | `components/nav.tsx` | `components/organisms/nav.tsx` (has state, dropdown, breadcrumb) |
| `footer.tsx` | `components/footer.tsx` | `components/organisms/footer.tsx` |
| `session-aware-banner.tsx` | `components/session-aware-banner.tsx` | `components/organisms/session-aware-banner.tsx` (fetches session, branches state) |
| `session-timer.tsx` | `components/session-timer.tsx` | `components/organisms/session-timer.tsx` |
| `property-card.tsx` | `components/property-card.tsx` | `components/organisms/property-card.tsx` (or molecule if no future business logic) |
| `property-filters.tsx` | `components/property-filters.tsx` | `components/organisms/property-filters.tsx` (clearly an organism — has its own URL state) |
| `property-apply-cta.tsx` | `components/property-apply-cta.tsx` | `components/organisms/property-apply-cta.tsx` (fetches session, eligibility logic) |
| `vr-viewer.tsx` | `components/vr-viewer.tsx` | `components/organisms/vr-viewer.tsx` |

The atomic folder split is half-landed (atoms/molecules/organisms exist, only `journey-progress` migrated). `CLAUDE.md` declares the convention; six business-logic components still sit at the root. This causes import inconsistency: `app/properties/[id]/page.tsx:5` imports `vr-tour` from `@/components/organisms/vr-tour` but `vr-viewer` from `@/components/vr-viewer` (`app/properties/[id]/page.tsx:4`).

### DRY violations still in flight

- `Field` / `Row` / `Stat` / `Metric` molecules **exist** at `components/molecules/*` but page files still ship local copies:
  - `app/page.tsx:187-220` (Metric, Pillar, Feat) — `Metric` already exists.
  - `app/pre-approval/page.tsx:456-501` (TextField, NumberField, Consent) — covered by `Field`.
  - `app/properties/[id]/page.tsx:139-154` (Stat, SimRow) — `Stat` already exists.
  - `app/status/[id]/page.tsx:197-207` (Doc).
  This is exactly the queue in `WIP.md:46`.

### Missing primitives

- `<AiExplainCard>` — referenced everywhere in `AUDIT.md`/`CLAUDE.md` but does not yet exist. [already queued]
- `<ConsentPanel>` — same. [already queued]
- `<ReasonChip>` molecule — proposed sub-component of `<AiExplainCard>`, would wrap a `top_reason` string with a tooltip linking to the input field that drove it. Used by both pre-approval result and (compact) on properties / apply / status.
- `<EligibilityBadge>` atom — current implementation in `<PropertyApplyCta>` is bespoke; would also be useful on property cards once match-score lands. Build alongside the match-score task.
- `<DocRow>` molecule — for status page.
- `<JourneyMap>` molecule (non-sticky variant of stepper) — for the home page where the sticky version is hidden.

---

## Cross-cutting recommendations

1. **Promote `<AiExplainCard>` to the top of the implementation queue.** It is the *single component* that unlocks closing 4 of the 5 P0/P1 trust gaps (home mock card, pre-approval result, apply sidebar, status CLF note). It already has a JSON contract (`r.tier`, `r.score`, `r.confidence`, `r.top_reasons`, `r.latency_ms`, `r.model`, `r.dti_ratio_pct`) — extract the existing UI block at `app/pre-approval/page.tsx:346-410` into `components/organisms/ai-explain-card.tsx` and re-use it.

2. **Build `<ConsentPanel>` next; it gates ethical thesis defense.** Spec: array of `{key, label, source, required, optional}` rendered as a card list with shadcn `<Switch>` (need to add — small footprint, MIT, no extra deps if Radix is already installed via shadcn). On submit, POST to a new `/api/consent` route that writes `applicants.consent_log jsonb`.

3. **Unify the stage indicator.** Choose one of: (a) keep `<JourneyProgress>` and delete `<SessionTimer>`, folding its elapsed-time pill into the stepper; or (b) keep both, but constrain `<SessionTimer>` to `/status` only as an SLA countdown. The current overlap weakens both.

4. **Finish the atomic migration.** Move six root-level components into `components/organisms/`, replace inline page helpers with the existing molecules, and update import paths. This is mechanical, fits in one PR, and the resulting consistency makes future audits 2x faster.

5. **Add `<MatchScore>` to `<PropertyCard>` even with a naive formula.** Even a deterministic `100 - ((price - limit) / limit) * 50` clamped to [0,100] is enough to advertise AI in the catalog. Defer the real model to post-defense.

6. **Naming hygiene.** `Property.location` carries `city`, and `Property.city` carries `province` (`lib/data/properties.ts:91-97`). This will trip up the FE engineer adding neighborhood data. Either rename now (`location → city`, `city → province`) or add a clarifying comment at the top of the file.

7. **Fix the post-score hardcoded slug.** Replace `/apply?property=grand-serenia-01` (`app/pre-approval/page.tsx:405` and `app/journey/page.tsx:97`) with `/properties?maxPrice={approved_limit_idr}`. Forces the FEEL stage; preserves narrative integrity.

8. **Indonesian-first microcopy sweep.** `<VRViewer>` controls ("Drag to rotate", "Scroll to zoom" — `components/vr-viewer.tsx:80-86`), `<SessionTimer>` aria-label "Close session timer" (`components/session-timer.tsx:86`), and `Aplikasi #{id}` semantics should all be IDN. Effort: S, single PR.

---

## Out of scope / deferred

- **Replacing `<VRViewer>` with multi-room 360 + hotspots.** Already addressed by `<VRTour>` organism (Pannellum). The single-image `<VRViewer>` only renders as a tertiary fallback when neither a Matterport URL nor a Pannellum scene exists. P3 polish at best, AUDIT.md L item.
- **Shortlist / compare page.** Listed P2 in `AUDIT.md:54-58`. Real value, but not blocking the thesis narrative. Skipping until P0/P1 are closed.
- **Post-decision micro-survey.** Real CS-capture is a defense-day extra, not a journey-clarity problem. Defer.
- **Developer dashboard.** P3 in AUDIT.md. The current `/admin/records` is sufficient for showing "this AI decision was persisted and is reviewable".
- **Splitting `nav.tsx` thesis dropdown.** It works on hover/click; minor accessibility concerns (no keyboard handlers) but doesn't block the framework demo.
- **`Tabs` overflow-x-auto fix on the property detail page.** Acceptable on mobile in `app/properties/[id]/page.tsx:69`.
- **Tailwind dark mode.** No dark mode is shipped; not a thesis requirement; not in scope.

---

## Top 5 issues for the FE engineer (in implementable order)

1. **Extract `<AiExplainCard>` and drop it everywhere AI output appears.**
   Take the result block at `app/pre-approval/page.tsx:346-410` and lift it into `components/organisms/ai-explain-card.tsx` with `variant: "full" | "compact" | "inline"`. Re-use on `/properties/[id]` (inside `<PropertyApplyCta>`), `/apply` (right-rail aside), `/status/[id]` (CLF analyst card), and the home hero mock. This single PR closes the largest P0 gap (Theme 5 / Trust / TAM:PU) and shows up in the screenshot every panelist will take.

2. **Build `<ConsentPanel>` and wire it before `/api/score`.**
   Replace the four decorative tiles at `app/pre-approval/page.tsx:236-240` with a real component (one `<Switch>` per source, required-vs-optional distinction, default optionals OFF). Gate the "Setuju & Cek Limit" button on required toggles. Persist consent state to `applicants.consent_log` via a new `/api/consent` route. Closes the UU-PDP defense gap.

3. **Fix the hardcoded property slug + status timeline.**
   Replace `/apply?property=grand-serenia-01` (`app/pre-approval/page.tsx:405`) with `/properties?maxPrice={approved_limit_idr}`. Replace the static `statusTimeline` import (`app/status/[id]/page.tsx:11,88-114`, `lib/data/user.ts:10-17`) with a Supabase query on `status_events` filtered by `application_code`. Also turn the static "Waktu berjalan: 3 jam 12 mnt" stat into a live countdown against the 8h SLA. These are three small fixes that collectively transform the demo from "scripted" to "live".

4. **Finish the atomic migration in one pass.**
   Move `nav.tsx`, `footer.tsx`, `session-aware-banner.tsx`, `session-timer.tsx`, `property-card.tsx`, `property-filters.tsx`, `property-apply-cta.tsx`, `vr-viewer.tsx` into `components/organisms/`. Then sweep `app/page.tsx`, `app/pre-approval/page.tsx`, `app/properties/[id]/page.tsx`, `app/status/[id]/page.tsx` to delete their local `Field`/`Row`/`Stat`/`Metric`/`Doc`/`SimRow` helpers and import the molecules. Mechanical, type-check-safe, and removes the inconsistent import paths.

5. **Surface AI in the catalog: match-score on `<PropertyCard>` and consolidate the stage indicator.**
   (a) Compute a naive `matchScore` from `session.score.approved_limit_idr` vs `price` and render it on every card (top-right ribbon). Drop the misleading "Pre-approved" badge for non-session visitors. (b) Either delete `<SessionTimer>` and add an elapsed-time pill on the active `<JourneyProgress>` step, or scope `<SessionTimer>` to `/status` only as a live SLA countdown. These together close the FEEL-stage TAM:PU gap and remove the conceptual overlap that confuses the journey indicator story.
