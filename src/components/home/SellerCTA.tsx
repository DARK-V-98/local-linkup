import { Link } from "react-router-dom";

const features = [
  { icon: "fa-rocket", title: "Grow Fast", desc: "Reach thousands of buyers from day one." },
  { icon: "fa-money-bill-wave", title: "Secure Payouts", desc: "Get paid safely, on time, every time." },
  { icon: "fa-clock", title: "Work on your terms", desc: "Set your own hours, prices and availability." },
  { icon: "fa-shield-halved", title: "Verified Profile", desc: "Stand out with the trusted Needlyy badge." },
];

export default function SellerCTA() {
  return (
    <section className="container mx-auto py-20">
      <div className="relative bg-slate-900 rounded-[2.5rem] p-8 md:p-14 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/30 blur-3xl rounded-full" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/30 blur-3xl rounded-full" />
        <div className="absolute inset-0 dot-pattern-light opacity-30" />

        <div className="relative grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs font-bold text-primary-glow">
              <i className="fas fa-bolt" /> For Sellers
            </span>
            <h2 className="mt-5 text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
              Turn your skills into a <span className="text-gradient-brand">thriving business.</span>
            </h2>
            <p className="mt-4 text-slate-300 max-w-md">
              Join 2,500+ verified pros earning on Needlyy. List your service in minutes and start receiving orders today.
            </p>
            <Link to="/role-selection?mode=register" className="inline-flex items-center gap-2 mt-7 bg-gradient-brand text-primary-foreground px-7 py-3.5 rounded-full font-bold shadow-glow hover:scale-105 transition">
              Become a Seller <i className="fas fa-arrow-right" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((f) => (
              <div key={f.title} className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition">
                <span className="grid place-items-center w-11 h-11 rounded-xl bg-gradient-brand text-primary-foreground">
                  <i className={`fas ${f.icon}`} />
                </span>
                <h4 className="text-white font-bold mt-3">{f.title}</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
