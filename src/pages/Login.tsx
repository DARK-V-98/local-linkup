import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Fetch user role to redirect appropriately
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        toast({ title: "Welcome back!", description: `Signed in as ${userData.name}` });
        
        // Redirect based on role
        if (["Admin", "Super Admin", "Service Developer"].includes(userData.role)) {
          navigate("/admin");
        } else if (userData.role === "Seller") {
          navigate("/dashboard/seller");
        } else {
          navigate("/dashboard/buyer");
        }
      } else {
        toast({ title: "Profile not found", description: "Please complete your profile setup." });
        navigate("/role-selection");
      }
    } catch (error: any) {
      toast({ 
        title: "Login failed", 
        description: error.message || "Invalid email or password.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const userDoc = await getDoc(doc(db, "users", user.uid));
      
      if (!userDoc.exists()) {
        // Handle Automatic Role Assignment for Developer
        if (user.email === "tikfese@gmail.com") {
          const devData = {
            name: user.displayName || "Service Developer",
            email: user.email,
            role: "Service Developer",
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users", user.uid), devData);
          toast({ title: "Developer Access Granted", description: "Welcome to the command center." });
          navigate("/admin"); // Or a specific developer dashboard if created
          return;
        }

        // New regular user
        toast({ title: "Account created!", description: "Please select your account type." });
        navigate("/role-selection");
      } else {
        const userData = userDoc.data();
        toast({ title: "Welcome back!", description: `Signed in as ${userData.name}` });
        
        // Comprehensive Redirection Logic
        if (["Admin", "Super Admin", "Service Developer"].includes(userData.role)) {
          navigate("/admin");
        } else if (userData.role === "Seller") {
          navigate("/dashboard/seller");
        } else {
          navigate("/dashboard/buyer");
        }
      }
    } catch (error: any) {
      toast({ 
        title: "Google login failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      maxWidth="max-w-md"
      eyebrow={<><i className="fas fa-lock" /> Secure Access</>}
      title={<>Welcome <span className="text-primary">back.</span></>}
      subtitle="Sign in to manage your bookings and chat with sellers."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/role-selection?mode=register" className="font-black text-slate-900 hover:text-primary transition-colors">Create one for free</Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
          <div className="relative group">
            <i className="fas fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              type="email" 
              required 
              placeholder="name@company.com" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-12 pr-5 font-bold focus-visible:ring-primary transition-all" 
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
            <Link to="/contact" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">Forgot password?</Link>
          </div>
          <div className="relative group">
            <i className="fas fa-key absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors" />
            <Input 
              type="password" 
              required 
              placeholder="••••••••" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-12 pr-5 font-bold focus-visible:ring-primary transition-all" 
            />
          </div>
        </div>

        <Button
          disabled={loading}
          className="w-full h-16 bg-gradient-brand text-primary-foreground rounded-2xl font-black text-lg shadow-glow hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-circle-check" />}
          Continue to Dashboard
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-white px-4 text-slate-400">or use social login</span>
          </div>
        </div>

        <Button 
          variant="outline" 
          type="button" 
          disabled={loading}
          onClick={handleSocialLogin}
          className="w-full h-14 rounded-xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-4"
        >
          <div className="w-5 h-5 flex items-center justify-center">
             <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-full h-full" />
          </div>
          Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
}
