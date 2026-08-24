/**
 * MicroWay — Delhi Transport Configuration
 * 
 * All fare/CO₂/speed constants are based on real Delhi-market rates.
 * Easy to tweak during judging Q&A — just edit this file.
 */

export const DELHI_CENTER = { lat: 28.6139, lng: 77.2090 };
export const DELHI_ZOOM = 12;

// Nominatim bounding box for NCT Delhi (SW lng, NE lng, NE lat, SW lat)
export const DELHI_VIEWBOX = "77.0354,28.8200,77.4138,28.4920";
// Bounding box corners for filtering
export const DELHI_BOUNDS = {
  south: 28.4070,
  north: 28.8915,
  west: 76.8388,
  east: 77.3555,
};

export type ModeId =
  | "metro"
  | "bus"
  | "car"
  | "bike"
  | "scooter"
  | "cycle"
  | "cab"
  | "auto";

export interface ModeConfig {
  id: ModeId;
  label: string;
  icon: string;
  color: string;
  available: boolean;
}

export const MODES: ModeConfig[] = [
  { id: "metro", label: "Delhi Metro", icon: "🚇", color: "#E4002B", available: true },
  { id: "bus", label: "Bus (DTC)", icon: "🚌", color: "#1E88E5", available: true },
  { id: "car", label: "Car (Self-drive)", icon: "🚗", color: "#5C6BC0", available: true },
  { id: "bike", label: "Motorbike", icon: "🏍️", color: "#FF8F00", available: true },
  { id: "scooter", label: "Scooter", icon: "🛵", color: "#7B1FA2", available: true },
  { id: "cycle", label: "Bicycle", icon: "🚲", color: "#43A047", available: true },
  { id: "cab", label: "Cab (Ola/Uber)", icon: "🚕", color: "#F9A825", available: true },
  { id: "auto", label: "Auto-rickshaw", icon: "🛺", color: "#FF7043", available: true },
];

/** Fare structure per mode — Delhi-specific */
export const FARE_CONFIG: Record<
  ModeId,
  {
    baseFare: number;
    perKm: number;
    avgSpeedKmh: number;
    flatSlab?: boolean;
    slabFn?: (km: number) => number;
  }
> = {
  auto: {
    baseFare: 30,
    perKm: 11,
    avgSpeedKmh: 18,
  },
  cab: {
    baseFare: 50,
    perKm: 15,
    avgSpeedKmh: 20,
  },
  bus: {
    baseFare: 10,
    perKm: 0,
    avgSpeedKmh: 15,
    flatSlab: true,
    slabFn: (km) => {
      if (km <= 4) return 10;
      if (km <= 10) return 15;
      if (km <= 20) return 20;
      return 25;
    },
  },
  metro: {
    baseFare: 10,
    perKm: 0,
    avgSpeedKmh: 32,
    flatSlab: true,
    slabFn: (km) => {
      if (km <= 2) return 10;
      if (km <= 5) return 20;
      if (km <= 12) return 30;
      if (km <= 21) return 40;
      if (km <= 32) return 50;
      return 60;
    },
  },
  bike: {
    baseFare: 0,
    perKm: 1.5,
    avgSpeedKmh: 25,
  },
  scooter: {
    baseFare: 0,
    perKm: 1.8,
    avgSpeedKmh: 25,
  },
  car: {
    baseFare: 0,
    perKm: 8,
    avgSpeedKmh: 20,
  },
  cycle: {
    baseFare: 0,
    perKm: 0,
    avgSpeedKmh: 12,
  },
};

/** CO₂ emissions in g/km per mode */
export const CO2_CONFIG: Record<ModeId, number> = {
  car: 120,
  cab: 120,
  auto: 70,
  bike: 60,
  scooter: 60,
  bus: 80,
  metro: 40,
  cycle: 0,
};

/** Safety score 1–5 */
export const SAFETY_CONFIG: Record<ModeId, number> = {
  metro: 5,
  bus: 4,
  cab: 4,
  car: 4,
  auto: 3,
  bike: 2,
  scooter: 2,
  cycle: 3,
};

/** Default WSM weights (must sum to 1) */
export const DEFAULT_WEIGHTS = {
  fare: 0.20,
  time: 0.25,
  co2: 0.20,
  safety: 0.20,
  airQuality: 0.15,
};

/** Air quality bands */
export function aqiBand(aqi: number): { label: string; color: string } {
  if (aqi <= 50) return { label: "Good", color: "#4CAF50" };
  if (aqi <= 100) return { label: "Satisfactory", color: "#FFEB3B" };
  if (aqi <= 200) return { label: "Moderate", color: "#FF9800" };
  if (aqi <= 300) return { label: "Poor", color: "#F44336" };
  if (aqi <= 400) return { label: "Very Poor", color: "#9C27B0" };
  return { label: "Severe", color: "#7B1FA2" };
}

/** Delhi Metro stations — key ones for proximity check */
export const METRO_STATIONS = [
  { name: "Rajiv Chowk", lat: 28.6328, lng: 77.2197 },
  { name: "New Delhi", lat: 28.6421, lng: 77.2270 },
  { name: "Connaught Place", lat: 28.6315, lng: 77.2167 },
  { name: "Kashmere Gate", lat: 28.6676, lng: 77.2281 },
  { name: "Dwarka Sector 21", lat: 28.5523, lng: 77.0585 },
  { name: "Rohini West", lat: 28.7426, lng: 77.1128 },
  { name: "Noida Electronic City", lat: 28.5827, lng: 77.3334 },
  { name: "Huda City Centre", lat: 28.4594, lng: 77.0266 },
  { name: "Saket", lat: 28.5238, lng: 77.2075 },
  { name: "Nehru Place", lat: 28.5491, lng: 77.2510 },
  { name: "Hauz Khas", lat: 28.5490, lng: 77.2003 },
  { name: "Karol Bagh", lat: 28.6514, lng: 77.1898 },
  { name: "Rajouri Garden", lat: 28.6493, lng: 77.1231 },
  { name: "Janakpuri West", lat: 28.6212, lng: 77.0816 },
  { name: "Lajpat Nagar", lat: 28.5700, lng: 77.2370 },
  { name: "ITO", lat: 28.6290, lng: 77.2430 },
  { name: "Preet Vihar", lat: 28.6420, lng: 77.2920 },
  { name: "Anand Vihar ISBT", lat: 28.6458, lng: 77.3159 },
  { name: "Pragati Maidan", lat: 28.6170, lng: 77.2415 },
  { name: "Chandni Chowk", lat: 28.6507, lng: 77.2300 },
  { name: "Mandi House", lat: 28.6250, lng: 77.2335 },
  { name: "INA", lat: 28.5690, lng: 77.2110 },
  { name: "AIIMS", lat: 28.5672, lng: 77.2100 },
  { name: "Kalkaji Mandir", lat: 28.5320, lng: 77.2580 },
  { name: "Noida Sector 15", lat: 28.5770, lng: 77.3120 },
  { name: "Dhaula Kuan", lat: 28.5940, lng: 77.1650 },
  { name: "Paschim Vihar East", lat: 28.6810, lng: 77.1050 },
  { name: "Peeragarhi", lat: 28.7060, lng: 77.0960 },
  { name: "Mundka", lat: 28.6820, lng: 77.0320 },
  { name: "Shivaji Stadium", lat: 28.6338, lng: 77.2150 },
];

/** Find nearest metro station within walkable distance (≤ 1.5 km) */
export function findNearestMetro(
  lat: number,
  lng: number
): { station: typeof METRO_STATIONS[number]; distance: number } | null {
  let best: typeof METRO_STATIONS[number] | null = null;
  let bestDist = Infinity;
  for (const s of METRO_STATIONS) {
    const d = haversine(lat, lng, s.lat, s.lng);
    if (d < bestDist) {
      bestDist = d;
      best = s;
    }
  }
  if (best && bestDist <= 1.5) {
    return { station: best, distance: bestDist };
  }
  return null;
}

/** Haversine distance in km */
export function haversine(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Compute fare for a given mode and distance */
export function computeFare(mode: ModeId, distanceKm: number): number {
  const cfg = FARE_CONFIG[mode];
  if (cfg.flatSlab && cfg.slabFn) return cfg.slabFn(distanceKm);
  return Math.round(cfg.baseFare + cfg.perKm * distanceKm);
}

/** Compute time in minutes for a given mode and distance */
export function computeTime(mode: ModeId, distanceKm: number): number {
  const cfg = FARE_CONFIG[mode];
  let minutes = (distanceKm / cfg.avgSpeedKmh) * 60;
  if (mode === "metro") minutes += 5;
  if (mode === "bus") minutes += 3;
  return Math.round(minutes);
}
