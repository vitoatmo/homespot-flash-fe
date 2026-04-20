# Homespot Flash Service — FE

Next.js 15 (App Router) + TypeScript + Tailwind + shadcn/ui + Supabase.
Prototype statis dengan dummy data + pre-fill untuk simulasi alur **KNOW → FEEL → DECIDE** dari PRD.

## Struktur

```
app/
  page.tsx                 # Landing: hero + 3 pilar + properti pilihan
  properties/              # Listing + detail (VR viewer, simulasi KPR)
  pre-approval/            # Step: consent → scoring → hasil (pre-filled dummy)
  apply/                   # Form aplikasi (auto-filled) + e-sign simulasi
  status/[id]/             # Tracker status real-time (timeline dummy)
components/
  ui/                      # shadcn primitives (button, card, badge, dll.)
  nav, footer, property-card, vr-viewer
lib/
  supabase/{client,server}.ts
  data/{properties,user}.ts  # dummy data untuk pre-fill
```

## Menjalankan

```bash
cp .env.local.example .env.local   # isi Supabase URL & anon key (opsional utk statis)
npm install
npm run dev
```

Supabase client sudah siap dipakai via `@/lib/supabase/client` (browser) atau `@/lib/supabase/server` (server component). Untuk versi statis, pages tidak memanggil Supabase — semua data dari `lib/data/*`.

## Rute

- `/` landing
- `/properties` · `/properties/[id]`
- `/pre-approval`
- `/apply?property=<id>`
- `/status/APP-2026-00042`

## Next steps

- Migrasi data ke tabel Supabase (`properties`, `applications`, `decisions`)
- Auth via `@supabase/ssr`
- Wire AI scoring ke endpoint Python (FastAPI) via API route
- Tambah CLF Operator Console (`/clf/queue`, `/clf/app/[id]`)
