import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { Button } from "@/components/ui/button";

const roles = [
  {
    id: "buyer",
    to: "/register/buyer",
    icon: "fa-bag-shopping",
    title: "I want to Hire",
    desc: "Discover verified professionals for any task, from design to repairs.",
    perks: ["Access top 5% talent", "Escrow protection", "Real-time collaboration"],
    color: "from-primary to-primary-glow",
    badge: "For Individuals & Biz",
  },
  {
    id: "seller",
    to: "/register/seller",
    icon: "fa-briefcase",
    title: "I want to Sell",
    desc: "Monetize your skills and reach thousands of potential clients today.",
    perks: ["Verified seller badge", "Automated payments", "Global reach tools"],
    color: "from-primary to-primary-glow",
    badge: "Professional Pro",
  },
];

export default function RoleSelection() {
  const [params] = useSearchParams();
  const mode = params.get("mode") === "register" ? "Join" : "Continue";

  return (
    <AuthShell
      eyebrow={<><i className="fas fa-wand-magic-sparkles" /> Start Your Journey</>}
      title={<>Choose your <span className="text-primary">Needlyy Path.</span></>}
      subtitle="Select the account type that best describes your needs."
      footer={
        <>
          Already part of the community?{" "}
          <Link to="/login" className="font-black text-slate-900 hover:text-primary transition-colors">Sign in to your account</Link>
        </>
      }
    >
      <div className="grid md:grid-cols-2 gap-8">
        {roles.map((r) => (
          <Link
            key={r.id}
            to={r.to}
            className="group relative bg-white border border-slate-100 rounded-[2.5rem] p-8 md:p-10 hover:shadow-glass hover:-translate-y-2 hover:border-primary/20 transition-all duration-500 overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${r.color} opacity-5 blur-3xl rounded-full group-hover:opacity-10 transition-opacity`} />

            <div className="relative">
              <div className="flex items-center justify-between mb-8">
                <span className={`grid place-items-center w-16 h-16 rounded-2xl bg-gradient-to-br ${r.color} text-white shadow-glow group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                  <i className={`fas ${r.icon} text-2xl`} />
                </span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-slate-50 text-slate-400 px-4 py-2 rounded-xl group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  {r.badge}
                </span>
              </div>

              <h3 className="text-2xl font-[900] text-slate-950 tracking-tight mb-3 group-hover:text-primary transition-colors">{r.title}</h3>
              <p className="text-slate-500 font-medium text-sm leading-relaxed mb-8">{r.desc}</p>

              <ul className="space-y-4 mb-10">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-center gap-3 text-sm font-bold text-slate-600">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                      <i className="fas fa-check" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>

              <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary group-hover:gap-5 transition-all">
                {mode} as {r.id} <i className="fas fa-arrow-right" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-12 pt-8 border-t border-slate-50 text-center">
        <div className="inline-flex items-center gap-3 px-5 py-2 bg-slate-50 rounded-full border border-slate-100">
           <i className="fas fa-shield-halved text-primary text-xs" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
             End-to-End Encryption & GDPR Compliant
           </span>
        </div>
      </div>
    </AuthShell>
  );
}
