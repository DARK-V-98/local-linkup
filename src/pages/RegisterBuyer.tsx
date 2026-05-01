import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";

export default function RegisterBuyer() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Account created (preview)", description: "Backend wiring lands in Phase 2." });
      setLoading(false);
      navigate("/");
    }, 700);
  };

  return (
    <AuthShell
      maxWidth="max-w-xl"
      eyebrow={<><i className="fas fa-magnifying-glass" /> Buyer Sign Up</>}
      title={<>Find <span className="text-gradient-brand">trusted pros</span> in minutes.</>}
      subtitle="Create a buyer account to book, chat, and review services across Sri Lanka."
      footer={
        <>
          Want to sell instead?{" "}
          <Link to="/register/seller" className="font-bold text-foreground hover:text-primary">Become a seller</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-5">
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Full name" name="name" placeholder="Saman Perera" icon="fa-user" required />
          <Field label="Phone" name="phone" placeholder="+94 77 123 4567" icon="fa-phone" type="tel" required />
        </div>
        <Field label="Email" name="email" placeholder="you@example.com" icon="fa-envelope" type="email" required />
        <Field label="City" name="city" placeholder="Colombo" icon="fa-location-dot" required />
        <Field label="Password" name="password" placeholder="••••••••" icon="fa-lock" type="password" required />

        <label className="flex items-start gap-3 text-sm text-muted-foreground">
          <input type="checkbox" required className="mt-1 accent-[hsl(var(--primary))]" />
          <span>
            I agree to Needlyy's <Link to="/terms" className="text-foreground font-semibold hover:text-primary">Terms</Link> and{" "}
            <Link to="/privacy" className="text-foreground font-semibold hover:text-primary">Privacy Policy</Link>.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-brand text-primary-foreground py-3.5 rounded-full font-bold shadow-glow hover:scale-[1.01] transition disabled:opacity-60 inline-flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-rocket" />}
          Create buyer account
        </button>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-background px-3 relative z-10">or sign up with</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <button type="button" className="w-full border border-border bg-background py-3 rounded-full font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2.5">
          <i className="fab fa-google text-secondary" /> Continue with Google
        </button>
      </form>
    </AuthShell>
  );
}

function Field({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>{label}</label>
      <div className="relative">
        <i className={`fas ${icon} absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm`} />
        <input
          id={name}
          name={name}
          className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition"
          {...rest}
        />
      </div>
    </div>
  );
}
