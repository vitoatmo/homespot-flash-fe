// Generic, persona-agnostic dummy data.
// PII (nama, NIK, NPWP, email, phone) sengaja TIDAK ada di sini supaya tidak
// pernah bocor ke UI. Identitas user selalu dibaca dari sessionStorage
// (lib/session-data.ts) — diisi sendiri oleh user di /pre-approval.

/**
 * Status timeline untuk halaman /status/[id]. Sementara di-hardcode (UI demo);
 * akan diganti dengan query ke tabel `status_events` saat backend ready.
 */
export const statusTimeline = [
  { id: 1, label: "Pre-approved", time: "Hari ini · 10:24", state: "done" as const },
  { id: 2, label: "Dokumen terverifikasi", time: "Hari ini · 10:31", state: "done" as const },
  { id: 3, label: "e-Appraisal (Tier-1 verified)", time: "Hari ini · 12:50", state: "in_progress" as const },
  { id: 4, label: "Final approval", time: "Estimasi sore ini", state: "pending" as const },
  { id: 5, label: "e-SPH siap ditandatangani", time: "Estimasi besok pagi", state: "pending" as const },
  { id: 6, label: "Pencairan", time: "Estimasi 1–2 hari kerja", state: "pending" as const },
];
