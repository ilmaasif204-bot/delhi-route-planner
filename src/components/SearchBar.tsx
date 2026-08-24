import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Search, X } from "lucide-react";
import { searchDelhiLocations, type GeoSuggestion } from "@/utils/geocoding";
import type { GeoLocation } from "@/types/route";

interface SearchBarProps {
  source: GeoLocation | null;
  destination: GeoLocation | null;
  onSourceChange: (loc: GeoLocation | null) => void;
  onDestinationChange: (loc: GeoLocation | null) => void;
  onSearch: () => void;
  loading: boolean;
}

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
      <label className="block text-[11px] font-medium tracking-wider uppercase text-vintage-muted mb-1.5 font-serif">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-vintage-muted" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-9 pr-8 py-2.5 bg-vintage-paper border border-vintage-border rounded-lg
                     text-sm text-vintage-text placeholder:text-vintage-muted/60
                     focus:outline-none focus:ring-2 focus:ring-vintage-accent/40 focus:border-vintage-accent/60
                     transition-all duration-200"
          style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
        />
        {(query || location) && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-vintage-muted hover:text-vintage-text transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
        {searching && (
          <div className="absolute right-8 top-1/2 -translate-y-1/2">
            <div className="h-3.5 w-3.5 border-2 border-vintage-accent/40 border-t-vintage-accent rounded-full animate-spin" />
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
            className="absolute z-50 mt-1 w-full bg-vintage-card border border-vintage-border rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((s, i) => (
              <button
                key={`${s.lat}-${s.lng}-${i}`}
                type="button"
                onClick={() => handleSelect(s)}
                className="w-full text-left px-3 py-2.5 hover:bg-vintage-accent/10 transition-colors border-b border-vintage-border/40 last:border-0"
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-3.5 w-3.5 text-vintage-accent mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-vintage-text truncate">
                      {s.label}
                    </div>
                    <div className="text-[11px] text-vintage-muted truncate">
                      {s.displayName}
                    </div>
                  </div>
                </div>
              </button>
            ))}
            <div className="px-3 py-1.5 text-[10px] text-vintage-muted/60 border-t border-vintage-border/40 italic">
              Showing locations within Delhi NCT only
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SearchBar({
  source,
  destination,
  onSourceChange,
  onDestinationChange,
  onSearch,
  loading,
}: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="w-full"
    >
      <div className="bg-vintage-card border border-vintage-border rounded-xl p-4 shadow-sm">
        {/* Decorative header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="h-px flex-1 bg-vintage-border" />
          <span className="text-[10px] tracking-[0.2em] uppercase text-vintage-muted" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Plan Your Route
          </span>
          <div className="h-px flex-1 bg-vintage-border" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-end">
          <LocationInput
            label="From"
            icon={Navigation}
            location={source}
            onChange={(loc) => onSourceChange(loc)}
            placeholder="e.g. Connaught Place, Karol Bagh..."
          />

          <div className="hidden sm:flex items-center justify-center pb-2.5 px-1">
            <svg className="w-5 h-5 text-vintage-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </div>

          <LocationInput
            label="To"
            icon={MapPin}
            location={destination}
            onChange={(loc) => onDestinationChange(loc)}
            placeholder="e.g. Nehru Place, Dwarka..."
          />

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSearch}
            disabled={!source || !destination || loading}
            className="flex items-center gap-2 px-5 py-2.5 bg-vintage-accent text-white rounded-lg
                       font-medium text-sm shadow-sm
                       disabled:opacity-40 disabled:cursor-not-allowed
                       hover:bg-vintage-accent/90 transition-colors shrink-0"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            {loading ? (
              <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? "Searching..." : "Compare"}
          </motion.button>
        </div>

        {!source && !destination && (
          <p className="text-[11px] text-vintage-muted mt-2.5 italic text-center" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
            Enter any Delhi locality, landmark, or metro station
          </p>
        )}
      </div>
    </motion.div>
  );
}
