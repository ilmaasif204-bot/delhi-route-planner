import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, ChevronDown, ChevronUp } from "lucide-react";
import type { HotspotCluster } from "@/types/route";

interface AuthorityAlertsProps {
  hotspots: HotspotCluster[];
}

export default function AuthorityAlerts({ hotspots }: AuthorityAlertsProps) {
  const [expanded, setExpanded] = useState(false);
  const [notified, setNotified] = useState<Set<string>>(new Set());

  const flaggedHotspots = hotspots.filter(
    (h) => h.count >= 4 || h.trend === "rising"
  );

  const handleNotify = (hotspotId: string) => {
    setNotified((prev) => new Set(prev).add(hotspotId));
  };

  const handleNotifyAll = () => {
    flaggedHotspots.forEach((h) => {
      setNotified((prev) => new Set(prev).add(h.id));
    });
  };

  if (flaggedHotspots.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-[#1e293b]/60 border border-red-500/20 rounded-2xl overflow-hidden"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-red-500/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/15 flex items-center justify-center">
            <AlertTriangle className="h-4.5 w-4.5 text-red-400" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">
              🚨 Authority Alert Panel
            </h3>
            <p className="text-[11px] text-slate-500">
              {flaggedHotspots.length} flagged zone{flaggedHotspots.length > 1 ? "s" : ""} require{flaggedHotspots.length === 1 ? "s" : ""} attention
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!expanded && flaggedHotspots.some((h) => !notified.has(h.id)) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNotifyAll();
              }}
              className="text-[10px] px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors font-bold"
            >
              Notify All
            </button>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] tracking-wider uppercase text-slate-600 font-semibold">
                    <th className="text-left px-4 py-2">Zone</th>
                    <th className="text-center px-3 py-2">Reports</th>
                    <th className="text-center px-3 py-2">Severity</th>
                    <th className="text-center px-3 py-2">Trend</th>
                    <th className="text-center px-3 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedHotspots.map((h) => (
                    <tr key={h.id} className="border-t border-white/5">
                      <td className="px-4 py-2.5 text-white font-medium">
                        Hotspot #{h.id.split("-")[1]}
                        <div className="text-[10px] text-slate-600">
                          {h.centerLat.toFixed(3)}, {h.centerLng.toFixed(3)}
                        </div>
                        {h.points.some((p) => p.photoUrl) && (
                          <div className="flex gap-1 mt-1.5">
                            {h.points
                              .filter((p) => p.photoUrl)
                              .slice(0, 3)
                              .map((p, idx) => (
                                <img
                                  key={idx}
                                  src={p.photoUrl}
                                  alt="Report"
                                  className="w-8 h-8 rounded-md object-cover border border-white/10"
                                />
                              ))}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center text-slate-300 font-bold">{h.count}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                          style={{
                            backgroundColor:
                              h.avgSeverity >= 4
                                ? "rgba(239,68,68,0.15)"
                                : h.avgSeverity >= 3
                                  ? "rgba(245,158,11,0.15)"
                                  : "rgba(34,197,94,0.15)",
                            color:
                              h.avgSeverity >= 4
                                ? "#f87171"
                                : h.avgSeverity >= 3
                                  ? "#fbbf24"
                                  : "#4ade80",
                          }}
                        >
                          {h.avgSeverity.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {h.trend === "rising" ? (
                          <span className="text-[10px] font-black text-red-400">📈 Rising</span>
                        ) : h.trend === "falling" ? (
                          <span className="text-[10px] font-bold text-emerald-400">📉 Falling</span>
                        ) : (
                          <span className="text-[10px] text-slate-600">— Stable</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {notified.has(h.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Notified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleNotify(h.id)}
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 bg-red-500 text-white rounded-lg hover:bg-red-400 transition-colors font-bold"
                          >
                            <Bell className="h-2.5 w-2.5" /> Notify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-4 py-2.5 text-[10px] text-slate-600 italic border-t border-white/5">
              Simulated dashboard — in production, "Notify" sends alerts to the Municipal Corporation of Delhi (MCD) and CPCB
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
