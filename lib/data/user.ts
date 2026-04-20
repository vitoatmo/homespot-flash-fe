// Pre-fill dummy persona — Fixed Income (primary persona from PRD)
export const dummyUser = {
  fullName: "Vito Atmo",
  nik: "3175061509910001",
  npwp: "12.345.678.9-012.345",
  email: "vito.atmo@example.com",
  phone: "+62 812 3456 7890",
  dob: "1991-09-15",
  employer: "PT Kreatif Digital Indonesia",
  position: "Senior Digital Marketing Strategist",
  monthlyIncome: 35_000_000,
  yearsEmployed: 5,
  homeAddress: "Jl. Mawar No. 12, Jakarta Selatan",
  bankAccount: "BRI · 0123-01-456789-50-3",
  hasSlikConsent: true,
  hasOpenBankingConsent: true,
};

export const aiScoreDummy = {
  approvedLimit: 2_000_000_000,
  maxTenorMonths: 240,
  estimatedRate: 6.75,
  confidence: "Green" as "Green" | "Amber" | "Red",
  scorePct: 87,
  topReasons: [
    "Riwayat pembayaran 24 bulan terakhir lancar",
    "Rasio cicilan terhadap pendapatan (DTI) 28% — sehat",
    "Masa kerja > 4 tahun di perusahaan saat ini",
    "Saldo rata-rata 3 bulan stabil",
    "Tidak ada kredit bermasalah di SLIK",
  ],
};

export const statusTimeline = [
  { id: 1, label: "Pre-approved", time: "Hari ini · 10:24", state: "done" as const },
  { id: 2, label: "Dokumen terverifikasi", time: "Hari ini · 10:31", state: "done" as const },
  { id: 3, label: "e-Appraisal (Tier-1 verified)", time: "Hari ini · 12:50", state: "in_progress" as const },
  { id: 4, label: "Final approval", time: "Estimasi sore ini", state: "pending" as const },
  { id: 5, label: "e-SPH siap ditandatangani", time: "Estimasi besok pagi", state: "pending" as const },
  { id: 6, label: "Pencairan", time: "Estimasi 1–2 hari kerja", state: "pending" as const },
];
