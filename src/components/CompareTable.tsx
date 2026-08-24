import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { RouteOption } from "@/types/route";

interface CompareTableProps {
  routes: RouteOption[];
  selectedRoute: string | null;
  onSelectRoute: (id: string) => void;
}

type SortKey = "fare" | "time" | "co2" | "safety" | "balancedScore" | "distance";

export default function CompareTable({ routes, selectedRoute, onSelectRoute }: CompareTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("balancedScore");
  const [sortAsc, setSortAsc] = useState(true);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(key === "safety"); // safety: higher is better
    }
  };

  const sorted = [...routes].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-vintage-muted/50" />;
    return sortAsc ? <ArrowUp className="h-3 w-3 text-vintage-accent" /> : <ArrowDown className="h-3 w-3 text-vintage-accent" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-x-auto rounded-xl border border-vintage-border"
    >
      <table className="w-full text-sm" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
        <thead>
          <tr className="bg-vintage-cream border-b border-vintage-border">
            <th className="text-left px-4 py-3 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
              Mode
            </th>
            <th className="text-right px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("fare")}>
              <div className="flex items-center justify-end gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                Fare (₹) <SortIcon col="fare" />
              </div>
            </th>
            <th className="text-right px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("time")}>
              <div className="flex items-center justify-end gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                Time (min) <SortIcon col="time" />
              </div>
            </th>
            <th className="text-right px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("distance")}>
              <div className="flex items-center justify-end gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                Distance <SortIcon col="distance" />
              </div>
            </th>
            <th className="text-right px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("co2")}>
              <div className="flex items-center justify-end gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                CO₂ (g) <SortIcon col="co2" />
              </div>
            </th>
            <th className="text-center px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("safety")}>
              <div className="flex items-center justify-center gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                Safety <SortIcon col="safety" />
              </div>
            </th>
            <th className="text-right px-3 py-3 cursor-pointer hover:text-vintage-accent transition-colors" onClick={() => handleSort("balancedScore")}>
              <div className="flex items-center justify-end gap-1 text-[11px] tracking-wider uppercase text-vintage-muted font-medium">
                Score <SortIcon col="balancedScore" />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((route) => (
            <tr
              key={route.id}
              onClick={() => route.available && onSelectRoute(route.id)}
              className={`
                border-b border-vintage-border/40 transition-colors
                ${route.available ? "cursor-pointer hover:bg-vintage-accent/5" : "opacity-40"}
                ${route.id === selectedRoute ? "bg-vintage-accent/10" : ""}
              `}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{route.modeIcon}</span>
                  <div>
                    <div className="font-medium text-vintage-text text-sm">{route.modeLabel}</div>
                    {route.badges && route.badges.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {route.badges.slice(0, 2).map((b) => (
                          <span key={b} className="text-[9px] px-1.5 py-0 rounded bg-vintage-accent/10 text-vintage-accent">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-medium text-vintage-text">₹{route.fare}</td>
              <td className="px-3 py-2.5 text-right font-medium text-vintage-text">{route.time} min</td>
              <td className="px-3 py-2.5 text-right text-vintage-muted">{route.distance} km</td>
              <td className="px-3 py-2.5 text-right">
                <span className={route.co2 === 0 ? "text-green-600" : route.co2 > 1500 ? "text-red-600" : "text-vintage-text"}>
                  {route.co2 >= 1000 ? `${(route.co2 / 1000).toFixed(1)} kg` : `${route.co2} g`}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="text-amber-700">{"★".repeat(route.safety)}</span>
                <span className="text-vintage-muted/40">{"☆".repeat(5 - route.safety)}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="font-bold text-vintage-accent">
                  {route.balancedScore?.toFixed(3)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
