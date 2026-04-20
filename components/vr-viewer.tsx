"use client";
import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Glasses, RotateCw, Maximize2, Compass } from "lucide-react";

const rooms = [
  { id: "living", label: "Ruang Tamu" },
  { id: "kitchen", label: "Dapur" },
  { id: "master", label: "Kamar Utama" },
  { id: "garden", label: "Taman" },
];

export function VRViewer({ image, title }: { image: string; title: string }) {
  const [room, setRoom] = useState(rooms[0].id);

  return (
    <div className="overflow-hidden rounded-xl border bg-black">
      <div className="relative aspect-[16/9] w-full">
        <Image src={image} alt={title} fill className="object-cover opacity-90" />
        {/* Overlay UI */}
        <div className="absolute inset-0 flex flex-col justify-between p-4">
          <div className="flex items-start justify-between">
            <Badge variant="accent" className="gap-1">
              <Glasses className="h-3 w-3" /> VR / 360° Mode
            </Badge>
            <div className="flex gap-1">
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90">
                <Compass className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90">
                <RotateCw className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="secondary" className="h-8 w-8 bg-white/90">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {rooms.map((r) => (
                <Button
                  key={r.id}
                  size="sm"
                  variant={room === r.id ? "accent" : "secondary"}
                  className={room === r.id ? "" : "bg-white/90 text-primary"}
                  onClick={() => setRoom(r.id)}
                >
                  {r.label}
                </Button>
              ))}
            </div>
            <div className="hidden text-xs text-white/90 md:block">
              Drag untuk memutar · Scroll untuk zoom
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between bg-neutral-900 px-4 py-2 text-xs text-white/80">
        <div>Resolusi: 4K · FPS: 60 · Latensi: 24 ms</div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Stream stabil
        </div>
      </div>
    </div>
  );
}
