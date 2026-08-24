import { motion } from "framer-motion";
import { Clock, IndianRupee, Leaf, Shield, Wind, Award, MapPin } from "lucide-react";
import type { RouteOption } from "@/types/route";

interface RouteCardsProps {
  routes: RouteOption[];
  selectedRoute: string | null;
  onSelectRoute: (id: string) => void;
}

const badgeStyles: Record<string, { bg: string; text: string; border: string }> = {
  "Best Overall": { bg: "bg-gradient-to-r from-teal-500 to-emerald-500", text: "text-white", border: "border-teal-400" },
  "Cheapest": { bg: "bg-emerald-500/15", text: "text-emerald-400", border: "border-emerald-500/30" },
  "Fastest": { bg: "bg-blue-500/15", text: "text-blue-400", border: "border-blue-500/30" },
  "Greenest": { bg: "bg-green-500/15", text: "text-green-400", border: "border-green-500/30" },
  "Safest": { bg: "bg-purple-500/15", text: "text-purple-400", border: "border-purple-500/30" },
  "Cleanest Air": { bg: "bg-cyan-500/15", text: "text-cyan-400", border: "border-cyan-500/30" },
};

function MetricRow({ icon: Icon, label, value, unit, color }: {
  icon: typeof Clock;
  label: string;
  value: string | number;
  unit: string;
  color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${color || "text-slate-500"}`} />
        <span className="text-xs text-slate-400">{label}</span>
      </div>
      <span className={`text-sm font-bold ${color || "text-white"}`}>
        {value}
        {unit && <span className="text-[10px] font-medium text-slate-500 ml-0.5">{unit}</span>}
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
              relative border rounded-2xl p-4 transition-all duration-200
              ${isUnavailable ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              ${isSelected
                ? "border-teal-500/40 shadow-lg shadow-teal-500/10 bg-[#1e293b]"
                : "border-white/[0.06] bg-[#1e293b]/60 hover:border-white/10 hover:bg-[#1e293b]"
              }
            `}
          >
            {/* Rank badge */}
            {route.rank && route.rank <= 3 && (
              <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-lg shadow-teal-500/25">
                {route.rank}
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{route.modeIcon}</span>
                <div>
                  <div className="text-sm font-bold text-white">
                    {route.modeLabel}
                  </div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {route.distance} km
                  </div>
                </div>
              </div>

              {route.balancedScore !== undefined && (
                <div className="flex flex-col items-end">
                  <div className="text-lg font-black text-teal-400">
                    {route.balancedScore.toFixed(3)}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-600 font-semibold">
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
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${style.bg} ${style.text} ${style.border}`}
                    >
                      {badge === "Best Overall" && <Award className="h-2.5 w-2.5" />}
                      {badge}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Metrics */}
            <div className="border-t border-white/5 pt-2">
              <MetricRow icon={IndianRupee} label="Fare" value={`₹${route.fare}`} unit="" color="text-amber-400" />
              <MetricRow icon={Clock} label="Time" value={route.time} unit="min" color="text-blue-400" />
              <MetricRow
                icon={Leaf}
                label="CO₂"
                value={route.co2 >= 1000 ? `${(route.co2 / 1000).toFixed(1)} kg` : `${route.co2} g`}
                unit=""
                color={route.co2 === 0 ? "text-emerald-400" : "text-slate-300"}
              />
              <MetricRow
                icon={Shield}
                label="Safety"
                value={`${"★".repeat(route.safety)}${"☆".repeat(5 - route.safety)}`}
                unit=""
                color="text-purple-400"
              />
              <MetricRow
                icon={Wind}
                label="Air Exposure"
                value={`${Math.round(route.airQualityScore * 100)}%`}
                unit=""
                color={route.airQualityScore > 0.6 ? "text-red-400" : "text-slate-300"}
              />
            </div>

            {/* Unavailable notice */}
            {isUnavailable && route.unavailableReason && (
              <div className="absolute inset-0 bg-[#0f172a]/80 rounded-2xl flex items-center justify-center">
                <div className="text-center px-4">
                  <div className="text-sm font-bold text-slate-400">⚠️ {route.modeLabel}</div>
                  <div className="text-xs text-slate-600 mt-1">{route.unavailableReason}</div>
                </div>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
