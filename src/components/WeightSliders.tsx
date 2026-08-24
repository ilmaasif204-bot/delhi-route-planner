import { motion } from "framer-motion";
import { IndianRupee, Clock, Leaf, Shield, Wind } from "lucide-react";
import type { WeightParams } from "@/types/route";
import { DEFAULT_WEIGHTS } from "@/config/transport";

interface WeightSlidersProps {
  weights: WeightParams;
  onChange: (weights: WeightParams) => void;
}

const SLIDER_CONFIG: {
  key: keyof WeightParams;
  label: string;
  icon: typeof Clock;
  color: string;
}[] = [
  { key: "fare", label: "Fare", icon: IndianRupee, color: "#f59e0b" },
  { key: "time", label: "Time", icon: Clock, color: "#3b82f6" },
  { key: "co2", label: "CO₂", icon: Leaf, color: "#22c55e" },
  { key: "safety", label: "Safety", icon: Shield, color: "#a855f7" },
  { key: "airQuality", label: "Air Quality", icon: Wind, color: "#06b6d4" },
];

export default function WeightSliders({ weights, onChange }: WeightSlidersProps) {
  const handleChange = (key: keyof WeightParams, value: number) => {
    const newWeights = { ...weights, [key]: value };
    const sum = newWeights.fare + newWeights.time + newWeights.co2 + newWeights.safety + newWeights.airQuality;
    if (sum > 0) {
      onChange({
        fare: newWeights.fare / sum,
        time: newWeights.time / sum,
        co2: newWeights.co2 / sum,
        safety: newWeights.safety / sum,
        airQuality: newWeights.airQuality / sum,
      });
    }
  };

  const handleReset = () => {
    onChange(DEFAULT_WEIGHTS);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-[#1e293b]/60 border border-white/[0.06] rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-white">
          ⚖️ Your Priorities
        </h3>
        <button
          onClick={handleReset}
          className="text-[10px] text-slate-500 hover:text-teal-400 transition-colors underline font-medium"
        >
          Reset
        </button>
      </div>

      <div className="space-y-3">
        {SLIDER_CONFIG.map(({ key, label, icon: Icon, color }) => (
          <div key={key}>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5" style={{ color }} />
                <span className="text-xs text-slate-400 font-medium">{label}</span>
              </div>
              <span className="text-xs font-bold text-white">
                {Math.round(weights[key] * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              value={Math.round(weights[key] * 100)}
              onChange={(e) => handleChange(key, parseInt(e.target.value) / 100)}
              className="w-full h-1.5 rounded-full appearance-none cursor-pointer
                         bg-white/10
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-4
                         [&::-webkit-slider-thumb]:h-4
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:border-2
                         [&::-webkit-slider-thumb]:border-white
                         [&::-webkit-slider-thumb]:shadow-lg
                         [&::-webkit-slider-thumb]:transition-all
                         [&::-webkit-slider-thumb]:hover:scale-110"
              style={{
                background: `linear-gradient(to right, ${color} 0%, ${color} ${Math.round(weights[key] * 100)}%, rgba(255,255,255,0.1) ${Math.round(weights[key] * 100)}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>
        ))}
      </div>

      {/* Weight distribution bar */}
      <div className="mt-3 flex h-2 rounded-full overflow-hidden bg-white/5">
        {SLIDER_CONFIG.map(({ key, color }) => (
          <motion.div
            key={key}
            layout
            className="h-full"
            style={{
              width: `${Math.round(weights[key] * 100)}%`,
              backgroundColor: color,
            }}
            transition={{ duration: 0.2 }}
          />
        ))}
      </div>

      <p className="text-[10px] text-slate-600 mt-2 text-center font-medium">
        Drag to re-prioritize · Lower score = better route
      </p>
    </motion.div>
  );
}
