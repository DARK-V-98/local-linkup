import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { sendPasswordReset } from "@/lib/auth";
import { usePageTitle } from "@/lib/usePageTitle";

export default function ForgotPassword() {
  usePageTitle("Reset Password");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
      toast.success("Reset link sent! Check your inbox.");
    } catch {
      toast.error("Could not send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/logo.png" alt="Needlyy" className="h-12 w-auto mx-auto drop-shadow-sm" />
          </Link>
        </div>

        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-soft p-8">
          {!sent ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 grid place-items-center mx-auto mb-4">
                  <i className="fas fa-lock-open text-primary text-2xl" />
                </div>
                <h1 className="text-2xl font-black text-slate-900">Forgot your password?</h1>
                <p className="text-slate-500 text-sm mt-2">
                  Enter your email and we'll send you a link to reset it.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <i className="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full border border-slate-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30 bg-slate-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-brand text-primary-foreground py-3.5 rounded-xl font-bold text-sm shadow-glow hover:scale-[1.02] transition disabled:opacity-70 disabled:scale-100 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><i className="fas fa-spinner fa-spin" /> Sending...</>
                  ) : (
                    <><i className="fas fa-paper-plane" /> Send Reset Link</>
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 grid place-items-center mx-auto mb-4">
                <i className="fas fa-circle-check text-emerald-500 text-3xl" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Check your inbox!</h2>
              <p className="text-slate-500 text-sm mb-6">
                We've sent a password reset link to <strong className="text-slate-900">{email}</strong>.
                It may take a minute to arrive.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-sm font-bold text-primary hover:underline"
              >
                Try a different email
              </button>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-slate-900 transition">
              <i className="fas fa-arrow-left mr-1.5 text-xs" /> Back to Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
