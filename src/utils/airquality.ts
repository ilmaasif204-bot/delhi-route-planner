import type { AQIStation } from "@/types/route";
import { DELHI_CENTER } from "@/config/transport";

/**
 * AQI data management for Delhi
 * Uses WAQI (World Air Quality Index) API for real-time station data
 * Falls back to demo data if API is unavailable
 */

const WAQI_API_BASE = "https://api.waqi.info";

// Known CPCB Delhi monitoring stations (for fallback demo data)
const DELHI_STATIONS: Omit<AQIStation, "aqi" | "lastUpdate">[] = [
  { id: "anand-vihar", name: "Anand Vihar", lat: 28.6458, lng: 77.3159, pollutant: "PM2.5" },
  { id: "rk-puram", name: "RK Puram", lat: 28.5588, lng: 77.1789, pollutant: "PM2.5" },
  { id: "punjabi-bagh", name: "Punjabi Bagh", lat: 28.7043, lng: 77.1298, pollutant: "PM10" },
  { id: "ito", name: "ITO", lat: 28.6290, lng: 77.2430, pollutant: "PM2.5" },
  { id: "dwarka", name: "Dwarka", lat: 28.5920, lng: 77.0460, pollutant: "PM2.5" },
  { id: "rohini", name: "Rohini", lat: 28.7490, lng: 77.1060, pollutant: "PM10" },
  { id: "okhla", name: "Okhla Phase-II", lat: 28.5370, lng: 77.2750, pollutant: "PM2.5" },
  { id: "vivek-vihar", name: "Vivek Vihar", lat: 28.6710, lng: 77.3020, pollutant: "NO2" },
  { id: "shadipur", name: "Shadipur", lat: 28.6510, lng: 77.1370, pollutant: "PM2.5" },
  { id: "nri-okhla", name: "NRI Complex (Okhla)", lat: 28.5250, lng: 77.2810, pollutant: "PM10" },
  { id: "sarita-vihar", name: "Sarita Vihar", lat: 28.5050, lng: 77.2890, pollutant: "PM2.5" },
  { id: "mandir-marg", name: "Mandir Marg", lat: 28.6410, lng: 77.1920, pollutant: "SO2" },
  { id: "chanakyapuri", name: "Chandni Chowk", lat: 28.6507, lng: 77.2300, pollutant: "PM2.5" },
  { id: "moti-bagh", name: "Moti Bagh", lat: 28.5790, lng: 77.1750, pollutant: "CO" },
  { id: "bawana", name: "Bawana", lat: 28.7940, lng: 77.0350, pollutant: "PM2.5" },
  { id: "wazirpur", name: "Wazirpur", lat: 28.7090, lng: 77.1690, pollutant: "PM10" },
  { id: "najafgarh", name: "Najafgarh", lat: 28.6090, lng: 76.9780, pollutant: "PM2.5" },
  { id: "jafrabad", name: "Jaffrabad", lat: 28.6890, lng: 77.2900, pollutant: "PM10" },
];

/**
 * Generate realistic demo AQI data (no API key needed)
 * Simulates realistic Delhi AQI levels — mostly poor to very poor
 */
function generateDemoAQI(): AQIStation[] {
  const now = new Date().toISOString();
  return DELHI_STATIONS.map((s) => {
    // Delhi AQI typically ranges 150–500 depending on area
    // Industrial areas higher, residential lower
    const baseAQI = 100 + Math.random() * 250;
    // Areas like Anand Vihar, ITO, Okhla tend to be worse
    const worstAreas = ["anand-vihar", "ito", "okhla", "bawana", "wazirpur", "jafrabad"];
    const penalty = worstAreas.includes(s.id) ? 100 : 0;
    const aqi = Math.round(Math.min(500, baseAQI + penalty + (Math.random() - 0.5) * 50));

    return {
      ...s,
      aqi,
      lastUpdate: now,
    };
  });
}

/**
 * Fetch real AQI data from WAQI API
 * Falls back to demo data if no API key or request fails
 */
export async function fetchDelhiAQI(): Promise<AQIStation[]> {
  const apiKey = import.meta.env.VITE_WAQI_API_KEY;

  if (!apiKey) {
    // Use demo data
    return generateDemoAQI();
  }

  try {
    // Search for Delhi stations
    const res = await fetch(
      `${WAQI_API_BASE}/search/?keyword=delhi&token=${apiKey}`
    );
    if (!res.ok) return generateDemoAQI();

    const data = await res.json();
    if (data.status !== "ok" || !data.data) return generateDemoAQI();

    const stations: AQIStation[] = data.data
      .filter((s: { station: { name: string; geo: number[] }; aqi: string }) => {
        const lat = s.station?.geo?.[0];
        const lng = s.station?.geo?.[1];
        return lat && lng && lat >= 28.4 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5;
      })
      .slice(0, 20)
      .map((s: { uid: number; station: { name: string; geo: number[] }; aqi: string }) => ({
        id: `waqi-${s.uid}`,
        name: s.station.name,
        lat: s.station.geo[0],
        lng: s.station.geo[1],
        aqi: parseInt(s.aqi) || 0,
        pollutant: "PM2.5",
        lastUpdate: new Date().toISOString(),
      }));

    return stations.length > 0 ? stations : generateDemoAQI();
  } catch (err) {
    console.error("AQI fetch error:", err);
    return generateDemoAQI();
  }
}

/**
 * Get nearest AQI value to a coordinate
 */
export function getNearestAQI(
  lat: number,
  lng: number,
  stations: AQIStation[]
): AQIStation | null {
  if (stations.length === 0) return null;
  let best = stations[0];
  let bestDist = Infinity;
  for (const s of stations) {
    const dist = Math.sqrt((lat - s.lat) ** 2 + (lng - s.lng) ** 2);
    if (dist < bestDist) {
      bestDist = dist;
      best = s;
    }
  }
  return best;
}
