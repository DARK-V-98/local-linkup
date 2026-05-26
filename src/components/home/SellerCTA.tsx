import { useState } from "react";
import { Link } from "react-router-dom";

const CATEGORY_RATES: Record<string, number> = {
  "Technology": 2000,
  "Creative": 1500,
  "Tuition": 900,
  "Education": 800,
  "Repairs": 700,
  "Vehicle Service": 900,
  "Home Services": 600,
  "Delivery": 500,
  "Agriculture": 450,
  "Ayurveda Service": 1200,
};

const CATEGORIES = Object.keys(CATEGORY_RATES);
const COMMISSION = 0.08; // 8% platform fee

function formatLKR(n: number): string {
  if (n >= 100000) return `Rs. ${(n / 1000).toFixed(0)}K`;
  return `Rs. ${n.toLocaleString()}`;
}

export default function SellerCTA() {
  const [category, setCategory] = useState("Technology");
  const [hours, setHours] = useState(20);

  const ratePerHour = CATEGORY_RATES[category] ?? 1000;
  const grossMonthly = ratePerHour * hours * 4;
  const netMonthly = Math.round(grossMonthly * (1 - COMMISSION));
  const netWeekly = Math.round(ratePerHour * hours * (1 - COMMISSION));

  return (
    <section className="container mx-auto py-12 md:py-20">
      <div className="relative bg-slate-900 rounded-[2.5rem] p-6 sm:p-10 md:p-14 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/30 blur-3xl rounded-full" />
        <div className="absolute inset-0 dot-pattern-light opacity-30" />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          {/* Left — Earnings Calculator */}
          <div className="text-center lg:text-left">
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-primary-glow">
              <i className="fas fa-calculator" /> Earnings Calculator
            </span>
            <h2 className="mt-5 text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
              How much could <br />
              <span className="text-gradient-brand">you earn?</span>
            </h2>
            <p className="mt-3 text-sm text-slate-400 max-w-md mx-auto lg:mx-0">
              See your estimated income based on your skill and availability.
            </p>

            {/* Calculator card */}
            <div className="mt-8 bg-white/5 backdrop-blur border border-white/10 rounded-3xl p-6 space-y-5 text-left">
              {/* Category picker */}
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                  Your Category
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 text-white rounded-2xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/50 appearance-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c}</option>
                    ))}
                  </select>
                  <i className="fas fa-chevron-down absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none" />
                </div>
              </div>

              {/* Hours slider */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Hours per Week
                  </label>
                  <span className="text-white font-black text-sm">{hours} hrs</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={40}
                  step={5}
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full accent-primary h-2 rounded-full"
                />
                <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                  <span>5 hrs</span>
                  <span>20 hrs</span>
                  <span>40 hrs</span>
                </div>
              </div>

              {/* Rate info */}
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <i className="fas fa-info-circle text-primary" />
                <span>Average {category} rate: <strong className="text-white">Rs. {ratePerHour.toLocaleString()} / hr</strong></span>
              </div>

              {/* Result */}
              <div className="bg-gradient-brand rounded-2xl p-5 relative overflow-hidden">
                <div className="absolute inset-0 grid-overlay opacity-20" />
                <div className="relative">
                  <div className="text-xs font-bold text-primary-foreground/70 uppercase tracking-wider mb-1">
                    Estimated Monthly Income
                  </div>
                  <div className="text-4xl font-black text-white">
                    {formatLKR(netMonthly)}
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs text-primary-foreground/70">
                    <span className="flex items-center gap-1">
                      <i className="fas fa-calendar-week text-[10px]" />
                      {formatLKR(netWeekly)} / week
                    </span>
                    <span className="text-primary-foreground/40">·</span>
                    <span>After 8% platform fee</span>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/role-selection?mode=register"
              className="inline-flex items-center gap-2 mt-7 bg-gradient-brand text-primary-foreground px-7 py-3.5 rounded-full font-bold shadow-glow hover:scale-105 transition"
            >
              Start Earning Today <i className="fas fa-arrow-right" />
            </Link>
          </div>

          {/* Right — Benefits grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: "fa-rocket", title: "Grow Fast", desc: "Reach thousands of buyers from day one across all 25 Sri Lanka districts." },
              { icon: "fa-money-bill-wave", title: "Secure Payouts", desc: "Get paid safely via bank transfer or wallet. Weekly payouts, no delays." },
              { icon: "fa-clock", title: "Work on your terms", desc: "Set your own hours, prices and availability. Pause anytime." },
              { icon: "fa-shield-halved", title: "Verified Profile", desc: "Stand out with the trusted Needlyy badge after a quick ID check." },
            ].map((f) => (
              <div key={f.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-brand text-primary-foreground">
                  <i className={`fas ${f.icon}`} />
                </span>
                <h4 className="text-white font-bold mt-3 text-sm sm:text-base">{f.title}</h4>
                <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}

            {/* Social proof */}
            <div className="sm:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
              <div className="flex -space-x-2 shrink-0">
                {["T", "N", "K", "H"].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-brand border-2 border-slate-900 grid place-items-center text-primary-foreground text-xs font-black">
                    {i}
                  </div>
                ))}
              </div>
              <div>
                <p className="text-white text-xs font-bold">2,500+ sellers earning on Needlyy</p>
                <p className="text-slate-400 text-xs">Average seller earns Rs. 45,000/month</p>
              </div>
              <div className="ml-auto text-right shrink-0">
                <div className="text-white font-black text-sm">4.8/5</div>
                <div className="text-amber-400 text-xs"><i className="fas fa-star" /> Seller rating</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
