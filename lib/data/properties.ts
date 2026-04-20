export type Property = {
  id: string;
  title: string;
  developer: string;
  tier: "Tier 1" | "Tier 2" | "Tier 3";
  location: string;
  city: string;
  price: number;       // IDR
  bedrooms: number;
  bathrooms: number;
  landSize: number;    // m2
  buildingSize: number;// m2
  image: string;
  hasVR: boolean;
  rating: number;
  features: string[];
  description: string;
};

export const properties: Property[] = [
  {
    id: "grand-serenia-01",
    title: "Grand Serenia Residence",
    developer: "Sinar Mas Land",
    tier: "Tier 1",
    location: "BSD City",
    city: "Tangerang Selatan",
    price: 1_850_000_000,
    bedrooms: 3, bathrooms: 2, landSize: 120, buildingSize: 95,
    image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&q=80",
    hasVR: true, rating: 4.8,
    features: ["Smart Home", "Clubhouse", "24/7 Security", "Dekat Stasiun BSD"],
    description: "Cluster premium di BSD City dengan akses langsung ke The Breeze, AEON Mall, dan Stasiun BSD.",
  },
  {
    id: "meikarta-02",
    title: "Meikarta Distrik 1",
    developer: "Lippo Group",
    tier: "Tier 1",
    location: "Cikarang",
    city: "Bekasi",
    price: 780_000_000,
    bedrooms: 2, bathrooms: 1, landSize: 60, buildingSize: 45,
    image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80",
    hasVR: true, rating: 4.5,
    features: ["CBD Akses", "Sekolah", "Rumah Sakit", "Mall"],
    description: "Apartemen modern di pusat Meikarta, cocok untuk keluarga muda.",
  },
  {
    id: "summarecon-03",
    title: "Summarecon Serpong - Cluster Alamanda",
    developer: "Summarecon Agung",
    tier: "Tier 1",
    location: "Serpong",
    city: "Tangerang",
    price: 2_450_000_000,
    bedrooms: 4, bathrooms: 3, landSize: 160, buildingSize: 135,
    image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
    hasVR: true, rating: 4.9,
    features: ["Waterfront", "Golf Course", "International School", "Private Pool"],
    description: "Rumah eksklusif menghadap danau, finishing premium, siap huni.",
  },
  {
    id: "citraland-04",
    title: "CitraLand Gama City",
    developer: "Ciputra Group",
    tier: "Tier 1",
    location: "Medan",
    city: "Medan",
    price: 1_250_000_000,
    bedrooms: 3, bathrooms: 2, landSize: 105, buildingSize: 85,
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    hasVR: true, rating: 4.6,
    features: ["Tol Akses", "Sekolah", "Kolam Renang Cluster", "CCTV"],
    description: "Cluster dengan one-gate system, harga kompetitif di kawasan berkembang Medan.",
  },
  {
    id: "paramount-05",
    title: "Paramount Petals",
    developer: "Paramount Land",
    tier: "Tier 2",
    location: "Curug",
    city: "Tangerang",
    price: 950_000_000,
    bedrooms: 3, bathrooms: 2, landSize: 84, buildingSize: 70,
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
    hasVR: false, rating: 4.3,
    features: ["Akses Tol Balaraja", "Sekolah", "Jogging Track"],
    description: "Hunian modern dengan konsep compact, lokasi strategis arah Serang.",
  },
  {
    id: "podomoro-06",
    title: "Podomoro Park Bandung",
    developer: "Agung Podomoro",
    tier: "Tier 1",
    location: "Buah Batu",
    city: "Bandung",
    price: 1_650_000_000,
    bedrooms: 3, bathrooms: 3, landSize: 110, buildingSize: 100,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    hasVR: true, rating: 4.7,
    features: ["Tol Akses", "Central Park 8ha", "Tematik Cluster", "Smart Home"],
    description: "Kawasan terintegrasi dengan central park seluas 8 hektar di Bandung selatan.",
  },
];

export function findProperty(id: string) {
  return properties.find((p) => p.id === id);
}
