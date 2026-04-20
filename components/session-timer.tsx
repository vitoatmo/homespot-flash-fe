"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Clock, Zap, X } from "lucide-react";

/**
 * SessionTimer — visualisasi klaim "Commitment in One Session" dari thesis.
 * - Mulai saat user masuk flow (/pre-approval, /properties, /apply, /status)
 * - Persist pakai sessionStorage supaya bertahan lintas navigasi
 * - Progress mapping: pre-approval 25% → properties 50% → apply 75% → status 100%
 */

const FLOW_ROUTES = ["/pre-approval", "/properties", "/apply", "/status"];

const progressMap: Record<string, number> = {
  "/pre-approval": 25,
  "/properties": 50,
  "/apply": 75,
  "/status": 100,
};

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function SessionTimer() {
  const pathname = usePathname();
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  const inFlow = FLOW_ROUTES.some((r) => pathname.startsWith(r));

  // Init from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const start = sessionStorage.getItem("hf_session_start");
    if (start) {
      setSeconds(Math.floor((Date.now() - Number(start)) / 1000));
    } else if (inFlow) {
      sessionStorage.setItem("hf_session_start", String(Date.now()));
      setSeconds(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Show only when in flow, respect dismissal
  useEffect(() => {
    setVisible(inFlow && !dismissed);
    if (inFlow && typeof window !== "undefined" && !sessionStorage.getItem("hf_session_start")) {
      sessionStorage.setItem("hf_session_start", String(Date.now()));
      setSeconds(0);
    }
  }, [pathname, inFlow, dismissed]);

  // Tick
  useEffect(() => {
    if (!visible) return;
    const id = setInterval(() => {
      const start = typeof window !== "undefined" ? sessionStorage.getItem("hf_session_start") : null;
      if (start) setSeconds(Math.floor((Date.now() - Number(start)) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [visible]);

  if (!visible) return null;

  // Current progress based on route
  const matched = FLOW_ROUTES.find((r) => pathname.startsWith(r)) || "/pre-approval";
  const progress = progressMap[matched] ?? 25;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[280px] overflow-hidden rounded-xl border bg-white shadow-xl">
      <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/80 px-3 py-2 text-white">
        <div className="flex items-center gap-1.5 text-xs font-semibold">
          <Zap className="h-3.5 w-3.5" />
          Sesi aktif — Flash Service
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="rounded p-0.5 hover:bg-white/20"
          aria-label="Close session timer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="p-3">
        <div className="flex items-baseline justify-between">
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-primary" />
            <span className="font-mono text-lg font-bold tabular-nums">{formatDuration(seconds)}</span>
          </div>
          <span className="text-xs text-muted-foreground">{progress}% progress</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-muted-foreground">
          Target: commitment dalam 1 sesi · &lt; 10 menit aktif.
        </div>
      </div>
    </div>
  );
}
