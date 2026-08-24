import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Table, ChevronLeft, Leaf, Loader, BarChart3,
  Clock, IndianRupee, TrendingUp,
} from "lucide-react";
import SearchBar from "@/components/SearchBar";
import RouteMap from "@/components/RouteMap";
import RouteCards from "@/components/RouteCards";
import CompareTable from "@/components/CompareTable";
import WeightSliders from "@/components/WeightSliders";
import ReportButton from "@/components/ReportButton";
import AuthorityAlerts from "@/components/AuthorityAlerts";
import EmissionsChart from "@/components/EmissionsChart";
import type { ReportType as CitizenReportType } from "@/components/ReportButton";
import { generateRouteOptions } from "@/utils/routing";
import { computeBalancedScores } from "@/utils/wsm";
import { detectHotspots, computeRouteAirQualityExposure } from "@/utils/dbscan";
import { fetchDelhiAQI } from "@/utils/airquality";
import { generateSeedReports } from "@/utils/seedData";
import { MODES } from "@/config/transport";
import type {
  GeoLocation,
  RouteOption,
  WeightParams,
  HotspotCluster,
  AQIStation,
  CitizenReport,
} from "@/types/route";

const POPULAR_ROUTES = [
  { from: "Connaught Place", to: "Saket", lat1: 28.6315, lng1: 77.2167, lat2: 28.5238, lng2: 77.2075 },
  { from: "Rohini", to: "Nehru Place", lat1: 28.7426, lng1: 77.1128, lat2: 28.5491, lng2: 77.2510 },
  { from: "Dwarka", to: "Connaught Place", lat1: 28.5523, lng1: 77.0585, lat2: 28.6315, lng2: 77.2167 },
  { from: "Karol Bagh", to: "Hauz Khas", lat1: 28.6514, lng1: 77.1898, lat2: 28.5490, lng2: 77.2003 },
];

export default function RoutePlanner() {
  const [source, setSource] = useState<GeoLocation | null>(null);
  const [destination, setDestination] = useState<GeoLocation | null>(null);
  const [routes, setRoutes] = useState<RouteOption[]>([]);
  const [weights, setWeights] = useState<WeightParams>({
    fare: 0.20,
    time: 0.25,
    co2: 0.20,
    safety: 0.20,
    airQuality: 0.15,
  });
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [visibleModes, setVisibleModes] = useState<Set<string>>(
    new Set(MODES.map((m) => m.id))
  );
  const [showAqiLayer, setShowAqiLayer] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [aqiStations, setAqiStations] = useState<AQIStation[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [chartMetric, setChartMetric] = useState<"co2" | "fare" | "time">("co2");
  const [hasSearched, setHasSearched] = useState(false);

  // Load initial data
  useEffect(() => {
    const seed = generateSeedReports();
    setCitizenReports(seed);
    setHotspots(detectHotspots(seed));

    fetchDelhiAQI().then(setAqiStations);
  }, []);

  // Re-compute hotspots when citizen reports change
  useEffect(() => {
    setHotspots(detectHotspots(citizenReports));
  }, [citizenReports]);

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!source || !destination) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const routeOptions = await generateRouteOptions(source, destination);
      // Compute air quality exposure for each route
      const routesWithAQ = routeOptions.map((r) => ({
        ...r,
        airQualityScore: computeRouteAirQualityExposure(
          r.polyline,
          hotspots,
          500
        ),
      }));
      // Compute balanced scores
      const scored = computeBalancedScores(routesWithAQ, weights);
      setRoutes(scored);
      setSelectedRoute(scored[0]?.id || null);
    } catch (err) {
      console.error("Route generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [source, destination, weights, hotspots]);

  // Re-compute scores when weights change
  useEffect(() => {
    if (routes.length === 0) return;
    const routesWithAQ = routes.map((r) => ({
      ...r,
      airQualityScore: computeRouteAirQualityExposure(
        r.polyline,
        hotspots,
        500
      ),
    }));
    const scored = computeBalancedScores(routesWithAQ, weights);
    setRoutes(scored);
  }, [weights]); // Intentionally not including routes to avoid infinite loop

  // Handle citizen report submission
  const handleSubmitReport = useCallback(
    (reportType: CitizenReportType) => {
      // Get user's GPS location
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newReport: CitizenReport = {
              id: `user-${Date.now()}`,
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              severity:
                reportType === "clear"
                  ? 1
                  : reportType === "dusty"
                    ? 3
                    : reportType === "smoky"
                      ? 4
                      : reportType === "burning"
                        ? 5
                        : 3,
              reportType,
              timestamp: Date.now(),
            };
            setCitizenReports((prev) => [...prev, newReport]);
          },
          () => {
            // Fallback: use Delhi center
            const newReport: CitizenReport = {
              id: `user-${Date.now()}`,
              lat: 28.6139,
              lng: 77.2090,
              severity: reportType === "clear" ? 1 : 3,
              reportType,
              timestamp: Date.now(),
            };
            setCitizenReports((prev) => [...prev, newReport]);
          }
        );
      }
    },
    []
  );

  // Toggle mode visibility
  const toggleMode = (modeId: string) => {
    setVisibleModes((prev) => {
      const next = new Set(prev);
      if (next.has(modeId)) next.delete(modeId);
      else next.add(modeId);
      return next;
    });
  };

  // Popular route quick-select
  const handlePopularRoute = (route: typeof POPULAR_ROUTES[number]) => {
    setSource({ lat: route.lat1, lng: route.lng1, label: route.from });
    setDestination({ lat: route.lat2, lng: route.lng2, label: route.to });
  };

  // Get the selected route for map highlight
  const selectedRouteObj = routes.find((r) => r.id === selectedRoute);

  return (
    <div className="min-h-screen bg-vintage-bg">
      {/* Header */}
      <header className="bg-vintage-card border-b border-vintage-border sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2 text-vintage-muted hover:text-vintage-text transition-colors">
            <ChevronLeft className="h-4 w-4" />
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xl">🗺️</span>
            <h1
              className="text-lg font-bold text-vintage-text tracking-tight"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              MicroWay
            </h1>
            <span className="text-[10px] tracking-wider uppercase text-vintage-muted border border-vintage-border rounded px-1.5 py-0.5">
              Delhi NCT
            </span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            {/* Map overlay toggles */}
            <div className="hidden md:flex items-center gap-1.5 text-[10px]">
              <button
                onClick={() => setShowAqiLayer(!showAqiLayer)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showAqiLayer
                    ? "bg-vintage-accent/10 border-vintage-accent/30 text-vintage-accent"
                    : "border-vintage-border text-vintage-muted"
                }`}
              >
                AQI Stations
              </button>
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showHotspots
                    ? "bg-red-50 border-red-200 text-red-600"
                    : "border-vintage-border text-vintage-muted"
                }`}
              >
                Hotspots
              </button>
              <button
                onClick={() => setShowReports(!showReports)}
                className={`px-2 py-1 rounded border transition-colors ${
                  showReports
                    ? "bg-vintage-accent/10 border-vintage-accent/30 text-vintage-accent"
                    : "border-vintage-border text-vintage-muted"
                }`}
              >
                Reports ({citizenReports.length})
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar */}
        <SearchBar
          source={source}
          destination={destination}
          onSourceChange={setSource}
          onDestinationChange={setDestination}
          onSearch={handleSearch}
          loading={loading}
        />

        {/* Popular Routes (shown when no search) */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-4"
          >
            <div className="text-center mb-3">
              <span
                className="text-[11px] tracking-[0.2em] uppercase text-vintage-muted"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                Popular Delhi Routes
              </span>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {POPULAR_ROUTES.map((r) => (
                <motion.button
                  key={r.from + r.to}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    handlePopularRoute(r);
                    setTimeout(() => {
                      setSource({ lat: r.lat1, lng: r.lng1, label: r.from });
                      setDestination({ lat: r.lat2, lng: r.lng2, label: r.to });
                    }, 50);
                  }}
                  className="px-3 py-2 bg-vintage-card border border-vintage-border rounded-lg
                             text-xs text-vintage-text hover:border-vintage-accent/40 transition-colors"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  {r.from} → {r.to}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content: Map + Routes */}
        <div className="mt-4 grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* Map (left / top) */}
          <div className="lg:col-span-3 h-[400px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-20">
            <RouteMap
              source={source}
              destination={destination}
              routes={routes}
              visibleModes={visibleModes}
              showAqiLayer={showAqiLayer}
              showHotspots={showHotspots}
              showReports={showReports}
              hotspots={hotspots}
              aqiStations={aqiStations}
              citizenReports={citizenReports}
              selectedRoute={selectedRoute}
            />
          </div>

          {/* Routes Panel (right / bottom) */}
          <div className="lg:col-span-2 space-y-4">
            {/* Loading state */}
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-vintage-accent mx-auto" />
                    <p
                      className="text-sm text-vintage-muted mt-3"
                      style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                    >
                      Calculating routes across Delhi...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {routes.length > 0 && !loading && (
              <>
                {/* Mode toggle pills */}
                <div className="flex flex-wrap gap-1.5">
                  {MODES.map((mode) => {
                    const isActive = visibleModes.has(mode.id);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-[11px] border transition-all ${
                          isActive
                            ? "border-vintage-accent/40 bg-vintage-accent/10 text-vintage-text"
                            : "border-vintage-border text-vintage-muted/50"
                        }`}
                        title={isActive ? `Hide ${mode.label}` : `Show ${mode.label}`}
                      >
                        <span>{mode.icon}</span>
                        <span className="hidden sm:inline">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View toggle */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setView("cards")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      view === "cards"
                        ? "bg-vintage-accent/10 border-vintage-accent/30 text-vintage-accent"
                        : "border-vintage-border text-vintage-muted hover:text-vintage-text"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" /> Cards
                  </button>
                  <button
                    onClick={() => setView("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                      view === "table"
                        ? "bg-vintage-accent/10 border-vintage-accent/30 text-vintage-accent"
                        : "border-vintage-border text-vintage-muted hover:text-vintage-text"
                    }`}
                  >
                    <Table className="h-3.5 w-3.5" /> Table
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    {(["co2", "fare", "time"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setChartMetric(m)}
                        className={`px-2 py-1 rounded text-[10px] border transition-colors ${
                          chartMetric === m
                            ? "bg-vintage-accent/10 border-vintage-accent/30 text-vintage-accent"
                            : "border-vintage-border text-vintage-muted"
                        }`}
                      >
                        {m === "co2" ? "🌿 CO₂" : m === "fare" ? "💰 Fare" : "⏱ Time"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chart */}
                <EmissionsChart routes={routes} metric={chartMetric} />

                {/* Route cards or table */}
                {view === "cards" ? (
                  <RouteCards
                    routes={routes}
                    selectedRoute={selectedRoute}
                    onSelectRoute={setSelectedRoute}
                  />
                ) : (
                  <CompareTable
                    routes={routes}
                    selectedRoute={selectedRoute}
                    onSelectRoute={setSelectedRoute}
                  />
                )}
              </>
            )}

            {!loading && !hasSearched && routes.length === 0 && (
              <div className="text-center py-12 text-vintage-muted">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 opacity-40" />
                <p className="text-sm" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Select source and destination to compare routes
                </p>
              </div>
            )}

            {/* Weight Sliders */}
            {routes.length > 0 && (
              <WeightSliders weights={weights} onChange={setWeights} />
            )}

            {/* Authority Alerts */}
            <AuthorityAlerts hotspots={hotspots} />
          </div>
        </div>
      </main>

      {/* Floating Report Button */}
      <ReportButton onSubmitReport={handleSubmitReport} />
    </div>
  );
}
