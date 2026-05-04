import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthShell from "@/components/auth/AuthShell";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterBuyer() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Create Auth Account
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Update Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // 3. Create Firestore Profile
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        city: formData.city,
        role: "Buyer",
        createdAt: new Date().toISOString(),
      });

      toast({ title: "Account created!", description: "Welcome to Needlyy!" });
      navigate("/dashboard/buyer");
    } catch (error: any) {
      toast({ 
        title: "Registration failed", 
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      maxWidth="max-w-2xl"
      eyebrow={<><i className="fas fa-shopping-bag" /> Start Hiring</>}
      title={<>Find trusted <span className="text-primary">Professionals.</span></>}
      subtitle="Join thousands of buyers getting things done faster on Needlyy."
      footer={
        <>
          Looking to offer services?{" "}
          <Link to="/register/seller" className="font-black text-slate-900 hover:text-primary transition-colors">Switch to Seller account</Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Full Name" name="name" placeholder="Saman Perera" icon="fa-user" required value={formData.name} onChange={handleChange} />
          <Field label="Phone Number" name="phone" placeholder="+94 77 123 4567" icon="fa-phone" type="tel" required value={formData.phone} onChange={handleChange} />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Email Address" name="email" placeholder="you@example.com" icon="fa-envelope" type="email" required value={formData.email} onChange={handleChange} />
          <Field label="Your City" name="city" placeholder="Colombo" icon="fa-location-dot" required value={formData.city} onChange={handleChange} />
        </div>
        <Field label="Secure Password" name="password" placeholder="••••••••" icon="fa-lock" type="password" required value={formData.password} onChange={handleChange} />

        <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Checkbox id="terms" required className="mt-1 border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
          <label htmlFor="terms" className="text-xs font-bold text-slate-500 leading-relaxed cursor-pointer">
            I agree to the <Link to="/terms" className="text-slate-900 underline underline-offset-2 hover:text-primary transition-colors">Terms of Service</Link> and{" "}
            <Link to="/privacy" className="text-slate-900 underline underline-offset-2 hover:text-primary transition-colors">Privacy Policy</Link>.
          </label>
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full h-16 bg-slate-950 text-white rounded-2xl font-[900] text-lg shadow-xl hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3"
        >
          {loading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-rocket" />}
          Complete Registration
        </Button>

        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-widest">
            <span className="bg-white px-4 text-slate-400">or sign up with</span>
          </div>
        </div>

        <Button variant="outline" type="button" className="w-full h-14 rounded-xl border-slate-200 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex gap-3">
          <i className="fab fa-google text-red-500" /> Continue with Google
        </Button>
      </form>
    </AuthShell>
  );
}

function Field({ label, name, icon, ...rest }: { label: string; name: string; icon: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor={name}>{label}</label>
      <div className="relative group">
        <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-primary transition-colors`} />
        <Input
          id={name}
          name={name}
          className="h-14 bg-slate-50 border-slate-200 rounded-xl pl-12 pr-5 font-bold focus-visible:ring-primary transition-all"
          {...rest}
        />
      </div>
    </div>
  );
}
