import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import {
  DEMO_ACCOUNTS,
  signInWithFirebase,
  signInWithGoogle,
} from "@/lib/auth";
import { toast } from "sonner";
import { usePageTitle } from "@/lib/usePageTitle";

const ROLE_DEST: Record<string, string> = {
  admin: "/admin",
  seller: "/dashboard/seller",
  buyer: "/dashboard/buyer",
};

export default function Login() {
  usePageTitle("Sign In");
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get("redirect") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);

    try {
      const user = await signInWithFirebase(email, password);
      toast.success(`Welcome back, ${user.name.split(" ")[0]}! 👋`);
      navigate(ROLE_DEST[user.role] ?? redirect);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Sign in failed. Please try again.";

      if (msg.includes("user-not-found") || msg.includes("wrong-password") || msg.includes("invalid-credential")) {
        toast.error("Invalid email or password.");
      } else if (msg.includes("too-many-requests")) {
        toast.error("Too many attempts. Please try again later.");
      } else if (msg.includes("not configured") || msg.includes("demo")) {
        toast.error("Use a demo account: buyer@demo.com / demo123");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const user = await signInWithGoogle();
      toast.success(`Welcome, ${user.name.split(" ")[0]}!`);
      navigate(ROLE_DEST[user.role] ?? "/dashboard/buyer");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (msg.includes("popup-closed")) {
        // User dismissed — no toast needed
      } else if (msg.includes("not configured")) {
        toast.error("Google Sign-In requires Firebase setup. See .env.example");
      } else {
        toast.error(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
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
          <Link to="/role-selection?mode=register" className="font-bold text-foreground hover:text-primary">
            Sign up free
          </Link>
        </>
      }
    >
      {/* Demo accounts hint */}
      <div className="mb-5 p-3.5 bg-primary/5 border border-primary/20 rounded-2xl text-xs">
        <div className="font-black text-foreground mb-1.5 flex items-center gap-1.5">
          <i className="fas fa-flask text-primary text-[10px]" /> Demo Accounts
        </div>
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
              <strong className="text-foreground">{a.label}:</strong>{" "}
              {a.email} / demo123
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Email</label>
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold ml-1">Password</label>
            <Link to="/forgot-password" className="text-xs font-bold text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <i className="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input
              type={showPw ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-background border border-input rounded-xl pl-11 pr-11 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <i className={`fas ${showPw ? "fa-eye-slash" : "fa-eye"} text-sm`} />
            </button>
          </div>
        </div>

        <button
          type="submit"
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
          <button
            type="button"
            disabled={googleLoading}
            onClick={handleGoogle}
            className="border border-border bg-background py-2.5 rounded-xl font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2 text-xs disabled:opacity-60"
          >
            {googleLoading
              ? <i className="fas fa-spinner fa-spin" />
              : <i className="fab fa-google text-secondary" />}
            Google
          </button>
          <button
            type="button"
            className="border border-border bg-background py-2.5 rounded-xl font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2 text-xs opacity-50 cursor-not-allowed"
            title="Coming soon"
          >
            <i className="fab fa-facebook text-blue-600" /> Facebook
          </button>
        </div>
      </form>
    </AuthShell>
  );
}
