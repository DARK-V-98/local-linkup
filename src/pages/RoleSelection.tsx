import { Link, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { usePageTitle } from "@/lib/usePageTitle";

const roles = [
  {
    id: "buyer",
    to: "/register/buyer",
    icon: "fa-magnifying-glass",
    title: "I'm a Buyer",
    desc: "Find trusted pros for anything you need — fast.",
    perks: ["Browse 1,000+ services", "Secure escrow payments", "Direct chat with sellers"],
    color: "from-secondary to-secondary",
    badge: "Free forever",
  },
  {
    id: "seller",
    to: "/register/seller",
    icon: "fa-briefcase",
    title: "I'm a Seller",
    desc: "Turn your skills into income. List a service in minutes.",
    perks: ["Reach thousands of buyers", "Get verified badge", "Set your own rates"],
    color: "from-primary to-primary-glow",
    badge: "Most popular",
  },
];

export default function RoleSelection() {
  usePageTitle("Join Needlyy");
  const [params] = useSearchParams();
  const mode = params.get("mode") === "register" ? "Sign up" : "Continue";

  return (
    <AuthShell
      eyebrow={<><i className="fas fa-sparkles" /> Welcome to Needlyy</>}
      title={<>How do you want to <span className="text-gradient-brand">use Needlyy?</span></>}
      subtitle="Pick the role that fits you. You can switch anytime from your dashboard."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-foreground hover:text-primary">Sign in</Link>
        </>
      }
    >
      <div className="grid md:grid-cols-2 gap-5">
        {roles.map((r) => (
          <Link
            key={r.id}
            to={r.to}
            className="group relative bg-background border border-border rounded-2xl p-7 hover:shadow-glow hover:-translate-y-1 hover:border-primary/40 transition-all overflow-hidden"
          >
            <div className={`absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br ${r.color} opacity-10 blur-2xl rounded-full group-hover:opacity-20 transition`} />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className={`grid place-items-center w-14 h-14 rounded-2xl bg-gradient-to-br ${r.color} text-primary-foreground shadow-glow`}>
                  <i className={`fas ${r.icon} text-xl`} />
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-foreground/5 text-foreground/70 px-2.5 py-1 rounded-full">
                  {r.badge}
                </span>
              </div>

              <h3 className="mt-5 text-2xl font-black tracking-tight">{r.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{r.desc}</p>

              <ul className="mt-5 space-y-2">
                {r.perks.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-sm">
                    <i className="fas fa-circle-check text-primary" />
                    <span className="text-foreground/80">{p}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-primary group-hover:gap-3 transition-all">
                {mode} as a {r.id} <i className="fas fa-arrow-right" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-border text-center text-xs text-muted-foreground">
        <i className="fas fa-shield-halved text-primary mr-1.5" />
        Your details are encrypted and never shared without your consent.
      </div>
    </AuthShell>
  );
}
