import type { ModeId } from "@/config/transport";

export interface GeoLocation {
  lat: number;
  lng: number;
  label: string;
}

export interface RouteOption {
  id: string;
  mode: ModeId;
  modeLabel: string;
  modeIcon: string;
  modeColor: string;
  distance: number; // km
  fare: number; // ₹
  time: number; // minutes
  co2: number; // grams
  safety: number; // 1-5
  airQualityScore: number; // 0-1 (higher = worse exposure)
  polyline: [number, number][]; // lat/lng pairs for map
  available: boolean;
  unavailableReason?: string;
  walkingDistance?: number; // km — last-mile walking distance
  balancedScore?: number;
  rank?: number;
  badges?: string[];
}

export interface WeightParams {
  fare: number;
  time: number;
  co2: number;
  walking: number;
}

export type Priority = "cheapest" | "fastest" | "greenest" | "balanced";

export interface CitizenReport {
  id: string;
  lat: number;
  lng: number;
  severity: number; // 1-5
  reportType: ReportType;
  timestamp: number;
  photoUrl?: string;
  videoUrl?: string;
  description?: string;
}

export type ReportType = "clear" | "dusty" | "smoky" | "burning" | "traffic_haze" | "garbage" | "dirty";

export interface HotspotCluster {
  id: string;
  centerLat: number;
  centerLng: number;
  count: number;
  avgSeverity: number;
  points: CitizenReport[];
  trend?: "rising" | "stable" | "falling";
}

export interface AQIStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  aqi: number;
  pollutant: string;
  lastUpdate: string;
}

export interface AppState {
  source: GeoLocation | null;
  destination: GeoLocation | null;
  routes: RouteOption[];
  weights: WeightParams;
  loading: boolean;
  error: string | null;
  selectedRoute: string | null;
  showAqiLayer: boolean;
  showHotspots: boolean;
  showReports: boolean;
  view: "cards" | "table";
  reportSheetOpen: boolean;
}
