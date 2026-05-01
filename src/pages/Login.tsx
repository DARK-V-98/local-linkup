import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast({ title: "Logged in successfully!", description: "Redirecting to your dashboard..." });
      setLoading(false);
      navigate("/");
    }, 800);
  };

  return (
    <AuthShell
      maxWidth="max-w-md"
      eyebrow={<><i className="fas fa-lock" /> Secure Access</>}
      title={<>Welcome <span className="text-gradient-brand">back.</span></>}
      subtitle="Sign in to manage your bookings and chat with sellers."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/role-selection?mode=register" className="font-bold text-foreground hover:text-primary">Sign up</Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-sm font-bold ml-1">Email</label>
          <div className="relative">
            <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm" />
            <input 
              type="email" 
              required 
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
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full bg-background border border-input rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring transition" 
            />
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
