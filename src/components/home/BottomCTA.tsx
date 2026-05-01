import { Link } from "react-router-dom";

const features = [
  { icon: "fa-lock", title: "Secure Payments" },
  { icon: "fa-award", title: "Top Talent" },
  { icon: "fa-message", title: "Direct Messaging" },
  { icon: "fa-bolt", title: "Fast Delivery" },
];

export default function BottomCTA() {
  return (
    <section className="container mx-auto pb-20">
      <div className="relative bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-center overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] bg-primary/20 blur-3xl rounded-full" />
        <div className="absolute inset-0 dot-pattern-light opacity-30" />
        <div className="relative">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight max-w-2xl mx-auto leading-tight">
            Ready to get something <span className="text-gradient-brand">amazing</span> done?
          </h2>
          <p className="mt-4 text-slate-300 max-w-lg mx-auto">Join the marketplace where Sri Lanka gets things done — securely and on time.</p>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link to="/role-selection?mode=register" className="bg-gradient-brand text-primary-foreground px-7 py-3.5 rounded-full font-bold shadow-glow hover:scale-105 transition inline-flex items-center gap-2">
              Get Started Free <i className="fas fa-arrow-right" />
            </Link>
            <Link to="/login" className="bg-white/5 border border-white/10 text-white px-7 py-3.5 rounded-full font-bold hover:bg-white/10 transition">
              Sign in
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 border border-white/10 rounded-2xl py-4 px-3">
                <i className={`fas ${f.icon} text-primary-glow text-xl`} />
                <div className="mt-2 text-sm font-bold text-white">{f.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
