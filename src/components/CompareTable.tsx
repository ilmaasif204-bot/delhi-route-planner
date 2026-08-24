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
      setSortAsc(key === "safety");
    }
  };

  const sorted = [...routes].sort((a, b) => {
    const aVal = a[sortKey] ?? 0;
    const bVal = b[sortKey] ?? 0;
    return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
  });

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="h-3 w-3 text-slate-700" />;
    return sortAsc ? <ArrowUp className="h-3 w-3 text-teal-400" /> : <ArrowDown className="h-3 w-3 text-teal-400" />;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1e293b]/60"
    >
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left px-4 py-3 text-[10px] tracking-wider uppercase text-slate-500 font-semibold">
              Mode
            </th>
            {[
              { key: "fare" as SortKey, label: "Fare" },
              { key: "time" as SortKey, label: "Time" },
              { key: "distance" as SortKey, label: "Dist" },
              { key: "co2" as SortKey, label: "CO₂" },
              { key: "safety" as SortKey, label: "Safety" },
              { key: "balancedScore" as SortKey, label: "Score" },
            ].map(({ key, label }) => (
              <th
                key={key}
                className="text-right px-3 py-3 cursor-pointer hover:text-teal-400 transition-colors"
                onClick={() => handleSort(key)}
              >
                <div className={`flex items-center justify-end gap-1 text-[10px] tracking-wider uppercase font-semibold ${
                  sortKey === key ? "text-teal-400" : "text-slate-500"
                }`}>
                  {label} <SortIcon col={key} />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((route) => (
            <tr
              key={route.id}
              onClick={() => route.available && onSelectRoute(route.id)}
              className={`
                border-b border-white/5 transition-colors
                ${route.available ? "cursor-pointer hover:bg-white/[0.03]" : "opacity-40"}
                ${route.id === selectedRoute ? "bg-teal-500/5" : ""}
              `}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{route.modeIcon}</span>
                  <div>
                    <div className="font-bold text-white text-sm">{route.modeLabel}</div>
                    {route.badges && route.badges.length > 0 && (
                      <div className="flex gap-1 mt-0.5">
                        {route.badges.slice(0, 2).map((b) => (
                          <span key={b} className="text-[9px] px-1.5 py-0 rounded bg-teal-500/15 text-teal-400 font-semibold">
                            {b}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-3 py-2.5 text-right font-bold text-amber-400">₹{route.fare}</td>
              <td className="px-3 py-2.5 text-right font-bold text-blue-400">{route.time} min</td>
              <td className="px-3 py-2.5 text-right text-slate-400 font-medium">{route.distance} km</td>
              <td className="px-3 py-2.5 text-right">
                <span className={route.co2 === 0 ? "text-emerald-400 font-bold" : route.co2 > 1500 ? "text-red-400 font-bold" : "text-slate-300 font-bold"}>
                  {route.co2 >= 1000 ? `${(route.co2 / 1000).toFixed(1)} kg` : `${route.co2} g`}
                </span>
              </td>
              <td className="px-3 py-2.5 text-center">
                <span className="text-purple-400">{"★".repeat(route.safety)}</span>
                <span className="text-slate-700">{"☆".repeat(5 - route.safety)}</span>
              </td>
              <td className="px-3 py-2.5 text-right">
                <span className="font-black text-teal-400">
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
