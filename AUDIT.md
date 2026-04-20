# Thesis-Alignment Audit

**Thesis:** Cipto Haryabri — *Homespot Flash Service: AI-Based Approval, Instant Buying Decision* (MBA ITB 2026)
**Framework:** KNOW → FEEL → DECIDE, backed by TAM + SERVQUAL integration
**Last audit:** 2026-04-20

---

## 1. Coverage matrix (current implementation vs thesis themes)

| Thesis Theme | TAM/SERVQUAL Lens | Current App | Status |
|---|---|---|---|
| T1. Financing uncertainty | TAM · PU | `/pre-approval` with AI scoring | ✅ Partial (no affordability sandbox) |
| T2. Process complexity | SERVQUAL · Reliability | `/apply` one-session flow | ✅ |
| T3. AI as cognitive enabler | TAM · PU + PEOU | Groq llama-3.3-70b, `top_reasons[]` stored | ⚠️ Reasons exist in DB but barely surfaced in UI |
| T4. VR emotional reinforcement | SERVQUAL · Tangibles | `<VRViewer>` — single pannable image | ⚠️ Shallow — no hotspots, no room-to-room, no neighborhood |
| T5. Trust foundation | SERVQUAL · Assurance | "Patuh OJK & UU PDP" strip only | ❌ No consent panel, no audit trail visible to user, no explainability modal |
| T6. Integration (missing link) | SERVQUAL · Responsiveness | Session-storage continuity | ⚠️ No persistent global stepper; user loses sense of "where am I in the journey" |
| Customer Satisfaction (CS) | Integrated / DECIDE | — | ❌ No in-app satisfaction capture |
| Behavioral Intention (BI) | TAM · DECIDE | Submit button | ⚠️ No soft-commit (save draft, shortlist, compare) |

---

## 2. Prioritized feature gaps

Each gap is tagged with the thesis construct it strengthens and an engineering cost estimate (S/M/L).

### P0 — defend the thesis framework visibly

1. **Global `JourneyProgress` stepper (KNOW → FEEL → DECIDE)** [S] · *T6, Responsiveness*
   - Persistent header component showing which stage the user is in
   - Clickable, route-aware, acts as breadcrumb + framework advertisement for a defense demo
2. **`AiExplainCard` organism** [S] · *T3, T5, PU, Assurance*
   - Surfaces `top_reasons`, `confidence`, `latency_ms`, `model` as an "Explainable AI" card
   - Tooltip per reason citing input value that drove it (e.g. "DTI 28% — sehat")
3. **`ConsentPanel` (UU PDP + SNAP-BI consent)** [M] · *T5, Assurance*
   - Explicit checkbox list: Dukcapil / DJP / SLIK OJK / Open Banking SNAP
   - Shown before scoring, persisted in `applicants.consent_log` (new column)
   - Revocable from a settings page

### P1 — close emotional gap (FEEL)

4. **Property match-score %** [S] · *T3, PU*
   - Per-property card: "92% match" = f(affordability, location pref, type pref)
   - Surfaces AI's role beyond just eligibility
5. **Neighborhood insights panel** [M] · *T4, Tangibles*
   - Walkable radius, nearby schools/malls/transit, "15 min ke Stasiun BSD"
   - Can be seeded in DB (`properties.neighborhood jsonb`)
6. **Gallery + real 360° hotspots** [L] · *T4, Tangibles*
   - Replace single-image VR with multi-room 360 + Pannellum or A-Frame hotspots
7. **Customer stories / testimonials** [S] · *T5, Assurance*
   - 3-5 seeded "customer journey" cards showing time-to-decision
   - Reinforces SLA claim qualitatively

### P2 — tighten DECIDE

8. **Shortlist + compare (up to 3 properties)** [M] · *BI*
   - localStorage-backed shortlist; `/compare` page with side-by-side
   - Directly reduces "decision hesitation" (thesis Theme 6)
9. **SLA countdown during apply** [S] · *Responsiveness*
   - Live "< 8 hours to CLF decision" timer while in `/status`
   - We already have `session-timer.tsx` — repurpose it
10. **Post-decision micro-survey (CS capture)** [S] · *CS, thesis validation hook*
    - After signing e-SPH: "Seberapa jelas proses ini? 1-5" + "Seberapa percaya kamu dengan hasil AI? 1-5"
    - Writes to a `feedback` table — defensible quantitative data for the defense

### P3 — integration theme (ecosystem)

11. **Developer dashboard** [M] · *T2, T6*
    - `/developer` view: pre-approved leads, conversion funnel
    - Directly addresses "developer conversion challenge" from IV.2.1 interviews
12. **Draft-save + resume link** [S] · *T6*
    - Share a magic link mid-flow so user can pick up on another device
13. **Unified `/me` dashboard** [M] · *T6*
    - All applications + shortlisted properties + doc status in one screen

---

## 3. DRY / architecture debt

Current components/ is flat. Atomic restructure landing:

```
components/
├── ui/             # shadcn primitives — kept as-is
├── atoms/          # our framework-specific atoms
│   ├── journey-pill.tsx
│   ├── tier-badge.tsx
│   ├── price-tag.tsx
│   └── trust-stamp.tsx
├── molecules/
│   ├── field.tsx       # extracted from 3 pages
│   ├── row.tsx         # extracted from 4 pages
│   ├── stat.tsx        # extracted from 3 pages
│   ├── ai-reason-chip.tsx
│   └── eligibility-gauge.tsx
├── organisms/
│   ├── nav.tsx
│   ├── footer.tsx
│   ├── journey-progress.tsx   # NEW
│   ├── ai-explain-card.tsx    # NEW
│   ├── consent-panel.tsx      # NEW
│   ├── property-card.tsx
│   ├── property-filters.tsx
│   ├── property-apply-cta.tsx
│   ├── session-aware-banner.tsx
│   └── vr-viewer.tsx
└── templates/
    └── page-shell.tsx
```

Near-term: introduce the folders + P0 organisms. Migrate shared patterns (Field/Row/Stat) incrementally.

---

## 4. Defense-day recommendations

If the panel asks *"bagaimana sistem ini membuktikan framework KNOW→FEEL→DECIDE?"*:

- **Point to the `JourneyProgress` stepper** (always on screen)
- **Click into `AiExplainCard`** to show AI ≠ black box → addresses Trust (T5) + PEOU
- **Show `ConsentPanel`** to show UU PDP compliance → Assurance
- **Open admin `/admin/records`** to show the AI decision is stored, reviewable → audit trail

Features #1, #2, #3 are the highest-ROI additions for a defense demo.
