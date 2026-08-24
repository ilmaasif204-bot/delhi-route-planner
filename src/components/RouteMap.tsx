import { useEffect, useRef, useMemo } from "react";
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import type { RouteOption, GeoLocation, HotspotCluster, AQIStation, CitizenReport } from "@/types/route";
import { DELHI_CENTER, DELHI_ZOOM } from "@/config/transport";

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface RouteMapProps {
  source: GeoLocation | null;
  destination: GeoLocation | null;
  routes: RouteOption[];
  visibleModes: Set<string>;
  showAqiLayer: boolean;
  showHotspots: boolean;
  showReports: boolean;
  hotspots: HotspotCluster[];
  aqiStations: AQIStation[];
  citizenReports: CitizenReport[];
  selectedRoute: string | null;
}

/** Custom animated source marker */
function SourceMarker({ location }: { location: GeoLocation }) {
  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={10}
      fillColor="#2d5016"
      fillOpacity={0.9}
      color="#1a3a0a"
      weight={3}
    >
      <Popup>
        <div className="text-center">
          <div className="font-bold text-sm">📍 Source</div>
          <div className="text-xs text-gray-600">{location.label}</div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

/** Custom animated destination marker */
function DestMarker({ location }: { location: GeoLocation }) {
  return (
    <CircleMarker
      center={[location.lat, location.lng]}
      radius={10}
      fillColor="#8B0000"
      fillOpacity={0.9}
      color="#5a0000"
      weight={3}
    >
      <Popup>
        <div className="text-center">
          <div className="font-bold text-sm">🏁 Destination</div>
          <div className="text-xs text-gray-600">{location.label}</div>
        </div>
      </Popup>
    </CircleMarker>
  );
}

/** Fit map bounds to source + destination + route points */
function FitBounds({
  source,
  destination,
  routes,
  visibleModes,
}: {
  source: GeoLocation | null;
  destination: GeoLocation | null;
  routes: RouteOption[];
  visibleModes: Set<string>;
}) {
  const map = useMap();

  useEffect(() => {
    if (!source || !destination) {
      map.setView([DELHI_CENTER.lat, DELHI_CENTER.lng], DELHI_ZOOM);
      return;
    }

    const bounds = L.latLngBounds([
      [source.lat, source.lng],
      [destination.lat, destination.lng],
    ]);

    // Add route polyline points for tighter bounds
    for (const route of routes) {
      if (!visibleModes.has(route.mode)) continue;
      if (route.polyline.length > 0) {
        for (const [lat, lng] of route.polyline) {
          bounds.extend([lat, lng]);
        }
      }
    }

    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
  }, [source, destination, routes, visibleModes, map]);

  return null;
}

export default function RouteMap({
  source,
  destination,
  routes,
  visibleModes,
  showAqiLayer,
  showHotspots,
  showReports,
  hotspots,
  aqiStations,
  citizenReports,
  selectedRoute,
}: RouteMapProps) {
  const mapRef = useRef<L.Map>(null);

  const center = useMemo(
    () => [DELHI_CENTER.lat, DELHI_CENTER.lng] as [number, number],
    []
  );

  return (
    <div className="w-full h-full min-h-[400px] rounded-xl overflow-hidden border border-vintage-border relative">
      <MapContainer
        center={center}
        zoom={DELHI_ZOOM}
        className="w-full h-full"
        style={{ minHeight: "400px", background: "#f5f0e8" }}
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> | <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        {source && <SourceMarker location={source} />}
        {destination && <DestMarker location={destination} />}

        <FitBounds
          source={source}
          destination={destination}
          routes={routes}
          visibleModes={visibleModes}
        />

        {/* Route polylines */}
        {routes.map((route) => {
          if (!visibleModes.has(route.mode)) return null;
          if (route.polyline.length < 2) return null;
          const isSelected = route.id === selectedRoute;
          return (
            <Polyline
              key={route.id}
              positions={route.polyline}
              pathOptions={{
                color: route.modeColor,
                weight: isSelected ? 6 : 3,
                opacity: isSelected ? 1 : 0.65,
                dashArray: route.available ? undefined : "8, 8",
              }}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold">{route.modeIcon} {route.modeLabel}</div>
                  <div className="text-xs mt-1">
                    {route.distance} km · ₹{route.fare} · {route.time} min
                  </div>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {/* AQI station dots */}
        {showAqiLayer &&
          aqiStations.map((station) => {
            const bandColor =
              station.aqi <= 50
                ? "#4CAF50"
                : station.aqi <= 100
                  ? "#FFEB3B"
                  : station.aqi <= 200
                    ? "#FF9800"
                    : station.aqi <= 300
                      ? "#F44336"
                      : "#9C27B0";
            return (
              <CircleMarker
                key={station.id}
                center={[station.lat, station.lng]}
                radius={6}
                fillColor={bandColor}
                fillOpacity={0.7}
                color="#333"
                weight={1}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-bold text-sm">{station.name}</div>
                    <div className="text-lg font-bold" style={{ color: bandColor }}>
                      AQI: {station.aqi}
                    </div>
                    <div className="text-xs text-gray-500">
                      Primary: {station.pollutant}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Citizen reports */}
        {showReports &&
          citizenReports.map((report) => {
            const color =
              report.severity <= 1
                ? "#4CAF50"
                : report.severity <= 2
                  ? "#8BC34A"
                  : report.severity <= 3
                    ? "#FF9800"
                    : report.severity <= 4
                      ? "#F44336"
                      : "#9C27B0";
            const typeLabels: Record<string, string> = {
              clear: "Clear",
              dusty: "Dusty",
              smoky: "Smoky",
              burning: "Burning Smell",
              traffic_haze: "Traffic Haze",
            };
            return (
              <CircleMarker
                key={report.id}
                center={[report.lat, report.lng]}
                radius={4}
                fillColor={color}
                fillOpacity={0.6}
                color={color}
                weight={1}
              >
                <Popup>
                  <div className="text-center">
                    <div className="font-bold text-sm">
                      {typeLabels[report.reportType] || report.reportType}
                    </div>
                    <div className="text-xs">
                      Severity: {report.severity}/5
                    </div>
                    <div className="text-[10px] text-gray-500">
                      {new Date(report.timestamp).toLocaleString("en-IN")}
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}

        {/* Hotspot clusters — pulsing red zones */}
        {showHotspots &&
          hotspots.map((hotspot) => (
            <CircleMarker
              key={hotspot.id}
              center={[hotspot.centerLat, hotspot.centerLng]}
              radius={30 + hotspot.count * 5}
              fillColor="#FF0000"
              fillOpacity={0.12}
              color="#CC0000"
              weight={2}
              dashArray="6, 4"
            >
              <Popup>
                <div className="text-center">
                  <div className="font-bold text-sm text-red-700">🚨 Pollution Hotspot</div>
                  <div className="text-xs mt-1">
                    Reports: {hotspot.count} · Avg Severity: {hotspot.avgSeverity}/5
                  </div>
                  {hotspot.trend === "rising" && (
                    <div className="text-xs font-bold text-red-600 mt-1">
                      ⚠️ Rising Risk — trend is increasing
                    </div>
                  )}
                </div>
              </Popup>
            </CircleMarker>
          ))}
      </MapContainer>

      {/* Map legend overlay */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-vintage-card/95 backdrop-blur-sm border border-vintage-border rounded-lg px-3 py-2 text-[10px] shadow-sm">
        <div className="font-bold mb-1 text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Legend</div>
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#2d5016]" /> Source</div>
          <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#8B0000]" /> Destination</div>
          {showAqiLayer && <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#FF9800]" /> AQI Station</div>}
          {showHotspots && <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full border border-red-600" /> Hotspot</div>}
        </div>
      </div>
    </div>
  );
}
