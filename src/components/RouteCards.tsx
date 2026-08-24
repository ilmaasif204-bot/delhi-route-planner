import { motion } from "framer-motion";
import { Clock, IndianRupee, Leaf, Shield, Wind, Award, MapPin } from "lucide-react";
import type { RouteOption } from "@/types/route";

interface RouteCardsProps {
  routes: RouteOption[];
  selectedRoute: string | null;
  onSelectRoute: (id: string) => void;
}

const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Best Overall": { bg: "bg-gradient-to-r from-amber-700 to-amber-500", text: "text-white", border: "border-amber-600" },
  "Cheapest": { bg: "bg-emerald-900/20", text: "text-emerald-800", border: "border-emerald-700/30" },
  "Fastest": { bg: "bg-blue-900/20", text: "text-blue-800", border: "border-blue-700/30" },
  "Greenest": { bg: "bg-green-900/20", text: "text-green-800", border: "border-green-700/30" },
  "Safest": { bg: "bg-violet-900/20", text: "text-violet-800", border: "border-violet-700/30" },
  "Cleanest Air": { bg: "bg-teal-900/20", text: "text-teal-800", border: "border-teal-700/30" },
};

function MetricRow({ icon: Icon, label, value, unit, highlight }: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${highlight ? "text-vintage-accent" : "text-vintage-muted"}`} />
        <span className="text-xs text-vintage-muted">{label}</span>
      </div>
      <span className={`text-sm font-semibold ${highlight ? "text-vintage-accent" : "text-vintage-text"}`}
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
        {value}
        <span className="text-[10px] font-normal text-vintage-muted ml-0.5">{unit}</span>
      </span>
    </div>
  );
}

export default function RouteCards({ routes, selectedRoute, onSelectRoute }: RouteCardsProps) {
  if (routes.length === 0) return null;

  return (
    <div className="grid gap-3">
      {routes.map((route, i) => {
        const isSelected = route.id === selectedRoute;
        const isUnavailable = !route.available;

        return (
          <motion.div
            key={route.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.06 }}
            onClick={() => !isUnavailable && onSelectRoute(route.id)}
            className={`
              relative border rounded-xl p-4 transition-all duration-200
              ${isUnavailable ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${isSelected
                ? "border-vintage-accent/60 shadow-md bg-vintage-card ring-1 ring-vintage-accent/20"
                : "border-vintage-border bg-vintage-card hover:border-vintage-accent/30 hover:shadow-sm"
              }
            `}
          >
            {/* Rank badge */}
            {route.rank && route.rank <= 3 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-vintage-accent text-white flex items-center justify-center text-xs font-bold shadow-sm"
                   style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                {route.rank}
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{route.modeIcon}</span>
                <div>
                  <div className="text-sm font-semibold text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                    {route.modeLabel}
                  </div>
                  <div className="text-[11px] text-vintage-muted flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {route.distance} km
                  </div>
                </div>
              </div>

              {/* Balanced score badge */}
              {route.balancedScore !== undefined && (
                <div className="flex flex-col items-end">
                  <div className="text-lg font-bold text-vintage-accent" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                    {route.balancedScore.toFixed(3)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-vintage-muted">
                    Score
                  </div>
                </div>
              )}
            </div>

            {/* Badges */}
            {route.badges && route.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2.5">
                {route.badges.map((badge) => {
                  const style = badgeStyles[badge] || badgeStyles["Best Overall"];
                  return (
                    <span
                      key={badge}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {badge === "Best Overall" && <Award className="h-2.5 w-2.5" />}
                      {badge}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Metrics */}
            <div className="border-t border-vintage-border/50 pt-2">
              <MetricRow icon={IndianRupee} label="Fare" value={`₹${route.fare}`} unit="" />
              <MetricRow icon={Clock} label="Time" value={route.time} unit="min" />
              <MetricRow
                icon={Leaf}
                label="CO₂"
                value={route.co2 >= 1000 ? `${(route.co2 / 1000).toFixed(1)} kg` : `${route.co2} g`}
                unit=""
              />
              <MetricRow
                icon={Shield}
                label="Safety"
                value={`${"★".repeat(route.safety)}${"☆".repeat(5 - route.safety)}`}
                unit=""
              />
              <MetricRow
                icon={Wind}
                label="Air Exposure"
                value={`${Math.round(route.airQualityScore * 100)}%`}
                unit=""
                highlight={route.airQualityScore > 0.6}
              />
            </div>

            {/* Unavailable notice */}
            {isUnavailable && route.unavailableReason && (
              <div className="absolute inset-0 bg-vintage-card/80 rounded-xl flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-sm font-medium text-vintage-muted">⚠️ {route.modeLabel}</div>
                  <div className="text-xs text-vintage-muted/80 mt-1">{route.unavailableReason}</div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
