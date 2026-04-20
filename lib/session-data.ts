// Cross-page session state — persisted in sessionStorage so data flows:
// /pre-approval → /apply → /status
// Expires when browser tab closes.

const KEY = "hf_applicant_session";

export type SessionApplicant = {
  // Identity
  fullName: string;
  nik?: string;
  npwp?: string;
  phone?: string;
  email?: string;
  dob?: string;
  homeAddress?: string;
  // Employment
  employer?: string;
  position?: string;
  age: number;
  yearsEmployed: number;
  // Financial
  monthlyIncome: number;
  existingDebt: number;
  // AI scoring result
  score?: {
    score: number;
    approved_limit_idr: number;
    max_tenor_months: number;
    estimated_rate: number;
    tier: "Green" | "Amber" | "Red";
    confidence: "Green" | "Amber" | "Red";
    top_reasons: string[];
    monthly_installment_idr: number;
    dti_ratio_pct: number;
    application_code?: string;
  };
  // Selected property (set when user clicks Apply on detail page)
  selectedProperty?: {
    slug: string;
    title: string;
    developer: string;
    location: string;
    city: string;
    price: number;
  };
};

export function saveSelectedProperty(p: NonNullable<SessionApplicant["selectedProperty"]>) {
  if (typeof window === "undefined") return;
  const cur = loadSessionApplicant();
  const next: SessionApplicant = cur
    ? { ...cur, selectedProperty: p }
    : {
        fullName: "",
        age: 0,
        yearsEmployed: 0,
        monthlyIncome: 0,
        existingDebt: 0,
        selectedProperty: p,
      };
  saveSessionApplicant(next);
}

export function saveSessionApplicant(data: SessionApplicant) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    /* quota or disabled — ignore */
  }
}

export function loadSessionApplicant(): SessionApplicant | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionApplicant;
  } catch {
    return null;
  }
}

export function clearSessionApplicant() {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
