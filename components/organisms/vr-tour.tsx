"use client";

// Multi-scene navigable virtual tour (Bellefont-style).
// Engine: Pannellum (vanilla JS via CDN — terbukti stabil 5+ tahun).
// Tidak pakai npm package supaya bundle Next.js tetap ringan.

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Glasses, Compass, RotateCw, Maximize2 } from "lucide-react";
import type { VRTour as VRTourConfig } from "@/lib/data/vr-tours";

const PANNELLUM_VERSION = "2.5.6";
const PANNELLUM_JS = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.js`;
const PANNELLUM_CSS = `https://cdn.jsdelivr.net/npm/pannellum@${PANNELLUM_VERSION}/build/pannellum.css`;

// Loose typing — Pannellum JS API tidak ship .d.ts
type PannellumViewer = {
  loadScene: (sceneId: string) => void;
  destroy: () => void;
};

type PannellumGlobal = {
  viewer: (
    container: HTMLElement,
    config: Record<string, unknown>
  ) => PannellumViewer;
};

declare global {
  interface Window {
    pannellum?: PannellumGlobal;
  }
}

type Props = {
  tour: VRTourConfig;
  title: string;
};

export function VRTour({ tour, title }: Props) {
  const [currentSceneId, setCurrentSceneId] = useState(tour.startSceneId);
  const [scriptReady, setScriptReady] = useState(false);
  const [cssReady, setCssReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<PannellumViewer | null>(null);

  // Inject CSS once (Next.js Script tag tidak handle stylesheet)
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.querySelector(`link[data-pannellum]`)) {
      setCssReady(true);
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = PANNELLUM_CSS;
    link.dataset.pannellum = "true";
    link.onload = () => setCssReady(true);
    document.head.appendChild(link);
  }, []);

  // Initialize viewer once both script + CSS + container ready
  useEffect(() => {
    if (!scriptReady || !cssReady) return;
    if (!containerRef.current) return;
    if (viewerRef.current) return; // already mounted
    if (!window.pannellum) return;

    // Build Pannellum scene config dari tour data
    const scenes: Record<string, unknown> = {};
    for (const s of tour.scenes) {
      scenes[s.id] = {
        title: s.name,
        type: "equirectangular",
        panorama: s.panorama,
        hfov: s.hfov ?? 110,
        yaw: s.initialYaw ?? 0,
        pitch: s.initialPitch ?? 0,
        autoLoad: true,
        hotSpots: s.hotspots.map((h) => ({
          type: "scene",
          text: h.text,
          sceneId: h.sceneId,
          yaw: h.yaw,
          pitch: h.pitch,
          cssClass: "homespot-hotspot",
        })),
      };
    }

    viewerRef.current = window.pannellum.viewer(containerRef.current, {
      default: {
        firstScene: tour.startSceneId,
        sceneFadeDuration: 800,
        autoLoad: true,
        showControls: false, // pakai custom UI (top bar)
        compass: false,
      },
      scenes,
    });

    // Listen scene change → sync currentSceneId
    const v = viewerRef.current as unknown as {
      on?: (ev: string, cb: () => void) => void;
      getScene?: () => string;
    };
    v.on?.("scenechange", () => {
      const id = v.getScene?.();
      if (id) setCurrentSceneId(id);
    });

    return () => {
      try {
        viewerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      viewerRef.current = null;
    };
  }, [scriptReady, cssReady, tour]);

  const jumpTo = (sceneId: string) => {
    viewerRef.current?.loadScene(sceneId);
    setCurrentSceneId(sceneId);
  };

  const current =
    tour.scenes.find((s) => s.id === currentSceneId) ?? tour.scenes[0];

  return (
    <>
      <Script
        src={PANNELLUM_JS}
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
        onReady={() => setScriptReady(true)}
      />
      <div className="overflow-hidden rounded-xl border bg-black">
        {/* Top bar — scene picker */}
        <div className="flex items-center justify-between gap-2 bg-neutral-900/95 px-3 py-2">
          <Badge variant="accent" className="gap-1">
            <Glasses className="h-3 w-3" /> VR Tour · {tour.scenes.length} ruangan
          </Badge>
          <div className="flex flex-wrap gap-1">
            {tour.scenes.map((s) => (
              <Button
                key={s.id}
                size="sm"
                variant={currentSceneId === s.id ? "accent" : "secondary"}
                className={
                  currentSceneId === s.id
                    ? "h-7 text-xs"
                    : "h-7 bg-white/90 text-xs text-primary"
                }
                onClick={() => jumpTo(s.id)}
              >
                {s.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Viewer container — fixed height so Pannellum has definite size */}
        <div className="relative w-full bg-black" style={{ height: 520 }}>
          <div ref={containerRef} className="absolute inset-0" />
          {(!scriptReady || !cssReady) && (
            <div className="absolute inset-0 grid place-items-center text-sm text-white/60">
              Memuat virtual tour…
            </div>
          )}
          <div className="pointer-events-none absolute right-3 top-3 flex gap-1">
            <span className="rounded-md bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur">
              <Compass className="mr-1 inline h-3 w-3" /> 360°
            </span>
          </div>
          {current.caption && (
            <div className="pointer-events-none absolute bottom-3 left-3 max-w-[60%] rounded-md bg-black/60 px-3 py-1.5 text-xs text-white/90 backdrop-blur">
              <span className="font-semibold">{current.name}:</span>{" "}
              {current.caption}
            </div>
          )}
        </div>

        {/* Status bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900 px-4 py-2 text-xs text-white/80">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium">{title}</span>
            <span className="hidden md:inline">
              Pannellum · multi-scene · klik hotspot untuk pindah
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1 md:inline-flex">
              <RotateCw className="h-3 w-3" /> Drag rotate
            </span>
            <span className="hidden items-center gap-1 md:inline-flex">
              <Maximize2 className="h-3 w-3" /> Scroll zoom
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400" /> Stream
              stabil
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
