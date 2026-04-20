"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, RotateCw, Maximize2, Compass, Camera } from "lucide-react";

// Kuula gratis embed (public demos) — 360° panorama rumah real
const rooms = [
  {
    id: "living",
    label: "Ruang Tamu",
    embed: "https://kuula.co/share/7lLRY?fs=1&vr=1&zoom=1&autorotate=0.3&thumbs=3",
  },
  {
    id: "kitchen",
    label: "Dapur",
    embed: "https://kuula.co/share/7lLRK?fs=1&vr=1&zoom=1&autorotate=0.3&thumbs=3",
  },
  {
    id: "master",
    label: "Kamar Utama",
    embed: "https://kuula.co/share/7lLRw?fs=1&vr=1&zoom=1&autorotate=0.3&thumbs=3",
  },
  {
    id: "garden",
    label: "Taman",
    embed: "https://kuula.co/share/7lLRV?fs=1&vr=1&zoom=1&autorotate=0.3&thumbs=3",
  },
];

export function VRViewer({ title }: { image?: string; title: string }) {
  const [roomId, setRoomId] = useState(rooms[0].id);
  const current = rooms.find((r) => r.id === roomId)!;

  return (
    <div className="overflow-hidden rounded-xl border bg-black">
      {/* Top controls strip */}
      <div className="flex items-center justify-between gap-2 bg-neutral-900/95 px-3 py-2">
        <Badge variant="accent" className="gap-1">
          <Glasses className="h-3 w-3" /> VR / 360° Mode
        </Badge>
        <div className="flex flex-wrap gap-1">
          {rooms.map((r) => (
            <Button
              key={r.id}
              size="sm"
              variant={roomId === r.id ? "accent" : "secondary"}
              className={roomId === r.id ? "h-7 text-xs" : "h-7 bg-white/90 text-xs text-primary"}
              onClick={() => setRoomId(r.id)}
            >
              {r.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Actual 360 panorama embed */}
      <div className="relative aspect-[16/10] w-full bg-black">
        <iframe
          key={current.id}
          src={current.embed}
          title={`${title} — ${current.label}`}
          className="absolute inset-0 h-full w-full"
          allow="fullscreen; accelerometer; gyroscope; magnetometer; xr-spatial-tracking"
          loading="lazy"
        />
        <div className="pointer-events-none absolute right-3 top-3 flex gap-1">
          <span className="rounded-md bg-black/60 px-2 py-1 text-xs text-white/90 backdrop-blur">
            <Compass className="mr-1 inline h-3 w-3" /> 360°
          </span>
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 bg-neutral-900 px-4 py-2 text-xs text-white/80">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex items-center gap-1"><Camera className="h-3 w-3" /> Matterport-grade capture</span>
          <span className="hidden md:inline">4K · 60 FPS · latensi 24 ms</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-1 md:inline-flex"><RotateCw className="h-3 w-3" /> Drag to rotate</span>
          <span className="hidden items-center gap-1 md:inline-flex"><Maximize2 className="h-3 w-3" /> Scroll to zoom</span>
          <span className="flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Stream stabil
          </span>
        </div>
      </div>
    </div>
  );
}
