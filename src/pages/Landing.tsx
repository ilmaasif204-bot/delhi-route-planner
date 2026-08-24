import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router";
import { ArrowRight, Leaf, Zap, Shield, BarChart3, Map, ChevronRight } from "lucide-react";

const POPULAR_ROUTES = [
  { from: "Connaught Place", to: "Saket" },
  { from: "Rohini", to: "Nehru Place" },
  { from: "Dwarka", to: "Connaught Place" },
  { from: "Karol Bagh", to: "Hauz Khas" },
];

const FEATURES = [
  {
    icon: BarChart3,
    title: "All Modes, One View",
    desc: "Metro, bus, car, bike, scooter, cycle, cab, auto — every option ranked side by side.",
    color: "from-teal-400 to-emerald-400",
  },
  {
    icon: Leaf,
    title: "Air Quality Awareness",
    desc: "Real-time AQI stations and citizen reports power every route score.",
    color: "from-green-400 to-lime-400",
  },
  {
    icon: Zap,
    title: "Balanced Score Engine",
    desc: "Fare, time, emissions, safety, and air quality combined into one smart ranking.",
    color: "from-amber-400 to-orange-400",
  },
  {
    icon: Shield,
    title: "Built for Delhi",
    desc: "Delhi-specific fares, metro station proximity, and city traffic patterns baked in.",
    color: "from-purple-400 to-pink-400",
  },
];

export default function Landing() {
  const navigate = useNavigate();
  const [hoveredPopular] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden">
      {/* Hero */}
      <section className="relative">
        {/* Gradient background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-teal-500/10 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-emerald-500/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 pt-8 pb-20 relative">
          {/* Nav */}
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-16"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Map className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">
                MicroWay
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/auth")}
                className="text-sm text-slate-400 hover:text-white transition-colors font-medium"
              >
                Log in
              </button>
              <button
                onClick={() => navigate("/auth")}
                className="text-sm px-4 py-2 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg transition-all font-medium"
              >
                Sign up
              </button>
            </div>
          </motion.nav>

          {/* Hero content */}
          <div className="text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/15 border border-teal-500/20 mb-6"
            >
              <Leaf className="h-3.5 w-3.5 text-teal-400" />
              <span className="text-xs font-medium text-teal-300">
                Delhi's greenest route planner
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight mb-6"
            >
              <span className="bg-gradient-to-r from-teal-400 via-emerald-400 to-amber-400 bg-clip-text text-transparent">
                MICROWAY
              </span>
              <br />
              <span className="text-white">Find the route that's best</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-400 bg-clip-text text-transparent">
                for YOU.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-400 max-w-xl mx-auto mb-8 leading-relaxed"
            >
              Compare every way to get across Delhi — and pick the route that's best
              for your wallet, your time, and the air we all breathe.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate("/auth")}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-xl font-bold text-[15px]
                           bg-gradient-to-r from-teal-500 to-emerald-500 text-white
                           shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
              >
                Get Started Free
                <ArrowRight className="h-4.5 w-4.5" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 relative">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl sm:text-4xl font-black tracking-tight mb-3"
            >
              Why MicroWay?
            </motion.h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              The first route planner that treats Delhi's air quality as a first-class
              travel metric — not an afterthought.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group p-6 bg-[#1e293b]/60 border border-white/[0.06] rounded-2xl
                           hover:border-white/10 hover:bg-[#1e293b]/80 transition-all"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 shadow-lg`}>
                  <f.icon className="h-5.5 w-5.5 text-white" />
                </div>
                <h3 className="text-lg font-bold mb-1.5 text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Eco impact */}
      <section className="py-20 relative border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/20 mb-6">
              <Leaf className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-xs font-medium text-emerald-300">
                Climate Impact
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Your commute, your climate choice
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
              Every trip across Delhi produces emissions. MicroWay shows you the CO₂
              cost of every mode so you can choose cleaner — and crowdsource air quality
              data to help your neighbours do the same.
            </p>
          </motion.div>

          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-teal-400">8</div>
              <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                Transport modes
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-amber-400">40+</div>
              <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                AQI stations
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="text-3xl font-black text-purple-400">Live</div>
              <div className="text-[11px] text-slate-500 mt-1 uppercase tracking-wider font-medium">
                Hotspot detection
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight mb-4">
              Ready to ride smarter?
            </h2>
            <p className="text-slate-400 mb-8 max-w-lg mx-auto">
              Sign up in seconds, compare every route in Delhi, and make every trip count — for
              your budget and for the city's air.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate("/auth")}
              className="inline-flex items-center gap-2.5 px-8 py-4 rounded-xl font-bold text-[15px]
                         bg-gradient-to-r from-teal-500 to-emerald-500 text-white
                         shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 transition-shadow"
            >
              Create Your Account
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center">
        <p className="text-xs text-slate-600">
          MicroWay — Better routes, cleaner air, smarter Delhi
        </p>
      </footer>
    </div>
  );
}
