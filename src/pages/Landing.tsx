import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight, Map, Shield, Leaf, Clock, BarChart3, Zap, Globe } from "lucide-react";

const POPULAR_ROUTES = [
  { from: "Connaught Place", to: "Saket" },
  { from: "Rohini", to: "Nehru Place" },
  { from: "Dwarka", to: "Connaught Place" },
  { from: "Karol Bagh", to: "Hauz Khas" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "8 Modes Compared",
    desc: "Metro, Bus, Car, Bike, Scooter, Cycle, Cab, Auto — all side by side",
  },
  {
    icon: Leaf,
    title: "Air Quality Aware",
    desc: "Citizen-sourced pollution reports and live AQI stations feed into route scoring",
  },
  {
    icon: Shield,
    title: "Smart Balancing",
    desc: "Weighted Sum Model scores fare, time, CO₂, safety & air quality together",
  },
  {
    icon: Zap,
    title: "Real-Time Routing",
    desc: "Live OSRM road routing with Delhi-specific fare and time estimates",
  },
  {
    icon: Globe,
    title: "Hotspot Detection",
    desc: "DBSCAN clustering finds pollution hotspots from citizen reports in real time",
  },
  {
    icon: Clock,
    title: "Live Re-ranking",
    desc: "Drag sliders to re-prioritize — cheapest? fastest? greenest? your call",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-vintage-bg text-vintage-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Subtle texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="max-w-6xl mx-auto px-4 pt-8 pb-16">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">🗺️</span>
              <h1
                className="text-2xl font-bold tracking-tight"
                style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
              >
                MicroWay
              </h1>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="text-sm text-vintage-muted hover:text-vintage-text transition-colors"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Sign in
            </button>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto">
            {/* Decorative ornament */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <div className="inline-flex items-center gap-3">
                <div className="h-px w-12 bg-vintage-accent/40" />
                <span className="text-[10px] tracking-[0.3em] uppercase text-vintage-muted" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  Delhi NCT · Travel Intelligence
                </span>
                <div className="h-px w-12 bg-vintage-accent/40" />
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Beat Delhi traffic.
              <br />
              <span className="text-vintage-accent">Beat Delhi air.</span>
              <br />
              Together.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-vintage-muted max-w-xl mx-auto mb-8 leading-relaxed"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Compare every way to get across Delhi — metro, bus, car, bike, cab, auto — and find the
              smartest route factoring in fare, time, emissions, safety, and air quality.
            </motion.p>

            {/* Indian flag accent line */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="h-1 max-w-xs mx-auto mb-8 rounded-full"
              style={{
                background: "linear-gradient(to right, #FF9933, #FFFFFF 50%, #138808)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-7 py-3 rounded-xl text-white font-medium shadow-lg
                           hover:shadow-xl transition-shadow"
                style={{
                  fontFamily: "'EB Garamond', Georgia, serif",
                  background: "linear-gradient(135deg, #8B6914 0%, #6B4F12 100%)",
                }}
              >
                <Map className="h-4 w-4" />
                Plan Your Route
                <ArrowRight className="h-4 w-4" />
              </motion.button>
            </motion.div>

            {/* Popular routes quick links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8"
            >
              <p className="text-[10px] tracking-[0.2em] uppercase text-vintage-muted mb-2" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                Try a popular route
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {POPULAR_ROUTES.map((r) => (
                  <button
                    key={r.from + r.to}
                    onClick={() => navigate("/dashboard")}
                    className="text-xs px-3 py-1.5 bg-vintage-card border border-vintage-border rounded-lg
                               text-vintage-muted hover:text-vintage-text hover:border-vintage-accent/30 transition-colors"
                    style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                  >
                    {r.from} → {r.to}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Decorative map illustration */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-12 max-w-4xl mx-auto"
          >
            <div className="bg-vintage-card border border-vintage-border rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-blue-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="text-[10px] text-vintage-muted tracking-wider uppercase">
                  MicroWay Route Comparison
                </span>
              </div>

              {/* Mock route comparison cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { icon: "🚇", mode: "Metro", fare: "₹30", time: "28 min", co2: "252g" },
                  { icon: "🚕", mode: "Cab", fare: "₹185", time: "24 min", co2: "2,040g" },
                  { icon: "🚌", mode: "Bus", fare: "₹15", time: "42 min", co2: "1,008g" },
                  { icon: "🚲", mode: "Cycle", fare: "₹0", time: "65 min", co2: "0g" },
                ].map((m, i) => (
                  <motion.div
                    key={m.mode}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                    className={`p-3 rounded-xl border transition-all ${
                      i === 0
                        ? "border-vintage-accent/40 bg-vintage-accent/5 shadow-sm"
                        : "border-vintage-border bg-vintage-paper"
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="text-xs font-semibold mt-1.5 text-vintage-text" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                      {m.mode}
                    </div>
                    <div className="text-[11px] text-vintage-muted mt-1 space-y-0.5">
                      <div>{m.fare}</div>
                      <div>{m.time}</div>
                      <div className={m.co2 === "0g" ? "text-green-600" : ""}>
                        {m.co2} CO₂
                      </div>
                    </div>
                    {i === 0 && (
                      <div className="mt-2 text-[9px] px-2 py-0.5 bg-vintage-accent/10 text-vintage-accent rounded-full inline-block">
                        Best Overall
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 border-t border-vintage-border">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-vintage-accent/40" />
              <span className="text-[10px] tracking-[0.3em] uppercase text-vintage-muted" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                Capabilities
              </span>
              <div className="h-px w-8 bg-vintage-accent/40" />
            </div>
            <h3
              className="text-3xl font-bold mb-3"
              style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
            >
              Why MicroWay?
            </h3>
            <p className="text-sm text-vintage-muted max-w-lg mx-auto" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              The first route planner that treats Delhi's air quality as a first-class travel metric.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="p-5 bg-vintage-card border border-vintage-border rounded-xl hover:shadow-sm transition-shadow"
              >
                <div className="w-9 h-9 rounded-lg bg-vintage-accent/10 flex items-center justify-center mb-3">
                  <f.icon className="h-4.5 w-4.5 text-vintage-accent" />
                </div>
                <h4
                  className="text-base font-semibold mb-1.5"
                  style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
                >
                  {f.title}
                </h4>
                <p className="text-xs text-vintage-muted leading-relaxed" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AQI Focus Section */}
      <section className="py-16 border-t border-vintage-border bg-vintage-card/30">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-red-400/40" />
            <span className="text-[10px] tracking-[0.3em] uppercase text-red-600/60" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
              Sustainability
            </span>
            <div className="h-px w-8 bg-red-400/40" />
          </div>
          <h3
            className="text-3xl font-bold mb-4"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            Delhi breathes. So should your route.
          </h3>
          <p
            className="text-sm text-vintage-muted max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ fontFamily: "'EB Garamond', Georgia, serif" }}
          >
            MicroWay integrates citizen-sourced air quality reports, live CPCB monitoring station data,
            and DBSCAN clustering to detect pollution hotspots — then feeds this into route scoring
            so you can avoid the worst air in Delhi.
          </p>

          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto text-center">
            <div className="p-3">
              <div className="text-2xl font-bold text-vintage-accent" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>40+</div>
              <div className="text-[10px] text-vintage-muted uppercase tracking-wider">AQI Stations</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-vintage-accent" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>8</div>
              <div className="text-[10px] text-vintage-muted uppercase tracking-wider">Transport Modes</div>
            </div>
            <div className="p-3">
              <div className="text-2xl font-bold text-vintage-accent" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>Real-time</div>
              <div className="text-[10px] text-vintage-muted uppercase tracking-wider">Hotspot Detection</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-vintage-border text-center">
        <p className="text-xs text-vintage-muted" style={{ fontFamily: "'EB Garamond', Georgia, serif" }}>
          MicroWay — Multimodal Travel Intelligence for Delhi
        </p>
        <p className="text-[10px] text-vintage-muted/50 mt-1">
          Built for Clean Air & Climate Resilience · Delhi NCT
        </p>
      </footer>
    </div>
  );
}
