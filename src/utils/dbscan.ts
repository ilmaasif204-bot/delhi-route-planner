import type { CitizenReport, HotspotCluster } from "@/types/route";

/**
 * DBSCAN-based hotspot clustering for citizen AQI reports
 * Uses the `density-clustering` npm package
 */
import { DBSCAN } from "density-clustering";

const DBSCAN_EPSILON = 0.008; // ~800m in lat/lng degrees
const DBSCAN_MIN_POINTS = 3;

/**
 * Run DBSCAN over citizen report locations and return cluster results
 */
export function detectHotspots(
  reports: CitizenReport[],
  epsilon = DBSCAN_EPSILON,
  minPoints = DBSCAN_MIN_POINTS
): HotspotCluster[] {
  if (reports.length === 0) return [];

  const points = reports.map((r) => [r.lat, r.lng]);
  const dbscan = new DBSCAN();

  const clusterIndices = dbscan.run(points, epsilon, minPoints);
  // clusterIndices is an array of arrays, each containing indices of points in the cluster

  const hotspots: HotspotCluster[] = [];

  clusterIndices.forEach((indices: number[], clusterIdx: number) => {
    if (indices.length < minPoints) return;

    const clusterReports = indices.map((i) => reports[i]);
    const centerLat =
      clusterReports.reduce((s, r) => s + r.lat, 0) / clusterReports.length;
    const centerLng =
      clusterReports.reduce((s, r) => s + r.lng, 0) / clusterReports.length;
    const avgSeverity =
      clusterReports.reduce((s, r) => s + r.severity, 0) /
      clusterReports.length;

    // Determine trend: compare recent vs older reports
    const now = Date.now();
    const recent = clusterReports.filter(
      (r) => now - r.timestamp < 3 * 60 * 60 * 1000
    );
    const older = clusterReports.filter(
      (r) => now - r.timestamp >= 3 * 60 * 60 * 1000
    );
    const recentAvgSeverity =
      recent.length > 0
        ? recent.reduce((s, r) => s + r.severity, 0) / recent.length
        : 0;
    const olderAvgSeverity =
      older.length > 0
        ? older.reduce((s, r) => s + r.severity, 0) / older.length
        : 0;

    let trend: "rising" | "stable" | "falling" = "stable";
    if (recentAvgSeverity > olderAvgSeverity + 0.5) trend = "rising";
    else if (recentAvgSeverity < olderAvgSeverity - 0.5) trend = "falling";

    hotspots.push({
      id: `hotspot-${clusterIdx}`,
      centerLat,
      centerLng,
      count: clusterReports.length,
      avgSeverity: Math.round(avgSeverity * 10) / 10,
      points: clusterReports,
      trend,
    });
  });

  return hotspots;
}

/**
 * Calculate air quality exposure for a route polyline based on hotspots
 * Returns a score 0-1 (higher = worse exposure)
 */
export function computeRouteAirQualityExposure(
  polyline: [number, number][],
  hotspots: HotspotCluster[],
  thresholdMeters = 500
): number {
  if (hotspots.length === 0 || polyline.length === 0) return 0;

  let totalExposure = 0;
  const thresholdDeg = thresholdMeters / 111000; // approx degrees

  for (const hotspot of hotspots) {
    // Check if any segment of polyline passes near this hotspot
    let minDist = Infinity;
    for (const [lat, lng] of polyline) {
      const dist = Math.sqrt(
        (lat - hotspot.centerLat) ** 2 + (lng - hotspot.centerLng) ** 2
      );
      if (dist < minDist) minDist = dist;
    }

    if (minDist <= thresholdDeg) {
      // Weight by severity and proximity
      const proximityFactor = 1 - minDist / thresholdDeg;
      totalExposure +=
        (hotspot.avgSeverity / 5) * proximityFactor * (hotspot.count / 10);
    }
  }

  return Math.min(1, totalExposure);
}
