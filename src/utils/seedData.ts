import type { CitizenReport, ReportType } from "@/types/route";

/**
 * SEED DATA — Demo citizen reports for Delhi pollution corridors
 * These simulate historical reports from citizens across known pollution-prone areas.
 * Clearly labeled as demo data, not real citizen submissions.
 */

const REPORT_TYPES: ReportType[] = ["dusty", "smoky", "burning", "traffic_haze", "clear", "garbage", "dirty"];

// Known Delhi pollution hotspots and corridors
const HOTSPOT_CORRIDORS = [
  // Anand Vihar — one of Delhi's worst polluted areas (bus terminal + industrial)
  { name: "Anand Vihar", reports: 8, baseSeverity: 4, lat: 28.6458, lng: 77.3159, spread: 0.005 },
  // ITO junction — heavy traffic + pollution
  { name: "ITO", reports: 7, baseSeverity: 3.5, lat: 28.6290, lng: 77.2430, spread: 0.004 },
  // Okhla industrial area
  { name: "Okhla Industrial", reports: 6, baseSeverity: 4.2, lat: 28.5370, lng: 77.2750, spread: 0.005 },
  // Ring Road stretches
  { name: "Ring Road (ITO)", reports: 5, baseSeverity: 3.8, lat: 28.6200, lng: 77.2500, spread: 0.006 },
  { name: "Ring Road (South)", reports: 5, baseSeverity: 3.5, lat: 28.5100, lng: 77.2600, spread: 0.006 },
  // Wazirpur industrial area
  { name: "Wazirpur", reports: 6, baseSeverity: 4.0, lat: 28.7090, lng: 77.1690, spread: 0.004 },
  // NH-8 / Dhaula Kuan corridor
  { name: "Dhaula Kuan", reports: 5, baseSeverity: 3.2, lat: 28.5940, lng: 77.1650, spread: 0.005 },
  // Bawana industrial
  { name: "Bawana", reports: 5, baseSeverity: 4.5, lat: 28.7940, lng: 77.0350, spread: 0.005 },
  // Outer Ring Road industrial belt
  { name: "Outer Ring Rd (North)", reports: 4, baseSeverity: 3.8, lat: 28.7200, lng: 77.2500, spread: 0.007 },
  // Mundka industrial area
  { name: "Mundka", reports: 4, baseSeverity: 4.1, lat: 28.6820, lng: 77.0320, spread: 0.005 },
  // Ludhiana Colony / GT Karnal Road
  { name: "GT Karnal Road", reports: 4, baseSeverity: 3.5, lat: 28.7300, lng: 77.1800, spread: 0.005 },
  // Narela
  { name: "Narela", reports: 3, baseSeverity: 3.9, lat: 28.8530, lng: 77.0930, spread: 0.006 },
];

/**
 * Generate seeded citizen reports for demo.
 * Uses deterministic seeding based on corridor positions.
 */
export function generateSeedReports(): CitizenReport[] {
  const reports: CitizenReport[] = [];
  let id = 0;

  for (const corridor of HOTSPOT_CORRIDORS) {
    for (let i = 0; i < corridor.reports; i++) {
      // Deterministic offset using simple math
      const angle = ((id * 137.508) % 360) * (Math.PI / 180); // golden angle
      const r = corridor.spread * ((id * 7 + 1) % 10) / 10;

      const lat = corridor.lat + r * Math.cos(angle);
      const lng = corridor.lng + r * Math.sin(angle);

      // Severity: base ± small variation
      const severityVar = ((id * 3 + 7) % 10) / 10 - 0.5; // -0.5 to 0.5
      const severity = Math.max(1, Math.min(5, Math.round(corridor.baseSeverity + severityVar)));

      // Report type: weight towards "smoky", "burning", "garbage" in bad areas
      const typeIdx = corridor.baseSeverity > 4
        ? (id % 4 === 0 ? 1 : id % 4 === 1 ? 2 : id % 4 === 2 ? 5 : 3) // smoky, burning, garbage, haze
        : id % 5; // spread across types
      const reportType = REPORT_TYPES[Math.abs(typeIdx) % REPORT_TYPES.length];

      // Timestamp: spread over last 12 hours
      const hoursAgo = ((id * 11 + 3) % 12);
      const timestamp = Date.now() - hoursAgo * 60 * 60 * 1000;

      reports.push({
        id: `seed-${id}`,
        lat,
        lng,
        severity,
        reportType,
        timestamp,
      });

      id++;
    }
  }

  return reports;
}
