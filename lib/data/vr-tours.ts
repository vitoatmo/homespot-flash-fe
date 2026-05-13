// Multi-scene VR tour config (Bellefont-style navigable hotspots).
// Engine: Pannellum (loaded via CDN in <VRTour>).
// Asset source: /public/vr/demo/*.jpg — di-host lokal supaya tidak ada
// dependency CDN remote. Source asset:
//   github.com/rofaidaezzat/virtual-tour (apartment 360 photos, MIT license)
//
// Pannellum coords:
//   yaw   = horizontal angle in degrees (-180..180)
//   pitch = vertical angle in degrees (-90..90)

export type TourHotspot = {
  /** Scene id tujuan */
  sceneId: string;
  /** Label tooltip */
  text: string;
  /** Posisi hotspot di scene saat ini, dalam derajat */
  yaw: number;
  pitch: number;
};

export type TourScene = {
  id: string;
  name: string;
  panorama: string;
  caption?: string;
  /** Yaw awal saat scene ini di-load (derajat) */
  initialYaw?: number;
  /** Pitch awal */
  initialPitch?: number;
  /** Horizontal field-of-view (derajat) */
  hfov?: number;
  hotspots: TourHotspot[];
};

export type VRTour = {
  propertySlug: string;
  startSceneId: string;
  scenes: TourScene[];
};

// ---- Demo tour: 3 ruangan dari 1 apartemen modern ----
// Semua equirectangular 6144x3072, di-host di /public/vr/demo/
const ASSET = "/vr/demo";

const demoTour: VRTour = {
  propertySlug: "__demo__",
  startSceneId: "living",
  scenes: [
    {
      id: "living",
      name: "Ruang Tamu",
      panorama: `${ASSET}/livingroom.jpg`,
      caption: "Living area dengan akses ke kolam renang & kamar tidur",
      initialYaw: 0,
      initialPitch: 0,
      hfov: 100,
      hotspots: [
        {
          sceneId: "bedroom",
          text: "Masuk ke Kamar Tidur",
          yaw: -90,
          pitch: -5,
        },
        {
          sceneId: "bathroom",
          text: "Lihat Kamar Mandi",
          yaw: 90,
          pitch: -5,
        },
      ],
    },
    {
      id: "bedroom",
      name: "Kamar Tidur",
      panorama: `${ASSET}/bedroom.jpg`,
      caption: "Master bedroom — natural light + workspace",
      initialYaw: 0,
      initialPitch: 0,
      hfov: 100,
      hotspots: [
        {
          sceneId: "living",
          text: "Kembali ke Ruang Tamu",
          yaw: 90,
          pitch: -5,
        },
        {
          sceneId: "bathroom",
          text: "Lanjut ke Kamar Mandi",
          yaw: -90,
          pitch: -5,
        },
      ],
    },
    {
      id: "bathroom",
      name: "Kamar Mandi",
      panorama: `${ASSET}/bathroom.jpg`,
      caption: "Bathroom — bathtub + akses garden",
      initialYaw: 0,
      initialPitch: 0,
      hfov: 100,
      hotspots: [
        {
          sceneId: "living",
          text: "Kembali ke Ruang Tamu",
          yaw: -90,
          pitch: -5,
        },
        {
          sceneId: "bedroom",
          text: "Kembali ke Kamar Tidur",
          yaw: 90,
          pitch: -5,
        },
      ],
    },
  ],
};

// Registry: property slug → tour config.
// Property apa pun yang TIDAK ada di sini akan fallback ke VRViewer lama (Kuula iframe).
const TOURS: Record<string, VRTour> = {
  __demo__: demoTour,
};

export function getTourBySlug(slug: string): VRTour | null {
  return TOURS[slug] ?? null;
}

export function getDemoTour(): VRTour {
  return demoTour;
}
