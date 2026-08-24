import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { RouteOption } from "@/types/route";

interface EmissionsChartProps {
  routes: RouteOption[];
  metric: "co2" | "fare" | "time";
}

const METRIC_CONFIG = {
  co2: { label: "CO₂ Emissions", unit: "g", key: "co2" as const },
  fare: { label: "Estimated Fare", unit: "₹", key: "fare" as const },
  time: { label: "Travel Time", unit: "min", key: "time" as const },
};

export default function EmissionsChart({ routes, metric }: EmissionsChartProps) {
  const config = METRIC_CONFIG[metric];
  const availableRoutes = routes.filter((r) => r.available);

  const data = availableRoutes.map((r) => ({
    name: r.modeIcon,
    label: r.modeLabel,
    value: r[config.key],
    color: r.modeColor,
  }));

  return (
    <div className="bg-[#1e293b]/60 border border-white/[0.06] rounded-2xl p-4">
      <h3 className="text-sm font-bold text-white mb-3">
        📊 {config.label} Comparison
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 18 }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1e293b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "12px",
              color: "#f1f5f9",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.3)",
            }}
            formatter={(value: number) => [
              `${config.unit === "₹" ? "₹" : ""}${value}${config.unit !== "₹" ? ` ${config.unit}` : ""}`,
              config.label,
            ]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
