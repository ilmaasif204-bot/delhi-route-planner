import type { GeoLocation, RouteOption } from "@/types/route";
import type { ModeId } from "@/config/transport";
import {
  MODES,
  FARE_CONFIG,
  CO2_CONFIG,
  SAFETY_CONFIG,
  computeFare,
  computeTime,
  findNearestMetro,
  haversine,
} from "@/config/transport";

/**
 * OSRM-based routing for car/bike/cycle/bus modes
 * Falls back to straight-line distance estimation for modes OSRM doesn't profile well
 */

const OSRM_BASE = "https://router.project-osrm.org";

interface OSRMResponse {
  code: string;
  routes: {
    geometry: string; // encoded polyline
    distance: number; // meters
    duration: number; // seconds
  }[];
}

/** Decode OSRM encoded polyline to lat/lng array */
function decodePolyline(encoded: string): [number, number][] {
  const points: [number, number][] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lat += dlat;
    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = (result & 1) !== 0 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

/** Get the OSRM profile for a mode */
function getOsrmProfile(mode: ModeId): string | null {
  const profiles: Record<string, string> = {
    car: "car",
    cab: "car",
    bike: "car", // OSRM doesn't have motorcycle; use car routing
    scooter: "car",
    cycle: "bike",
    bus: "car", // approximate bus route with road routing
  };
  return profiles[mode] || null;
}

/** Fetch route from OSRM */
async function fetchOsrmRoute(
  from: GeoLocation,
  to: GeoLocation,
  mode: ModeId
): Promise<{ polyline: [number, number][]; distanceKm: number; durationMin: number } | null> {
  const profile = getOsrmProfile(mode);
  if (!profile) return null;

  const url = `${OSRM_BASE}/route/v1/${profile}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=polyline&steps=false`;

  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const data: OSRMResponse = await res.json();
    if (data.code !== "Ok" || data.routes.length === 0) return null;

    const route = data.routes[0];
    return {
      polyline: decodePolyline(route.geometry),
      distanceKm: Math.round((route.distance / 1000) * 100) / 100,
      durationMin: Math.round(route.duration / 60),
    };
  } catch (err) {
    console.error(`OSRM route error for ${mode}:`, err);
    return null;
  }
}

/**
 * Generate all route options between source and destination
 */
export async function generateRouteOptions(
  source: GeoLocation,
  dest: GeoLocation
): Promise<RouteOption[]> {
  // First, get OSRM route for car (used as baseline distance for most modes)
  const carRoute = await fetchOsrmRoute(source, dest, "car");
  const directDistance = carRoute?.distanceKm || haversine(source.lat, source.lng, dest.lat, dest.lng);
  const carPolyline = carRoute?.polyline || [
    [source.lat, source.lng] as [number, number],
    [dest.lat, dest.lng] as [number, number],
  ];

  const modes: ModeId[] = ["car", "cab", "auto", "bus", "metro", "bike", "scooter", "cycle"];
  const results: RouteOption[] = [];

  // Get specific routes for modes that benefit from it
  const [cycleRoute, bikeRoute] = await Promise.all([
    fetchOsrmRoute(source, dest, "cycle"),
    fetchOsrmRoute(source, dest, "bike"),
  ]);

  for (const modeId of modes) {
    const mode = MODES.find((m) => m.id === modeId)!;
    let distanceKm: number;
    let polyline: [number, number][];
    let available = true;
    let unavailableReason: string | undefined;

    if (modeId === "metro") {
      const srcMetro = findNearestMetro(source.lat, source.lng);
      const destMetro = findNearestMetro(dest.lat, dest.lng);

      if (!srcMetro || !destMetro) {
        available = false;
        unavailableReason = !srcMetro
          ? "No nearby metro station at source"
          : "No nearby metro station at destination";
        distanceKm = directDistance;
        polyline = carPolyline;
      } else {
        distanceKm = Math.round(directDistance * 1.2 * 100) / 100;
        polyline = carPolyline;
      }
    } else if (modeId === "cycle" && cycleRoute) {
      distanceKm = cycleRoute.distanceKm;
      polyline = cycleRoute.polyline;
    } else if ((modeId === "bike" || modeId === "scooter") && bikeRoute) {
      distanceKm = bikeRoute.distanceKm;
      polyline = bikeRoute.polyline;
    } else {
      distanceKm = carRoute?.distanceKm || directDistance;
      polyline = carPolyline;
    }

    const fare = computeFare(modeId, distanceKm);
    const time = computeTime(modeId, distanceKm);
    const co2 = Math.round(CO2_CONFIG[modeId] * distanceKm);

    // Compute walking distance (last-mile for metro, 0 for others)
    let walkingDistance = 0;
    if (modeId === "metro") {
      const srcMetro = findNearestMetro(source.lat, source.lng);
      const destMetro = findNearestMetro(dest.lat, dest.lng);
      const srcWalk = srcMetro?.distance ?? 0;
      const destWalk = destMetro?.distance ?? 0;
      walkingDistance = Math.round((srcWalk + destWalk) * 100) / 100;
    }

    results.push({
      id: `${modeId}-${Date.now()}`,
      mode: modeId,
      modeLabel: mode.label,
      modeIcon: mode.icon,
      modeColor: mode.color,
      distance: distanceKm,
      fare,
      time,
      co2,
      safety: SAFETY_CONFIG[modeId],
      airQualityScore: 0.5, // placeholder — will be computed after DBSCAN
      polyline,
      available,
      unavailableReason,
      walkingDistance,
    });
  }

  return results;
}
