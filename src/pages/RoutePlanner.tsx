import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map, Table, ChevronLeft, Leaf, Loader, MapPin,
  Navigation, Search, X, Clock, IndianRupee, TrendingUp,
  RotateCcw, Info, Trophy, Route, Wind, Footprints, Zap,
} from "lucide-react";
import RouteMap from "@/components/RouteMap";
import RouteCards from "@/components/RouteCards";
import CompareTable from "@/components/CompareTable";
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
import { MODES, PRIORITY_WEIGHTS } from "@/config/transport";
import type {
  GeoLocation,
  RouteOption,
  WeightParams,
  Priority,
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

const PRIORITY_OPTIONS: { id: Priority; label: string; icon: string; color: string; desc: string }[] = [
  { id: "cheapest", label: "Cheapest", icon: "💰", color: "#f59e0b", desc: "Minimize cost" },
  { id: "fastest", label: "Fastest", icon: "⚡", color: "#3b82f6", desc: "Minimize travel time" },
  { id: "greenest", label: "Greenest", icon: "🌿", color: "#22c55e", desc: "Minimize CO₂ emissions" },
  { id: "balanced", label: "Balanced", icon: "⚖️", color: "#a855f7", desc: "Best all-around route" },
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
  const [priority, setPriority] = useState<Priority>("balanced");
  const [weights, setWeights] = useState<WeightParams>(PRIORITY_WEIGHTS.balanced);
  const [loading, setLoading] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [view, setView] = useState<"cards" | "table">("cards");
  const [visibleModes, setVisibleModes] = useState<Set<string>>(
    new Set(MODES.map((m) => m.id))
  );
  const [showAqiLayer, setShowAqiLayer] = useState(true);
  const [showHotspots, setShowHotspots] = useState(true);
  const [showReports, setShowReports] = useState(true);
  const [showMapInfo, setShowMapInfo] = useState(false);
  const [aqiStations, setAqiStations] = useState<AQIStation[]>([]);
  const [hotspots, setHotspots] = useState<HotspotCluster[]>([]);
  const [citizenReports, setCitizenReports] = useState<CitizenReport[]>([]);
  const [chartMetric, setChartMetric] = useState<"co2" | "fare" | "time">("co2");
  const [hasSearched, setHasSearched] = useState(false);
  const [showResults, setShowResults] = useState(false);

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

  // Update weights when priority changes
  const handlePriorityChange = (p: Priority) => {
    setPriority(p);
    setWeights(PRIORITY_WEIGHTS[p]);
  };

  // Reset search
  const handleReset = () => {
    setSource(null);
    setDestination(null);
    setRoutes([]);
    setSelectedRoute(null);
    setHasSearched(false);
    setShowResults(false);
  };

  // Search handler
  const handleSearch = useCallback(async () => {
    if (!source || !destination) return;
    setLoading(true);
    setHasSearched(true);
    setShowResults(false);
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
      setShowResults(true);
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

  // Handle citizen report submission
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

  // Best route for the results hero
  const bestRoute = routes.length > 0 ? routes[0] : null;

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
              MicroWay
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
              {/* Info button for map layer explanations */}
              <button
                onClick={() => setShowMapInfo(!showMapInfo)}
                className="px-2 py-1 rounded-md border border-white/10 text-slate-500 hover:text-white hover:border-white/20 transition-all"
              >
                <Info className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Map layers info box */}
        <AnimatePresence>
          {showMapInfo && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden border-t border-white/5"
            >
              <div className="max-w-7xl mx-auto px-4 py-4">
                <div className="bg-[#0f172a] border border-white/10 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-500/15 flex items-center justify-center shrink-0">
                      <Wind className="h-4 w-4 text-teal-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-0.5">AQI Stations</div>
                      <div className="text-slate-400 leading-relaxed">
                        Live air quality monitoring stations across Delhi (CPCB network).
                        Each dot shows the current Air Quality Index — green is good, red is hazardous.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center shrink-0">
                      <div className="w-3 h-3 rounded-full border-2 border-red-400 animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-0.5">Pollution Hotspots</div>
                      <div className="text-slate-400 leading-relaxed">
                        Crowdsourced areas where multiple citizen reports cluster together.
                        Detected using density-based clustering (DBSCAN) — flagged zones may have elevated pollution.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-white mb-0.5">Citizen Reports</div>
                      <div className="text-slate-400 leading-relaxed">
                        Real-time reports from people on the ground — dust, smoke, garbage, or dirty areas.
                        Tap the camera button to submit your own report with a photo or video.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4">
        {/* Search Bar + Reset */}
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

              {/* Reset button */}
              {(source || destination) && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl font-semibold text-xs
                             border border-white/10 text-slate-400 hover:text-white hover:border-white/20
                             transition-all shrink-0"
                  title="Clear search"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </motion.button>
              )}

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
                {loading ? "Calculating..." : "Find Best Route"}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Priority Selector */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="mt-4"
        >
          <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="h-4 w-4 text-teal-400" />
              <h3 className="text-sm font-bold text-white">Priority</h3>
              <span className="text-[10px] text-slate-500 font-medium">— choose what matters most to you</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map((opt) => {
                const isActive = priority === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handlePriorityChange(opt.id)}
                    className={`relative flex flex-col items-center gap-1 px-3 py-3 rounded-xl border transition-all ${
                      isActive
                        ? "border-white/20 bg-white/5 shadow-lg"
                        : "border-white/5 hover:border-white/10"
                    }`}
                    style={isActive ? { boxShadow: `0 0 20px ${opt.color}15` } : undefined}
                  >
                    <span className="text-xl">{opt.icon}</span>
                    <span className="text-xs font-bold text-white">{opt.label}</span>
                    <span className="text-[10px] text-slate-500">{opt.desc}</span>
                    {isActive && (
                      <motion.div
                        layoutId="priorityIndicator"
                        className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
                        style={{ backgroundColor: opt.color }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </motion.button>
                );
              })}
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

        {/* 🏆 BEST ROUTE HERO — shown after search */}
        <AnimatePresence>
          {showResults && bestRoute && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6"
            >
              <div className="relative bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
                {/* Decorative glow */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center gap-2 mb-1">
                    <Trophy className="h-5 w-5 text-amber-400" />
                    <span className="text-[11px] tracking-[0.2em] uppercase text-amber-400 font-bold">
                      Best Route for You
                    </span>
                  </div>
                  <div className="text-sm text-slate-400 mb-4">
                    Based on your <span className="text-white font-semibold">{priority}</span> priority
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    {/* Mode icon + name */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
                        style={{ backgroundColor: `${bestRoute.modeColor}20`, border: `1px solid ${bestRoute.modeColor}40` }}
                      >
                        {bestRoute.modeIcon}
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-white">{bestRoute.modeLabel}</div>
                        <div className="text-xs text-slate-500">Recommended transport mode</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-3 sm:ml-auto">
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <Clock className="h-4 w-4 text-blue-400" />
                        <div>
                          <div className="text-sm font-bold text-white">{bestRoute.time} min</div>
                          <div className="text-[10px] text-slate-500">Travel time</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <IndianRupee className="h-4 w-4 text-amber-400" />
                        <div>
                          <div className="text-sm font-bold text-white">₹{bestRoute.fare}</div>
                          <div className="text-[10px] text-slate-500">Estimated fare</div>
                        </div>
                      </div>
                      {bestRoute.walkingDistance !== undefined && bestRoute.walkingDistance > 0 && (
                        <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                          <Footprints className="h-4 w-4 text-teal-400" />
                          <div>
                            <div className="text-sm font-bold text-white">{bestRoute.walkingDistance} km</div>
                            <div className="text-[10px] text-slate-500">Walking distance</div>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 bg-white/5 rounded-xl px-3 py-2">
                        <Leaf className="h-4 w-4 text-emerald-400" />
                        <div>
                          <div className="text-sm font-bold text-white">
                            {bestRoute.co2 >= 1000 ? `${(bestRoute.co2 / 1000).toFixed(1)} kg` : `${bestRoute.co2}g`}
                          </div>
                          <div className="text-[10px] text-slate-500">CO₂ emissions</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
