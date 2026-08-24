import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Table, ChevronLeft, Leaf, Loader, MapPin,
  Navigation, Search, X, Clock, IndianRupee, TrendingUp,
} from "lucide-react";
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
import { searchDelhiLocations, type GeoSuggestion } from "@/utils/geocoding";
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

function LocationInput({
  label,
  icon: Icon,
  location,
  onChange,
  placeholder,
}: {
  label: string;
  icon: typeof MapPin;
  location: GeoLocation | null;
  onChange: (loc: GeoLocation | null) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState(location?.label || "");
  const [suggestions, setSuggestions] = useState<GeoSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    setQuery(location?.label || "");
  }, [location]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    setSearching(true);
    try {
      const results = await searchDelhiLocations(q);
      setSuggestions(results);
      setIsOpen(results.length > 0);
    } catch {
      setSuggestions([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (location) {
      onChange(null);
    }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 300);
  };

  const handleSelect = (s: GeoSuggestion) => {
    setQuery(s.label);
    onChange({ lat: s.lat, lng: s.lng, label: s.label });
    setIsOpen(false);
    setSuggestions([]);
  };

  const handleClear = () => {
    setQuery("");
    onChange(null);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1 min-w-0">
      <label className="block text-[11px] font-semibold tracking-wider uppercase text-slate-500 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-[#0f172a] border border-white/10 rounded-lg
                     text-sm text-white placeholder:text-slate-600
                     focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500/60
                     transition-all duration-200"
        />
        {(query || location) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {searching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-1 w-full bg-[#1e293b] border border-white/10 rounded-lg shadow-xl overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={`${s.lat}-${s.lng}-${i}`}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-teal-400 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-white truncate">
                      {s.label}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">
                      {s.displayName}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <div className="px-3 py-1.5 text-[10px] text-slate-600 border-t border-white/5 italic">
              Showing locations within Delhi NCT only
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      const routesWithAQ = routeOptions.map((r) => ({
        ...r,
        airQualityScore: computeRouteAirQualityExposure(
          r.polyline,
          hotspots,
          500
        ),
      }));
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
  }, [weights]);

  // Handle citizen report submission (with optional photo/video/description)
  const handleSubmitReport = useCallback(
    (reportType: CitizenReportType, photo?: File, video?: File, description?: string) => {
      const getSeverity = (type: CitizenReportType) => {
        switch (type) {
          case "clear": return 1;
          case "dusty": return 3;
          case "smoky": return 4;
          case "burning": return 5;
          case "garbage": return 4;
          case "dirty": return 3;
          default: return 3;
        }
      };

      const createReport = (lat: number, lng: number) => {
        const photoUrl = photo ? URL.createObjectURL(photo) : undefined;
        const videoUrl = video ? URL.createObjectURL(video) : undefined;
        const newReport: CitizenReport = {
          id: `user-${Date.now()}`,
          lat,
          lng,
          severity: getSeverity(reportType),
          reportType,
          timestamp: Date.now(),
          photoUrl,
          videoUrl,
          description,
        };
        setCitizenReports((prev) => [...prev, newReport]);
      };

      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => createReport(pos.coords.latitude, pos.coords.longitude),
          () => createReport(28.6139, 77.2090)
        );
      }
    },
    []
  );

  const toggleMode = (modeId: string) => {
    setVisibleModes((prev) => {
      const next = new Set(prev);
      if (next.has(modeId)) next.delete(modeId);
      else next.add(modeId);
      return next;
    });
  };

  const handlePopularRoute = (route: typeof POPULAR_ROUTES[number]) => {
    setSource({ lat: route.lat1, lng: route.lng1, label: route.from });
    setDestination({ lat: route.lat2, lng: route.lng2, label: route.to });
  };

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* Header */}
      <header className="bg-[#1e293b]/95 backdrop-blur-md border-b border-white/10 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-500/20">
              <Map className="h-4 w-4 text-white" />
            </div>
            <span className="text-base font-extrabold text-white tracking-tight group-hover:text-teal-300 transition-colors">
              microway
            </span>
          </a>
          <span className="text-[10px] tracking-wider uppercase text-slate-500 font-medium border border-white/10 rounded px-1.5 py-0.5">
            Delhi NCT
          </span>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1.5 text-[10px]">
              <button
                onClick={() => setShowAqiLayer(!showAqiLayer)}
                className={`px-2 py-1 rounded-md border transition-all ${
                  showAqiLayer
                    ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                    : "border-white/10 text-slate-500"
                }`}
              >
                AQI Stations
              </button>
              <button
                onClick={() => setShowHotspots(!showHotspots)}
                className={`px-2 py-1 rounded-md border transition-all ${
                  showHotspots
                    ? "bg-red-500/15 border-red-500/30 text-red-400"
                    : "border-white/10 text-slate-500"
                }`}
              >
                Hotspots
              </button>
              <button
                onClick={() => setShowReports(!showReports)}
                className={`px-2 py-1 rounded-md border transition-all ${
                  showReports
                    ? "bg-amber-500/15 border-amber-500/30 text-amber-400"
                    : "border-white/10 text-slate-500"
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
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="w-full"
        >
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-lg">
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <LocationInput
                label="From"
                icon={Navigation}
                location={source}
                onChange={(loc) => setSource(loc)}
                placeholder="e.g. Connaught Place, Karol Bagh..."
              />

              <div className="hidden sm:flex items-center justify-center pb-2.5 px-1">
                <svg className="w-5 h-5 text-teal-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14m-7-7 7 7-7 7" />
                </svg>
              </div>

              <LocationInput
                label="To"
                icon={MapPin}
                location={destination}
                onChange={(loc) => setDestination(loc)}
                placeholder="e.g. Nehru Place, Dwarka..."
              />

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSearch}
                disabled={!source || !destination || loading}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm
                           bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg shadow-teal-500/20
                           disabled:opacity-40 disabled:cursor-not-allowed
                           hover:shadow-teal-500/30 transition-all shrink-0"
              >
                {loading ? (
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                {loading ? "Calculating..." : "Compare Routes"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Popular Routes */}
        {!hasSearched && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5"
          >
            <div className="text-center mb-3">
              <span className="text-[11px] tracking-[0.2em] uppercase text-slate-500 font-semibold">
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
                    setSource({ lat: r.lat1, lng: r.lng1, label: r.from });
                    setDestination({ lat: r.lat2, lng: r.lng2, label: r.to });
                  }}
                  className="px-4 py-2 bg-[#1e293b] border border-white/10 rounded-xl
                             text-xs font-medium text-slate-300 hover:border-teal-500/30 hover:text-teal-300 transition-all"
                >
                  {r.from} → {r.to}
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Main Content */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Map */}
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

          {/* Routes Panel */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center py-12"
                >
                  <div className="text-center">
                    <Loader className="h-8 w-8 animate-spin text-teal-400 mx-auto" />
                    <p className="text-sm text-slate-400 mt-3 font-medium">
                      Calculating routes across Delhi...
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {routes.length > 0 && !loading && (
              <>
                {/* Mode toggles */}
                <div className="flex flex-wrap gap-1.5">
                  {MODES.map((mode) => {
                    const isActive = visibleModes.has(mode.id);
                    return (
                      <button
                        key={mode.id}
                        onClick={() => toggleMode(mode.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                          isActive
                            ? "border-teal-500/30 bg-teal-500/10 text-white"
                            : "border-white/10 text-slate-600"
                        }`}
                      >
                        <span>{mode.icon}</span>
                        <span className="hidden sm:inline">{mode.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* View toggle + chart metric */}
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setView("cards")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      view === "cards"
                        ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                        : "border-white/10 text-slate-500 hover:text-white"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" /> Cards
                  </button>
                  <button
                    onClick={() => setView("table")}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      view === "table"
                        ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                        : "border-white/10 text-slate-500 hover:text-white"
                    }`}
                  >
                    <Table className="h-3.5 w-3.5" /> Table
                  </button>

                  <div className="ml-auto flex items-center gap-1">
                    {(["co2", "fare", "time"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => setChartMetric(m)}
                        className={`px-2 py-1 rounded-md text-[10px] font-semibold border transition-all ${
                          chartMetric === m
                            ? "bg-teal-500/15 border-teal-500/30 text-teal-400"
                            : "border-white/10 text-slate-500"
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
              <div className="text-center py-12">
                <TrendingUp className="h-8 w-8 mx-auto mb-3 text-slate-700" />
                <p className="text-sm text-slate-500 font-medium">
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
