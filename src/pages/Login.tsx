import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { setUser, DEMO_ACCOUNTS, genUserId } from "@/lib/auth";
import { toast } from "sonner";

export default function Login() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    setTimeout(() => {
      const demo = DEMO_ACCOUNTS[email.toLowerCase()];
      if (demo && demo.password === password) {
        setUser(demo.user);
        toast.success(`Welcome back, ${demo.user.name}!`);
        const dest = demo.user.role === 'admin' ? '/admin' : demo.user.role === 'seller' ? '/dashboard/seller' : '/dashboard/buyer';
        navigate(dest);
      } else if (email && password.length >= 6) {
        // Generic login — create buyer session
        setUser({ id: genUserId(), name: email.split('@')[0], email, phone: '', role: 'buyer', district: 'Colombo', verified: false, joinedAt: new Date().toISOString().split('T')[0] });
        toast.success("Logged in successfully!");
        navigate(redirect);
      } else {
        toast.error("Invalid email or password. Try: buyer@demo.com / demo123");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <AuthShell
      maxWidth="max-w-md"
      eyebrow={<><i className="fas fa-lock" /> Secure Access</>}
      title={<>Welcome <span className="text-gradient-brand">back.</span></>}
      subtitle="Sign in to manage your bookings and connect with sellers."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/role-selection?mode=register" className="font-bold text-foreground hover:text-primary">Sign up free</Link>
        </>
      }
    >
      {/* Demo accounts hint */}
      <div className="mb-5 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl text-xs">
        <div className="font-black text-foreground mb-1.5">Demo Accounts</div>
        <div className="space-y-1 text-muted-foreground">
          {[
            { label: "Buyer", email: "buyer@demo.com" },
            { label: "Seller", email: "seller@demo.com" },
            { label: "Admin", email: "admin@demo.com" },
          ].map((a) => (
            <button
              key={a.email}
              type="button"
              onClick={() => { setEmail(a.email); setPassword("demo123"); }}
              className="flex items-center gap-2 w-full text-left hover:text-primary transition"
            >
              <i className="fas fa-circle-right text-primary text-[10px]" />
              <strong className="text-foreground">{a.label}:</strong> {a.email} / demo123
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Email</label>
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold ml-1">Password</label>
            <Link to="/contact" className="text-xs font-bold text-primary hover:underline">Forgot?</Link>
          </div>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              type={showPw ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-input rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"} text-sm`} />
            </button>
          </div>
        </div>

        <button
          disabled={loading}
          className="w-full bg-gradient-brand text-primary-foreground py-3.5 rounded-full font-bold shadow-glow hover:scale-[1.01] active:scale-95 transition disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-right-to-bracket" />}
          Sign In
        </button>

        <div className="relative text-center text-xs text-muted-foreground">
          <span className="bg-background px-3 relative z-10">or sign in with</span>
          <div className="absolute inset-x-0 top-1/2 h-px bg-border" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="border border-border bg-background py-2.5 rounded-xl font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2 text-xs">
            <i className="fab fa-google text-secondary" /> Google
          </button>
          <button type="button" className="border border-border bg-background py-2.5 rounded-xl font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2 text-xs">
            <i className="fab fa-facebook text-blue-600" /> Facebook
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
