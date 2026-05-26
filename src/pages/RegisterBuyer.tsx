import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { signUpBuyer, signInWithGoogle } from "@/lib/auth";
import { toast } from "sonner";

export default function RegisterBuyer() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name") as string;
    const phone = data.get("phone") as string;
    const email = data.get("email") as string;
    const city = data.get("city") as string;
    const password = data.get("password") as string;

    if (!name || !phone || !email || !city || !password) {
      toast.error("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const user = await signUpBuyer({ name, email, phone, password, district: city });
      toast.success(`Welcome to Needlyy, ${user.name.split(" ")[0]}! 🎉`);
      navigate("/dashboard/buyer");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      if (msg.includes("email-already-in-use")) {
        toast.error("This email is already registered. Try signing in.");
      } else if (msg.includes("weak-password")) {
        toast.error("Password is too weak. Use at least 6 characters.");
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
      toast.success(`Welcome, ${user.name.split(" ")[0]}! 🎉`);
      navigate("/dashboard/buyer");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Google sign-in failed.";
      if (!msg.includes("popup-closed")) {
        toast.error(msg.includes("not configured") ? "Google Sign-In requires Firebase setup." : msg);
      }
    } finally {
      setGoogleLoading(false);
    }
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
          <Link to="/register/seller" className="font-bold text-foreground hover:text-primary">
            Become a seller
          </Link>
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
            I agree to Needlyy's{" "}
            <Link to="/terms" className="text-foreground font-semibold hover:text-primary">Terms</Link>{" "}
            and{" "}
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

        <button
          type="button"
          disabled={googleLoading}
          onClick={handleGoogle}
          className="w-full border border-border bg-background py-3 rounded-full font-semibold hover:bg-foreground/5 transition inline-flex items-center justify-center gap-2.5 disabled:opacity-60"
        >
          {googleLoading
            ? <i className="fas fa-spinner fa-spin" />
            : <i className="fab fa-google text-secondary" />}
          Continue with Google
        </button>
      </form>
    </AuthShell>
  );
}

function Field({
  label,
  name,
  icon,
  ...rest
}: { label: string; name: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" htmlFor={name}>
        {label}
      </label>
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
