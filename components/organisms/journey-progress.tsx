"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Heart, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type StageKey = "KNOW" | "FEEL" | "DECIDE";

const STAGES: {
  key: StageKey;
  label: string;
  caption: string;
  href: string;
  icon: React.ReactNode;
  matches: RegExp;
}[] = [
  {
    key: "KNOW",
    label: "KNOW",
    caption: "Cek eligibility",
    href: "/pre-approval",
    icon: <Search className="h-4 w-4" />,
    matches: /^\/pre-approval/,
  },
  {
    key: "FEEL",
    label: "FEEL",
    caption: "Jelajahi properti",
    href: "/properties",
    icon: <Heart className="h-4 w-4" />,
    matches: /^\/properties/,
  },
  {
    key: "DECIDE",
    label: "DECIDE",
    caption: "Ajukan & tanda tangan",
    href: "/apply",
    icon: <CheckCircle2 className="h-4 w-4" />,
    matches: /^\/(apply|status)/,
  },
];

// Routes that should NOT render the stepper
const HIDE_ON = [/^\/admin/, /^\/design-system/, /^\/findings/, /^\/limitations/, /^\/journey/, /^\/$/];

export function JourneyProgress() {
  const pathname = usePathname() ?? "/";
  if (HIDE_ON.some((re) => re.test(pathname))) return null;

  const activeIdx = STAGES.findIndex((s) => s.matches.test(pathname));

  return (
    <div
      aria-label="Journey progress"
      className="sticky top-14 z-30 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60"
    >
      <div className="container flex items-center gap-2 overflow-x-auto py-2">
        {STAGES.map((s, i) => {
          const state: "done" | "current" | "upcoming" =
            i < activeIdx ? "done" : i === activeIdx ? "current" : "upcoming";
          return (
            <div key={s.key} className="flex items-center gap-2">
              <Link
                href={s.href}
                aria-current={state === "current" ? "step" : undefined}
                className={cn(
                  "group inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition",
                  state === "current" &&
                    "border-primary bg-primary text-primary-foreground shadow-sm",
                  state === "done" &&
                    "border-emerald-200 bg-emerald-50 text-emerald-700",
                  state === "upcoming" &&
                    "border-muted bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    state === "current" && "bg-white/20",
                    state === "done" && "bg-emerald-500 text-white",
                    state === "upcoming" && "bg-muted",
                  )}
                >
                  {state === "done" ? <CheckCircle2 className="h-3 w-3" /> : s.icon}
                </span>
                <span className="uppercase tracking-wide">{s.label}</span>
                <span className="hidden text-[11px] font-normal opacity-80 sm:inline">
                  · {s.caption}
                </span>
              </Link>
              {i < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "h-px w-4 sm:w-8",
                    i < activeIdx ? "bg-emerald-400" : "bg-muted",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
