import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { RouteOption } from "@/types/route";

interface EmissionsChartProps {
  routes: RouteOption[];
  metric: "co2" | "fare" | "time";
}

const METRIC_CONFIG = {
  co2: { label: "CO₂ Emissions", unit: "g", color: "#43A047", key: "co2" as const },
  fare: { label: "Estimated Fare", unit: "₹", color: "#8B6914", key: "fare" as const },
  time: { label: "Travel Time", unit: "min", color: "#5C6BC0", key: "time" as const },
};

export default function EmissionsChart({ routes, metric }: EmissionsChartProps) {
  const config = METRIC_CONFIG[metric];
  const availableRoutes = routes.filter((r) => r.available);

  const data = availableRoutes.map((r) => ({
    name: r.modeIcon,
    label: r.modeLabel,
    value: r[config.key],
    fill: r.modeColor,
  }));

  return (
    <div className="bg-vintage-card border border-vintage-border rounded-xl p-4">
      <h3
        className="text-sm font-semibold text-vintage-text mb-3"
        style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
      >
        📊 {config.label} Comparison
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#d4c9b8" opacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 18 }}
            axisLine={{ stroke: "#b8a99a" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#8B7355" }}
            axisLine={{ stroke: "#b8a99a" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#f5f0e8",
              border: "1px solid #d4c9b8",
              borderRadius: "8px",
              fontSize: "12px",
              fontFamily: "'EB Garamond', Georgia, serif",
            }}
            formatter={(value: number) => [`${config.unit === "₹" ? "₹" : ""}${value}${config.unit !== "₹" ? ` ${config.unit}` : ""}`, config.label]}
            labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ""}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <rect key={index} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
