import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, X } from "lucide-react";

export type ReportType = "clear" | "dusty" | "smoky" | "burning" | "traffic_haze";

interface ReportButtonProps {
  onSubmitReport: (reportType: ReportType, photo?: File) => void;
}

const REPORT_OPTIONS: { type: ReportType; label: string; emoji: string; color: string }[] = [
  { type: "clear", label: "Clear Skies", emoji: "☀️", color: "#22c55e" },
  { type: "dusty", label: "Dusty", emoji: "🌫️", color: "#a8a29e" },
  { type: "smoky", label: "Smoky", emoji: "💨", color: "#64748b" },
  { type: "burning", label: "Burning Smell", emoji: "🔥", color: "#ef4444" },
  { type: "traffic_haze", label: "Traffic Haze", emoji: "🚗", color: "#f59e0b" },
];

export default function ReportButton({ onSubmitReport }: ReportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleReport = (reportType: ReportType) => {
    onSubmitReport(reportType);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
    }, 1500);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Report sheet */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-80 bg-[#1e293b] border border-white/10 rounded-2xl p-5 shadow-2xl"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6"
              >
                <div className="text-4xl mb-3">✅</div>
                <div className="text-lg font-bold text-white">
                  Report Submitted!
                </div>
                <div className="text-sm text-slate-400 mt-1">
                  Thank you for helping Delhi breathe better
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Report Air Quality
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      What do you see around you?
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4 text-slate-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  {REPORT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.type}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReport(opt.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/[0.06]
                                 hover:border-white/10 hover:bg-white/[0.03] transition-all text-left"
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-sm font-bold text-white">
                        {opt.label}
                      </span>
                      <div
                        className="ml-auto w-3 h-3 rounded-full shadow-lg"
                        style={{ backgroundColor: opt.color }}
                      />
                    </motion.button>
                  ))}
                </div>

                <p className="text-[10px] text-slate-600 mt-3 text-center font-medium">
                  Your GPS location will be captured automatically
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl text-white
                   shadow-lg shadow-teal-500/25 flex items-center justify-center
                   hover:shadow-teal-500/40 transition-shadow
                   bg-gradient-to-br from-teal-500 to-emerald-500"
      >
        <Cloud className="h-6 w-6" />
      </motion.button>
    </>
  );
}
