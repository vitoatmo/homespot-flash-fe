-- Homespot Flash — full schema (reconstructed from FE code)
-- Target: Supabase project vitoatmo-personal (ccypzcbkmfzxwbmdqkdb)
-- All objects live in schema `homespot`. Run this, then supabase/seed/seed_matterport.sql.
-- NOTE: after running, expose `homespot` in Dashboard > Settings > API > Exposed schemas
--       (or via the ALTER ROLE below), then NOTIFY pgrst to reload.

create schema if not exists homespot;

-- ── Enums ───────────────────────────────────────────────────────────────
do $$ begin
  create type homespot.prop_type as enum
    ('rumah_tapak','apartemen','townhouse','ruko','villa','penthouse','rumah_subsidi');
exception when duplicate_object then null; end $$;

do $$ begin
  create type homespot.prop_category as enum
    ('subsidi','starter','mid','upper_mid','premium','luxury','ultra_luxury');
exception when duplicate_object then null; end $$;

-- ── properties (KNOW/FEEL catalog) ──────────────────────────────────────
create table if not exists homespot.properties (
  id             uuid primary key default gen_random_uuid(),
  slug           text unique not null,
  title          text not null,
  developer      text,
  city           text not null,
  province       text,
  address        text,
  bedrooms       int,
  bathrooms      int,
  land_m2        numeric,
  building_m2    numeric,
  price_idr      bigint not null,
  vr_tour_url    text,
  hero_image_url text,
  status         text not null default 'available',
  property_type  homespot.prop_type,
  category       homespot.prop_category,
  description    text,
  features       text[],
  rating         numeric,
  tier           text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_properties_price    on homespot.properties(price_idr);
create index if not exists idx_properties_city     on homespot.properties(city);
create index if not exists idx_properties_category on homespot.properties(category);
create index if not exists idx_properties_type     on homespot.properties(property_type);

-- ── applicants (PII) ────────────────────────────────────────────────────
create table if not exists homespot.applicants (
  id                        uuid primary key default gen_random_uuid(),
  full_name                 text not null,
  email                     text,
  nik                       text,
  npwp                      text,
  phone                     text,
  employer                  text,
  position                  text,
  monthly_income_idr        bigint not null default 0,
  years_employed            int not null default 0,
  existing_monthly_debt_idr bigint not null default 0,
  persona                   text not null default 'fixed_income',
  created_at                timestamptz not null default now()
);

-- ── applications (DECIDE) ───────────────────────────────────────────────
create table if not exists homespot.applications (
  id                   uuid primary key default gen_random_uuid(),
  code                 text unique not null,
  applicant_id         uuid not null references homespot.applicants(id) on delete cascade,
  property_id          uuid references homespot.properties(id) on delete set null,
  requested_amount_idr bigint not null default 0,
  tenor_months         int not null default 240,
  status               text not null default 'draft',
  decision_tier        text,
  created_at           timestamptz not null default now()
);
create index if not exists idx_applications_applicant on homespot.applications(applicant_id);
create index if not exists idx_applications_property  on homespot.applications(property_id);

-- ── ai_scores (one row per Groq call) ───────────────────────────────────
create table if not exists homespot.ai_scores (
  id                      uuid primary key default gen_random_uuid(),
  application_id          uuid not null references homespot.applications(id) on delete cascade,
  score                   int,
  approved_limit_idr      bigint,
  max_tenor_months        int,
  estimated_rate          numeric,
  tier                    text,
  confidence              text,
  monthly_installment_idr bigint,
  dti_ratio_pct           numeric,
  top_reasons             text[],
  latency_ms              int,
  model                   text,
  raw_input               jsonb,
  raw_output              jsonb,
  created_at              timestamptz not null default now()
);
create index if not exists idx_ai_scores_application on homespot.ai_scores(application_id);

-- ── property_tours (VR analytics) ───────────────────────────────────────
create table if not exists homespot.property_tours (
  id                uuid primary key default gen_random_uuid(),
  applicant_id      uuid references homespot.applicants(id) on delete cascade,
  property_id       uuid references homespot.properties(id) on delete set null,
  duration_sec      int not null default 0,
  rooms_viewed      text[],
  ended_with_action text,
  created_at        timestamptz not null default now()
);

-- ── status_events (timeline — was UI-hardcoded) ─────────────────────────
create table if not exists homespot.status_events (
  id             uuid primary key default gen_random_uuid(),
  application_id uuid not null references homespot.applications(id) on delete cascade,
  status         text not null,
  note           text,
  created_at     timestamptz not null default now()
);
create index if not exists idx_status_events_application on homespot.status_events(application_id);

-- ── RLS: permissive (demo-only, per CLAUDE.md) ──────────────────────────
do $$
declare t text;
begin
  foreach t in array array['properties','applicants','applications','ai_scores','property_tours','status_events']
  loop
    execute format('alter table homespot.%I enable row level security;', t);
    execute format('drop policy if exists demo_all on homespot.%I;', t);
    execute format('create policy demo_all on homespot.%I for all to anon, authenticated using (true) with check (true);', t);
  end loop;
end $$;

-- ── Grants + expose to PostgREST ────────────────────────────────────────
grant usage on schema homespot to anon, authenticated, service_role;
grant all on all tables    in schema homespot to anon, authenticated, service_role;
grant all on all sequences in schema homespot to anon, authenticated, service_role;
alter default privileges in schema homespot grant all on tables    to anon, authenticated, service_role;
alter default privileges in schema homespot grant all on sequences to anon, authenticated, service_role;

alter role authenticator set pgrst.db_schemas = 'public, graphql_public, homespot';
notify pgrst, 'reload schema';
notify pgrst, 'reload config';
