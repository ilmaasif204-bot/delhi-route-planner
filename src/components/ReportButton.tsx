import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cloud, X } from "lucide-react";

export type ReportType = "clear" | "dusty" | "smoky" | "burning" | "traffic_haze";

interface ReportButtonProps {
  onSubmitReport: (reportType: ReportType, photo?: File) => void;
}

const REPORT_OPTIONS: { type: ReportType; label: string; emoji: string; color: string }[] = [
  { type: "clear", label: "Clear", emoji: "☀️", color: "#4CAF50" },
  { type: "dusty", label: "Dusty", emoji: "🌫️", color: "#795548" },
  { type: "smoky", label: "Smoky", emoji: "💨", color: "#607D8B" },
  { type: "burning", label: "Burning Smell", emoji: "🔥", color: "#F44336" },
  { type: "traffic_haze", label: "Traffic Haze", emoji: "🚗", color: "#FF9800" },
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
    }, 1200);
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
            className="fixed inset-0 bg-black/30 z-40"
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
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 w-80 bg-vintage-card border border-vintage-border rounded-2xl p-5 shadow-2xl"
          >
            {submitted ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-6"
              >
                <div className="text-4xl mb-3">✅</div>
                <div className="text-lg font-semibold text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Report Submitted!
                </div>
                <div className="text-sm text-vintage-muted mt-1">
                  Thank you for helping Delhi breathe better
                </div>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-semibold text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                      Report Air Quality
                    </h3>
                    <p className="text-[11px] text-vintage-muted mt-0.5">
                      What do you see around you?
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-full hover:bg-vintage-border/40 transition-colors"
                  >
                    <X className="h-4 w-4 text-vintage-muted" />
                  </button>
                </div>

                <div className="space-y-2">
                  {REPORT_OPTIONS.map((opt) => (
                    <motion.button
                      key={opt.type}
                      whileHover={{ scale: 1.02, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleReport(opt.type)}
                      className="w-full flex items-center gap-3 p-3 rounded-xl border border-vintage-border/60
                                 hover:border-vintage-accent/40 hover:bg-vintage-accent/5 transition-all text-left"
                    >
                      <span className="text-xl">{opt.emoji}</span>
                      <span className="text-sm font-medium text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                        {opt.label}
                      </span>
                      <div
                        className="ml-auto w-3 h-3 rounded-full"
                        style={{ backgroundColor: opt.color }}
                      />
                    </motion.button>
                  ))}
                </div>

                <p className="text-[10px] text-vintage-muted/60 mt-3 text-center italic">
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
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-vintage-accent text-white
                   shadow-lg flex items-center justify-center
                   hover:bg-vintage-accent/90 transition-colors"
        style={{
          background: "linear-gradient(135deg, #8B6914 0%, #6B4F12 100%)",
        }}
      >
        <Cloud className="h-6 w-6" />
      </motion.button>
    </>
  );
}
