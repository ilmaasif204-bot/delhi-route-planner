import { DELHI_VIEWBOX, DELHI_BOUNDS } from "@/config/transport";

/**
 * Nominatim geocoding restricted to NCT Delhi
 * Uses viewbox + bounded=1 to ensure only Delhi results
 */

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  boundingbox: string[];
  type: string;
  importance: number;
}

export interface GeoSuggestion {
  label: string;
  displayName: string;
  lat: number;
  lng: number;
}

function isInDelhi(lat: number, lng: number): boolean {
  return (
    lat >= DELHI_BOUNDS.south &&
    lat <= DELHI_BOUNDS.north &&
    lng >= DELHI_BOUNDS.west &&
    lng <= DELHI_BOUNDS.east
  );
}

export async function searchDelhiLocations(
  query: string
): Promise<GeoSuggestion[]> {
  if (query.length < 2) return [];

  const params = new URLSearchParams({
    q: query,
    format: "json",
    viewbox: DELHI_VIEWBOX,
    bounded: "1",
    countrycodes: "in",
    limit: "8",
    "accept-language": "en",
    extratags: "1",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?${params}`,
      {
        headers: {
          "User-Agent": "MicroWay/1.0 (microway-delhi-travel-app)",
        },
      }
    );

    if (!res.ok) return [];

    const data: NominatimResult[] = await res.json();

    return data
      .filter((r) => {
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        return isInDelhi(lat, lng);
      })
      .map((r) => {
        const lat = parseFloat(r.lat);
        const lng = parseFloat(r.lon);
        // Use a short, readable label
        const parts = r.display_name.split(", ");
        const label = parts[0] || r.display_name;
        return {
          label,
          displayName: r.display_name,
          lat,
          lng,
        };
      })
      .slice(0, 6);
  } catch (err) {
    console.error("Geocoding error:", err);
    return [];
  }
}

/**
 * Reverse geocode — get address from coordinates
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string> {
  const params = new URLSearchParams({
    lat: lat.toString(),
    lon: lng.toString(),
    format: "json",
    "accept-language": "en",
  });

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params}`,
      {
        headers: {
          "User-Agent": "MicroWay/1.0 (microway-delhi-travel-app)",
        },
      }
    );

    if (!res.ok) return "Unknown location";

    const data = await res.json();
    const parts = data.display_name?.split(", ") || [];
    return parts.slice(0, 3).join(", ") || "Unknown location";
  } catch {
    return "Unknown location";
  }
}
