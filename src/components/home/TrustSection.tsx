import { Link } from "react-router-dom";

const trustItems = [
  {
    icon: "fa-id-badge",
    color: "from-blue-500 to-indigo-500",
    title: "Verified Sellers",
    desc: "Every seller goes through our ID verification process. Look for the blue verified badge on all trusted profiles.",
  },
  {
    icon: "fa-lock",
    color: "from-emerald-500 to-teal-500",
    title: "Secure Payments",
    desc: "Your payment is held in escrow and only released after you confirm the job is done to your satisfaction.",
  },
  {
    icon: "fa-shield-halved",
    color: "from-violet-500 to-purple-500",
    title: "Customer Protection",
    desc: "All verified bookings are covered by Needly's Customer Protection Program up to Rs. 20,000.",
  },
  {
    icon: "fa-headset",
    color: "from-amber-500 to-orange-500",
    title: "24/7 Support",
    desc: "Our local support team is available via WhatsApp, hotline, and email to resolve any issues fast.",
  },
];

const badges = [
  { icon: "fa-star", label: "4.9 Avg Rating" },
  { icon: "fa-circle-check", label: "Verified Sellers" },
  { icon: "fa-users", label: "2,500+ Pros" },
  { icon: "fa-shield-halved", label: "Secure Platform" },
];

export default function TrustSection() {
  return (
    <section className="py-16 md:py-24 bg-gradient-to-b from-background to-slate-50/50 border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-flex items-center gap-2 bg-foreground/5 rounded-full px-4 py-1.5 text-xs font-bold text-foreground/70">
            <i className="fas fa-shield-halved text-primary" /> Trust & Safety
          </span>
          <h2 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-black tracking-tight">
            Your safety is our<br />
            <span className="text-gradient-brand">top priority</span>
          </h2>
          <p className="mt-4 text-muted-foreground text-sm sm:text-base">
            Needly is built for Sri Lanka — with local verification, Sinhala & Tamil support, and real human backing to make every booking stress-free.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trustItems.map((item) => (
            <div
              key={item.title}
              className="bg-card border border-border rounded-3xl p-6 hover:shadow-glass hover:-translate-y-1 transition-all"
            >
              <span className={`grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-glow`}>
                <i className={`fas ${item.icon} text-2xl`} />
              </span>
              <h3 className="mt-5 text-base font-black">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Bottom trust bar */}
        <div className="mt-12 bg-slate-900 rounded-[2rem] px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute inset-0 dot-pattern-light opacity-20" />
          <div className="relative flex flex-wrap justify-center sm:justify-start gap-6">
            {badges.map((b) => (
              <span key={b.label} className="flex items-center gap-2 text-white text-sm font-semibold">
                <i className={`fas ${b.icon} text-primary`} />
                {b.label}
              </span>
            ))}
          </div>
          <Link
            to="/browse"
            className="relative shrink-0 bg-gradient-brand text-primary-foreground px-7 py-3 rounded-full font-bold text-sm shadow-glow hover:scale-105 transition"
          >
            Browse Verified Pros
          </Link>
        </div>

        {/* Customer Protection callout */}
        <div className="mt-6 border border-primary/20 bg-primary/5 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <span className="grid place-items-center w-12 h-12 rounded-2xl bg-primary/10 text-primary shrink-0">
            <i className="fas fa-shield-halved text-xl" />
          </span>
          <div className="flex-1">
            <h4 className="font-black text-base">Needly Customer Protection — up to Rs. 20,000</h4>
            <p className="text-sm text-muted-foreground mt-1">
              If a verified booking doesn't go as planned, we step in. Report a dispute within 3 days of service completion and our team handles it — no hassle, no stress.
            </p>
          </div>
          <Link to="/about" className="shrink-0 text-sm font-bold text-primary hover:underline">
            Learn more <i className="fas fa-arrow-right text-xs" />
          </Link>
        </div>
      </div>
    </section>
  );
}
