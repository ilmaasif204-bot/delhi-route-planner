import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Bell, CheckCircle, X, ChevronDown, ChevronUp } from "lucide-react";
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
      className="bg-vintage-card border border-red-300/50 rounded-xl overflow-hidden shadow-sm"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-red-50/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              🚨 Authority Alert Panel
            </h3>
            <p className="text-[11px] text-vintage-muted">
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
              className="text-[10px] px-2 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Notify All
            </button>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-vintage-muted" />
          ) : (
            <ChevronDown className="h-4 w-4 text-vintage-muted" />
          )}
        </div>
      </button>

      {/* Expanded table */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-vintage-border">
              <table className="w-full text-sm" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                <thead>
                  <tr className="bg-vintage-cream text-[10px] tracking-wider uppercase text-vintage-muted">
                    <th className="text-left px-4 py-2 font-medium">Zone</th>
                    <th className="text-center px-3 py-2 font-medium">Reports</th>
                    <th className="text-center px-3 py-2 font-medium">Severity</th>
                    <th className="text-center px-3 py-2 font-medium">Trend</th>
                    <th className="text-center px-3 py-2 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {flaggedHotspots.map((h) => (
                    <tr key={h.id} className="border-t border-vintage-border/40">
                      <td className="px-4 py-2.5 text-vintage-text font-medium">
                        Hotspot #{h.id.split("-")[1]}
                        <div className="text-[10px] text-vintage-muted">
                          {h.centerLat.toFixed(3)}, {h.centerLng.toFixed(3)}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center text-vintage-text">{h.count}</td>
                      <td className="px-3 py-2.5 text-center">
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{
                            backgroundColor:
                              h.avgSeverity >= 4
                                ? "#FEE2E2"
                                : h.avgSeverity >= 3
                                  ? "#FEF3C7"
                                  : "#ECFDF5",
                            color:
                              h.avgSeverity >= 4
                                ? "#DC2626"
                                : h.avgSeverity >= 3
                                  ? "#D97706"
                                  : "#059669",
                          }}
                        >
                          {h.avgSeverity.toFixed(1)}/5
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {h.trend === "rising" ? (
                          <span className="text-[10px] font-bold text-red-600">📈 Rising</span>
                        ) : h.trend === "falling" ? (
                          <span className="text-[10px] text-green-600">📉 Falling</span>
                        ) : (
                          <span className="text-[10px] text-vintage-muted">— Stable</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {notified.has(h.id) ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-green-700">
                            <CheckCircle className="h-3 w-3" /> Notified
                          </span>
                        ) : (
                          <button
                            onClick={() => handleNotify(h.id)}
                            className="inline-flex items-center gap-1 text-[10px] px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
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

            <div className="px-4 py-2.5 bg-vintage-cream/50 text-[10px] text-vintage-muted italic">
              Simulated dashboard — in production, "Notify" would send alerts to the Municipal Corporation of Delhi (MCD) and CPCB
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
